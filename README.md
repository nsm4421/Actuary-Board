# Actuary Board

바이브코딩(codex) 계리사 갤러리 만들기 프로젝트

## Scripts

- `npm run dev` – 개발 서버 (Next.js) 실행
- `npm run build` – 프로덕션 번들 빌드
- `npm run start` – 빌드 결과 실행
- `npm run lint` – ESLint 검사
- `npm test` – Vitest 단위/통합 테스트 실행

## 게시글 작성 API

- **Endpoint:** `POST /api/article`
- **Headers:** `Content-Type: application/json`, 인증된 사용자는 `auth_user` 쿠키 포함
- **Body:**

  ```json
  {
    "title": "제목 (1~120자)",
    "category": "free | career | exam | industry",
    "content": "본문 (1~5000자)",
    "isPublic": true
  }
  ```

- **Responses:**
  - `201 Created` – `{ "article": {...}, "redirectTo": "/article/<id>" }`
  - `400 Bad Request` – `{ "error": "..." }` (검증 실패 또는 JSON 파싱 실패)
  - `401 Unauthorized` – `{ "error": "로그인이 필요합니다." }`
  - `500 Internal Server Error` – `{ "error": "게시글 생성 중 오류가 발생했습니다." }`

성공 시 응답의 `redirectTo` 경로로 클라이언트에서 이동하면 작성된 게시글 페이지로 안내됩니다.
