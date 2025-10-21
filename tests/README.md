# Tests

이 디렉터리에는 Vitest를 사용한 단위 테스트가 포함되어 있습니다.

## 실행 방법

```bash
npm run test
```

## 테스트 목록

### repository/user/user-repository-impl.test.ts

| 그룹 | 케이스 | 설명 |
| --- | --- | --- |
| `create()` | `creates a new user with normalized email` | 이메일을 소문자로 정규화해 저장하고 타임스탬프를 반환하는지 검증합니다. |
|  | `throws when password hash is invalid` | SHA-256 형식이 아닌 해시로 저장을 시도하면 예외를 발생시킵니다. |
|  | `throws when creating user with duplicate email` | 중복 이메일로 사용자 생성 시 예외가 발생하는지 확인합니다. |
| `findByEmail()` | `finds a user by email` | 저장된 사용자를 이메일로 조회할 수 있는지 확인합니다. |
|  | `returns undefined when finding by unknown email` | 존재하지 않는 이메일 조회 시 `undefined`를 반환합니다. |
| `findById()` | `finds a user by id` | ID 기반 조회가 정상 동작하는지 검증합니다. |
|  | `returns undefined when finding by unknown id` | 존재하지 않는 ID 조회 시 `undefined`를 반환합니다. |
| `updatePassword()` | `updates a user password` | 비밀번호 해시 업데이트와 수정 시각 갱신을 확인합니다. |
|  | `returns undefined when updating password for unknown user` | 존재하지 않는 사용자 비밀번호 변경 시 `undefined`를 반환합니다. |
|  | `throws when new password hash is invalid` | 해시가 아닌 값으로 변경을 시도하면 예외를 발생시킵니다. |
| `updateProfile()` | `updates a user profile` | 이름 등 프로필 필드를 업데이트하는지 검증합니다. |
|  | `returns undefined when updating profile for unknown user` | 존재하지 않는 사용자 프로필 수정 시 `undefined`를 반환합니다. |

### service/user/user-service-impl.test.ts

| 그룹 | 케이스 | 설명 |
| --- | --- | --- |
| `register` | `hashes password before persisting` | 전달된 원본 비밀번호를 해시해 저장하는지 확인합니다. |
|  | `normalizes email to lowercase` | 대소문자가 섞인 이메일을 소문자로 통일해 저장합니다. |
| `changePassword` | `hashes new password before updating` | 새 비밀번호를 해시해 저장하는지 검증합니다. |
| `authenticate` | `throws when password does not match stored hash` | 잘못된 비밀번호로 로그인 시 인증 오류를 발생시킵니다. |
|  | `returns user when credentials are valid` | 올바른 자격 증명으로 로그인하면 사용자 정보를 반환합니다. |
| `updateProfile` | `updates user profile fields` | 프로필 수정 로직이 정상 동작하는지 검증합니다. |

### api/auth-api.test.ts

| 그룹 | 케이스 | 설명 |
| --- | --- | --- |
| `POST /api/sign-up` | `registers a user and sets auth cookie` | 회원가입 성공 시 응답 데이터와 쿠키를 검증합니다. |
|  | `prevents registering with duplicate email` | 동일 이메일 재등록 시 409를 반환합니다. |
|  | `returns validation error for invalid payload` | 잘못된 입력에 대해 400과 오류 메시지를 반환합니다. |
| `POST /api/sign-in` | `signs in an existing user and sets cookie` | 로그인 성공 시 사용자 정보와 쿠키를 검증합니다. |
|  | `rejects sign in with wrong password` | 비밀번호가 틀리면 401을 반환합니다. |
| `POST /api/sign-out` | `clears auth cookie on sign out` | 로그아웃 시 인증 쿠키가 제거되는지 확인합니다. |

### components/sign-up-form.test.tsx

| 그룹 | 케이스 | 설명 |
| --- | --- | --- |
| `SignUpForm` | `handles successful registration and redirects home` | 폼 제출이 성공하면 fetch 호출, `setUser`, 토스트, 홈 리다이렉트를 검증합니다. |
|  | `shows error toast when server returns failure` | 서버가 실패 응답을 주면 에러 토스트가 표시되고 리다이렉트되지 않는지 확인합니다. |

### components/sign-in-form.test.tsx

| 그룹 | 케이스 | 설명 |
| --- | --- | --- |
| `SignInForm` | `handles successful sign-in and redirects home` | 로그인 성공 시 fetch 옵션, `setUser`, 토스트, 홈 이동을 검증합니다. |
|  | `shows error toast when server returns failure` | 서버가 실패 응답을 주면 에러 토스트가 표시되고 이동하지 않는지 확인합니다. |
