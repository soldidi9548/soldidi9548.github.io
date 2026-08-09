코우세이 롤링페이퍼

구조
- 모든 학생의 롤링페이퍼를 누구나 열람 가능
- 글 작성은 Firebase Auth 본인 확인 후 가능
- 같은 작성자 -> 같은 학생에게 최대 3개 (클라이언트 제한)
- 한 쪽지 최대 300자
- 작성자 이름은 공개
- 수정/삭제 기능 없음

설정
1. assets/js/firebase-config.js의 apiKey에 기존 코우세이 Firebase Web API Key를 붙여넣으세요.
2. Firebase Realtime Database Rules에 FIREBASE_RULES_ADD.json의 rollingPapers 블록을 기존 rules 내부에 병합하세요.
3. 추천 배포 폴더명: kousei_rolling_paper
4. 주소 예시: https://soldidi9548.github.io/kousei_rolling_paper/

주의
Firebase Realtime Database Rules만으로 '작성자당 상대 1명에게 최대 3개'를 안전하게 카운트 제한하기는 구조상 까다로워,
현재 최대 3개 제한은 사이트 코드에서 적용됩니다. 일반 사용에서는 정상 제한됩니다.


관리자 삭제 기능
- admin.html 접속
- gm@kousei.local 계정으로 로그인
- 전체 쪽지 / 학생별 쪽지 조회
- 삭제 버튼으로 잘못된 쪽지 삭제
- FIREBASE_RULES_ADD.json은 GM 삭제 권한이 포함된 새 버전입니다.
