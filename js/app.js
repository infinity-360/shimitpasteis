(() => {
  "use strict";
  const C = window.SHIMIT;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const money = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const wa = (msg) => `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(msg || C.whatsappMsg)}`;
  const unit = (id) => C.unidades.find((u) => u.id === id);

  /* ---------- Logo da Shimit (SVG) ---------- */
  let lgN = 0;
  function logoSVG() {
    const id = "lg" + lgN++;
    return `<svg class="logo-svg" viewBox="0 0 200 200" role="img" aria-label="Shimit Pastéis">
      <defs>
        <radialGradient id="${id}r" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="#F0262E"/><stop offset=".65" stop-color="#C8101A"/><stop offset="1" stop-color="#8E0A11"/></radialGradient>
        <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#${id}r)" stroke="#FFC400" stroke-width="5"/>
      <ellipse cx="100" cy="58" rx="70" ry="38" fill="url(#${id}g)"/>
      <text class="lg-text1" x="100" y="101" text-anchor="middle" font-size="60" fill="#fff" letter-spacing="-1.5">Shimit</text>
      <text class="lg-text2" x="104" y="141" text-anchor="middle" font-size="41" fill="#FFC400">pastéis</text>
    </svg>`;
  }
  $$("[data-logo]").forEach((el) => (el.innerHTML = logoSVG()));

  /* ---------- Links WhatsApp ---------- */
  $$("[data-wpp]").forEach((a) => { a.href = wa(); a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-horario]").forEach((el) => (el.textContent = C.horario.toLowerCase()));
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Intro ---------- */
  const intro = $("#intro");
  const hero = $("#hero");
  let introDone = false;
  function endIntro() {
    if (introDone) return;
    introDone = true;
    intro.classList.add("done");
    logoTween();
    setTimeout(() => hero.classList.add("t-on"), 350);
  }
  setTimeout(endIntro, reduce ? 50 : 1700);
  intro.addEventListener("click", endIntro);

  /* logo surgindo no hero (giro + escala elástica) */
  let logoIn = 0;
  function logoTween() {
    if (reduce) { logoIn = 1; return; }
    const t0 = performance.now(), d = 1100;
    const back = (t) => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
    (function step(now) {
      const t = clamp((now - t0) / d);
      logoIn = back(t);
      if (t < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- Hero: vídeo controlado pela rolagem ---------- */
  const video = $(".hero-video");
  const vWrap = $(".hero-videoWrap");
  const amb = $(".hero-ambient");
  const actx = amb.getContext("2d");
  const heroLogo = $(".hero-logo");
  const progress = $(".hero-progress");
  const scrollHint = $(".hero-scroll");
  const nav = $("#nav");
  const mbar = $(".mobile-bar");
  let vCur = 0, heroP = 0, ready = false;

  video.addEventListener("loadedmetadata", () => { ready = true; });
  video.addEventListener("seeked", drawAmbient);
  video.addEventListener("loadeddata", drawAmbient);
  function drawAmbient() { try { actx.drawImage(video, 0, 0, amb.width, amb.height); } catch (e) {} }
  // iOS: precisa de um gesto para liberar a busca de quadros
  const unlock = () => { video.play().then(() => video.pause()).catch(() => {}); window.removeEventListener("touchstart", unlock); };
  window.addEventListener("touchstart", unlock, { passive: true });
  video.load();

  function heroProgress() {
    const r = hero.getBoundingClientRect();
    return clamp(-r.top / (r.height - innerHeight));
  }

  function frame() {
    heroP = heroProgress();
    const p = heroP;
    // vídeo
    if (ready && video.duration) {
      const target = p * (video.duration - 0.06);
      vCur += (target - vCur) * (reduce ? 1 : 0.14);
      if (Math.abs(video.currentTime - vCur) > 0.035 && !video.seeking) video.currentTime = vCur;
    }
    // logo
    const ls = logoIn * (1 - p * 0.25);
    heroLogo.style.setProperty("--ls", ls.toFixed(3));
    heroLogo.style.setProperty("--lo", clamp(logoIn * 1.4).toFixed(3));
    heroLogo.style.setProperty("--lr", ((1 - logoIn) * -140 + p * 30).toFixed(2) + "deg");
    // cartão do vídeo
    vWrap.style.setProperty("--rot", (4 - p * 7).toFixed(2) + "deg");
    vWrap.style.setProperty("--vs", (1 + p * 0.06).toFixed(3));
    progress.style.setProperty("--p", p.toFixed(4));
    hero.classList.toggle("b-on", p > 0.12 && p < 0.97);
    scrollHint.style.opacity = p > 0.04 ? 0 : 1;
    // nav + barra mobile
    nav.classList.toggle("solid", scrollY > 40);
    mbar.classList.toggle("show", scrollY > innerHeight * 0.8);
    // parallax do pastelão
    const g = $(".giant");
    const gr = g.getBoundingClientRect();
    if (gr.bottom > 0 && gr.top < innerHeight) g.querySelector(".giant-bg").style.setProperty("--py", ((gr.top + gr.height / 2 - innerHeight / 2) * -0.18).toFixed(1) + "px");
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- Menu mobile ---------- */
  const burger = $(".nav-burger"), mm = $("#mobileMenu");
  burger.addEventListener("click", () => {
    const open = !mm.classList.contains("open");
    mm.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
    document.body.style.overflow = open ? "hidden" : "";
  });
  $$("a", mm).forEach((a) => a.addEventListener("click", () => { mm.classList.remove("open"); burger.setAttribute("aria-expanded", false); document.body.style.overflow = ""; }));

  /* ---------- Cardápio ---------- */
  const grid = $("#menuGrid"), cats = $("#menuCats"), search = $("#menuSearch"), empty = $("#menuEmpty");
  let curCat = "pastelao", curUnit = "u1";
  const ALL = window.MENU.flatMap((c) => c.itens.map((it) => ({ cat: c, it })));
  const pastelSVG = `<svg class="ph-pastel" viewBox="0 0 200 120" aria-hidden="true"><defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE29A"/><stop offset="1" stop-color="#F0B45A"/></linearGradient></defs><path d="M14 92 C 20 30, 70 8, 120 12 C 170 16, 192 52, 186 92 Z" fill="url(#pg)" stroke="#C98A2E" stroke-width="3"/><path d="M14 92 H186" stroke="#C98A2E" stroke-width="6" stroke-linecap="round"/><g fill="#E9A646" opacity=".7"><circle cx="60" cy="50" r="5"/><circle cx="95" cy="35" r="4"/><circle cx="130" cy="48" r="6"/><circle cx="150" cy="70" r="4"/><circle cx="80" cy="72" r="4"/></g><path d="M22 92 l6 10 l8 -10 l8 10 l8 -10 l8 10 l8 -10 l8 10 l8 -10 l8 10 l8 -10 l8 10 l8 -10 l8 10 l8 -10 l8 10 l8 -10 l8 10 l8 -10 l8 10 l8 -10" fill="none" stroke="#C98A2E" stroke-width="3" stroke-linejoin="round"/></svg>`;

  function renderCats() {
    cats.innerHTML = window.MENU.map((c) => `<button class="cat-chip" role="tab" data-cat="${c.id}" aria-selected="${c.id === curCat}"><span>${c.emoji}</span>${c.nome}<small>${c.itens.length}</small></button>`).join("");
  }
  function dishHTML({ cat, it }, i) {
    const [nome, desc, preco, orig, img, aPartir] = it;
    const off = orig ? Math.round((1 - preco / orig) * 100) : 0;
    const isDrink = cat.id === "bebidas";
    const media = img
      ? `<img src="assets/menu/${img}.jpg" alt="${nome}" loading="lazy" />`
      : "";
    const tag = off >= 5 ? `<span class="dish-tag">-${off}%</span>` : cat.id === "pastelao" ? `<span class="dish-tag red">30cm</span>` : "";
    return `<article class="dish" style="--i:${i % 12}">
      <div class="dish-img ${img ? "" : "noimg"} ${isDrink && !img ? "drink" : ""}">${media || (isDrink ? `<span style="font-size:64px">🥤</span>` : pastelSVG + `<span class="ph-emoji">${cat.emoji}</span>`)}${tag}</div>
      <div class="dish-body">
        <h3>${nome}</h3>
        ${desc ? `<p>${desc}</p>` : "<p></p>"}
        <div class="dish-price">${aPartir ? "<small>a partir de</small>" : ""}<b>${money(preco)}</b>${orig ? `<s>${money(orig)}</s>` : ""}</div>
        <div class="dish-actions">
          <a class="btn btn-ifood" data-ifood-item="${nome.replace(/"/g, "")}" href="${unit(curUnit).ifood}" target="_blank" rel="noopener">Pedir no iFood</a>
          <a class="btn btn-wpp" href="${wa(`Olá, Shimit! Quero pedir: ${nome} 😋`)}" target="_blank" rel="noopener" aria-label="Pedir ${nome} pelo WhatsApp"><svg viewBox="0 0 32 32"><path fill="currentColor" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3Zm5.8 15.7c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7 0a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5 1-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.6 3.6 0 0 0-1.1 2.7 6.3 6.3 0 0 0 1.3 3.3 14.4 14.4 0 0 0 5.5 4.9c2 .9 2.8.9 3.9.8a3.3 3.3 0 0 0 2.1-1.5 2.7 2.7 0 0 0 .2-1.5c-.1-.2-.3-.3-.6-.4Z"/></svg></a>
        </div>
      </div>
    </article>`;
  }
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  function renderMenu() {
    const q = norm(search.value.trim());
    const list = q
      ? ALL.filter(({ it }) => norm(it[0] + " " + it[1]).includes(q))
      : ALL.filter(({ cat }) => cat.id === curCat);
    grid.innerHTML = list.map(dishHTML).join("");
    empty.hidden = list.length > 0;
    $$(".cat-chip", cats).forEach((b) => b.setAttribute("aria-selected", !q && b.dataset.cat === curCat));
  }
  cats.addEventListener("click", (e) => {
    const b = e.target.closest(".cat-chip");
    if (!b) return;
    curCat = b.dataset.cat;
    search.value = "";
    renderMenu();
    b.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  });
  search.addEventListener("input", renderMenu);
  $$(".unit-switch button").forEach((b) => b.addEventListener("click", () => {
    curUnit = b.dataset.unit;
    $$(".unit-switch button").forEach((x) => x.setAttribute("aria-checked", x === b));
    $$("[data-ifood-item]", grid).forEach((a) => (a.href = unit(curUnit).ifood));
  }));
  $$("[data-jump-cat]").forEach((a) => a.addEventListener("click", () => {
    curCat = a.dataset.jumpCat; search.value = ""; renderMenu();
  }));
  renderCats();
  renderMenu();

  /* ---------- Modal de unidade (botões gerais "Pedir no iFood") ---------- */
  const modal = $("#unitModal");
  function openModal(item) {
    $("#unitModalItem").textContent = item ? `Pedido: ${item}` : "As duas unidades ficam em Sarandi. Escolha a mais perto de você:";
    $("#unitModalOpts").innerHTML = C.unidades.filter((u) => u.ifood).map((u) =>
      `<a class="modal-opt" href="${u.ifood}" target="_blank" rel="noopener"><div><b>${u.apelido}</b><span>${u.endereco}</span></div><i>Abrir iFood</i></a>`).join("") +
      `<a class="modal-opt wpp" href="${wa()}" target="_blank" rel="noopener"><div><b>Prefere WhatsApp?</b><span>(44) 99181-1857</span></div><i>Chamar</i></a>`;
    modal.hidden = false;
  }
  $$("[data-ifood-open]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); openModal(); }));
  modal.addEventListener("click", (e) => { if (e.target === modal || e.target.closest("[data-close]") || e.target.closest(".modal-opt")) modal.hidden = true; });
  addEventListener("keydown", (e) => { if (e.key === "Escape") { modal.hidden = true; lb.hidden = true; } });

  /* ---------- Unidades + cartões de pedido ---------- */
  const mapsLink = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  $("#unitsGrid").innerHTML = C.unidades.map((u) => u.status === "em-breve" ? `
    <article class="unit soon reveal">
      <div class="unit-map"><div class="soon-dots"></div><div class="soon-stamp">EM BREVE<small>Maringá</small></div></div>
      <div class="unit-body">
        <span class="unit-city">${u.cidade}</span>
        <h3>${u.nome}</h3>
        <p class="unit-addr">A Shimit está chegando em Maringá! Quer ser o primeiro a saber da inauguração?</p>
        <div class="unit-actions"><a class="btn btn-yellow" href="${wa("Oi, Shimit! Quero ser avisado(a) da inauguração em Maringá 🎉")}" target="_blank" rel="noopener">Quero ser avisado</a></div>
      </div>
    </article>` : `
    <article class="unit reveal">
      <div class="unit-map" data-map="${u.mapa}"></div>
      <div class="unit-body">
        <span class="unit-city">${u.cidade}</span>
        <h3>${u.apelido}</h3>
        <p class="unit-addr">${u.endereco}</p>
        <div class="unit-actions">
          <a class="btn btn-ifood" href="${u.ifood}" target="_blank" rel="noopener">iFood</a>
          <a class="btn btn-ghost" href="${mapsLink(u.mapa)}" target="_blank" rel="noopener">Como chegar</a>
        </div>
      </div>
    </article>`).join("");

  $("#orderCards").innerHTML = C.unidades.map((u) => u.ifood ? `
    <div class="ocard"><h3>${u.apelido}</h3><p>${u.endereco} · ${u.cidade}</p>
      <a class="btn btn-ifood" href="${u.ifood}" target="_blank" rel="noopener">Pedir no iFood</a>
      <a class="btn btn-wpp" href="${wa()}" target="_blank" rel="noopener">WhatsApp</a></div>` : `
    <div class="ocard soon"><h3>Maringá</h3><p>Em breve! Fique de olho no nosso Instagram.</p>
      <a class="btn btn-yellow" href="${C.instagram}" target="_blank" rel="noopener">@shimitpasteis</a></div>`).join("");

  /* ---------- Reveal + mapas preguiçosos ---------- */
  const io = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add("in");
    io.unobserve(en.target);
  }), { threshold: 0.15 });
  $$(".reveal").forEach((el) => io.observe(el));
  const mio = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (!en.isIntersecting) return;
    const el = en.target;
    el.innerHTML = `<iframe title="Mapa: ${el.dataset.map}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${encodeURIComponent(el.dataset.map)}&z=16&output=embed"></iframe>`;
    mio.unobserve(el);
  }), { rootMargin: "300px" });
  $$("[data-map]").forEach((el) => mio.observe(el));

  /* ---------- Tour virtual 360° ---------- */
  const SCENES = {
    caixa: { title: "Caixa & Retirada", img: "salao-caixa", yaw: -150, pos: "5%",
      spots: [
        { go: "salao", yaw: -82, pitch: -3, t: "Entrar no salão" },
        { go: "esquina", yaw: 22, pitch: -5, t: "Sair para a esquina" },
        { info: "Caixa — faça seu pedido aqui", yaw: 151, pitch: 22 },
        { info: "Retirada dos pedidos", yaw: -128, pitch: 19 },
        { info: "“O melhor pastel do Brasil!”", yaw: -150, pitch: -10 },
      ] },
    salao: { title: "Salão", img: "salao-mesas", yaw: 0, pos: "50%",
      spots: [
        { go: "caixa", yaw: -160, pitch: -4, t: "Ir ao caixa" },
        { go: "esquina", yaw: 85, pitch: -4, t: "Ver a rua" },
        { info: "Salão amplo e climatizado", yaw: -30, pitch: 4 },
      ] },
    esquina: { title: "Esquina à noite", img: "esquina-noite", yaw: 155, pos: "92%",
      spots: [
        { go: "caixa", yaw: 160, pitch: -3, t: "Entrar na Shimit" },
        { go: "rua", yaw: -20, pitch: -8, t: "Atravessar a rua" },
      ] },
    rua: { title: "Vista da rua", img: "rua-entardecer", yaw: -172, pos: "2%",
      spots: [
        { go: "caixa", yaw: -168, pitch: -2, t: "Entrar na Shimit" },
        { go: "esquina", yaw: 172, pitch: -4, t: "Ir para a esquina" },
      ] },
    fachada: { title: "Fachada de dia", img: "fachada-dia", yaw: 76, pos: "71%",
      spots: [
        { info: "Shimit Pastéis — mesas ao ar livre", yaw: 76, pitch: 10 },
        { info: "Drive Thru", yaw: 101, pitch: 6 },
      ] },
  };
  const tourTitle = $("#tourTitle");
  $("#tourThumbs").innerHTML = Object.entries(SCENES).map(([id, s], i) =>
    `<button class="tour-thumb ${i === 0 ? "active" : ""}" data-scene="${id}" style="--pos:${s.pos}"><img src="assets/pano/${s.img}.jpg" alt="" loading="lazy"><span>${s.title}</span></button>`).join("");

  function hsTip(div, a) {
    div.classList.add(a.cls);
    if (a.cls === "hs-info") div.textContent = "i";
    const s = document.createElement("span");
    s.className = "hs-label"; s.textContent = a.t;
    div.appendChild(s);
  }
  let viewer = null;
  function initTour() {
    if (viewer || !window.pannellum) return;
    if (location.protocol === "file:") { $("#tourFallback").hidden = false; return; }
    const scenes = {};
    for (const [id, s] of Object.entries(SCENES)) {
      scenes[id] = {
        title: s.title, type: "equirectangular", panorama: `assets/pano/${s.img}.jpg`,
        yaw: s.yaw, pitch: 0, hfov: 105,
        hotSpots: s.spots.map((h) => h.go
          ? { type: "scene", sceneId: h.go, yaw: h.yaw, pitch: h.pitch, cssClass: "hs-custom", createTooltipFunc: hsTip, createTooltipArgs: { cls: "hs-go", t: h.t }, targetYaw: SCENES[h.go].yaw, targetPitch: 0 }
          : { type: "info", yaw: h.yaw, pitch: h.pitch, cssClass: "hs-custom", createTooltipFunc: hsTip, createTooltipArgs: { cls: "hs-info", t: h.info } }),
      };
    }
    viewer = pannellum.viewer("panorama", {
      default: { firstScene: "caixa", sceneFadeDuration: 900, autoLoad: true, autoRotate: -2.5, autoRotateInactivityDelay: 5000, showFullscreenCtrl: false, showZoomCtrl: true, mouseZoom: false, compass: false, minHfov: 50, maxHfov: 120, hfov: 105 },
      scenes,
    });
    viewer.on("scenechange", (id) => {
      tourTitle.textContent = SCENES[id].title;
      $$(".tour-thumb").forEach((b) => b.classList.toggle("active", b.dataset.scene === id));
    });
  }
  $("#tourThumbs").addEventListener("click", (e) => {
    const b = e.target.closest(".tour-thumb");
    if (!b) return;
    if (!viewer) initTour();
    if (viewer) viewer.loadScene(b.dataset.scene);
    else { $("#tourFallback").style.backgroundImage = `url(assets/pano/${SCENES[b.dataset.scene].img}.jpg)`; tourTitle.textContent = SCENES[b.dataset.scene].title; }
  });
  $("#tourFs").addEventListener("click", () => {
    if (viewer) viewer.toggleFullscreen();
    else $(".tour-frame").requestFullscreen?.();
  });
  new IntersectionObserver((ents, o) => { if (ents[0].isIntersecting) { initTour(); o.disconnect(); } }, { rootMargin: "400px" }).observe($("#tour"));

  /* ---------- Lightbox da galeria ---------- */
  const lb = $("#lightbox");
  $("#masonry").addEventListener("click", (e) => {
    const img = e.target.closest("img");
    if (!img) return;
    lb.querySelector("img").src = img.src;
    lb.querySelector("img").alt = img.alt;
    lb.hidden = false;
  });
  lb.addEventListener("click", () => (lb.hidden = true));

  /* ---------- Dica do WhatsApp ---------- */
  const wf = $(".wpp-float");
  setTimeout(() => { wf.classList.add("tip"); setTimeout(() => wf.classList.remove("tip"), 4500); }, 9000);
})();
