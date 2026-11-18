/* 연말 건배사 생성기 — UI 바인딩 (31기 홈페이지 상단) */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const LAB = $("toastLab");
  if (!LAB || !window.ToastGen) return;

  const { STYLES, generate, asText } = window.ToastGen;
  const state = { style: "classy", member: "" };
  let result = null;

  /* ── 스타일 칩 ── */
  const chips = $("gtStyles");
  chips.innerHTML = STYLES.map(
    (s) => `<button type="button" class="gt-chip${s.id === state.style ? " on" : ""}" data-style="${s.id}" title="${s.hint}">
      <span>${s.label}</span></button>`
  ).join("");
  chips.addEventListener("click", (e) => {
    const b = e.target.closest(".gt-chip");
    if (!b) return;
    state.style = b.dataset.style;
    [...chips.children].forEach((c) => c.classList.toggle("on", c === b));
    render(true);
  });

  /* ── 회원 선택 (선택 사항) ── */
  const sel = $("gtMember");
  function fillMembers(list) {
    const opts = ['<option value="">회원 선택 (선택)</option>'];
    list
      .filter((m) => m.name)
      .forEach((m) => {
        const t = m.title && !["-", "비공개", ""].includes(m.title) ? m.title : "대표";
        const label = `${m.name} ${t}`;
        opts.push(`<option value="${m.id}">${label.replace(/</g, "&lt;")}</option>`);
      });
    sel.innerHTML = opts.join("");
  }
  const waitMembers = (tries) => {
    if (window.__members) return fillMembers(window.__members);
    if (tries > 40) return;
    setTimeout(() => waitMembers(tries + 1), 120);
  };
  waitMembers(0);

  sel.addEventListener("change", () => {
    const m = (window.__members || []).find((x) => x.id === sel.value);
    if (m) {
      const t = m.title && !["-", "비공개", ""].includes(m.title) ? m.title : "대표";
      $("gtTarget").value = `${m.name} ${t}`;
      state.member = m.name;
    } else {
      state.member = "";
    }
  });

  /* ── 렌더 ── */
  const box = $("gtResult");
  function render(isNew) {
    const target = $("gtTarget").value;
    result = generate(state.style, target, state.member && target.includes(state.member) ? state.member : "");
    const lead = result.lead
      .map((l, i) => `<p class="gt-line"><span class="gt-n">${i + 1}</span>${escapeHtml(l)}</p>`)
      .join("");
    box.innerHTML = `
      <div class="gt-block">
        <div class="gt-lab">선창 <span>리더가 말하는 멘트</span></div>
        ${lead}
      </div>
      <div class="gt-block gt-chorus-block">
        <div class="gt-lab">후창 <span>다 같이 외치는 구호</span></div>
        <p class="gt-chorus">${escapeHtml(result.chorus)}</p>
      </div>
      <p class="gt-tip"><span>💡</span>${escapeHtml(result.tip)}</p>`;
    box.classList.remove("is-new");
    if (isNew) {
      // 강제 리플로우 후 애니메이션 재생
      void box.offsetWidth;
      box.classList.add("is-new");
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  /* ── 버튼 ── */
  $("gtGo").addEventListener("click", () => render(true));
  $("gtAgain").addEventListener("click", () => render(true));
  $("gtTarget").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      state.member = "";
      sel.value = "";
      render(true);
    }
  });

  $("gtCopy").addEventListener("click", async () => {
    if (!result) render(false);
    const text = asText(result);
    let ok = false;
    // 1) 권한 창이 뜨지 않는 방식(구형 API) 먼저, 2) 막히면 클립보드 API
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      ok = document.execCommand("copy");
      document.body.removeChild(ta);
    } catch (e) { ok = false; }
    if (!ok) {
      try { await navigator.clipboard.writeText(text); ok = true; } catch (e) { ok = false; }
    }
    snack(ok ? "복사했어요. 카톡·문자에 붙여 넣으세요 🥂" : "복사가 막혔어요. 길게 눌러 직접 복사해 주세요.");
  });

  function snack(msg) {
    let el = document.querySelector(".gt-snack");
    if (!el) {
      el = document.createElement("div");
      el.className = "gt-snack";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("on");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("on"), 2400);
  }

  /* ── 접기 / 펼치기 ── */
  const body = $("gtBody");
  const toggle = $("gtToggle");
  toggle.addEventListener("click", () => {
    const closed = LAB.classList.toggle("closed");
    toggle.setAttribute("aria-expanded", closed ? "false" : "true");
    toggle.querySelector("span").textContent = closed ? "펼치기" : "접기";
    body.style.maxHeight = closed ? "0px" : body.scrollHeight + 40 + "px";
    if (!closed) setTimeout(() => { body.style.maxHeight = "none"; }, 320);
    try { localStorage.setItem("gt-closed", closed ? "1" : "0"); } catch (e) {} // eslint-disable-line
  });
  try {
    if (localStorage.getItem("gt-closed") === "1") toggle.click();
  } catch (e) { /* storage 없음 */ }

  /* ── 레퍼토리 수 표시 ── */
  try {
    const n = Object.values(window.ToastGen.DB).reduce((a, b) => a + b.length, 0);
    const c = document.querySelector(".gt-count");
    if (c) c.textContent = `${n}가지 레퍼토리 · 입력을 비우면 31기 기본 멘트`;
  } catch (e) { /* noop */ }

  /* ── 최초 1회 자동 생성 ── */
  render(false);
})();
