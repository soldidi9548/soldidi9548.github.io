// ============================================================
// 학생 명단 데이터
// 새 학생을 추가하면 사물함도 자동으로 생성됩니다.
// lockerId는 Firebase 저장 경로이므로 한 번 사용한 값은 바꾸지 않는 것을 권장합니다.
// ============================================================
window.KOUSEI_STUDENTS = [
  { lockerId:"mio", nameJP:"道上 美桜", nameKR:"미치카미 미오", gender:"여학생", grade:1, className:"A", age:"17세" },
  { lockerId:"tsumugi", nameJP:"紫紬", nameKR:"무라사키 츠무기", gender:"여학생", grade:2, className:"A", age:"18세" },
  { lockerId:"mizuki", nameJP:"はせがわ みづき", nameKR:"하세가와 미즈키", gender:"여학생", grade:2, className:"B", age:"18세" },
  { lockerId:"mei", nameJP:"天宮 梅", nameKR:"아마미야 메이", gender:"여학생", grade:2, className:"B", age:"18세" },
  { lockerId:"kaito", nameJP:"長谷川 海斗", nameKR:"하세가와 카이토", gender:"남학생", grade:3, className:"A", age:"19세" },
  { lockerId:"rin", nameJP:"冬咲 凛", nameKR:"후유사키 린", gender:"여학생", grade:1, className:"B", age:"17세" },
  { lockerId:"yuu", nameJP:"小川 悠", nameKR:"오가와 유우", gender:"남학생", grade:1, className:"A", age:"17세" },
  { lockerId:"nagi", nameJP:"桐谷 凪", nameKR:"키리타니 나기", gender:"남학생", grade:2, className:"B", age:"18세" },
  { lockerId:"yui", nameJP:"サクラバ ユイ", nameKR:"사쿠라바 유이", gender:"여학생", grade:2, className:"C", age:"18세" },
  { lockerId:"kei", nameJP:"一ノ瀬 圭", nameKR:"이치노세 케이", gender:"남학생", grade:2, className:"C", age:"18세" },
  { lockerId:"shuto", nameJP:"片桐 晶人", nameKR:"카타기리 슈토", gender:"남학생", grade:3, className:"C", age:"19세" }
];

/* 새 학생 예시
window.KOUSEI_STUDENTS.push({
  lockerId:"unique-id",
  nameJP:"日本語 名前",
  nameKR:"한글 이름",
  gender:"여학생",
  grade:1,
  className:"A",
  age:"17세"
});
*/
