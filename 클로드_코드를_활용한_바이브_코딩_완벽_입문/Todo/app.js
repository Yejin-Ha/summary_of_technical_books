'use strict';

// ── 상태 ──────────────────────────────────────────────────
let todos = [];
let filter = 'all'; // 'all' | 'active' | 'completed'

// ── DOM 참조 ──────────────────────────────────────────────
const todoInput     = document.getElementById('todoInput');
const addBtn        = document.getElementById('addBtn');
const todoList      = document.getElementById('todoList');
const itemCount     = document.getElementById('itemCount');
const clearBtn      = document.getElementById('clearCompleted');
const themeToggle   = document.getElementById('themeToggle');
const filterBtns    = document.querySelectorAll('.filter-btn');

// ── 초기화 ────────────────────────────────────────────────
(function init() {
  const saved = localStorage.getItem('todos');
  todos = saved ? JSON.parse(saved) : [];

  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);

  render();
})();

// ── 테마 ──────────────────────────────────────────────────
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem('theme', next);
});

// ── 추가 ──────────────────────────────────────────────────
function addTodo() {
  const text = todoInput.value.trim();
  if (!text) {
    todoInput.focus();
    return;
  }

  todos.unshift({ id: Date.now(), text, completed: false });
  todoInput.value = '';
  todoInput.focus();
  save();
  render();
}

addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTodo();
});

// ── 완료 토글 ─────────────────────────────────────────────
function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    save();
    render();
  }
}

// ── 삭제 ──────────────────────────────────────────────────
function deleteTodo(id) {
  const li = todoList.querySelector(`[data-id="${id}"]`);
  if (!li) return;

  li.classList.add('removing');
  li.addEventListener('animationend', () => {
    todos = todos.filter((t) => t.id !== id);
    save();
    render();
  }, { once: true });
}

// ── 편집 ──────────────────────────────────────────────────
function startEdit(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo || todo.completed) return;

  const li       = todoList.querySelector(`[data-id="${id}"]`);
  const textEl   = li.querySelector('.todo-text');
  const editEl   = li.querySelector('.todo-edit-input');

  textEl.classList.add('hidden');
  editEl.classList.add('active');
  editEl.value = todo.text;
  editEl.focus();

  function commit() {
    const newText = editEl.value.trim();
    if (newText) todo.text = newText;
    save();
    render();
  }

  editEl.addEventListener('blur',    commit, { once: true });
  editEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter')  { editEl.removeEventListener('blur', commit); commit(); }
    if (e.key === 'Escape') { editEl.removeEventListener('blur', commit); render(); }
  }, { once: true });
}

// ── 필터 ──────────────────────────────────────────────────
filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

// ── 완료 항목 전체 삭제 ───────────────────────────────────
clearBtn.addEventListener('click', () => {
  todos = todos.filter((t) => !t.completed);
  save();
  render();
});

// ── 저장 ──────────────────────────────────────────────────
function save() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// ── 렌더링 ────────────────────────────────────────────────
function render() {
  const visible = filtered();
  const activeCount = todos.filter((t) => !t.completed).length;

  itemCount.textContent = `${activeCount}개 남음`;

  if (visible.length === 0) {
    todoList.innerHTML = emptyHTML();
    return;
  }

  todoList.innerHTML = visible.map(todoHTML).join('');

  // 이벤트 위임
  todoList.querySelectorAll('.todo-item').forEach((li) => {
    const id = Number(li.dataset.id);

    li.querySelector('.checkbox').addEventListener('click', () => toggleTodo(id));
    li.querySelector('.delete-btn').addEventListener('click', () => deleteTodo(id));
    li.querySelector('.todo-text').addEventListener('dblclick', () => startEdit(id));
  });
}

function filtered() {
  if (filter === 'active')    return todos.filter((t) => !t.completed);
  if (filter === 'completed') return todos.filter((t) =>  t.completed);
  return todos;
}

function todoHTML(todo) {
  return `
    <li class="todo-item${todo.completed ? ' completed' : ''}" data-id="${todo.id}">
      <div class="checkbox" title="완료 토글">
        <span class="checkbox-icon">✓</span>
      </div>
      <span class="todo-text" title="더블클릭으로 편집">${escape(todo.text)}</span>
      <input class="todo-edit-input" maxlength="200" />
      <button class="delete-btn" title="삭제">✕</button>
    </li>
  `;
}

function emptyHTML() {
  if (filter === 'completed') {
    return `<li class="empty-msg"><span>📋</span>완료된 항목이 없습니다.</li>`;
  }
  if (filter === 'active') {
    return `<li class="empty-msg"><span>🎉</span>모든 할 일을 완료했습니다!</li>`;
  }
  return `<li class="empty-msg"><span>✨</span>할 일을 추가해 보세요.<br/>Enter 또는 추가 버튼을 누르세요.</li>`;
}

function escape(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
