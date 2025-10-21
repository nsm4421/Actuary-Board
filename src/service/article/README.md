# Article Service

게시글 비즈니스 로직을 담당하는 계층입니다.  
`article-service.ts`는 서비스 인터페이스와 DTO를 정의하고, `article-service-impl.ts`는 `ArticleRepository`를 사용해 구현합니다.

## 주요 책임

- 입력값(페이징 옵션 등)을 정규화하고 레포지토리 호출 결과를 `ArticleModel`로 변환
- 게시글 생성/수정/삭제 및 좋아요·댓글 카운터 조정
- 작성자/카테고리 기준 커서 페이지네이션 처리와 다음 커서 계산

## 메서드 개요

- `create(input)` → 새 게시글 등록
- `getById(id)` → 단일 게시글 조회(작성자 프로필 포함)
- `listByAuthor(authorId, options)` → 작성자 기준 페이지네이션
- `listPublicByCategory(category, options)` → 카테고리 기준 공개 게시글 페이지네이션
- `update(input)` → 게시글 내용 수정
- `adjustCounters(input)` → 좋아요/댓글 수 증감
- `delete(articleId)` → 게시글 삭제

## 모델 & 매퍼

- `ArticleModel` (`src/model/article/article.ts`)  
  - 작성자 정보는 `UserProfileModel` (`src/model/user/user-profile.ts`)을 참조합니다.
- `mappers.ts`에서 DB 레코드를 서비스 모델로 변환합니다.
