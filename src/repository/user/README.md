# User Repository

Drizzle ORM을 사용해 `users` 및 `user_profiles` 테이블과 직접 상호작용하는 데이터 접근 계층입니다. 인터페이스(`user-repository.ts`)와 구현체(`user-repository-impl.ts`)로 구성되어 있으며, 서비스 계층에서 요구하는 핵심 사용자/프로필 CRUD 연산을 제공합니다.

## 제공 메서드 (`user-repository.ts`)

- `create(input)`  
  이메일, 비밀번호 해시, 사용자명 등을 받아 `users`와 `user_profiles` 레코드를 함께 저장하고, 생성된 사용자 + 프로필을 반환합니다. 해시 형식이 올바르지 않으면 `InvalidPasswordHashError`를 던집니다.

- `findByEmail(email)`  
  정규화된 이메일을 기반으로 사용자를 조회합니다. 없으면 `undefined`를 반환합니다.

- `findById(id)`  
  사용자 ID로 단일 레코드를 조회합니다.

- `updatePassword(input)`  
  지정한 사용자 ID의 비밀번호 해시를 업데이트하고, 갱신된 사용자 + 프로필을 반환합니다. 입력값이 SHA-256 형식이 아니면 예외를 던집니다.

- `updateProfile(input)`  
  사용자 프로필 필드(사용자명, 소개, 아바타 URL 등)를 갱신하고, 업데이트된 사용자 + 프로필을 반환합니다.

## 책임

- SQL/ORM 세부 구현을 서비스 계층에 노출하지 않고 캡슐화합니다.
- 모든 메서드는 Promise 기반으로 동작해 비동기 데이터 흐름을 유지합니다.
- 입력 타입(`CreateUserInput`, `UpdateUserPasswordInput`, `UpdateUserProfileInput`)을 통해 상위 계층이 필요한 필드만 전달하도록 강제합니다.
- 반환된 사용자 레코드는 컨트롤러 시리얼라이저를 거쳐 클라이언트의 `zustand` 스토어 상태에 반영됩니다.
