/* 광진구상공회 CEO 31기 회원 명부 — 공용 스크립트
 * 데이터: data/members.json (연락처 전체 공개 — show 플래그로 항목별 노출을 켜고 끈다)
 */
window.SITE_CONFIG = {
  useSensitive: false,  // 별도 원본 파일을 함께 읽지 않는다 (실제 값은 data/members.json에 직접 들어 있다)
  showMobile: true,     // 개인 휴대폰 노출 여부 — 31기 전체 공개
  showEmail: true,      // 개인 이메일 노출 여부 — 31기 전체 공개
  showBizno: true,      // 사업자등록번호 노출 여부 — 31기 전체 공개
  showTel: true         // 직장 전화/팩스 (업무 연락처)
};

const EMPTY = ["-", "", null, undefined, "비공개"];
const isBlank = v => EMPTY.includes(v);

/* ── 마스킹 ─────────────────────────────── */
function maskMobile(v) {
  if (isBlank(v)) return "-";
  const d = String(v).replace(/[^0-9]/g, "");
  if (d.length < 7) return "***";
  if (d.length === 11) return d.slice(0, 3) + "-****-" + d.slice(7);
  return d.slice(0, 3) + "-***-" + d.slice(-4);
}
function maskEmail(v) {
  if (isBlank(v)) return "-";
  const [id, dom] = String(v).split("@");
  if (!dom) return "***";
  const head = id.slice(0, Math.min(2, id.length));
  return head + "***@" + dom;
}
function maskBizno(v) {
  if (isBlank(v)) return "-";
  const d = String(v).replace(/[^0-9]/g, "");
  if (d.length < 3) return "***-**-*****";
  return d.slice(0, 3) + "-**-*****";
}

/* ── 데이터 ─────────────────────────────── */
async function loadMembers() {
  const res = await fetch("data/members.json", { cache: "no-store" });
  if (!res.ok) throw new Error("members.json 로드 실패: " + res.status);
  return res.json();
}

function photoHtml(m, cls) {
  if (m.photo) return `<img src="${m.photo}" alt="${m.name} 프로필 사진" loading="lazy" />`;
  return `<div class="avatar"><span>${m.name.slice(0, 1)}</span></div>`;
}

/* ── 메인 목록 ──────────────────────────── */
async function initIndex() {
  const grid = document.getElementById("grid");
  if (!grid) return;
  let data;
  try { data = await loadMembers(); }
  catch (e) {
    grid.innerHTML = `<div class="empty">회원 데이터를 불러오지 못했습니다. (${e.message})</div>`;
    return;
  }
  const members = data.members;
  const state = { q: "", cat: "전체" };

  // 상단 통계
  const cats = [...new Set(members.map(m => m.category))];
  const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setText("statTotal", members.length);
  setText("statCats", cats.filter(c => c !== "업종 미입력").length);
  setText("statPhoto", members.filter(m => m.photo).length);
  setText("updatedAt", data.meta.lastUpdated || "");

  // 업종 칩
  const chips = document.getElementById("cats");
  const counts = {};
  members.forEach(m => counts[m.category] = (counts[m.category] || 0) + 1);
  const order = ["전체", ...cats.filter(c => c !== "업종 미입력").sort((a, b) => counts[b] - counts[a]), "업종 미입력"].filter(c => c === "전체" || counts[c]);
  chips.innerHTML = order.map(c => {
    const n = c === "전체" ? members.length : counts[c];
    return `<button class="chip${c === state.cat ? " active" : ""}" data-cat="${c}">${c}<span class="cnt">${n}</span></button>`;
  }).join("");
  chips.addEventListener("click", e => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    state.cat = btn.dataset.cat;
    [...chips.children].forEach(c => c.classList.toggle("active", c === btn));
    render();
  });

  const search = document.getElementById("search");
  if (search) search.addEventListener("input", () => { state.q = search.value.trim().toLowerCase(); render(); });

  function matches(m) {
    if (state.cat !== "전체" && m.category !== state.cat) return false;
    if (!state.q) return true;
    const hay = [m.name, m.company, m.industry, m.address, m.category, m.engname, m.title, m.note]
      .filter(v => !isBlank(v)).join(" ").toLowerCase();
    return hay.includes(state.q);
  }

  function render() {
    const list = members.filter(matches).sort((a, b) => a.order - b.order);
    document.getElementById("resultCount").textContent = `${list.length}명 / 전체 ${members.length}명`;
    if (!list.length) {
      grid.innerHTML = `<div class="empty">조건에 맞는 회원이 없습니다. 다른 검색어나 업종을 선택해 보세요.</div>`;
      return;
    }
    grid.innerHTML = list.map(m => `
      <a class="card" href="member.html?id=${m.id}">
        <div class="card-photo">${photoHtml(m)}</div>
        <div class="card-body">
          <h3 class="card-name">${m.name}<span class="gi">31기</span></h3>
          <div class="card-co">${isBlank(m.company) ? '<span class="masked">회사 정보 미입력</span>' : m.company}</div>
          <div class="card-ind">${isBlank(m.industry) ? "" : m.industry}${isBlank(m.title) ? "" : (isBlank(m.industry) ? "" : " · ") + m.title}</div>
          <div class="card-foot">
            <span class="badge${m.category === "업종 미입력" ? " muted" : ""}">${m.category}</span>
            <span class="arrow">상세 →</span>
          </div>
        </div>
      </a>`).join("");
  }
  render();
}

