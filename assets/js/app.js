/* 광진구상공회 CEO 31기 회원 명부 — 공용 스크립트
 * 데이터: data/members.json (연락처 전체 공개 — show 플래그로 항목별 노출을 켜고 끈다)
 * 디지털 명함: assets/js/card.js (통일 디지털 명함 렌더러)
 */
window.SITE_CONFIG = {
  useSensitive: false,  // 별도 원본 파일을 함께 읽지 않는다 (실제 값은 data/members.json에 직접 들어 있다)
  showMobile: true,     // 개인 휴대폰 노출 여부 — 31기 전체 공개
  showEmail: true,      // 개인 이메일 노출 여부 — 31기 전체 공개
  showBizno: true,      // 사업자등록번호 노출 여부 — 31기 전체 공개
  showTel: true         // 직장 전화/팩스 (업무 연락처)
};

const EMPTY = ["-", "", null, undefined, "비공개"];
const isBlank = v => EMPTY.includes(typeof v === "string" ? v.trim() : v);
const digits = v => String(v || "").replace(/[^0-9]/g, "");
const SITE_URL = "https://futureboy-tim.github.io/gjcci-31-pr";

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

function cardLine(m) {
  if (!isBlank(m.company)) return m.company;
  return "광진구상공회 CEO 아카데미 31기";
}

function ariaOf(m) {
  const parts = [m.name];
  if (!isBlank(m.title)) parts.push(m.title);
  if (!isBlank(m.company)) parts.push(m.company);
  if (!isBlank(m.mobile)) parts.push(m.mobile);
  return parts.join(" · ") + " 디지털 명함";
}

function toast(msg) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("on");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("on"), 2200);
}

/* ── 세로형 명함 (히어로·흐름 영역) ─────────── */
const escH = v => String(v == null ? "" : v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function vCardHTML(m, opts) {
  opts = opts || {};
  const title = isBlank(m.title) ? "" : `<small>${escH(m.title)}</small>`;
  const co = isBlank(m.company) ? "광진구상공회 CEO 31기" : m.company;
  const hasCat = !isBlank(m.category) && m.category !== "업종 미입력";
  const tagText = !isBlank(m.industry) ? m.industry : (hasCat ? m.category : "CEO 아카데미 31기");
  const photo = m.photo
    ? `<img src="${escH(m.photo)}" alt="" loading="${opts.eager ? "eager" : "lazy"}" decoding="async" />`
    : `<span class="v-mono">${escH((m.name || "?").trim().slice(0, 1))}</span>`;
  const inner = `
      <div class="v-top"><span>광진구상공회 31기</span><span>CEO</span></div>
      <div class="v-photo">${photo}${m.realCard && (m.realCard.front || m.realCard.back) ? '<span class="v-real">실제 명함</span>' : ""}</div>
      <div class="v-body">
        <div class="v-name">${escH(m.name)}${title}</div>
        <div class="v-co">${escH(co)}</div>
        <span class="v-tag${!isBlank(m.industry) || hasCat ? "" : " muted"}">${escH(tagText)}</span>
      </div>`;
  if (opts.plain) return `<div class="v-card">${inner}</div>`;
  return `<a class="v-card" href="member.html?id=${encodeURIComponent(m.id)}"${opts.hidden ? ' aria-hidden="true" tabindex="-1"' : ` aria-label="${escH(ariaOf(m))}"`}>${inner}</a>`;
}

function initFlow(members) {
  const track = document.getElementById("flowTrack");
  if (track) {
    // 사진·회사 정보가 있는 회원이 먼저 보이도록 정렬 (같은 조건이면 회원 번호순)
    const score = m => (m.photo ? 2 : 0) + (isBlank(m.company) ? 0 : 1);
    const list = [...members].sort((a, b) => score(b) - score(a) || a.order - b.order);
    track.innerHTML = list.map(m => vCardHTML(m)).join("") + list.map(m => vCardHTML(m, { hidden: true })).join("");
    track.style.setProperty("--flow-dur", Math.max(60, list.length * 4) + "s");
    const fc = document.getElementById("flowCount");
    if (fc) fc.textContent = members.length;
  }
  const art = document.getElementById("heroArt");
  if (art) {
    const pick = members.filter(m => m.photo && !isBlank(m.company)).slice(0, 3);
    art.innerHTML = pick.map(m => vCardHTML(m, { plain: true, eager: true })).join("");
  }
}

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
  return new Promise((resolve, reject) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;left:-9999px;top:0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy") ? resolve() : reject(new Error("copy")); }
    catch (e) { reject(e); }
    ta.remove();
  });
}

