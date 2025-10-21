# Article Controller

게시글 관련 API/액션에서 사용할 컨트롤러입니다.  
`ArticleController`는 서비스 계층을 호출하고 DTO ↔ 모델 직렬화를 담당합니다.

## 구성 파일

- `article-controller.ts`  
  - 게시글 생성, 단건 조회, 작성자/카테고리별 목록, 수정, 좋아요/댓글 수 조정, 삭제 메서드를 제공합니다.
- `dto.ts`  
  - 요청/응답에 사용하는 타입 정의 (`CreateArticleRequest`, `ArticleListResponse`, 커서 DTO 등).
- `serializers.ts`  
  - 서비스 반환값을 컨트롤러 응답 포맷으로 변환합니다.

## 등록 방법

- `src/controller/di.ts`에서 `ArticleControllerToken`으로 tsyringe 컨테이너에 등록되어 있습니다.
- `resolveArticleController()`로 인스턴스를 가져와 사용할 수 있습니다.
