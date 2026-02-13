document.addEventListener("DOMContentLoaded", () => {
  // ===== Core navigation =====
  const screens = Array.from(document.querySelectorAll(".screen"));
  const backBtn = document.getElementById("backBtn");

  // ===== Modal =====
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");
  const modalText = document.getElementById("modalText");
  const modalClose = document.getElementById("modalClose");

  // ===== Playlist embed =====
  const playBtn = document.getElementById("playBtn");
  const embedFrame = document.getElementById("embedFrame");
  const embedPlaceholder = document.getElementById("embedPlaceholder");
  const embedCard = document.getElementById("embedCard");

  // ===== Love note timer =====
  let loveTimerInterval = null;

  // ✅ дата начала отношений (как ты сказал)
  const LOVE_START_DATE = new Date("2025-03-31T01:12:00");

  // ===== Navigation stack =====
  let historyStack = ["home"];

  function normalizeId(id) {
    return String(id || "").trim().toLowerCase();
  }

  function showScreen(id, push = true) {
    const cleanId = normalizeId(id);

    screens.forEach((s) => s.classList.remove("is-active"));

    const next = document.getElementById(`screen-${cleanId}`);
    if (!next) {
      const home = document.getElementById("screen-home");
      if (home) home.classList.add("is-active");
      historyStack = ["home"];
      updateBack();
      return;
    }

    next.classList.add("is-active");

    if (push) {
      const last = historyStack[historyStack.length - 1];
      if (last !== cleanId) historyStack.push(cleanId);
    }

    updateBack();
  }

  function updateBack() {
    if (!backBtn) return;
    if (historyStack.length <= 1) backBtn.classList.add("is-hidden");
    else backBtn.classList.remove("is-hidden");
  }

  // Back
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (historyStack.length <= 1) return;
      historyStack.pop();
      const prev = historyStack[historyStack.length - 1] || "home";
      showScreen(prev, false);
    });
  }

  // ===== Modal helpers =====
  function openModalImage(src, html) {
    if (!modal || !modalImg || !modalText) return;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    if (src) {
      modalImg.style.display = "block";
      modalImg.src = src;
    } else {
      modalImg.style.display = "none";
      modalImg.src = "";
    }

    // ✅ ВАЖНО: нам нужен HTML
    modalText.innerHTML = html || "";
  }

  function closeModal() {
    if (!modal || !modalImg || !modalText) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    modalImg.src = "";
    modalText.innerHTML = "";

    // останавливаем таймер
    if (loveTimerInterval) {
      clearInterval(loveTimerInterval);
      loveTimerInterval = null;
    }
  }

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // ===== Love helpers (ВАЖНО: теперь обновляет и big дни, и строку) =====
  function getLoveDiff() {
    const now = new Date();
    let diff = now - LOVE_START_DATE;

    if (diff < 0) diff = 0;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
    const minutes = Math.floor(diff / (1000 * 60)) % 60;
    const seconds = Math.floor(diff / 1000) % 60;

    return { days, hours, minutes, seconds };
  }

  function formatLoveTime() {
    const { days, hours, minutes, seconds } = getLoveDiff();
    const pad = (n) => String(n).padStart(2, "0");
    return `${days} дней ${pad(hours)} часов ${pad(minutes)} минут ${pad(seconds)} секунд`;
  }

  function renderLove() {
    const { days } = getLoveDiff();

    const big = document.getElementById("loveDaysBig");
    if (big) big.textContent = days;

    const line = document.getElementById("loveTimer");
    if (line) line.textContent = formatLoveTime();
  }

  function startLoveTimer() {
    if (loveTimerInterval) clearInterval(loveTimerInterval);

    // ✅ сразу обновляем, чтобы не было "0"
    renderLove();

    loveTimerInterval = setInterval(renderLove, 1000);
  }

  function buildLoveNoteHTML() {
    return `
      <div class="love-note" style="padding:20px;">
        <div style="
          display:grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap:20px;
          align-items:center;
        ">

          <div style="line-height:1.7;">
            <b style="font-size:18px;">Моей любимой:</b><br><br>
            Если бы я выбирал самое безопасное место, <br>
            я бы выбрал рядом с тобой.<br><br>
            Чем больше времени проходит, <br>
            тем сильнее я люблю тебя.
          </div>

          <div style="text-align:center; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">
            <div style="
              font-size:64px;
              font-weight:800;
              letter-spacing:4px;
              line-height:1;
              text-shadow: 0 0 26px rgba(255,150,200,0.35), 0 6px 0 rgba(0,0,0,0.25);
            " id="loveDaysBig">0</div>

            <div style="margin-top:10px; font-size:14px; opacity:0.8;">
              дней вместе
            </div>

            <div style="margin-top:18px; font-size:18px;" id="loveTimer">
              ${formatLoveTime()}
            </div>
          </div>

        </div>
      </div>
    `;
  }

  // ===== Click router =====
  document.addEventListener("click", (e) => {
    // 1) переходы по кнопкам data-go (HOME -> HUB)
    const goBtn = e.target.closest("[data-go]");
    if (goBtn) {
      showScreen(goBtn.dataset.go, true);
      return;
    }

    // 2) папки Surprise (data-open)
    const openFolder = e.target.closest("[data-open]");
    if (openFolder) {
      showScreen(openFolder.dataset.open, true);
      return;
    }

    // 3) фото
    const photoTile = e.target.closest(".photo-tile");
    if (photoTile) {
      openModalImage(photoTile.dataset.photo, "");
      return;
    }

    // 4) заметки
    const noteCard = e.target.closest(".note-card");
    if (noteCard) {
      const n = noteCard.dataset.note;

      if (n === "1") {
        openModalImage("", buildLoveNoteHTML());
        startLoveTimer();
        return;
      }

      if (n === "2") {
  openModalImage("", `
    <div style="text-align:center; padding:10px 6px;">
      <h3 style="margin:0 0 12px;">Наш первый влог ехехехехе 💗</h3>

      <video
        controls
        playsinline
        preload="metadata"
        style="width:100%; max-height:70vh; border-radius:14px; box-shadow:0 20px 40px rgba(0,0,0,0.4);"
      >
        <source src="./assets/video/vlog.mp4" type="video/mp4">
        Хуесос, не работает, если че я тебе лично скину.
      </video>

      <div style="margin-top:10px; opacity:.8; font-size:13px;">
        Включай видео и улыбайся ;)
      </div>
    </div>
  `);
  return;
}

        

      if (n === "3") {
        openModalImage(
          "",
          `
          <div style="text-align:center; padding:10px 6px;">
            <h3 style="margin:0 0 12px;">Наш момент 💗</h3>
            <video
              src="./assets/video/our-video.mp4"
              controls
              playsinline
              style="width:100%; max-height:70vh; border-radius:14px; box-shadow:0 20px 40px rgba(0,0,0,0.4);"
            ></video>
          </div>
        `
        );
        return;
      }
    }
  });

  // ===== Playlist: появление музыки по клику =====
  if (playBtn && embedFrame && embedPlaceholder) {
    const EMBED_URL =
      "https://open.spotify.com/embed/track/2llEsEEmWyKYouWkGS40S1";

    let loaded = false;

    playBtn.addEventListener("click", () => {
      if (loaded) return;

      embedPlaceholder.style.display = "none";

      embedFrame.innerHTML = `
        <iframe
          src="${EMBED_URL}"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowfullscreen
          loading="lazy"
          style="width:100%;height:100%;border:0;border-radius:16px;"
        ></iframe>
      `;

      if (embedCard) embedCard.classList.add("has-player");
      loaded = true;
    });
  }

  // ===== Init =====
  showScreen("home", false);
  updateBack();
});
let noClickCount = 0;

