# User Service

사용자 도메인 비즈니스 로직을 담당하는 계층입니다. 서비스 인터페이스(`user-service.ts`)와 구현체(`user-service-impl.ts`), 도메인 오류(`errors.ts`)로 구성되어 있습니다.

## 핵심 메서드 (`user-service-impl.ts`)

- `register(input)`  
  이메일을 정규화(lowercase + trim)한 뒤 중복 가입을 검사합니다. 원본 비밀번호를 SHA-256 해시로 변환해 저장소에 전달하며, 이미 존재하면 `Error("User already exists")`를 던집니다.

- `authenticate(email, password)`  
  이메일을 정규화하여 조회하고, 입력 받은 비밀번호를 해시해 저장된 해시와 비교합니다. 실패하면 `InvalidCredentialsError`를 던집니다.

- `getByEmail(email)` / `getById(id)`  
  각각 이메일 또는 ID로 사용자를 조회합니다. 이메일 조회 시 정규화를 적용해 케이스 민감도 문제를 방지합니다.

- `changePassword(input)`  
  새로운 비밀번호를 해시한 뒤 저장소를 통해 갱신합니다. 대상 사용자가 없으면 `ensureUser` 헬퍼가 예외를 발생시켜 상위 계층에서 처리할 수 있게 합니다.

- `updateProfile(input)`  
  사용자 이름 등 프로필 정보를 갱신하고, 존재하지 않는 사용자에 대해서는 예외를 던집니다.

## 책임

- 저장소 계층을 사용해 사용자 데이터를 조회·변경하고 비즈니스 규칙을 강제합니다.
- 컨트롤러가 사용할 명확한 API를 제공하고, 도메인 전용 오류(`InvalidCredentialsError`)를 통해 상위 계층이 상황별 응답을 하도록 돕습니다.
- 이메일 정규화 및 비밀번호 해싱을 책임져 저장소와 컨트롤러가 각자의 역할에 집중할 수 있도록 합니다.
- 직렬화된 사용자 객체는 프런트엔드 `zustand` 스토어에서 그대로 활용되므로, 안정적인 데이터 형태를 제공하는 것이 중요합니다.
