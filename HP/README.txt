soldidi9548 홈페이지

실행 방법
1. 폴더 안 index.html을 더블클릭합니다.
2. 로그인 화면에는 아무 ID/PASSWORD나 입력하면 됩니다.

포함 기능
- 오전/밤 자동 배경 전환
- 떠다니는 하트/별, 클릭 효과, 패럴랙스
- 각진 데스크톱 창, 드래그/최소화/최대화/닫기
- ABOUT / GALLERY / DIARY / OTT / MESSENGER / GUESTBOOK / TRASH
- 내부 검색

주의
- DIARY 추가와 GUESTBOOK은 현재 브라우저 localStorage에 저장됩니다.
- 다른 기기나 다른 방문자와 공유되지 않습니다.
- 공개 저장 기능은 추후 Firebase/Supabase 연결이 필요합니다.
- DIARY 관리자 비밀번호(연출용): soldidi9548

GitHub Pages
이 폴더의 전체 내용을 GitHub 저장소 루트에 올리고 Pages를 활성화하면 됩니다.

[공개 방명록 설정]
1. Firebase Console > Firestore Database > 규칙으로 이동합니다.
2. FIRESTORE_RULES.txt의 규칙을 붙여넣고 게시합니다.
3. GitHub Pages에 이 폴더 내용을 업로드하면 공개 방명록이 작동합니다.

※ 방명록은 Firebase Firestore의 guestbook 컬렉션을 사용합니다.
※ 방문자는 작성과 조회만 가능하고 수정/삭제는 차단되어 있습니다.
