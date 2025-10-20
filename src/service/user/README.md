# User Service

`UserService`는 도메인 로직을 담당하여 사용자 관련 유스케이스를 제공합니다. 기본 구현체는 `DefaultUserService`이며, `UserRepository`를 주입받아 데이터 계층과 상호 작용합니다.

## 의존성
- `UserRepository`: 사용자 저장소 인터페이스. 사용자 조회·생성·수정 기능을 제공합니다.

## 주요 기능
- `register(input: CreateUserInput): Promise<User>`  
  이메일을 정규화하고 중복 여부를 확인한 뒤 새 사용자를 생성합니다. 중복 시 예외를 발생시킵니다.
- `getByEmail(email: string): Promise<User | undefined>`  
  이메일을 정규화하여 사용자 정보를 조회합니다.
- `getById(id: string): Promise<User | undefined>`  
  사용자 ID로 정보를 조회합니다.
- `changePassword(input: UpdateUserPasswordInput): Promise<User>`  
  저장소를 통해 비밀번호를 변경하고, 결과가 없으면 예외를 발생시킵니다.
- `updateProfile(input: UpdateUserProfileInput): Promise<User>`  
  사용자 이름 프로필을 갱신하고, 대상 사용자가 없으면 예외를 발생시킵니다.

## 예외 처리
- 등록 시 이미 존재하는 이메일이라면 `User already exists` 예외를 던집니다.
- 비밀번호 및 프로필 수정 시 대상 사용자가 없으면 각각 `Failed to update password: user not found`, `Failed to update profile: user not found` 예외를 던집니다.

## 의존성 주입
- `src/service/di.ts`에서 `DefaultUserService`를 `UserServiceToken`으로 등록하여 `tsyringe` 컨테이너를 통해 주입할 수 있도록 구성했습니다.