const valentineText = document.getElementById("valentineText");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const buttonsWrapper = document.getElementById("valentineButtons");

if (noBtn && yesBtn && valentineText) {

  noBtn.addEventListener("click", () => {
    noClickCount++;

    if (noClickCount === 1) {
      valentineText.textContent = "А может да?)";
      yesBtn.style.transform = "scale(1.3)";
    } else if (noClickCount === 2) {
      valentineText.textContent = "Ну пожалуйста жан";
      yesBtn.style.transform = "scale(1.6)";
    } else if (noClickCount === 3) {
  valentineText.textContent = "Да у тебя все равно не получится, ты все равно только моя)";
  noBtn.style.display = "none";
  yesBtn.style.transform = "scale(2)";
  buttonsWrapper.style.justifyContent = "center";

  const heart = document.querySelector(".pixel-heart");
  if (heart) heart.style.display = "none";
}

  });

  yesBtn.addEventListener("click", () => {
  const heart = document.querySelector(".pixel-heart");
  if (heart) heart.style.display = "none";

  valentineText.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; gap:20px;">
      <img 
        src="./assets/gif/4.gif" 
        alt="" 
        style="width:180px; image-rendering:auto;"
      >
      <div style="font-size:26px; letter-spacing:2px;">
        УРААААА, Я ЛЮБЛЮЮЮ ТЕБЯЯЯЯ 💗
      </div>
    </div>
  `;

  buttonsWrapper.style.display = "none";
});



}
