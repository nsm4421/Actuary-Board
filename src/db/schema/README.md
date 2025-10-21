# Drizzle 스키마 & 마이그레이션 가이드

이 프로젝트는 `src/db/schema` 아래에 정의된 모델을 기준으로 [Drizzle ORM for SQLite](https://orm.drizzle.team/docs/get-started/sqlite-new)를 사용합니다.  
기본 SQLite 파일 경로는 `.data/dev.sqlite`이며, `SQLITE_DB_PATH` 환경 변수를 설정해서 변경할 수 있습니다.

## 현재 스키마 개요

- **users**  
  - 기본 키 `id`(UUID), 고유한 `email`, `hashed_password`, 생성/수정 시각 타임스탬프.
  - `user_profiles`와 1:1 관계를 가지도록 `usersRelations.profile`을 통해 관계 매핑.

- **user_profiles**  
  - `user_id`를 기본 키 및 `users.id`에 대한 FK로 사용하며 `ON DELETE CASCADE` 적용.
  - 필수 `username`(고유 인덱스), 선택적 `bio`, `avatar_url`, 생성/수정 타임스탬프.
  - `userProfilesRelations.user`를 통해 역방향 관계 구성.

- **articles**  
  - 기본 키 `id`, 작성자 FK `author_id` (`users.id` 참조, CASCADE 삭제).
  - `title`, `content`, `category`(기본값 `free`), `like_count`, `comment_count`, 생성/수정 타임스탬프.
  - `authorIdx`, `categoryIdx` 인덱스로 조회 성능 보강.

## 설정 파일

- 루트의 `drizzle.config.ts`에서 스키마 경로(`./src/db/schema`)와 마이그레이션 출력 폴더(`./drizzle`)를 지정합니다.
- `strict: true`로 설정되어 있어 스키마와 마이그레이션의 싱크를 엄격하게 검증합니다.

## 마이그레이션 생성 방법

```bash
npx drizzle-kit generate
```

- 명령 실행 전 `drizzle.config.ts`가 존재해야 하며, Drizzle 문서의 최신 템플릿을 참고해 구성했습니다.
- 실행 후 `drizzle/` 및 `drizzle/meta/_journal.json`이 생성되어 마이그레이션 이력이 기록됩니다.

## 개발 시 자동 적용

`SqliteDatabaseClient`는 앱이 시작될 때, 다음 조건을 만족하면 `migrate()`를 자동 실행합니다.

- `NODE_ENV !== "production"`
- `DB_AUTO_MIGRATE !== "false"`
- `drizzle/meta/_journal.json` 파일이 존재

즉, 생성된 마이그레이션 파일을 커밋해 두면 새 개발 환경에서도 앱 실행 시 자동으로 테이블이 준비됩니다.  
자동 실행을 끄고 싶다면 `DB_AUTO_MIGRATE=false`를 환경 변수로 지정하면 됩니다.