function initShare(members) {
  const url = SITE_URL + "/";
  const msg = `광진구상공회 CEO 아카데미 31기 회원 명부입니다.\n회원 ${members.length}인의 디지털 명함을 이름·회사·업종으로 찾아보실 수 있습니다.\n${url}`;
  const on = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener("click", fn); };
  on("shareCopy", () => copyText(url).then(() => toast("링크를 복사했습니다")).catch(() => toast(url)));
  on("shareMsg", () => copyText(msg).then(() => toast("안내 문구를 복사했습니다")).catch(() => toast("복사에 실패했습니다")));
  const nat = document.getElementById("shareNative");
  if (nat) {
    if (!navigator.share) nat.style.display = "none";
    else nat.addEventListener("click", () => {
      navigator.share({ title: "광진구상공회 CEO 31기 회원 명부", text: msg.split("\n").slice(0, 2).join("\n"), url }).catch(() => {});
    });
  }
}

/* ── 목록 명함 그리기 (보이는 것만 그리고, 멀어지면 메모리 반환) ── */
let cardIO = null;

function renderOne(cv) {
  const data = window.__members;
  if (!data) return;
  const m = data.find(x => x.id === cv.dataset.member);
  const w = Math.round(cv.clientWidth || 0);
  if (!m || w < 40) return;
  if (cv._renderedW === w) return;
  cv._renderedW = w;
  window.CardArt.render(cv, m, w, { maxDpr: 2 }).catch(() => { cv._renderedW = 0; });
}

function releaseOne(cv) {
  if (!cv._renderedW) return;
  cv.width = 0;
  cv.height = 0;
  cv._renderedW = 0;
}

function observeCards() {
  const canvases = [...document.querySelectorAll("canvas[data-member]")];
  if (!canvases.length) return;
  if (!("IntersectionObserver" in window)) {
    canvases.forEach(renderOne);
    return;
  }
  if (!cardIO) {
    cardIO = new IntersectionObserver(entries => {
      entries.forEach(en => en.isIntersecting ? renderOne(en.target) : releaseOne(en.target));
    }, { rootMargin: "700px 0px" });
  }
  cardIO.disconnect();
  canvases.forEach(cv => cardIO.observe(cv));
}

