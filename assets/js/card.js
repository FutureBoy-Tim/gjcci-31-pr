/* 광진구상공회 CEO 31기 — 통일 디지털 명함 렌더러
 * 가로형 명함 비율 1.75 : 1 (1050 x 600 디자인 단위)을 Canvas로 그린다.
 * 같은 그리기 함수로 화면 표시·고해상도 PNG 다운로드를 모두 처리해
 * 모든 회원의 명함이 한 벌의 디자인으로 통일된다.
 */
(function () {
  "use strict";

  const CW = 1050, CH = 600;
  const FONT = '"Pretendard31","Pretendard Variable",Pretendard,"Noto Sans KR","Malgun Gothic","Apple SD Gothic Neo",sans-serif';
  const ORANGE = "#FF8200", ORANGE_DEEP = "#E86A00", ORANGE_BG = "#FFF1DF";
  const INK = "#0E1422", INK_2 = "#3A435A";
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
    ctx.fillStyle = o.color || "#0E1422";
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

  /* ── 명함 그리기 (밝은 화이트 + 주황) ──────── */
  function drawCard(ctx, m, img) {
    ctx.save();
    ctx.clearRect(0, 0, CW, CH);

    // 배경: 화이트 → 아주 옅은 크림
    const bg = ctx.createLinearGradient(0, 0, CW, CH);
    bg.addColorStop(0, "#FFFFFF");
    bg.addColorStop(1, "#FFF6EA");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CW, CH);

    // 상단 주황 밴드
    const BAND = 72;
    const band = ctx.createLinearGradient(0, 0, CW, 0);
    band.addColorStop(0, ORANGE);
    band.addColorStop(1, "#FFA63D");
    ctx.fillStyle = band;
    ctx.fillRect(0, 0, CW, BAND);
    text(ctx, "광진구상공회 CEO 아카데미 31기", 56, 46, { size: 24, weight: 800, color: "#FFFFFF", spacing: 0.2 });
    text(ctx, "CEO CLASS 31", CW - 56, 45, { size: 16, weight: 800, color: "rgba(255,255,255,.9)", spacing: 3, align: "right" });

    // 하단 얇은 주황 라인
    ctx.fillStyle = ORANGE;
    ctx.fillRect(0, CH - 8, CW, 8);

    /* ── 사진 패널 (우측, 둥근 프레임) ── */
    const PX = 700, PY = 108, PW = 294, PH = 440, PR = 24;
    ctx.save();
    ctx.shadowColor = "rgba(120,60,0,.20)";
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 10;
    roundRect(ctx, PX, PY, PW, PH, PR);
    ctx.fillStyle = ORANGE_BG;
    ctx.fill();
    ctx.restore();

    ctx.save();
    roundRect(ctx, PX, PY, PW, PH, PR);
    ctx.clip();
    if (img) {
      ctx.imageSmoothingQuality = "high";
      drawCover(ctx, img, PX, PY, PW, PH);
    } else {
      // 사진 미등록 — 주황 모노그램
      ctx.strokeStyle = "rgba(255,130,0,.16)";
      ctx.lineWidth = 1.5;
      for (let r = 80; r <= 260; r += 60) {
        ctx.beginPath();
        ctx.arc(PX + PW / 2, PY + PH / 2, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      const ch = (m.name || "?").trim().slice(0, 1);
      ctx.beginPath();
      ctx.arc(PX + PW / 2, PY + PH / 2, 88, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.strokeStyle = ORANGE;
      ctx.lineWidth = 3;
      ctx.stroke();
      setFont(ctx, 82, 800, 0);
      ctx.fillStyle = ORANGE_DEEP;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(ch, PX + PW / 2, PY + PH / 2 + 4);
    }
    ctx.restore();
    // 프레임 테두리
    roundRect(ctx, PX, PY, PW, PH, PR);
    ctx.strokeStyle = "rgba(255,130,0,.35)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 회원 번호
    text(ctx, "No. " + String(m.order || "").padStart(2, "0"), 56, 122, {
      size: 15, weight: 800, color: ORANGE_DEEP, spacing: 2
    });

    /* ── 이름 · 회사 · 업종 (위쪽 영역 안에서 세로 가운데 정렬) ── */
    const company = isBlank(m.company) ? "" : String(m.company).trim();
    const industry = !isBlank(m.industry) ? String(m.industry).trim()
      : (!isBlank(m.category) && m.category !== "업종 미입력" ? String(m.category).trim() : "");
    const title = isBlank(m.title) ? "" : String(m.title).trim();

    const blockH = 96 + (company ? 52 : 0) + (industry ? 58 : 0);
    const startY = 150 + Math.max(0, (250 - blockH) / 2);
    const nameBase = startY + 74;

    const nameFit = fitText(ctx, (m.name || "").trim(), 440, 82, 800, 44);
    setFont(ctx, nameFit.size, 800, -1.5);
    ctx.fillStyle = INK;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(nameFit.text, 56, nameBase);
    const nameW = ctx.measureText(nameFit.text).width;

    if (title) {
      const tf = fitText(ctx, title, Math.max(60, 610 - nameW - 16), Math.min(30, Math.max(20, nameFit.size * 0.38)), 700, 16);
      text(ctx, tf.text, 56 + nameW + 16, nameBase, { size: tf.size, weight: 700, color: ORANGE_DEEP });
    }

    let cursorY = nameBase + 62;
    if (company) {
      const cf = fitText(ctx, company, 600, 40, 700, 22);
      text(ctx, cf.text, 56, cursorY, { size: cf.size, weight: 700, color: INK_2 });
      cursorY += 52;
    }

    if (industry) {
      const indFit = fitText(ctx, industry, 420, 22, 700, 16);
      setFont(ctx, indFit.size, 700, 0.4);
      const iw = ctx.measureText(indFit.text).width + 36;
      roundRect(ctx, 56, cursorY - 4, iw, 40, 20);
      ctx.fillStyle = ORANGE_BG;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,130,0,.45)";
      ctx.lineWidth = 1;
      ctx.stroke();
      text(ctx, indFit.text, 56 + 18, cursorY + 23, { size: indFit.size, weight: 700, color: ORANGE_DEEP, spacing: 0.4 });
    }

    /* ── 구분선 ── */
    const divY = 404;
    ctx.fillStyle = "rgba(14,20,34,.10)";
    ctx.fillRect(56, divY, 600, 1);
    ctx.fillStyle = ORANGE;
    ctx.fillRect(56, divY - 1, 56, 3);

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
      text(ctx, label, 56, ry, { size: 18, weight: 800, color: ORANGE, spacing: 0.5 });
      const vf = fitText(ctx, val, 540, size, 600, 15);
      text(ctx, vf.text, 96, ry, { size: vf.size, weight: 600, color: INK });
      ry += 40;
    });

    /* ── 하단 푸터 ── */
    text(ctx, "GWANGJIN CHAMBER OF COMMERCE  ·  CEO CLASS 31", 56, 570, {
      size: 12, weight: 700, color: "rgba(14,20,34,.38)", spacing: 1.8
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

    // 저장용 JPG (갤러리·메신저 어디서나 열리는 형식)
    async toJPEG(m, scale, quality) {
      scale = scale || 1.5;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(CW * scale);
      canvas.height = Math.round(CH * scale);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      const img = await loadPhoto(m.photo);
      drawCard(ctx, m, img);
      return await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality || 0.92));
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
