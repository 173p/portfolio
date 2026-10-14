type Section = { id: string; name: string; title: string; face: string; body: string; href?: string };

const sections: Section[] = [...document.querySelectorAll<HTMLTemplateElement>("template[data-section]")].map((t) => ({
  id: t.dataset.section!,
  name: t.dataset.name!,
  title: t.dataset.title ?? t.dataset.name!,
  href: t.dataset.href,
  face: t.content.querySelector("[data-face]")?.innerHTML ?? "",
  body: t.content.querySelector("[data-body]")?.innerHTML ?? "",
}));

const N = sections.length, COPIES = 3, M = N * COPIES;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const strip = document.getElementById("strip")!;
const ticksEl = document.getElementById("ticks")!;
const brackets = [...document.querySelectorAll<HTMLElement>(".bracket")];
const mod = (a: number, n: number) => ((a % n) + n) % n;
const EASE = "cubic-bezier(.2,.75,.15,1)";

let statusText = "";
const applyStatus = (root: ParentNode) =>
  root.querySelectorAll<HTMLElement>(".status").forEach((el) => { el.textContent = statusText; el.hidden = !statusText; });
const statusUrl = strip.dataset.statusUrl;
if (statusUrl) {
  fetch(statusUrl).then((r) => r.json()).then((j) => {
    const days = Math.floor((j.uptime_seconds || 0) / 86400);
    statusText = days >= 1 ? `homelab up ${days} day${days === 1 ? "" : "s"}` : "homelab up";
    applyStatus(document);
  }).catch(() => {});
}

for (let i = 0; i < N * 4; i++) ticksEl.appendChild(document.createElement("i"));

const cards: HTMLButtonElement[] = [];
for (let m = 0; m < M; m++) {
  const s = sections[m % N];
  const b = document.createElement("button");
  b.type = "button"; b.className = "card"; b.setAttribute("role", "listitem");
  b.setAttribute("aria-label", "Open " + s.name);
  b.innerHTML = `<span class="lbl">0${(m % N) + 1}&nbsp;&nbsp;${s.name}</span><div class="face">${s.face}</div>`;
  strip.appendChild(b); cards.push(b);
}
applyStatus(strip);

let dpr = 1, W = 0, H = 0, cw = 0, ch = 0, step = 0, top0 = 0;
let pos = 0, target = 0, snapping = true, lastDir = 1;
type Open = { m: number; sheet: HTMLElement; closing?: boolean };
let openState: Open | null = null;

const startHash = location.hash.slice(1);
const startIdx = sections.findIndex((s) => s.id === startHash);
const cameFrom = (window as any).navigation?.activation?.from?.url ?? document.referrer;
const fromWriting = !!cameFrom && new URL(cameFrom).origin === location.origin && new URL(cameFrom).pathname.startsWith("/writing");
const landIdx = startIdx >= 0 ? startIdx : fromWriting ? sections.findIndex((s) => s.id === "writing") : -1;
if (landIdx > 0) pos = target = landIdx;

function layout() {
  W = innerWidth; H = innerHeight; dpr = devicePixelRatio || 1;
  cw = W < 640 ? W * 0.8 : Math.min(W * 0.56, 680);
  cw = Math.round(cw); ch = Math.round(cw * 0.6);
  step = cw + Math.max(14, cw * 0.025);
  top0 = Math.round(((H - ch) / 2) * dpr) / dpr;
  cards.forEach((c) => { c.style.width = cw + "px"; c.style.height = ch + "px"; });
}

const wrapD = (d: number) => d - M * Math.round(d / M);

function frame() {
  pos += (target - pos) * (reduce ? 1 : snapping ? 0.1 : 0.2);
  if (Math.abs(target - pos) < 0.0005) pos = target;
  draw();
  requestAnimationFrame(frame);
}

function draw() {
  cards.forEach((c, m) => {
    const d = wrapD(m - pos);
    const x = Math.round((W / 2 + d * step - cw / 2) * dpr) / dpr;
    const near = Math.max(0, 1 - Math.abs(d));
    const vis = Math.abs(d * step) < W / 2 + step;
    c.style.visibility = vis && !(openState && openState.m === m) ? "visible" : "hidden";
    c.style.transform = `translate3d(${x}px, ${top0}px, 0)`;
    (c.querySelector(".lbl") as HTMLElement).style.opacity = (0.45 + 0.55 * near).toFixed(3);
    c.tabIndex = Math.abs(d) < 0.5 ? 0 : -1;
  });
  const sw = 168, bw = (sw / N) * 0.9, x0 = (mod(pos, N) / N) * sw;
  brackets[0].style.cssText = `left:${x0.toFixed(2)}px;width:${bw}px`;
  brackets[1].style.cssText = `left:${(x0 + (x0 > sw / 2 ? -sw : sw)).toFixed(2)}px;width:${bw}px`;
}

