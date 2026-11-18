/* 광진구상공회 CEO 31기 — 연말 건배사 생성기
 * 정적 JSON(data/toasts.json)을 불러와 백엔드 없이 동작한다.
 * 각 항목: { lead: 선창, chorus: 후창, tip: 한 줄 해설 }
 * {target} — 모임명·대상, {member} — 선택한 회원 이름
 * 삼행시 항목: { key, lines[], chorus, tip }
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

  const DEFAULT_TARGET = "우리 31기";
  const FALLBACK_MEMBER = "오늘의 주인공";

  /* 데이터를 못 불러와도 페이지가 비지 않도록 두는 최소 예비 문구 */
  const RESERVE = {
    classy: [
      { lead: "한 해 동안 각자의 자리에서 묵묵히 버텨 온 우리,", chorus: "그 버팀이 오늘의 우리입니다. 건배!", tip: "가장 무난한 품격형 오프닝." },
      { lead: "돈은 다시 벌 수 있어도, 사람은 다시 만나기 어렵습니다.", chorus: "오늘 이 자리에 모인 인연에, 건배!", tip: "사업 이야기로 무거워질 때." }
    ],
    witty: [
      { lead: "연말에 지켜야 할 세 가지가 있습니다. 체중, 체면, 체력.", chorus: "오늘은 체면만 지킵시다. 건배!", tip: "폭소 포인트가 확실한 오프닝." },
      { lead: "올해도 살아남았습니다. 이건 꽤 괜찮은 성과입니다.", chorus: "생존이 최고의 성장! 건배!", tip: "자조 섞인 위로가 필요한 자리." }
    ],
    short: [
      { lead: "한 해 수고했습니다.", chorus: "건배!", tip: "가장 짧고 안전한 마무리." },
      { lead: "인연은 길게, 잔은 짧게.", chorus: "건배!", tip: "과음이 걱정되는 자리에서." }
    ],
    gjcci: [
      { lead: "31기는 졸업이 아니라 시작입니다.", chorus: "시작하는 31기! 건배!", tip: "수료식·송년회 공통." },
      { lead: "우리에게는 이미 최고의 네트워크가 있습니다. 바로 이 방 안에.", chorus: "52인 원팀! 건배!", tip: "서먹한 자리에서." }
    ],
    acrostic: [
      { key: "인연", lines: ["인(人) — 사람 사이에 생긴 것이고,", "연(緣) — 연이 있으면 또 만납니다."], chorus: "인연, 건배!", tip: "어떤 자리에도 어색하지 않은 인연 삼행시." }
    ]
  };

  const DB = Object.assign({}, RESERVE);
  const META = { count: 0, version: "" };

  const PLACE = /\{(target|member)\}/g;
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function normalizeTarget(raw, member) {
    let t = (raw || "").trim();
    if (member) t = member;
    if (!t) return DEFAULT_TARGET;
    return t.replace(/\s+/g, " ").slice(0, 24);
  }

  function fill(text, target, member) {
    return String(text)
      .replace(/\{target\}/g, target || DEFAULT_TARGET)
      .replace(/\{member\}/g, member || FALLBACK_MEMBER);
  }

  /* ── 셔플 큐: 최근에 본 문구는 다시 나오지 않게 ── */
  const recent = {};
  function pick(pool, styleId) {
    const r = recent[styleId] || (recent[styleId] = []);
    const windowSize = Math.min(r.length, Math.max(0, pool.length - 5));
    const skip = new Set(windowSize ? r.slice(r.length - windowSize) : []);
    let cand = pool.filter((x) => !skip.has(x));
    if (!cand.length) cand = pool;
    const item = cand[Math.floor(Math.random() * cand.length)];
    r.push(item);
    if (r.length > 60) r.splice(0, r.length - 60);
    return item;
  }

  function hasPlaceholder(item) {
    return /\{(target|member)\}/.test((item.lead || "") + (item.chorus || "") + (item.tip || ""));
  }

  /* ── 삼행시 ── */
  function acrostic(target, member) {
    const raw = (target && target !== DEFAULT_TARGET) ? target.replace(/\s/g, "") : "";
    const list = DB.acrostic || [];
    if (raw) {
      const matches = list.filter((a) => {
        const k = (a.key || "").replace(/\s/g, "");
        return k && (raw.includes(k) || k.includes(raw) || k.startsWith(raw.slice(0, 2)) || raw.startsWith(k));
      });
      if (matches.length) {
        const found = pick(matches, "acrostic");
        return {
          lines: found.lines.map((l) => fill(l, target, member)),
          chorus: fill(found.chorus, target, member),
          tip: found.tip
        };
      }
      const chars = Array.from(raw).slice(0, 3);
      if (chars.length >= 2) {
        const head = ["한 해의 무게를 내려놓고,", "옆자리의 손을 잡고,", "내일을 크게 웃으며"];
        const lines = chars.map((c, i) => `${c} — ${head[i] || head[head.length - 1]} (${i + 1}/${chars.length})`);
        return {
          lines,
          chorus: `${chars.join("! ")}! 건배!`,
          tip: `입력하신 ‘${raw}’를 글자마다 끊어 부르는 즉석 삼행시입니다. 다 같이 글자를 따라 외치면 분위기가 살아납니다.`
        };
      }
    }
    /* 입력이 없으면 수록된 삼행시 중 하나를 골라 보여 준다 */
    const shortKeys = list.filter((a) => (a.key || "").replace(/\s/g, "").length <= 3);
    const found = pick(shortKeys.length ? shortKeys : list, "acrostic");
    return {
      lines: found.lines.map((l) => fill(l, DEFAULT_TARGET, member)),
      chorus: fill(found.chorus, DEFAULT_TARGET, member),
      tip: found.tip
    };
  }

  /* ── 생성 ── */
  function generate(styleId, rawTarget, memberName) {
    const target = normalizeTarget(rawTarget, memberName);
    if (styleId === "acrostic") {
      const a = acrostic(target, memberName);
      return { styleId, target, lead: a.lines, chorus: a.chorus, tip: a.tip, acrostic: true };
    }
    const pool = (DB[styleId] && DB[styleId].length ? DB[styleId] : DB.classy);
    // 이름·모임명이 있으면 그 값을 실제로 쓰는 멘트를 우선한다
    let cand = pool;
    if (memberName) {
      const withMember = pool.filter((x) => /\{member\}/.test(x.lead + x.chorus + x.tip));
      if (withMember.length) cand = withMember;
    } else {
      const noMember = pool.filter((x) => !/\{member\}/.test(x.lead + x.chorus + x.tip));
      if (noMember.length) cand = noMember;
    }
    if (!memberName && target && target !== DEFAULT_TARGET) {
      const withTarget = cand.filter((x) => /\{target\}/.test(x.lead + x.chorus + x.tip));
      if (withTarget.length) cand = withTarget;
    }
    const item = pick(cand, styleId);
    return {
      styleId,
      target,
      item,
      lead: [fill(item.lead, target, memberName)],
      chorus: fill(item.chorus, target, memberName),
      tip: item.tip
    };
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

  function count() {
    return Object.values(DB).reduce((a, b) => a + (b ? b.length : 0), 0);
  }

  const ready = fetch("./data/toasts.json", { cache: "no-cache" })
    .then((res) => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then((data) => {
      if (!data || !data.toasts) throw new Error("bad payload");
      Object.keys(data.toasts).forEach((k) => {
        if (Array.isArray(data.toasts[k]) && data.toasts[k].length) DB[k] = data.toasts[k];
      });
      META.count = (data.meta && data.meta.count) || count();
      META.version = (data.meta && data.meta.version) || "";
      return DB;
    })
    .catch((err) => {
      META.error = String(err && err.message ? err.message : err);
      META.count = count();
      return DB;
    });

  window.ToastGen = {
    STYLES,
    DB,
    META,
    ready,
    generate,
    asText,
    normalizeTarget,
    count,
    hasPlaceholder,
    esc
  };
})();
