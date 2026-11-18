/* 광진구상공회 CEO 31기 — 통일 디지털 명함 렌더러
 * 가로형 명함 비율 1.75 : 1 (1050 x 600 디자인 단위)을 Canvas로 그린다.
 * 같은 그리기 함수로 화면 표시·고해상도 PNG 다운로드를 모두 처리해
 * 모든 회원의 명함이 한 벌의 디자인으로 통일된다.
 */
(function () {
  "use strict";

  const CW = 1050, CH = 600;
  const FONT = '"Pretendard31","Pretendard Variable",Pretendard,"Noto Sans KR","Malgun Gothic","Apple SD Gothic Neo",sans-serif';
  const NAVY_1 = "#0D2A52", NAVY_2 = "#061326";
  const GOLD = "#C9A227", GOLD_LIGHT = "#E7CD8A", GOLD_SOFT = "#F0DFB6";
  const BLANK = ["-", "", null, undefined, "비공개"];

  const isBlank = (v) => BLANK.includes(typeof v === "string" ? v.trim() : v);

  /* ── 유틸 ─────────────────────────────── */
  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function setFont(ctx, size, weight, spacing) {
    ctx.font = `${weight} ${size}px ${FONT}`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = spacing ? spacing + "px" : "0px";
  }

  function text(ctx, str, x, y, o) {
    o = o || {};
    setFont(ctx, o.size || 26, o.weight || 600, o.spacing || 0);
    ctx.fillStyle = o.color || "#fff";
    ctx.textAlign = o.align || "left";
    ctx.textBaseline = o.baseline || "alphabetic";
    if (o.alpha != null) ctx.globalAlpha = o.alpha;
    ctx.fillText(str, x, y);
    if (o.alpha != null) ctx.globalAlpha = 1;
  }

  // 폭에 맞춰 글자 크기를 줄이고, 그래도 넘치면 말줄임
  function fitText(ctx, str, maxW, size, weight, minSize, spacing) {
    let s = size;
    setFont(ctx, s, weight, spacing || 0);
    while (s > minSize && ctx.measureText(str).width > maxW) {
      s -= 2;
      setFont(ctx, s, weight, spacing || 0);
    }
    let out = str;
    if (ctx.measureText(out).width > maxW) {
      while (out.length > 1 && ctx.measureText(out + "…").width > maxW) out = out.slice(0, -1);
      out += "…";
    }
    return { text: out, size: s };
  }

  function cleanTel(v) {
    if (isBlank(v)) return "";
    const d = String(v).replace(/[^0-9]/g, "");
    return d.length >= 9 ? v : "";
  }

  /* ── 사진 캐시 ────────────────────────── */
  const photoCache = new Map();
  function loadPhoto(src) {
    if (!src) return Promise.resolve(null);
    if (photoCache.has(src)) return photoCache.get(src);
    const p = new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
    photoCache.set(src, p);
    return p;
  }

  function drawCover(ctx, img, x, y, w, h) {
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const scale = Math.max(w / iw, h / ih);
    const dw = iw * scale, dh = ih * scale;
    const dx = x + (w - dw) / 2;
    const dy = y + (h - dh) * 0.08; // 인물 사진은 위쪽을 살린다
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  /* ── 명함 그리기 ──────────────────────── */
  function drawCard(ctx, m, img) {
    ctx.save();
    ctx.clearRect(0, 0, CW, CH);

    // 배경
    const bg = ctx.createLinearGradient(0, 0, CW, CH);
    bg.addColorStop(0, NAVY_1);
    bg.addColorStop(0.55, "#0A2144");
    bg.addColorStop(1, NAVY_2);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CW, CH);

    // 은은한 골드 광원
    const glow = ctx.createRadialGradient(940, 40, 20, 940, 40, 520);
    glow.addColorStop(0, "rgba(201,162,39,.22)");
    glow.addColorStop(0.55, "rgba(201,162,39,.05)");
    glow.addColorStop(1, "rgba(201,162,39,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, CW, CH);

    // 좌측 상단 얇은 골드 라인
    ctx.fillStyle = "rgba(201,162,39,.55)";
    ctx.fillRect(56, 96, 44, 2);

    /* ── 사진 패널 (우측) ── */
    const PX = 652, PW = CW - PX, PH = CH;
    ctx.save();
    ctx.beginPath();
    ctx.rect(PX, 0, PW, PH);
    ctx.clip();
    if (img) {
      ctx.fillStyle = "#080F1B";
      ctx.fillRect(PX, 0, PW, PH);
      ctx.imageSmoothingQuality = "high";
      drawCover(ctx, img, PX, 0, PW, PH);
    } else {
      // 사진 미등록 — 배경과 이어지는 모노그램 패널
      const pg = ctx.createRadialGradient(PX + PW / 2, CH / 2, 40, PX + PW / 2, CH / 2, PW * 0.85);
      pg.addColorStop(0, "rgba(18,48,85,.55)");
      pg.addColorStop(1, "rgba(6,19,38,0)");
      ctx.fillStyle = pg;
      ctx.fillRect(PX, 0, PW, PH);
      ctx.strokeStyle = "rgba(201,162,39,.16)";
      ctx.lineWidth = 1;
      for (let r = 90; r <= 300; r += 70) {
        ctx.beginPath();
        ctx.arc(PX + PW / 2, CH / 2, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      const ch = (m.name || "?").trim().slice(0, 1);
      ctx.beginPath();
      ctx.arc(PX + PW / 2, CH / 2, 92, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(201,162,39,.16)";
      ctx.fill();
      ctx.strokeStyle = "rgba(201,162,39,.55)";
      ctx.lineWidth = 2;
      ctx.stroke();
      setFont(ctx, 84, 800, 0);
      ctx.fillStyle = GOLD_LIGHT;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(ch, PX + PW / 2, CH / 2 + 4);
    }
    // 사진 왼쪽을 배경에 자연스럽게 녹임 (딥블랙 사진용 — 하얗게 뜨지 않도록 카드 네이비로)
    if (img) {
      const fade = ctx.createLinearGradient(PX, 0, PX + 205, 0);
      fade.addColorStop(0, "rgba(10,32,64,.95)");
      fade.addColorStop(0.38, "rgba(10,31,62,.55)");
      fade.addColorStop(0.72, "rgba(9,27,54,.16)");
      fade.addColorStop(1, "rgba(9,27,54,0)");
      ctx.fillStyle = fade;
      ctx.fillRect(PX, 0, 205, PH);
      // 사진 전체에 얇은 네이비 톤을 얹어 카드 배경과 같은 결로
      const wash = ctx.createLinearGradient(PX, 0, CW, CH);
      wash.addColorStop(0, "rgba(10,32,64,.30)");
      wash.addColorStop(1, "rgba(6,19,38,.10)");
      ctx.fillStyle = wash;
      ctx.fillRect(PX, 0, PW, PH);
    }
    // 아래쪽 살짝 어둡게
    const bot = ctx.createLinearGradient(0, CH - 120, 0, CH);
    bot.addColorStop(0, "rgba(4,12,24,0)");
    bot.addColorStop(1, "rgba(4,12,24,.45)");
    ctx.fillStyle = bot;
    ctx.fillRect(PX, CH - 120, PW, 120);
    ctx.restore();

    // 사진 경계 골드 헤어라인
    ctx.fillStyle = "rgba(201,162,39,.5)";
    ctx.fillRect(PX - 1, 0, 1.6, CH);

    /* ── 상단 배지 ── */
    const badgeLabel = "광진구상공회 CEO 아카데미 31기";
    setFont(ctx, 20, 600, 0.6);
    const btw = ctx.measureText(badgeLabel).width;
    const bx = 56, by = 48, bh = 38, bw = btw + 40;
    roundRect(ctx, bx, by, bw, bh, 19);
    ctx.fillStyle = "rgba(201,162,39,.12)";
    ctx.fill();
    ctx.strokeStyle = "rgba(201,162,39,.42)";
    ctx.lineWidth = 1;
    ctx.stroke();
    text(ctx, badgeLabel, bx + 20, by + 25, { size: 20, weight: 600, color: GOLD_LIGHT, spacing: 0.6 });

    // 회원 번호
    text(ctx, "No. " + String(m.order || "").padStart(2, "0"), 56, 118, {
      size: 15, weight: 700, color: "rgba(255,255,255,.42)", spacing: 2
    });

    /* ── 이름 · 회사 · 업종 (위쪽 영역 안에서 세로 가운데 정렬) ── */
    const company = isBlank(m.company) ? "" : String(m.company).trim();
    const industry = !isBlank(m.industry) ? String(m.industry).trim()
      : (!isBlank(m.category) && m.category !== "업종 미입력" ? String(m.category).trim() : "");
    const title = isBlank(m.title) ? "" : String(m.title).trim();

    const blockH = 96 + (company ? 52 : 0) + (industry ? 58 : 0);
    const startY = 150 + Math.max(0, (250 - blockH) / 2);
    const nameBase = startY + 74;

    const nameFit = fitText(ctx, (m.name || "").trim(), 470, 82, 800, 44);
    setFont(ctx, nameFit.size, 800, -1.5);
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(nameFit.text, 56, nameBase);
    const nameW = ctx.measureText(nameFit.text).width;

    if (title) {
      text(ctx, title, 56 + nameW + 16, nameBase, {
        size: Math.min(30, Math.max(20, nameFit.size * 0.38)), weight: 600, color: GOLD
      });
    }

    let cursorY = nameBase + 62;
    if (company) {
      const cf = fitText(ctx, company, 560, 40, 700, 22);
      text(ctx, cf.text, 56, cursorY, { size: cf.size, weight: 700, color: GOLD_SOFT });
      cursorY += 52;
    }

    if (industry) {
      const indFit = fitText(ctx, industry, 380, 22, 600, 16);
      setFont(ctx, indFit.size, 600, 0.4);
      const iw = ctx.measureText(indFit.text).width + 36;
      roundRect(ctx, 56, cursorY - 4, iw, 40, 20);
      ctx.fillStyle = "rgba(201,162,39,.10)";
      ctx.fill();
      ctx.strokeStyle = "rgba(201,162,39,.5)";
      ctx.lineWidth = 1;
      ctx.stroke();
      text(ctx, indFit.text, 56 + 18, cursorY + 23, { size: indFit.size, weight: 600, color: GOLD_LIGHT, spacing: 0.4 });
    }

    /* ── 구분선 ── */
    const divY = 404;
    ctx.fillStyle = "rgba(255,255,255,.16)";
    ctx.fillRect(56, divY, 500, 1);

    /* ── 연락처 ── */
    const mobile = isBlank(m.mobile) ? "" : String(m.mobile).trim();
    const email = isBlank(m.email) ? "" : String(m.email).trim();
    let tel = cleanTel(m.tel);
    if (tel && mobile && tel.replace(/[^0-9]/g, "") === mobile.replace(/[^0-9]/g, "")) tel = "";

    const rows = [];
    if (mobile) rows.push(["M", mobile, 30]);
    if (tel) rows.push(["T", tel, 26]);
    if (email) rows.push(["E", email, 26]);

    let ry = 448;
    rows.forEach(([label, val, size]) => {
      text(ctx, label, 56, ry, { size: 18, weight: 800, color: GOLD, spacing: 0.5 });
      const vf = fitText(ctx, val, 500, size, 600, 15);
      text(ctx, vf.text, 96, ry, { size: vf.size, weight: 600, color: "rgba(255,255,255,.94)" });
      ry += 40;
    });

    /* ── 하단 푸터 ── */
    text(ctx, "GWANGJIN CHAMBER OF COMMERCE  ·  CEO CLASS 31", 56, 566, {
      size: 12, weight: 700, color: "rgba(255,255,255,.38)", spacing: 1.8
    });

    ctx.restore();
  }

  /* ── 공개 API ───────────────────────────── */
  const Card = {
    W: CW,
    H: CH,
    async render(canvas, m, cssWidth, opts) {
      opts = opts || {};
      const dpr = Math.min(window.devicePixelRatio || 1, opts.maxDpr || 2.5);
      const scale = Math.max(0.2, (cssWidth * dpr) / CW);
      const w = Math.round(CW * scale), h = Math.round(CH * scale);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      canvas.style.aspectRatio = CW + " / " + CH;
      const ctx = canvas.getContext("2d");
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const img = await loadPhoto(m.photo);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      drawCard(ctx, m, img);
    },

    async toPNG(m, scale) {
      scale = scale || 1.6;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(CW * scale);
      canvas.height = Math.round(CH * scale);
      const ctx = canvas.getContext("2d");
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      const img = await loadPhoto(m.photo);
      drawCard(ctx, m, img);
      return await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    },

    async toDataURL(m, scale) {
      scale = scale || 1.6;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(CW * scale);
      canvas.height = Math.round(CH * scale);
      const ctx = canvas.getContext("2d");
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      const img = await loadPhoto(m.photo);
      drawCard(ctx, m, img);
      return canvas.toDataURL("image/png");
    }
  };

  /* ── 폰트 준비 ───────────────────────────── */
  Card.fontReady = (async function () {
    if (!document.fonts) return;
    try {
      await Promise.all([
        document.fonts.load('800 82px "Pretendard31"', "가나다"),
        document.fonts.load('700 40px "Pretendard31"', "가나다"),
        document.fonts.load('600 26px "Pretendard31"', "가나다"),
        document.fonts.load('400 20px "Pretendard31"', "가나다")
      ]);
      await document.fonts.ready;
    } catch (e) { /* 시스템 폰트로 대체 */ }
  })();

  window.CardArt = Card;
})();