let snapT: number | undefined;
addEventListener("wheel", (e) => {
  if (openState) return;
  e.preventDefault();
  let dl = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  if (e.deltaMode === 1) dl *= 16;
  target += (dl / step) * 2.2;
  if (dl) lastDir = Math.sign(dl);
  snapping = false;
  clearTimeout(snapT);
  snapT = window.setTimeout(() => {
    target = lastDir > 0 ? Math.ceil(target - 0.12) : Math.floor(target + 0.12);
    snapping = true;
  }, 120);
}, { passive: false });

let drag: { x: number; y: number; t: number; vx: number; lx: number } | null = null, moved = false;
strip.addEventListener("pointerdown", (e) => {
  drag = { x: e.clientX, y: e.clientY, t: target, vx: 0, lx: e.clientX }; moved = false;
  strip.setPointerCapture(e.pointerId);
});
strip.addEventListener("pointermove", (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  const d = Math.abs(dx) > Math.abs(dy) ? dx : -dy * 0.6;
  if (Math.abs(d) > 5) { moved = true; strip.classList.add("drag"); }
  target = drag.t - d / step;
  drag.vx = e.clientX - drag.lx; drag.lx = e.clientX;
});
strip.addEventListener("pointerup", (e) => {
  if (!drag) return;
  strip.classList.remove("drag");
  if (moved) target = Math.round(target - drag.vx / 40);
  else {
    const c = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)?.closest(".card");
    if (c) choose(cards.indexOf(c as HTMLButtonElement));
  }
  drag = null;
});
strip.addEventListener("pointercancel", () => { drag = null; strip.classList.remove("drag"); });

addEventListener("keydown", (e) => {
  if (openState) { if (e.key === "Escape") navigate(""); return; }
  if (e.key === "ArrowRight" || e.key === "ArrowDown") { target = Math.round(target) + 1; e.preventDefault(); }
  if (e.key === "ArrowLeft" || e.key === "ArrowUp") { target = Math.round(target) - 1; e.preventDefault(); }
  if (e.key === "Enter" || e.key === " ") { choose(mod(Math.round(pos), M)); e.preventDefault(); }
});

function choose(m: number) {
  if (openState || m < 0) return;
  const s = sections[m % N];
  const d = wrapD(m - pos);
  const go = () => {
    if (s.href) { cards[m].style.viewTransitionName = "panel"; location.href = s.href; }
    else navigate("#" + s.id);
  };
  if (Math.abs(d) > 0.5) { target = Math.round(pos + d); setTimeout(go, reduce ? 0 : 420); }
  else go();
}

const px = (o: { left: number; top: number; width: number; height: number }) =>
  ({ left: o.left + "px", top: o.top + "px", width: o.width + "px", height: o.height + "px" });

function wire(sheet: HTMLElement) {
  applyStatus(sheet);
  sheet.querySelector(".close")!.addEventListener("click", () => navigate(""));
  sheet.querySelectorAll<HTMLButtonElement>(".copy").forEach((btn) => btn.addEventListener("click", () => {
    const addr = btn.parentElement!.querySelector(".addr")!;
    const done = () => { btn.textContent = "Copied"; setTimeout(() => { btn.textContent = "Copy"; }, 1600); };
    const fallback = () => { const r = document.createRange(); r.selectNodeContents(addr); const sel = getSelection()!; sel.removeAllRanges(); sel.addRange(r); };
    try { navigator.clipboard.writeText(addr.textContent ?? "").then(done, fallback); } catch { fallback(); }
  }));
}