/* ── 상세 페이지 ────────────────────────── */
async function initDetail() {
  const root = document.getElementById("detail");
  if (!root) return;
  const id = new URLSearchParams(location.search).get("id");
  let data;
  try { data = await loadMembers(); }
  catch (e) { root.innerHTML = `<div class="empty">회원 데이터를 불러오지 못했습니다. (${e.message})</div>`; return; }

  const m = data.members.find(x => x.id === id);
  if (!m) {
    root.innerHTML = `<div class="empty">해당 회원을 찾을 수 없습니다. <a href="index.html#members">목록으로 돌아가기</a></div>`;
    return;
  }
  document.title = `${m.name} · 광진구상공회 CEO 31기`;

  const pv = m.private || { mobile: m.mobile, email: m.email, bizno: m.bizno };
  const masked = m.masked || {};
  const canShow = (flag, v) => flag && !isBlank(v);
  const mobileCell = canShow(window.SITE_CONFIG.showMobile, pv.mobile)
    ? `<a href="tel:${String(pv.mobile).replace(/[^0-9]/g, "")}">${pv.mobile}</a>`
    : `<span class="masked">${masked.mobile || maskMobile(pv.mobile)}</span>`;
  const emailCell = canShow(window.SITE_CONFIG.showEmail, pv.email)
    ? `<a href="mailto:${pv.email}">${pv.email}</a>`
    : `<span class="masked">${masked.email || maskEmail(pv.email)}</span>`;
  const bizCell = canShow(window.SITE_CONFIG.showBizno, pv.bizno)
    ? pv.bizno
    : `<span class="masked">${masked.bizno || maskBizno(pv.bizno)}</span>`;

  const rows = [
    ["소속", isBlank(m.company) ? "회사 정보 미입력" : m.company],
    ["직위", m.title],
    ["업종", m.industry],
    ["분류", m.category],
    ["직장 주소", m.address],
    ["직장 전화", isBlank(m.tel) ? "-" : `<a href="tel:${String(m.tel).replace(/[^0-9]/g, "")}">${m.tel}</a>`],
    ["팩스", m.fax],
    ["휴대폰", mobileCell],
    ["이메일", emailCell],
    ["사업자등록번호", bizCell]
  ];
  const noteHtml = isBlank(m.note) ? "" : `
    <div class="info-row"><div class="k">비고</div><div class="v">${m.note}</div></div>`;

  const related = data.members
    .filter(x => x.id !== m.id && x.category === m.category && m.category !== "업종 미입력")
    .slice(0, 8);

  root.innerHTML = `
    <a class="back-link" href="index.html#members">← 전체 회원 목록</a>
    <div class="detail-wrap">
      <aside class="profile-card">
        <div class="profile-photo">${photoHtml(m)}</div>
        <div class="profile-id">
          <h1>${m.name}</h1>
          <div class="en">${isBlank(m.engname) ? "광진구상공회 CEO 31기" : m.engname}</div>
          <div class="co">${isBlank(m.company) ? "회사 정보 미입력" : m.company}</div>
          <div class="ti">${isBlank(m.title) ? "" : m.title}${isBlank(m.industry) ? "" : (isBlank(m.title) ? "" : " · ") + m.industry}</div>
          <div class="tag-row"><span class="badge${m.category === "업종 미입력" ? " muted" : ""}">${m.category}</span><span class="badge muted">31기</span></div>
        </div>
      </aside>
      <div class="detail-body">
        <div class="info-table">
          ${rows.map(([k, v]) => `<div class="info-row"><div class="k">${k}</div><div class="v">${isBlank(v) ? "-" : v}</div></div>`).join("")}
          ${noteHtml}
        </div>
        <div class="panel">
          <h2>연락처 공개 범위</h2>
          <p>이 명부는 31기 회원 간 상호 연결을 위해 <b>휴대폰·이메일·사업자등록번호·프로필 사진을 모두 공개</b>하고 있습니다.
          회원수첩에 등록된 정보를 그대로 옮겼으며, 검색엔진 검색 결과에도 노출됩니다.</p>
          <div class="locked-note">현재 설정 — 휴대폰 ${window.SITE_CONFIG.showMobile ? "공개" : "비노출"} · 이메일 ${window.SITE_CONFIG.showEmail ? "공개" : "비노출"} · 사업자번호 ${window.SITE_CONFIG.showBizno ? "공개" : "비노출"} · 검색엔진 노출 허용
          · 정보 수정이나 비공개 요청은 아래 문의처로 알려 주세요.</div>
        </div>
        ${related.length ? `
        <div class="panel">
          <h2>같은 업종 회원</h2>
          <div class="mini-grid">
            ${related.map(r => `
              <a class="mini-card" href="member.html?id=${r.id}">
                <div class="mini-photo">${r.photo ? `<img src="${r.photo}" alt="${r.name}" loading="lazy" />` : r.name.slice(0, 1)}</div>
                <div><div class="nm">${r.name}</div><div class="bs">${isBlank(r.company) ? r.category : r.company}</div></div>
              </a>`).join("")}
          </div>
        </div>` : ""}
      </div>
    </div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  initIndex();
  initDetail();
});
