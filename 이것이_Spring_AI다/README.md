# 01. Spring AI 시작
- 자바와 파이선에는 AI 모델을 구현하기 위한 프레임워크가 존재하며 파이선은 랭체인(LangChain), 자바는 Spring AI이다.



# 02. 텍스트 대화
chat model을 사용한다. 
- ChatModel 인터페이스 : 텍스트 기반 대화형 인터페이스. 입력된 프롬프트를 LLM에게 동기 요청을 보내며 완전한 응답을 받은 뒤 String/ChatResponse로 반환한다
    - StreamingChatModel 인터페이스 : 프롬프트를 LLM에게 비동기 요청을 보낸 뒤 텍스트 응답을 받으면 Flux<String> / Flux<ChatResponse> 로 반환한다.
    청크 단위로 순차적으로 사용하는 Flux 형태이기 때문에 메모리 사용량이 줄어들며 대규모 동시성 처리가 가능하여 실시간 채팅, 로그 스트리밍 등에 핵심 역할을 한다.
    - prompt 클래스 : 복수 개의 시스템 메시지, 사용자 메시지, AI 메시지를 저장한다.
    - ChatOption 인터페이스 : Start-up 옵션, runtime 옵션 등 대화 옵션이 존재한다.

- 사용자의 질문이 LLLM에서 처리하기 힘든 경우 도구 호출을 요청하는데 애플리케이션과 LLM 간의 복잡한 대화 흐름이 발생하고 이 흐름은 ChatClient가 관리한다.


# 03. 프롬프트 엔지니어링
- 프롬프트 : 대규모 언어 모델(LLM)에게 원하는 작업을 구체적으로 지시하거나 질문의 형태로 요구사항을 전달하는 일종의 명령문
- Spring AI에서는 Prompt 클래스를 사용하며 해당 클래스에는 메시지들과 대화 옵션을 담고 있다.
    - 대화 옵션은 ChatOptions와 동일하다.
    - 메시지 
        |메시지 타입|설명|
        |---|---|
        |SystemMessage|LLM의 행동과 응답 스타일을 지시하는 메시지|
        |UserMessage|사용자의 질문, 명령을 담고 있는 메시지|
        |AssistantMessage|LLM의 응답 메시지로 답변 전달을 넘어 대화 기억 유지에도 사용됨|
        - UserMessage만 포함된 경우는 존재하지만 UserMessage 없이 SystemMessage 나 AssistantMessage만 포함된 경우는 없다. UserMessage는 필수로 포함되어야 한다.
        - 여러 대화를 기억하고 응답할 경우엔 다수의 UserMessage를 입력하고 각 경우에 AssistantMessage에 프롬프트 진행 이력을 저장하여 사용한다.
- 기본 메시지와 옵션 설정하기
    - ChatClient.Builder 내부에 기본 설정을 위한 메소드가 존재한다.
        - defaultSystem(), defaultUser(), defaultOptions()
- 프롬프트 엔지니어링
    1. 제로-샷 프롬프트
        - 예시 없이 작업을 수행하도록 요청하는 방법
    2. 퓨-샷 프롬프트
        - 몇 개의 예시를 제공하여 사용자가 원하는 방식으로 출력하도록 유도하는 기법. 한 개의 예시를 제공하는 것을 원-샷 프롬프트라고 한다.
    3. 역할 부여 프롬프트 
        - 특정 정체성, 전문성 또는 관점을 부여함으로써 출력 내용의 스타일, 톤, 깊이를 조정할 수 있다.
    4. 스탭-백 프롬프트 
        - 질문을 여러 단계로 분해해, 단계별로 배경 지식을 확보하는 기법
            > ex) 서울에서 울릉도 갈 때 비용이 가장 적게 드는 방법은?
            >
            > [1단계] 서울에서 울릉도 가는 교통 수단은 무었이 있나요? 
            >
            > [2단계] 각 교통 수단의 비용은 얼마인가요?
            >
            > [3단계] 비용이 가장 적은 교통 수단은 무엇인가요?
    5. 생각의 사슬 프롬프트(CoT 프롬프트)
        - 문제를 해결하는 과정을 명시적으로 요청하거나 논리적인 단계로 생각하도록 요구함으로써, 다단계 추론이 필요한 작업에서 성능을 향상시킬 수 있다.
    6. 자기 일관성
        - 여러 번 요청해서 얻은 응답을 집계하여 다수결로 최종 응답을 정하는 기법이다. LLM 출력의 변동성을 해결할 수 있다.

# 04. 구조화된 출력
데이터의 의미와 관계를 고려하여 JSON 같은 형식으로 출력하는 것을 **구조화된 출력**이라고 한다.
Spring AI는 이런 작업을 할 수 있도록 구조화된 출력 변환기 StructuredOutputConverter<T> 인터페이스를 제공한다.
아래 변환기들은 해당 인터페이스를 상속받았다.
- ListOutputConverter : List<String> 으로 변환
- BeanOutputConverter : T(객체)로 변환
- MapOutputConverter : Map으로 변환

# 05. 음성 대화
- SST(Speech-to-text) : 사람이 말한 음성을 텍스트로 변환하는 기술이다.
- TTS(text-to-speech) : 텍스트 문자을 자연스러운 음성으로 변환하는 기술이다.

Java에서는 OpenAI 스타터 패키지에서 `OpenAiAudioTranscriptionModel`, `OpenAiAudioSpeechModel`를 사용할 수 있다.