function openSheet(m: number) {
  if (openState) return;
  const s = sections[m % N];
  const r = cards[m].getBoundingClientRect();
  const sheet = document.createElement("div");
  sheet.className = "sheet";
  sheet.setAttribute("role", "dialog"); sheet.setAttribute("aria-label", s.name);
  sheet.innerHTML = `<div class="ghost"><div class="face">${s.face}</div></div>
    <div class="inner"><header><h2>${s.title}</h2><button class="close mono-btn" type="button">Close</button></header><div class="body">${s.body}</div></div>`;
  document.body.appendChild(sheet);
  const tw = Math.min(W - 32, 640);
  sheet.style.width = tw + "px";
  const th = Math.min(H * 0.84, Math.max(ch, sheet.querySelector(".inner")!.scrollHeight + 4));
  const to = { left: (W - tw) / 2, top: (H - th) / 2, width: tw, height: th };
  const from = { left: r.left, top: r.top, width: r.width, height: r.height };
  Object.assign(sheet.style, px(to));
  openState = { m, sheet };
  document.body.classList.add("open");
  wire(sheet);
  sheet.addEventListener("click", (e) => e.stopPropagation());

  const dur = reduce ? 0 : 560;
  sheet.animate([px(from), px(to)], { duration: dur, easing: EASE });
  const ghost = sheet.querySelector<HTMLElement>(".ghost")!;
  ghost.style.width = r.width + "px"; ghost.style.height = r.height + "px";
  ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur * 0.45, fill: "forwards" });
  const parts = [...sheet.querySelectorAll<HTMLElement>(".inner > header, .body > *, .body li")].filter((el) => !el.matches("ul"));
  parts.slice(0, 10).forEach((el, i) => el.animate(
    [{ opacity: 0, transform: "translateY(10px)", filter: "blur(5px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }],
    { duration: reduce ? 0 : 520, delay: reduce ? 0 : 220 + i * 60, easing: EASE, fill: "backwards" }));
  sheet.tabIndex = -1;
  setTimeout(() => sheet.focus({ preventScroll: true }), dur);
  document.addEventListener("pointerdown", outside, true);
}

function outside(e: Event) {
  if (openState && !openState.sheet.contains(e.target as Node)) { e.preventDefault(); navigate(""); }
}

function closeSheet() {
  if (!openState || openState.closing) return;
  openState.closing = true;
  document.removeEventListener("pointerdown", outside, true);
  const { m, sheet } = openState;
  const r = cards[m].getBoundingClientRect();
  const cur = px({ left: sheet.offsetLeft, top: sheet.offsetTop, width: sheet.offsetWidth, height: sheet.offsetHeight });
  const dur = reduce ? 0 : 420, ease = "cubic-bezier(.4,0,.2,1)";
  sheet.querySelector(".inner")!.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur * 0.4, fill: "forwards" });
  sheet.querySelector(".ghost")!.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur, delay: dur * 0.2, fill: "forwards" });
  document.body.classList.remove("open");
  const finish = () => { sheet.remove(); openState = null; cards[m].focus({ preventScroll: true }); };
  if (reduce) { finish(); return; }
  sheet.animate([cur, px({ left: r.left, top: r.top, width: r.width, height: r.height })], { duration: dur, easing: ease, fill: "forwards" }).onfinish = finish;
}

function navigate(hash: string) {
  if (location.hash !== hash) {
    try { history.pushState(null, "", hash || location.pathname + location.search); } catch {}
  }
  route(hash.slice(1));
}
function route(h = location.hash.slice(1)) {
  const idx = sections.findIndex((s) => s.id === h && !s.href);
  if (idx < 0) { if (openState) closeSheet(); return; }
  if (openState && !openState.closing) {
    if (openState.m % N === idx) return;
    closeSheet(); setTimeout(() => route(h), reduce ? 0 : 460); return;
  }
  const base = Math.round(pos);
  let d = mod(idx - base, N); if (d > N / 2) d -= N;
  const m = mod(base + d, M);
  if (Math.abs(wrapD(m - pos)) > 0.5) { target = Math.round(pos + wrapD(m - pos)); setTimeout(() => openSheet(m), reduce ? 0 : 420); }
  else openSheet(m);
}
addEventListener("popstate", () => route());

if (startHash === "saudi-web-infrastructure") location.replace("/writing/saudi-web-infrastructure");

addEventListener("pageshow", () => cards.forEach((c) => { c.style.viewTransitionName = ""; }));

addEventListener("pagereveal", (e) => {
  const vt = (e as Event & { viewTransition?: ViewTransition | null }).viewTransition;
  if (!vt) return;
  const from = (window as any).navigation?.activation?.from?.url;
  if (!from || !new URL(from).pathname.startsWith("/writing")) return;
  const card = cards.find((c, m) => sections[m % N].href && Math.abs(wrapD(m - pos)) < 0.5);
  if (!card) return;
  card.style.viewTransitionName = "panel";
  vt.finished.finally(() => { card.style.viewTransitionName = ""; });
});

addEventListener("resize", () => { layout(); if (openState) navigate(""); });
layout();
draw();
requestAnimationFrame(frame);
if (startIdx >= 0 && !sections[startIdx].href) setTimeout(() => route(startHash), 300);