function repaintVisible() {
  const vh = window.innerHeight || 0;
  document.querySelectorAll("canvas[data-member]").forEach(cv => {
    const r = cv.getBoundingClientRect();
    if (r.bottom > -700 && r.top < vh + 700) {
      if (Math.round(cv.clientWidth) !== cv._renderedW) { releaseOne(cv); renderOne(cv); }
    }
  });
}

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
  window.__members = members;
  initFlow(members);
  initShare(members);
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
      <a class="biz-card" href="member.html?id=${encodeURIComponent(m.id)}" aria-label="${ariaOf(m)}">
        <canvas data-member="${m.id}" role="img" aria-hidden="true"></canvas>
        <span class="sr-only">${m.name}${isBlank(m.title) ? "" : " " + m.title} · ${cardLine(m)}${isBlank(m.mobile) ? "" : " · " + m.mobile}</span>
        <span class="peek" aria-hidden="true">↗</span>
      </a>`).join("");
    window.CardArt.fontReady.then(observeCards);
  }
  render();

  // 화면 폭이 바뀌면(열 수 변경·회전) 다시 그린다
  let rt;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(repaintVisible, 180);
  });
}

/* ── vCard ──────────────────────────────── */
function escV(v) {
  return String(v).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function buildVCard(m) {
  const L = ["BEGIN:VCARD", "VERSION:3.0"];
  const title = isBlank(m.title) ? "" : m.title;
  const company = isBlank(m.company) ? "" : m.company;
  L.push(`N:${escV(m.name)};;;;`);
  L.push(`FN:${escV(m.name)}${title ? " " + escV(title) : ""}`);
  if (company) L.push(`ORG:${escV(company)}`);
  if (title) L.push(`TITLE:${escV(title)}`);
  if (!isBlank(m.mobile)) L.push(`TEL;TYPE=CELL:${escV(m.mobile)}`);
  if (!isBlank(m.tel) && digits(m.tel) !== digits(m.mobile)) L.push(`TEL;TYPE=WORK,VOICE:${escV(m.tel)}`);
  if (!isBlank(m.email)) L.push(`EMAIL;TYPE=INTERNET:${escV(m.email)}`);
  if (!isBlank(m.address)) L.push(`ADR;TYPE=WORK:;;${escV(m.address)};;;;`);
  if (!isBlank(m.industry)) L.push(`ROLE:${escV(m.industry)}`);
  L.push(`NOTE:${escV("광진구상공회 CEO 아카데미 31기" + (isBlank(m.category) ? "" : " · " + m.category))}`);
  L.push(`URL:${SITE_URL}/member.html?id=${encodeURIComponent(m.id)}`);
  L.push("END:VCARD");
  return L.join("\r\n");
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function fileNameOf(m, ext) {
  const safe = String(m.name || "member").replace(/[\\/:*?"<>|]/g, "");
  return `광진구상공회31기_${safe}_명함.${ext}`;
}

/* ── 명함 이미지 저장 ─────────────────────
 * 1) 휴대폰: 공유 시트(이미지 저장 → 갤러리)   2) PC·일반 브라우저: 파일 내려받기
 * 3) 카카오톡 등 앱 안 브라우저: 저장용 이미지를 띄우고 길게 눌러 저장하도록 안내
 * 어떤 경우에도 오류 문구로 끝나지 않고 다음 방법으로 넘어간다. */
const UA = navigator.userAgent || "";
const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(UA) || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(UA));
const IN_APP = /KAKAOTALK|NAVER\(inapp|Instagram|FBAN|FBAV|Line\/|DaumApps|BAND\//i.test(UA);
const cardImageUrl = m => `assets/cards/${encodeURIComponent(m.id)}.jpg`;
const preparedFiles = new Map();   // 이미지 key → 준비된 파일(Promise)

// 저장 대상 하나를 나타내는 묶음: 디지털 명함 / 실제 명함(앞·뒤)
function cardItem(m) {
  return {
    key: "card:" + m.id,
    url: cardImageUrl(m),
    name: fileNameOf(m, "jpg"),
    alt: `${m.name} 디지털 명함`,
    fallbackBlob: () => window.CardArt.toJPEG(m, 1.5, 0.92),
    fallbackDataUrl: () => window.CardArt.toDataURL(m, 1.2)
  };
}
const REAL_SIDES = [["front", "앞면"], ["back", "뒷면"]];
function realCardItems(m) {
  const rc = m.realCard || {};
  const safe = String(m.name || "member").replace(/[\\/:*?"<>|]/g, "");
  return REAL_SIDES.filter(([k]) => !isBlank(rc[k])).map(([k, label]) => ({
    key: `real:${m.id}:${k}`,
    side: k,
    label,
    url: rc[k],
    name: `광진구상공회31기_${safe}_실제명함_${label}.jpg`,
    alt: `${m.name} 실제 명함 ${label}`
  }));
}

function prepareFile(item) {
  if (preparedFiles.has(item.key)) return preparedFiles.get(item.key);
  const p = (async () => {
    let blob = null;
    try {
      const res = await fetch(item.url);
      if (res.ok) blob = await res.blob();
    } catch (e) { /* 아래에서 대체 방법을 쓴다 */ }
    if ((!blob || !/^image\//.test(blob.type) || blob.size < 2000) && item.fallbackBlob) {
      blob = await item.fallbackBlob();
    }
    if (!blob || blob.size < 500) throw new Error("no image");
    const type = /^image\//.test(blob.type) ? blob.type : "image/jpeg";
    const file = new File([blob], item.name, { type });
    p.ready = file;
    return file;
  })();
  p.catch(() => preparedFiles.delete(item.key));
  preparedFiles.set(item.key, p);
  return p;
}

function canShareFile(file) {
  try { return !!(navigator.share && navigator.canShare && navigator.canShare({ files: [file] })); }
  catch (e) { return false; }
}

// 반환값: "shared" | "downloaded" | "manual" | "cancel"
async function saveImage(item) {
  const p = prepareFile(item);
  let file = p.ready;
  if (!file) {
    try { file = await p; } catch (e) { openSaveGuide(item); return "manual"; }
  }
  if (IS_MOBILE && canShareFile(file)) {
    try {
      await navigator.share({ files: [file] });
      return "shared";
    } catch (e) {
      if (e && e.name === "AbortError") return "cancel";
      // 권한·환경 문제면 아래 방법으로 계속
    }
  }
  if (IN_APP || (IS_MOBILE && /iPhone|iPad|iPod/i.test(UA) && !canShareFile(file))) {
    openSaveGuide(item);
    return "manual";
  }
  try {
    saveBlob(file, file.name);
    return "downloaded";
  } catch (e) {
    openSaveGuide(item);
    return "manual";
  }
}

// 여러 장(앞·뒤)을 한 번에 전달 — 공유 시트가 있으면 함께, 없으면 차례로 저장
async function shareImages(items, title) {
  const files = [];
  for (const it of items) {
    const p = prepareFile(it);
    try { files.push(p.ready || await p); } catch (e) { /* 건너뜀 */ }
  }
  if (!files.length) { if (items[0]) openSaveGuide(items[0]); return "manual"; }
  let ok = false;
  try { ok = !!(navigator.share && navigator.canShare && navigator.canShare({ files })); } catch (e) { ok = false; }
  if (ok) {
    try { await navigator.share({ files, title }); return "shared"; }
    catch (e) { if (e && e.name === "AbortError") return "cancel"; }
  }
  if (IN_APP) { openSaveGuide(items[0]); return "manual"; }
  files.forEach((f, i) => setTimeout(() => saveBlob(f, f.name), i * 500));
  return "downloaded";
}

function saveResultToast(r) {
  if (r === "downloaded") toast(IS_MOBILE ? "명함 이미지를 저장했습니다 (갤러리·다운로드 폴더)" : "명함 이미지를 저장했습니다");
}

function downloadVCF(m) {
  const blob = new Blob([buildVCard(m)], { type: "text/vcard;charset=utf-8" });
  saveBlob(blob, fileNameOf(m, "vcf"));
}

/* ── 저장 안내 화면 (길게 눌러 저장) ─────── */
function openSaveGuide(item) {
  let box = document.getElementById("lightbox");
  if (!box) {
    box = document.createElement("div");
    box.id = "lightbox";
    box.className = "lightbox";
    box.innerHTML = `
      <button class="lb-close" aria-label="닫기">✕</button>
      <div class="lb-inner">
        <p class="lb-tip">👇 이미지를 <b>길게 눌러</b> <b>'이미지 저장'</b>을 선택하세요</p>
        <img alt="" />
        <div class="lb-actions"></div>
      </div>`;
    document.body.appendChild(box);
    box.addEventListener("click", e => {
      if (e.target === box || e.target.closest(".lb-close")) closeLightbox();
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });
  }
  const img = box.querySelector("img");
  img.alt = item.alt || "명함 이미지";
  img.onerror = async () => {
    img.onerror = null;
    if (!item.fallbackDataUrl) return;
    try { img.src = await item.fallbackDataUrl(); } catch (e) { /* 그대로 둔다 */ }
  };
  img.src = item.url;
  const acts = box.querySelector(".lb-actions");
  const abs = new URL(item.url, location.href).href;
  let html = `<a class="btn btn-accent" href="${escH(item.url)}" download="${escH(item.name)}">⬇ 파일로 내려받기</a>`;
  if (/KAKAOTALK/i.test(UA)) {
    html += `<a class="btn btn-line" href="kakaotalk://web/openExternal?url=${encodeURIComponent(location.href)}">🌐 다른 브라우저로 열기</a>`;
  } else {
    html += `<a class="btn btn-line" href="${escH(abs)}" target="_blank" rel="noopener">🖼 이미지만 새 창으로</a>`;
  }
  acts.innerHTML = html;
  box.classList.add("on");
}
function closeLightbox() {
  const box = document.getElementById("lightbox");
  if (box) box.classList.remove("on");
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
  window.__members = data.members;
  document.title = `${m.name} 명함 · 광진구상공회 CEO 31기`;
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", `${m.name} 명함 · 광진구상공회 CEO 31기`);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute("content", [m.name, isBlank(m.title) ? "" : m.title, isBlank(m.company) ? "" : m.company, "광진구상공회 CEO 아카데미 31기 디지털 명함"].filter(Boolean).join(" · "));

  const pv = m.private || { mobile: m.mobile, email: m.email, bizno: m.bizno };
  const masked = m.masked || {};
  const canShow = (flag, v) => flag && !isBlank(v);
  const mobileCell = canShow(window.SITE_CONFIG.showMobile, pv.mobile)
    ? `<a href="tel:${digits(pv.mobile)}">${pv.mobile}</a>`
    : `<span class="masked">${masked.mobile || maskMobile(pv.mobile)}</span>`;
  const emailCell = canShow(window.SITE_CONFIG.showEmail, pv.email)
    ? `<a href="mailto:${pv.email}">${pv.email}</a>`
    : `<span class="masked">${masked.email || maskEmail(pv.email)}</span>`;
  const bizCell = canShow(window.SITE_CONFIG.showBizno, pv.bizno)
    ? pv.bizno
    : `<span class="masked">${masked.bizno || maskBizno(pv.bizno)}</span>`;

  const rows = [
    ["소속", isBlank(m.company) ? "-" : m.company],
    ["직위", m.title],
    ["업종", m.industry],
    ["분류", m.category],
    ["직장 주소", m.address],
    ["직장 전화", isBlank(m.tel) ? "-" : `<a href="tel:${digits(m.tel)}">${m.tel}</a>`],
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

  const realItems = realCardItems(m);

  const subParts = [];
  if (!isBlank(m.title)) subParts.push(m.title);
  if (!isBlank(m.company)) subParts.push(m.company);
  if (!isBlank(m.industry)) subParts.push(m.industry);

  root.innerHTML = `
    <div class="member-head"><a class="back-link" href="index.html#members">← 전체 회원 목록</a></div>

    <section class="card-stage">
      <div class="card-stage-inner" id="cardStage" tabindex="0" role="button" aria-label="${m.name} 디지털 명함 이미지 저장">
        <canvas id="memberCard"></canvas>
      </div>
    </section>
    <p class="card-hint">명함을 누르면 휴대폰 갤러리(PC는 다운로드 폴더)에 저장됩니다.</p>

    <div class="card-actions">
      <button class="btn btn-primary" id="btnPng">⬇ 명함 이미지 저장</button>
      <button class="btn btn-accent" id="btnVcf">＋ 연락처에 저장 <span class="x">(vCard)</span></button>
      <button class="btn btn-line" id="btnCopy">🔗 명함 링크 복사</button>
    </div>

    ${realItems.length ? `
    <section class="real-card" id="realCard">
      <div class="real-head">
        <h2>실제 명함</h2>
        <p>이미지를 누르면 저장됩니다. 받은 그대로 전달하거나 쓰실 수 있습니다.</p>
      </div>
      <div class="real-grid${realItems.length === 1 ? " one" : ""}">
        ${realItems.map(it => `
        <figure class="real-item">
          <button type="button" class="real-img" data-real="${it.side}" aria-label="${escH(it.alt)} 저장">
            <img src="${escH(it.url)}" alt="${escH(it.alt)}" loading="lazy" decoding="async" />
          </button>
          <figcaption>${it.label}</figcaption>
        </figure>`).join("")}
      </div>
      <div class="card-actions real-actions">
        ${realItems.map(it => `<button class="btn btn-primary" data-real="${it.side}">⬇ ${it.label} 저장</button>`).join("")}
        <button class="btn btn-line" id="btnRealShare">📤 실제 명함 전달하기</button>
      </div>
    </section>` : ""}

    <div class="member-title-row">
      <h1>${m.name}</h1>
      ${isBlank(m.title) ? "" : `<span class="sub">${m.title}</span>`}
      ${isBlank(m.company) ? "" : `<span class="sub">· ${m.company}</span>`}
    </div>
    <div class="tag-row">
      <span class="badge${m.category === "업종 미입력" ? " muted" : ""}">${m.category}</span>
      <span class="badge muted">광진구상공회 CEO 31기</span>
      ${isBlank(m.industry) ? "" : `<span class="badge muted">${m.industry}</span>`}
    </div>

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
            <a class="mini-card" href="member.html?id=${encodeURIComponent(r.id)}">
              <div class="mini-photo">${r.photo ? `<img src="${r.photo}" alt="${r.name}" loading="lazy" />` : r.name.slice(0, 1)}</div>
              <div><div class="nm">${r.name}</div><div class="bs">${isBlank(r.company) ? r.category : r.company}</div></div>
            </a>`).join("")}
        </div>
      </div>` : ""}
    </div>`;

  const canvas = document.getElementById("memberCard");
  const stage = document.getElementById("cardStage");
  await window.CardArt.fontReady;
  const paint = () => {
    const w = Math.round(canvas.clientWidth || 780);
    canvas._renderedW = w;
    return window.CardArt.render(canvas, m, w, { maxDpr: 2.5 });
  };
  await paint();

  let rt;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => { if (canvas._renderedW !== Math.round(canvas.clientWidth)) paint(); }, 180);
  });

  // 누르는 즉시 저장되도록 이미지 파일을 미리 준비해 둔다
  const digital = cardItem(m);
  prepareFile(digital).catch(() => {});
  realItems.forEach(it => prepareFile(it).catch(() => {}));

  let saving = false;
  async function saveNow() {
    if (saving) return;
    saving = true;
    try { saveResultToast(await saveImage(digital)); }
    catch (err) { openSaveGuide(digital); }
    saving = false;
  }

  // 실제 명함: 이미지·버튼 모두 같은 저장 흐름
  const realBox = document.getElementById("realCard");
  if (realBox) {
    realBox.addEventListener("click", async (e) => {
      const t = e.target.closest("[data-real]");
      if (!t || saving) return;
      const it = realItems.find(x => x.side === t.dataset.real);
      if (!it) return;
      saving = true;
      try { saveResultToast(await saveImage(it)); }
      catch (err) { openSaveGuide(it); }
      saving = false;
    });
    document.getElementById("btnRealShare").addEventListener("click", async () => {
      if (saving) return;
      saving = true;
      try { saveResultToast(await shareImages(realItems, `${m.name} 명함`)); }
      catch (err) { openSaveGuide(realItems[0]); }
      saving = false;
    });
  }
  stage.addEventListener("click", saveNow);
  stage.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); saveNow(); } });
  document.getElementById("btnPng").addEventListener("click", saveNow);

  document.getElementById("btnVcf").addEventListener("click", () => {
    try { downloadVCF(m); toast("연락처 파일(.vcf)을 저장했습니다"); }
    catch (err) { toast("저장에 실패했습니다. 다시 시도해 주세요"); }
  });

  document.getElementById("btnCopy").addEventListener("click", async () => {
    const url = `${SITE_URL}/member.html?id=${encodeURIComponent(m.id)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("명함 링크를 복사했습니다");
    } catch (err) {
      toast(url);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initIndex();
  initDetail();
});
