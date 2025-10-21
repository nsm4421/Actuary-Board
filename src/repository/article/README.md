# Article Repository

게시글(`articles` 테이블)과 작성자 프로필(`user_profiles`)을 다루는 데이터 접근 계층입니다.  
`article-repository.ts`에 인터페이스가 정의되어 있으며 구현체는 `article-repository-impl.ts`에서 Drizzle ORM을 사용해 제공합니다.

## 제공 메서드

- `create(input)`  
  새 게시글을 저장하고 저장 결과를 반환합니다.
- `findById(id)` / `findDetailedById(id)`  
  단일 게시글 조회. `findDetailedById`는 작성자 프로필을 조인합니다.
- `findByAuthor(authorId, options)`  
  작성자 기준 커서 페이지네이션. `options.limit`(최대 100)과 `options.cursor`로 다음 페이지를 요청할 수 있습니다.
- `listPublicByCategory(category, options)`  
  공개 게시글을 카테고리별로 커서 페이지네이션 합니다.
- `update(input)`  
  제목/본문/카테고리/공개 여부를 갱신합니다.
- `adjustCounters(input)`  
  좋아요/댓글 수를 증감합니다.
- `delete(id)`  
  게시글을 삭제하고 삭제 여부를 boolean으로 반환합니다.

## 페이지네이션 규칙

- `created_at DESC`, `id DESC` 순으로 정렬하며 커서는 `{ createdAt, id }` 형태입니다.
- 한 번에 가져올 수 있는 최대 개수는 `DEFAULT_PAGE_SIZE`(20)~`MAX_PAGE_SIZE`(100) 사이로 제한됩니다.

## 의존성

- `DatabaseClientToken` (tsyringe)  
  - SQLite Drizzle 클라이언트를 주입받아 사용합니다.
