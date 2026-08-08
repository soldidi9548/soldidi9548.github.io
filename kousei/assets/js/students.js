// ============================================================
// 학생 명단 데이터
// 새 학생을 추가할 때는 아래 객체 하나를 복사해서 내용만 바꾸세요.
// 이미지는 assets/images 폴더에 넣고 cardImage / popupImage 경로만 적으면 됩니다.
// gender: "여학생" 또는 "남학생"
// grade: 1, 2, 3 / className: "A", "B" 등
// ============================================================

window.KOUSEI_STUDENTS = [
  {
    nameJP: "道上 美桜",
    nameKR: "미치카미 미오",
    gender: "여학생",
    grade: 1,
    className: "A",
    age: "17세",
    keyword: "제멋대로 / 여유로운 / 고양이",
    quoteJP: "ずっと残る夏の光を、一枚くらい写真に収めようと思って。",
    quoteKR: "오래 남을 여름빛을 한 장쯤은 담아가려고.",
    cardImage: "assets/images/mio_card.png",
    popupImage: "assets/images/mio_popup.png"
  },
  {
    nameJP: "紫紬",
    nameKR: "무라사키 츠무기",
    gender: "여학생",
    grade: 2,
    className: "A",
    age: "18세",
    keyword: "차분함 / 밴드부 / 서정적",
    quoteJP: "…⁠この潮風から拾い上げる歌詞は、何だろう？",
    quoteKR: "... 이 바닷바람에서 집어 올 노랫말은 뭘까?",
    cardImage: "assets/images/tsumugi_card.png",
    popupImage: "assets/images/tsumugi_popup.png"
  },
  {
    nameJP: "はせがわ みづき",
    nameKR: "하세가와 미즈키",
    gender: "여학생",
    grade: 2,
    className: "B",
    age: "18세",
    keyword: "발랄함 / 영화부 / 쾌활형",
    quoteJP: "この夏は素敵な友達をたくさん作らなきゃ。みんな、私と友達になってね！",
    quoteKR: "이번 여름엔 예쁜 친구 많이 만들어야지. 다들 나랑 친구해!",
    cardImage: "assets/images/mizuki_card.png",
    popupImage: "assets/images/mizuki_popup.png"
  },
  {
    nameJP: "天宮 梅",
    nameKR: "아마미야 메이",
    gender: "여학생",
    grade: 2,
    className: "B",
    age: "18세",
    keyword: "즉흥적 / 사진부 / 거울공주",
    quoteJP: "この夏が終わっても、私たちはそのままでいるだろうか？",
    quoteKR: "이 여름이 끝나도, 우리는 그대로일까?",
    cardImage: "assets/images/mei_card.jpg",
    popupImage: "assets/images/mei_popup.jpg"
  },
  {
    nameJP: "長谷川 海斗",
    nameKR: "하세가와 카이토",
    gender: "남학생",
    grade: 3,
    className: "A",
    age: "19세",
    keyword: "다정 / 상냥 / 학생회장 / 소심형",
    quoteJP: "この夏は君と一緒だったらいいな。",
    quoteKR: "올여름은 너와 함께라면 좋겠어.",
    cardImage: "assets/images/kaito_card.png",
    popupImage: "assets/images/kaito_popup.png"
  },
  {
  nameJP: "冬咲 凛",
  nameKR: "후유사키 린",
  gender: "여학생",
  grade: 1,
  className: "B",
  age: "17세",
  keyword: "차분함 / 현실주의자 / 노력형",
  quoteJP: "今年の夏は、なんだかちょっと特別になりそう。",
  quoteKR: "이번 여름은 왠지 조금 특별할 것 같아.",
  cardImage: "assets/images/rin_card.png",
  popupImage: "assets/images/rin_popup.png"
},
  {
  nameJP: "小川 悠",
  nameKR: "오가와 유우",
  gender: "남학생",
  grade: 1,
  className: "A",
  age: "17세",
  keyword: "밴드부 / 마이웨이 / 장난기",
  quoteJP: "後悔も、振り返ることもなく。",
  quoteKR: "후회도, 뒤도 없이.",
  cardImage: "assets/images/uyu_card.png",
  popupImage: "assets/images/uyu_popup.png"
},
  {
  nameJP: "桐谷 凪",
  nameKR: "키리타니 나기",
  gender: "남학생",
  grade: 2,
  className: "B",
  age: "18세",
  keyword: "까칠함/귀가부/사실은 여림",
  quoteJP: "……何見てんだよ。喧嘩売ってんの？",
  quoteKR: "…뭘 쳐다봐. 시비 거는 거야?",
  cardImage: "assets/images/nagi_card.png",
  popupImage: "assets/images/nagi_popup.png"
},
  {
  nameJP: サクラバ ユイ",
  nameKR: "사쿠라바 유이",
  gender: "여학생",
  grade: 2,
  className: "C",
  age: "18세",
  keyword: "활발함 / 도서부 / 호기심 많음",
  quoteJP: "ここでたくさんの思い出を作りたい。",
  quoteKR: "이곳에서 많은 추억을 만들고 싶어.",
  cardImage: "assets/images/yui_card.png",
  popupImage: "assets/images/yui_popup.png"
}
/*
새 학생 예시 — 이 블록을 window.KOUSEI_STUDENTS 배열 안에 복사해서 사용하세요.
마지막 학생 뒤에 추가할 때는 바로 앞 객체 끝에 쉼표(,)가 있는지만 확인하면 됩니다.

{
  nameJP: "日本語 名前",
  nameKR: "한글 이름",
  gender: "여학생",
  grade: 1,
  className: "A",
  age: "17세",
  keyword: "키워드1 / 키워드2 / 키워드3",
  quoteJP: "日本語の一言。",
  quoteKR: "한국어 한마디.",
  cardImage: "assets/images/example_card.png",
  popupImage: "assets/images/example_popup.png"
}
*/
