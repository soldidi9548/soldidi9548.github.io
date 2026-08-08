window.KOUSEI_COURAGE = {
  gmEmail: "gm@kousei.local",
  players: [
    {id:"mio", email:"mio@kousei.local", nameJP:"道上 美桜", nameKR:"미치카미 미오", grade:1, className:"A", age:"17세"},
    {id:"rin", email:"rin@kousei.local", nameJP:"冬咲 凛", nameKR:"후유사키 린", grade:1, className:"B", age:"17세"},
    {id:"yuu", email:"yuu@kousei.local", nameJP:"小川 悠", nameKR:"오가와 유우", grade:1, className:"A", age:"17세"},
    {id:"tsumugi", email:"tsumugi@kousei.local", nameJP:"紫紬", nameKR:"무라사키 츠무기", grade:2, className:"A", age:"18세"},
    {id:"mizuki", email:"mizuki@kousei.local", nameJP:"はせがわ みづき", nameKR:"하세가와 미즈키", grade:2, className:"B", age:"18세"},
    {id:"mei", email:"mei@kousei.local", nameJP:"天宮 梅", nameKR:"아마미야 메이", grade:2, className:"B", age:"18세"},
    {id:"nagi", email:"nagi@kousei.local", nameJP:"桐谷 凪", nameKR:"키리타니 나기", grade:2, className:"B", age:"18세"},
    {id:"yui", email:"yui@kousei.local", nameJP:"サクラバ ユイ", nameKR:"사쿠라바 유이", grade:2, className:"C", age:"18세"},
    {id:"kei", email:"kei@kousei.local", nameJP:"一ノ瀬 圭", nameKR:"이치노세 케이", grade:2, className:"C", age:"18세"},
    {id:"kaito", email:"kaito@kousei.local", nameJP:"長谷川 海斗", nameKR:"하세가와 카이토", grade:3, className:"A", age:"19세"},
    {id:"shuto", email:"shuto@kousei.local", nameJP:"片桐 晶人", nameKR:"카타기리 슈토", grade:3, className:"C", age:"19세"}
  ],
  suspects: [
    {id:"haru", jp:"青木 春", kr:"아오키 하루", grade:"1학년", club:"사진부", order:2, item:"카메라"},
    {id:"sora", jp:"水無瀬 空", kr:"미나세 소라", grade:"2학년", club:"수영부", order:4, item:"수건"},
    {id:"ren", jp:"白川 蓮", kr:"시라카와 렌", grade:"2학년", club:"문예부", order:1, item:"원고지"},
    {id:"nao", jp:"橘 直", kr:"타치바나 나오", grade:"3학년", club:"방송부", order:3, item:"카세트테이프"}
  ],
  stages: {
    1: {
      title:"사라진 이름", label:"RECORD 01", answer:"sora",
      intro:"과거 담력시험 기록에서 삭제된 학생의 이름을 찾으세요. 각자의 조건을 공유해야만 한 명으로 좁힐 수 있습니다.",
      clues:[
        {title:"출발 기록", text:"기록에서 삭제된 학생은 홀수 번째로 출발하지 않았다."},
        {title:"활동 기록", text:"그 학생은 사진을 찍는 쪽도, 글을 쓰는 쪽도 아니었다."},
        {title:"목격 기록", text:"마지막까지 돌아오지 않은 학생은 3학년이 아니었다."},
        {title:"비품 반환 기록", text:"青木 春—카메라 / 水無瀬 空—수건 / 白川 蓮—원고지 / 橘 直—카세트테이프. 기록에서 삭제된 학생의 물건은 카메라도 카세트테이프도 아니었다."}
      ],
      hints:["출발 순서, 동아리, 학년 조건을 겹쳐 보세요.","세 조건을 동시에 만족하는 학생은 水無瀬 空 한 명뿐입니다."]
    },
    2: {
      title:"어긋난 기록", label:"RECORD 02",
      intro:"소라가 일행과 함께 있었음이 확인된 마지막 시각을 복원하세요. 어떤 자료는 다른 자료 없이는 해석할 수 없습니다.",
      p1:[
        {title:"사진 #17", text:"水無瀬 空가 일행과 함께 관리동 앞을 지나고 있다. 사진 속 관리동 벽시계는 22:39. 뒷면에는 ‘시계는 아직 고쳐지지 않았다.’라고 적혀 있다."},
        {title:"시설 점검표", text:"관리동 벽시계와 방송실 시계의 차이 = 8분. 어느 쪽이 빠른지는 야간 점검 기록 참조."},
        {title:"야간 점검 기록", text:"가장 느린 시계 = 관리동. 방송실 시계를 표준 시각으로 사용함."},
        {title:"방송 시스템 기록", text:"방송실 시계는 인터넷 표준시각과 자동 동기화되어 있었다."}
      ],
      timeOptions:["22:31","22:39","22:47","22:55"], timeAnswer:"22:47",
      p2:[
        {title:"사진 #18 메모", text:"#17 촬영 후 다음 안내방송이 나오기 전에 촬영자는 숙소로 돌아갔다. #18에는 소라가 보이지 않는다."},
        {title:"방송 간격 기록", text:"야간 안내방송은 15분 간격. 마지막 정상 방송은 22:45, 다음 방송은 23:00."},
        {title:"사진 뒷면", text:"#18 뒷면에는 ‘먼저 가 있겠대.’라는 메모가 있지만 작성자는 불명이다."},
        {title:"자동방송 로그", text:"22:45 정상 / 23:00 정상. 두 방송 사이 수동 방송 기록 없음."}
      ],
      meaningOptions:[
        "소라는 22:47에 숙소로 돌아왔다.",
        "소라는 22:47 이후에도 일행과 함께 있었다.",
        "22:47은 소라가 일행과 함께 있었음이 확인된 마지막 시각이다.",
        "소라는 23:00에 실종되었다."
      ], meaningAnswer:2,
      hints:["22:39에 ‘8분 차이’만 적용하면 두 후보가 생깁니다. 어느 시계가 느린지 찾아야 합니다.","관리동이 방송실보다 8분 느립니다. 22:39 + 8 = 22:47. 그 다음은 ‘22:47이 무엇을 증명하는지’를 고르세요."]
    },
    3: {
      title:"서로 다른 기억", label:"RECORD 03",
      intro:"복구된 기록 중 한 사람의 화면만 다릅니다. 먼저 차이를 찾고, 어느 쪽이 진짜인지 증명하세요.",
      normal:["출발 — 4명","관리동 — 전원 확인","두 번째 표식 — 전원 확인","귀환 — 3명"],
      distorted:["출발 — 4명","관리동 — 전원 확인","두 번째 표식 — 3명 확인","귀환 — 3명"],
      verifyClues:[
        {title:"확인표 운영 규칙", text:"참가자에게 개인 확인표 1장씩 지급. 각 표식에서 도장을 받고 숙소 귀환 시 최종 회수한다."},
        {title:"지급 대장", text:"지급 전 12장 / 지급 후 8장. 참가자 1인당 1장씩 지급했다."},
        {title:"발견물 기록", text:"두 번째 표식과 세 번째 표식 사이, 두 번째 표식에서 약 180m 지난 숲길에서 확인표 1장 발견. 확인표에는 제2표식 도장이 있고 제3표식 도장은 없다."},
        {title:"사진 #18", text:"두 번째 표식 사진. 얼굴은 흐리지만 바닥에 네 사람의 그림자가 찍혀 있다."}
      ],
      countOptions:["3명","4명"], countAnswer:"4명",
      mapOptions:["관리동 이전","관리동 → 두 번째 표식","두 번째 표식 → 세 번째 표식 사이 숲길","세 번째 표식 → 숙소"], mapAnswer:2,
      hints:["‘다수가 보는 화면’이 진짜라는 보장은 없습니다. 두 번째 표식 통과 인원을 별도 자료로 증명하세요.","확인표에는 제2표식 도장이 있고 제3표식 도장이 없습니다. 소라는 제2표식까지 갔지만 제3표식에는 도달하지 못했습니다."]
    },
    4: {
      title:"말하지 못한 것", label:"RECORD 04",
      intro:"한 사람에게만 손상된 무전기 음성 기록의 복원본이 전달됩니다. 목격자는 말 대신 그림으로만 증언할 수 있습니다.",
      witnessRecord:[
        "22:51 — 소라: ‘잠깐만. 신발에 뭐가 들어갔어.’",
        "하루: ‘쟤 놀려주자. 우리 먼저 가자.’",
        "나오: ‘야, 그래도 소라 두고 가는 건 좀…’",
        "렌: ‘금방 오겠지.’",
        "소라: ‘뭐 해? 잠깐 기다려—’",
        "세 사람은 그대로 이동했고, 소라는 뒤늦게 그들을 쫓았다."
      ],
      rules:"WITNESS는 밴드챗에서 글자·숫자·초성·말풍선·텍스트 없이 순수 그림으로만 답합니다. 질문은 자유입니다. 증언권은 5회입니다.",
      objectives:[
        {key:"reason", title:"소라가 멈춘 이유", options:["길을 잃어서","신발에 이물질이 들어가서","사진을 찍으려고","무전기를 찾으려고"], answer:1},
        {key:"proposer", title:"먼저 이동하자고 제안한 사람", options:["青木 春","水無瀬 空","白川 蓮","橘 直"], answer:0},
        {key:"reaction", title:"소라가 일행에게 보인 반응", options:["먼저 가라고 함","아무 반응 없음","붙잡거나 제지하려 함","다른 길을 선택함"], answer:2},
        {key:"hesitant", title:"처음 제안을 망설인 사람", options:["青木 春","水無瀬 空","白川 蓮","橘 直"], answer:3}
      ],
      truthOptions:["소라가 스스로 남았다.","길을 잃어 자연스럽게 갈라졌다.","일행이 소라가 뒤에 있다는 것을 알고도 의도적으로 먼저 이동했다.","교사가 소라를 따로 불렀다."], truthAnswer:2,
      hints:["질문을 낭비하지 말고 각자의 조사 목표를 먼저 공유하세요.","핵심은 ‘누가 제안했는지 / 소라가 왜 멈췄는지 / 소라가 동의했는지’입니다."]
    },
    final: {
      title:"네 번째 귀환자", label:"FINAL RECORD",
      facts:["소라는 숙소로 귀환했다.","소라는 두 번째 표식 이전에 사라졌다.","소라를 제외한 세 학생은 숙소로 귀환했다.","네 학생 모두 숙소로 귀환했다."], factAnswer:2,
      pattern:["소라의 이름","22시 47분","두 번째 표식","존재하지 않는 한 명"], patternAnswer:3,
      ending:["네 번째 귀환자의 이름을 새로 기록한다.","과거 귀환 기록을 삭제한다.","소라를 결석 처리한다.","돌아오지 못한 한 명을 인정한다."], endingAnswer:3,
      hints:["과거 기록과 현재 게임방 모두 ‘실제 인원보다 하나 많다’는 공통점이 있습니다.","기록을 끝내려면 없던 사람을 만들어내는 게 아니라, 돌아오지 못한 한 명이 있었다는 사실을 인정해야 합니다."]
    }
  }
};
