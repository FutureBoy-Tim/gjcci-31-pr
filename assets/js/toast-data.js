/* 광진구상공회 CEO 31기 — 연말 건배사 생성기
 * 정적 데이터 + 바닐라 JS. 백엔드 없이 즉시 동작한다.
 * 각 항목: { lead: 선창, chorus: 후창, tip: 한 줄 해설 }
 * {target} — 모임명·대상, {member} — 선택한 회원 이름
 */
(function () {
  "use strict";

  const STYLES = [
    { id: "classy", label: "🥂 품격·CEO형", hint: "격식 있는 송년회·상견례 자리" },
    { id: "witty", label: "😄 유쾌·센스형", hint: "웃음이 필요한 2차 자리" },
    { id: "short", label: "⚡ 짧고 굵게", hint: "건배 직전, 3초 안에" },
    { id: "gjcci", label: "🏛️ 31기·광진구 맞춤형", hint: "31기 모임 전용" },
    { id: "acrostic", label: "✨ 삼행시형", hint: "이름·모임명으로 짓는 삼행시" }
  ];

  const DB = {
    classy: [
      {
        lead: "한 해 동안 각자의 자리에서 묵묵히 버텨 온 우리,",
        chorus: "그 버팀이 오늘의 우리입니다. 건배!",
        tip: "가장 무난하고 품격 있는 오프닝. 회장·원장·고문님이 계신 자리에서 먼저 쓰기 좋습니다."
      },
      {
        lead: "돈은 다시 벌 수 있어도, 사람은 다시 만나기 어렵습니다.",
        chorus: "오늘 이 자리에 모인 인연에, 건배!",
        tip: "사업 이야기로 무거워질 때 분위기를 정리하는 한 마디. 천천히, 낮은 목소리로."
      },
      {
        lead: "쉽지 않은 한 해였습니다. 그런데 우리는 여기서 이렇게 웃고 있습니다.",
        chorus: "그것 하나로 충분합니다. 건배!",
        tip: "어려운 한 해를 보낸 모임에. 힘들었다는 말 대신 웃음으로 닫아 주는 방식입니다."
      },
      {
        lead: "좋은 회사는 혼자 만들지 않습니다. 좋은 사람들이 옆에 있어 만들어질 뿐입니다.",
        chorus: "옆자리의 동기에게, 건배!",
        tip: "옆 사람과 잔을 부딪치게 만드는 멘트. 원샷보다 ‘옆자리와 눈 맞추기’를 유도하세요."
      },
      {
        lead: "우리는 각자의 업(業)을 하지만, 같은 시대를 삽니다.",
        chorus: "{target}, 이 자리의 인연에 건배!",
        tip: "업종이 다양한 31기 성격을 살린 멘트. 업종 소개가 길어질 때 마무리로 쓰면 깔끔합니다."
      },
      {
        lead: "올해의 성과는 숫자로 남지만, 올해의 사람은 기억으로 남습니다.",
        chorus: "기억에 남을 사람들께, 건배!",
        tip: "매출·실적 이야기가 오간 뒤에. 숫자보다 사람을 앞세우면 자리가 따뜻해집니다."
      },
      {
        lead: "내일의 나를 위해, 오늘 한 잔은 반드시 필요합니다.",
        chorus: "필요한 일은 미루지 맙시다. 건배!",
        tip: "품격과 유쾌의 경계선. 술을 권하는 자리에서 부담 없이 쓰기 좋습니다."
      },
      {
        lead: "광진에서 만난 인연이 전국으로 뻗어 나가길 바랍니다.",
        chorus: "31기의 네트워크에, 건배!",
        tip: "지역 모임에서 ‘우리끼리’로 끝나지 않게 확장성을 얘기해 주는 멘트."
      },
      {
        lead: "{target}, 오늘 이 자리의 주인공은 여러분입니다.",
        chorus: "오늘의 주인공, 건배!",
        tip: "모임명을 넣으면 ‘송년회’·‘다은컴즈’처럼 그 자리 이름으로 시작하는 멘트가 됩니다."
      },
      {
        lead: "{member}, 오늘 이 자리는 당신 때문에 한 겹 더 밝아졌습니다.",
        chorus: "{member}의 한 해에, 건배!",
        tip: "회원 한 분을 골라 주인공으로 세우는 멘트. 회원 선택에서 이름을 고르면 자동으로 채워집니다."
      },
      {
        lead: "좋은 한 해를 보낸 사람에게는 좋은 한 잔이 어울립니다.",
        chorus: "올해도 잘 살아낸 우리에게, 건배!",
        tip: "건배사가 길어지기 쉬운 자리에서 20초 안에 끝내는 표준형."
      }
    ],
    witty: [
      {
        lead: "연말에 지켜야 할 세 가지가 있습니다. 체중, 체면, 체력.",
        chorus: "오늘은 체면만 지킵시다. 건배!",
        tip: "폭소 포인트가 확실한 오프닝. 3초 쉬었다가 후창을 던지면 웃음이 커집니다."
      },
      {
        lead: "올해 우리 모두 AI처럼 일했습니다. 24시간, 학습하고, 또 학습하고.",
        chorus: "오늘만큼은 ‘휴(休)’ 모드로! 건배!",
        tip: "2026년 분위기 반영. ‘AI’를 아는 사람이 많은 자리에서 특히 잘 먹힙니다."
      },
      {
        lead: "매출은 회계가 기억하고, 술자리는 사람이 기억합니다.",
        chorus: "오늘은 사람이 이깁니다. 건배!",
        tip: "실적 이야기 직후에 쓰면 웃으면서 주제를 바꿀 수 있습니다."
      },
      {
        lead: "사장님들은 다 계획이 있으십니다. 오늘의 계획은 ‘한 잔 더’입니다.",
        chorus: "계획대로 됩시다. 건배!",
        tip: "2차로 넘어가기 전에. 웃으면서 자리를 한 번 더 붙여 줍니다."
      },
      {
        lead: "올해도 살아남았습니다. 이건 꽤 괜찮은 성과입니다.",
        chorus: "생존이 최고의 성장! 건배!",
        tip: "자조 섞인 위로가 필요한 자리. 어려운 업종이 많을 때 특히 좋습니다."
      },
      {
        lead: "내일 아침 회의가 있는 분, 손 들어보세요. ……없네요. 좋습니다.",
        chorus: "없는 셈 치고, 건배!",
        tip: "잔을 든 뒤에 던지는 멘트. 손 드는 사람이 실제로 없을 때 가장 웃깁니다."
      },
      {
        lead: "적자는 회계로, 스트레스는 이 잔으로 넘깁시다.",
        chorus: "오늘만 원샷! 건배!",
        tip: "원샷을 유도하고 싶을 때. 단, 술을 못 드시는 분에겐 ‘한 모금’으로 바꿔 말하세요."
      },
      {
        lead: "{target}에서 오늘 가장 비싼 것은 이 잔이 아니라 이 인연입니다.",
        chorus: "인연값, 오늘 계산! 건배!",
        tip: "모임명을 넣으면 그 자리 전용 센스 멘트가 됩니다. 2차 자리에서 특히 잘 통합니다."
      },
      {
        lead: "올해 가장 잘한 투자는…… 오늘 이 자리에 온 것입니다.",
        chorus: "투자 성공! 건배!",
        tip: "수익률 이야기가 오간 뒤에. 자기 자리 자랑이 아니라 사람 자랑이 됩니다."
      },
      {
        lead: "오늘 {member}님이 계셔서 이 자리가 완성됐습니다. 나머지는 잔이 채워 주겠습니다.",
        chorus: "{member}, 한 잔! 건배!",
        tip: "분위기를 띄울 때. 이름을 부르고 잔을 들면 그분이 자연스럽게 주인공이 됩니다."
      },
      {
        lead: "올해 초에 세운 계획, 기억나십니까? 저도 방금 기억났습니다.",
        chorus: "계획은 내년에, 건배는 지금!",
        tip: "셀프 디스형. 첫 잔 전에 긴장을 풀어 주는 데 효과적입니다."
      }
    ],
    short: [
      { lead: "한 해 수고했습니다.", chorus: "건배!", tip: "가장 짧고 안전한 마무리. 3초 안에 끝납니다." },
      { lead: "우리, 여기까지 왔습니다.", chorus: "건배!", tip: "힘든 한 해를 보낸 자리에서 짧게 위로하는 방식." },
      { lead: "말은 줄이고, 잔은 높이.", chorus: "건배!", tip: "인사말이 길어지려는 분위기를 정리할 때." },
      { lead: "인연은 길게, 잔은 짧게.", chorus: "건배!", tip: "과음이 걱정되는 자리에서. 웃으면서 속도를 조절합니다." },
      { lead: "31기, 아직 안 끝났습니다.", chorus: "건배!", tip: "모임 막바지에 다음 모임을 암시하는 한마디." },
      { lead: "각자의 자리에서, 각자의 승리로.", chorus: "건배!", tip: "업종이 달라도 통하는 만능 멘트." },
      { lead: "오늘은 여기까지가 아니라, 여기부터입니다.", chorus: "건배!", tip: "신년 계획을 암시하는 마무리형. 12월 말에 잘 어울립니다." },
      { lead: "감사합니다. 그리고 건배.", chorus: "건배!", tip: "감사 인사만 남기고 싶을 때. 가장 무해한 선택." },
      { lead: "{target}, 잘 부탁드립니다.", chorus: "한 잔! 건배!", tip: "모임명을 넣으면 그 자리 전용 한 줄이 됩니다. 3초 멘트." },
      { lead: "다들 건강하십니까? 그럼 됐습니다.", chorus: "건배!", tip: "건강이 화두인 자리에서. 50대 이상 모임에 특히 잘 맞습니다." },
      { lead: "{member}, 그리고 우리 모두.", chorus: "건배!", tip: "이름 한 번 부르고 바로 잔을 드는 가장 짧은 형식." }
    ],
    gjcci: [
      {
        lead: "2026년, 우리는 광진구상공회 31기로 만났습니다. 우연이 아니라 인연입니다.",
        chorus: "31기의 인연에, 건배!",
        tip: "31기 모임의 기본 멘트. 상공회 관계자분이 계실 때 가장 안전합니다."
      },
      {
        lead: "같은 건물도, 같은 시간도 아니지만, 같은 시간표를 살아낸 동기입니다.",
        chorus: "31기 동기에, 건배!",
        tip: "강의실 기억을 소환하는 멘트. 수료 후 모임에서 특히 반응이 좋습니다."
      },
      {
        lead: "광진에서 시작해 대한민국으로 — 31기의 영업망은 오늘도 확장 중입니다.",
        chorus: "무한 확장! 건배!",
        tip: "비즈니스 모임 성격이 강할 때. 명함 교환 타이밍에 던지면 좋습니다."
      },
      {
        lead: "우리에게는 이미 최고의 네트워크가 있습니다. 바로 이 방 안에.",
        chorus: "52인의 명함첩에, 건배!",
        tip: "신규 회원이 많거나 서먹할 때. ‘여기 있는 사람이 자산’이라는 메시지."
      },
      {
        lead: "한 명이 아프면 52명이 아픕니다. 그래서 우리는 강합니다.",
        chorus: "52인 원팀! 건배!",
        tip: "경조사·소식이 오간 뒤에. 공동체 감각을 살려 주는 멘트입니다."
      },
      {
        lead: "내년에도 이 자리에서 만납시다. 올해보다 더 좋은 이야기로.",
        chorus: "31기의 다음 챕터에, 건배!",
        tip: "모임 마무리용. 다음 모임 날짜를 이어서 정하면 자연스럽습니다."
      },
      {
        lead: "오늘 이 자리, 31기 총무진이 조용히 준비했습니다.",
        chorus: "총무진 만세! 건배!",
        tip: "준비해 주신 분들께 박수를 돌리는 멘트. 반드시 실명 대신 ‘총무진’으로."
      },
      {
        lead: "31기는 졸업이 아니라 시작입니다.",
        chorus: "시작하는 31기! 건배!",
        tip: "수료식·송년회 공통. 짧고 각인되는 구호가 필요할 때."
      },
      {
        lead: "오늘의 주인공은 {member}입니다. 31기의 자랑으로 남으시길.",
        chorus: "{member}, 건배!",
        tip: "회원 한 분을 골라 축하할 때. 회원 선택에서 이름을 고르면 자동으로 채워집니다."
      }
    ],
    acrostic: [
      {
        key: "송년회",
        lines: ["송(送) — 송구했던 한 해는 오늘 다 보내버리고,", "년(年) — 연말 정산은 내일의 나에게 맡기고,", "회(會) — 회(會)처럼 크게 웃으며 한 잔."],
        chorus: "송년회, 건배!",
        tip: "‘회’를 ‘회(會)’로 받아 웃음으로 닫는 삼행시. 가장 무난한 송년회용."
      },
      {
        key: "광진구",
        lines: ["광(光) — 광(光)처럼 밝게 나아가고,", "진(進) — 진(進)하게 한 걸음 더,", "구(求) — 구(求)하는 것은 다 이루고."],
        chorus: "광진구, 건배!",
        tip: "지역 모임용. 한자 풀이를 붙이면 품격이 살아납니다."
      },
      {
        key: "31기",
        lines: ["3 — 삼(三) 번 웃고,", "1 — 일(一) 번 더 크게 웃고,", "기(氣) — 기(氣) 있게 한 잔."],
        chorus: "31기, 건배!",
        tip: "숫자를 소리 내어 세는 재미. 다 같이 ‘삼! 일! 기!’를 외치면 분위기가 뜹니다."
      },
      {
        key: "건배사",
        lines: ["건(乾) — 건강도, 사업도, 인연도", "배(倍) — 배(倍)로 불어나길 바라며,", "사(士) — 사(士)와 사람이 함께 웃는 한 해."],
        chorus: "건배사, 건배!",
        tip: "건배사 자체를 소재로 쓰는 메타 삼행시. 첫 잔에 쓰기 좋습니다."
      },
      {
        key: "이형진",
        lines: ["이(二) — 이(二) 배로 웃고,", "형(兄) — 형(兄)처럼 든든하게,", "진(眞) — 진(眞)심으로 한 잔."],
        chorus: "이형진, 건배!",
        tip: "이름 삼행시의 정석. 상대 이름을 부르며 잔을 들면 효과가 큽니다."
      },
      {
        key: "다은컴즈",
        lines: ["다(多) — 다(多) 같이 웃고,", "은(恩) — 은(恩)을 기억하고,", "컴(com) — 컴(com)처럼 연결되고, 즈(즈)… 즈음에 한 잔."],
        chorus: "다은컴즈, 건배!",
        tip: "영문이 섞인 회사명용 변형. 마지막 글자에서 살짝 넘어가며 웃음을 만듭니다."
      },
      {
        key: "새해",
        lines: ["새(新) — 새(新)로운 마음으로,", "해(海) — 해(海)처럼 넓게,", "복(福) — 복(福)은 나눌수록 커지고."],
        chorus: "새해 복 많이 받으십시오! 건배!",
        tip: "신년회·시무식 겸용. ‘새해’가 들어오면 이 세 줄로 자동 전환됩니다."
      }
    ]
  };

  const DEFAULT_TARGET = "우리 31기";
  const FALLBACK_MEMBER = "오늘의 주인공";

  /* ── 유틸 ───────────────────────────── */
  const pick = (arr, avoid) => {
    if (arr.length === 1) return arr[0];
    let i = Math.floor(Math.random() * arr.length);
    if (avoid && arr.length > 1 && arr[i] === avoid) i = (i + 1) % arr.length;
    return arr[i];
  };

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function normalizeTarget(raw, member) {
    let t = (raw || "").trim();
    if (member) t = member;
    if (!t) return DEFAULT_TARGET;
    return t.replace(/\s+/g, " ").slice(0, 24);
  }

  function fill(text, target, member) {
    return text
      .replace(/\{target\}/g, target || DEFAULT_TARGET)
      .replace(/\{member\}/g, member || FALLBACK_MEMBER);
  }

  /* 삼행시: 등록된 키워드가 있으면 사용, 없으면 입력값으로 즉석 삼행시 */
  function acrostic(target, member) {
    const word = (target && target !== DEFAULT_TARGET) ? target.replace(/\s/g, "") : "";
    const found = word && DB.acrostic.find((a) => word.includes(a.key) || a.key.includes(word.slice(0, 2)));
    if (found) {
      return {
        lines: found.lines.map((l) => fill(l, target, member)),
        chorus: fill(found.chorus, target, member),
        tip: found.tip
      };
    }
    const chars = Array.from(word || (member || DEFAULT_TARGET).replace(/\s/g, "")).slice(0, 3);
    const head = ["한 해의 무게를 내려놓고,", "옆자리의 손을 잡고,", "내일을 크게 웃으며"];
    const lines = chars.length >= 2
      ? chars.map((c, i) => `${c} — ${head[i] || head[head.length - 1]} (${i + 1}/${chars.length})`)
      : ["한(一) — 한 번뿐인 오늘,", "해(海) — 해맑게 웃고,", "잔(盞) — 잔을 높이."];
    return {
      lines,
      chorus: chars.length >= 2 ? `${chars.join("! ")}! 건배!` : "오늘 이 자리에, 건배!",
      tip: chars.length >= 2
        ? `입력하신 ‘${esc(word)}’를 글자마다 끊어 부르는 방식입니다. 다 같이 글자를 따라 외치면 분위기가 살아납니다.`
        : "두 글자 이하일 때는 기본 삼행시로 대체됩니다. 모임명이나 이름을 넣으면 그 글자로 지어 드립니다."
    };
  }

  /* ── 생성 ───────────────────────────── */
  let last = null;

  function generate(styleId, rawTarget, memberName) {
    const target = normalizeTarget(rawTarget, memberName);
    if (styleId === "acrostic") {
      const a = acrostic(target, memberName);
      last = { styleId, target, lead: a.lines, chorus: a.chorus, tip: a.tip, acrostic: true };
      return last;
    }
    const pool = DB[styleId] || DB.classy;
    // 이름·모임명을 넣었으면 그 값을 실제로 쓰는 멘트를 우선한다
    let cand = pool;
    if (memberName) {
      const withMember = pool.filter((x) => /\{member\}/.test(x.lead + x.chorus + x.tip));
      if (withMember.length) cand = withMember;
    } else {
      // 회원을 고르지 않았으면 이름 자리({member})가 빈 멘트는 쓰지 않는다
      const noMember = pool.filter((x) => !/\{member\}/.test(x.lead + x.chorus + x.tip));
      if (noMember.length) cand = noMember;
    }
    if (!memberName && target && target !== DEFAULT_TARGET) {
      const withTarget = cand.filter((x) => /\{target\}/.test(x.lead + x.chorus + x.tip));
      if (withTarget.length) cand = withTarget;
    }
    const item = pick(cand, last && last.item);
    last = {
      styleId,
      target,
      item,
      lead: [fill(item.lead, target, memberName)],
      chorus: fill(item.chorus, target, memberName),
      tip: item.tip
    };
    return last;
  }

  function asText(r) {
    const label = (STYLES.find((s) => s.id === r.styleId) || {}).label || "";
    return [
      `🥂 연말 건배사 (${label.replace(/^\S+\s/, "")})`,
      "",
      "【선창】",
      ...r.lead,
      "",
      `【후창】 ${r.chorus}`,
      "",
      `💡 ${r.tip}`,
      "",
      "— 광진구상공회 CEO 아카데미 31기 · 연말 건배사 생성기"
    ].join("\n");
  }

  window.ToastGen = { STYLES, DB, generate, asText, normalizeTarget };
})();
