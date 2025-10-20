# User Repository

`UserRepository` 인터페이스는 사용자 도메인에 대한 데이터 접근 로직을 캡슐화합니다. 기본 구현체는 `DrizzleUserRepository`이며, Drizzle ORM과 SQLite 데이터베이스를 사용합니다.

## 의존성
- `DatabaseClient` (`BetterSQLite3Database`): 트랜잭션과 쿼리 실행에 사용되는 Drizzle 클라이언트.
- `users` 테이블 스키마: `/src/db/schema/users.ts`에서 정의된 사용자 테이블.

## 주요 메서드
- `create(input: CreateUserInput): Promise<User>`  
  새 사용자를 생성합니다. 트랜잭션으로 감싸져 있어 삽입 또는 조회가 실패하면 롤백됩니다.

- `findByEmail(email: string): Promise<User | undefined>`  
  이메일(소문자 변환 기준)로 사용자 레코드를 검색합니다.

- `findById(id: string): Promise<User | undefined>`  
  사용자 ID로 레코드를 조회합니다.

- `updatePassword(input: UpdateUserPasswordInput): Promise<User | undefined>`  
  비밀번호를 업데이트하고 최신 사용자 레코드를 반환합니다.

- `updateProfile(input: UpdateUserProfileInput): Promise<User | undefined>`  
  이름 필드를 수정하고 최신 사용자 레코드를 반환합니다.

## 트랜잭션 및 정규화
- 생성 로직은 `client.transaction`을 사용해 삽입과 조회를 하나의 트랜잭션으로 묶습니다.
- 이메일은 항상 소문자로 저장 및 조회하여 중복을 방지합니다.
