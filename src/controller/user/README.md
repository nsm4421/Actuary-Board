# User Controller

사용자 관련 요청을 받아 서비스 계층을 호출하고 응답을 만들어 반환합니다. 컨트롤러는 DTO/시리얼라이저와 함께 동작하여 안전한 입·출력을 보장합니다.

## 핵심 파일

- `user-controller.ts`: 컨트롤러 클래스와 주요 메서드를 정의합니다.
- `actions/sign-up.ts`, `actions/sign-in.ts`: API 라우트에서 사용할 실행 함수와 입력 검증 헬퍼를 제공합니다.
- `dto.ts`: 컨트롤러와 외부 계층이 주고받는 데이터 계약을 정의합니다.
- `serializers.ts`: 서비스에서 받은 도메인 모델을 HTTP 응답 형태로 변환합니다.
- `constants.ts`: 로그인/로그아웃 시 사용하는 쿠키 이름 등 상수를 보관합니다.

## 주요 메서드 (`user-controller.ts`)

- `register(request)`  
  원본 비밀번호와 이메일을 그대로 서비스의 `register`에 전달해 신규 사용자를 생성합니다. 비밀번호 해싱은 서비스에서 처리됩니다.

- `login(request)`  
  입력 받은 비밀번호를 서비스의 `authenticate`에 전달해 로그인 검증을 수행합니다. 실패 시 서비스에서 던진 오류를 그대로 위로 전달합니다.

- `changePassword(request)`  
  새로운 비밀번호를 서비스에 전달해 내부적으로 해싱하고 저장소를 업데이트하도록 합니다.

- `updateProfile(request)`  
  이름 등의 프로필 정보를 업데이트합니다.

- `getById(userId)` / `getByEmail(email)`  
  서비스 계층에 조회를 위임해 사용자를 반환합니다.

## 액션 흐름

1. **검증**: `actions/sign-up.ts`와 `actions/sign-in.ts`에서 zod 스키마(`core/validators`)로 요청을 검증합니다.
2. **컨트롤러 호출**: 검증이 통과하면 `resolveUserController()`로 컨트롤러 인스턴스를 가져와 메서드를 호출합니다.
3. **응답 생성**: 컨트롤러가 반환한 도메인 모델은 `serializers.ts`에서 `UserResponse` 형태로 직렬화돼 API 응답에 사용됩니다.
4. **세션 관리**: 로그인·회원가입 API는 성공 시 `auth_user` 쿠키를 설정하고, `/api/sign-out`은 해당 쿠키를 제거해 로그아웃을 완료합니다.
5. **클라이언트 상태 연동**: API 응답으로 전달한 `UserResponse` 객체는 클라이언트의 `useUserStore`(zustand)에서 즉시 사용됩니다.
