(() => {
  const STORAGE_KEY = "aftermind-theme";
  const THEME_COLORS = { light: "#E9E6DD", dark: "#24232B" };
  const root = document.documentElement;
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  function getStored() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v === "light" || v === "dark" || v === "system" ? v : "system";
    } catch {
      return "system";
    }
  }

  function setStored(val) {
    try {
      if (val === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, val);
    } catch {
      // Storage unavailable: current-page override still works
    }
  }

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeThemeTransition = null;
  let themeTransitionSeq = 0;
  let themeFadeTimer = 0;

  function resolveEffectiveTheme(mode) {
    return mode === "system" ? (media.matches ? "dark" : "light") : mode;
  }

  function currentEffectiveTheme() {
    const attr = root.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") return attr;
    return media.matches ? "dark" : "light";
  }

  function applyTheme(mode) {
    if (mode === "light" || mode === "dark") {
      root.setAttribute("data-theme", mode);
    } else {
      root.removeAttribute("data-theme");
    }
    const effective = resolveEffectiveTheme(mode);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_COLORS[effective]);
  }

  function getSwitchOrigin(triggerEl) {
    if (triggerEl && typeof triggerEl.getBoundingClientRect === "function") {
      const rect = triggerEl.getBoundingClientRect();
      if (rect.width > 0 || rect.height > 0) {
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }
    }
    return { x: Math.max(window.innerWidth - 48, 24), y: 28 };
  }

  function spawnLampHalo(x, y, toLight) {
    const halo = document.createElement("div");
    halo.className = `theme-lamp-halo ${toLight ? "theme-lamp-halo--on" : "theme-lamp-halo--off"}`;
    halo.setAttribute("aria-hidden", "true");
    halo.style.setProperty("--lamp-x", `${x}px`);
    halo.style.setProperty("--lamp-y", `${y}px`);
    document.body.appendChild(halo);
    const cleanup = () => halo.remove();
    halo.addEventListener("animationend", cleanup, { once: true });
    window.setTimeout(cleanup, 600);
  }

  function switchTheme(mode, triggerEl) {
    const prevEffective = currentEffectiveTheme();
    const nextEffective = resolveEffectiveTheme(mode);
    setStored(mode);
    syncThemeButtons(mode);

    if (prevEffective === nextEffective || reducedMotionQuery.matches) {
      applyTheme(mode);
      return;
    }

    if (typeof document.startViewTransition !== "function") {
      root.classList.add("theme-fading");
      applyTheme(mode);
      window.clearTimeout(themeFadeTimer);
      themeFadeTimer = window.setTimeout(() => root.classList.remove("theme-fading"), 360);
      return;
    }

    const seq = ++themeTransitionSeq;
    if (activeThemeTransition && typeof activeThemeTransition.skipTransition === "function") {
      try {
        activeThemeTransition.skipTransition();
      } catch {
        // Ignore already-settled transitions
      }
    }

    const toLight = nextEffective === "light";
    const { x, y } = getSwitchOrigin(triggerEl);
    const maxR = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    root.setAttribute("data-theme-transition", toLight ? "to-light" : "to-dark");

    const transition = document.startViewTransition(() => {
      applyTheme(mode);
    });
    activeThemeTransition = transition;

    transition.ready
      .then(() => {
        if (seq !== themeTransitionSeq) return;
        if (toLight) {
          root.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${maxR}px at ${x}px ${y}px)`,
              ],
              filter: ["brightness(1.06)", "brightness(1)"],
            },
            {
              duration: 500,
              easing: "cubic-bezier(0.16, 1, 0.3, 1)",
              fill: "both",
              pseudoElement: "::view-transition-new(root)",
            }
          );
          root.animate(
            { filter: ["brightness(1)", "brightness(0.92)"] },
            {
              duration: 500,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
              fill: "both",
              pseudoElement: "::view-transition-old(root)",
            }
          );
        } else {
          root.animate(
            {
              clipPath: [
                `circle(${maxR}px at ${x}px ${y}px)`,
                `circle(0px at ${x}px ${y}px)`,
              ],
              filter: ["brightness(1)", "brightness(0.78)"],
            },
            {
              duration: 440,
              easing: "cubic-bezier(0.32, 0, 0.2, 1)",
              fill: "both",
              pseudoElement: "::view-transition-old(root)",
            }
          );
          root.animate(
            { filter: ["brightness(0.9)", "brightness(1)"] },
            {
              duration: 440,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
              fill: "both",
              pseudoElement: "::view-transition-new(root)",
            }
          );
        }
      })
      .catch(() => {
        // Fallback: theme is already applied in update callback
      });

    transition.finished.finally(() => {
      if (seq !== themeTransitionSeq) return;
      activeThemeTransition = null;
      root.removeAttribute("data-theme-transition");
      spawnLampHalo(x, y, toLight);
    });
  }

  // Init 3-state theme switcher
  const themeBtns = Array.from(document.querySelectorAll("[data-theme-btn]"));
  function syncThemeButtons(mode) {
    themeBtns.forEach((btn) => {
      const active = btn.dataset.themeBtn === mode;
      btn.setAttribute("aria-checked", active ? "true" : "false");
      btn.classList.toggle("is-active", active);
      btn.tabIndex = active ? 0 : -1;
    });
  }

  if (themeBtns.length) {
    syncThemeButtons(getStored());
    themeBtns.forEach((btn, idx) => {
      btn.addEventListener("click", () => {
        switchTheme(btn.dataset.themeBtn, btn);
      });
      btn.addEventListener("keydown", (e) => {
        const forward = e.key === "ArrowRight" || e.key === "ArrowDown";
        const backward = e.key === "ArrowLeft" || e.key === "ArrowUp";
        if (!forward && !backward) return;
        e.preventDefault();
        const next = (idx + (forward ? 1 : -1) + themeBtns.length) % themeBtns.length;
        const target = themeBtns[next];
        target.click();
        target.focus();
      });
    });
  }
  media.addEventListener("change", () => {
    if (getStored() === "system") applyTheme("system");
  });

  // Live region for unobtrusive status announcements
  const liveRegion = document.getElementById("a11y-live");
  function announce(msg) {
    if (!liveRegion) return;
    liveRegion.textContent = "";
    requestAnimationFrame(() => {
      liveRegion.textContent = msg;
    });
  }

  // Code block archival header & copy button
  const copyLabel = root.dataset.copyLabel || "Copy";
  const copiedLabel = root.dataset.copiedLabel || "Copied";
  const copyFailLabel = root.dataset.copyFailLabel || "Copy failed";
  const copyTpl = document.getElementById("tpl-icon-copy");
  const checkTpl = document.getElementById("tpl-icon-check");

  function setCopyButtonState(btn, state, label) {
    btn.textContent = "";
    const tpl = state === "copied" ? checkTpl : copyTpl;
    if (tpl && tpl.content) {
      btn.append(tpl.content.cloneNode(true));
    }
    const span = document.createElement("span");
    span.textContent = label;
    btn.append(span);
    btn.classList.toggle("is-copied", state === "copied");
  }

  document.querySelectorAll(".prose pre").forEach((pre) => {
    if (pre.parentElement && pre.parentElement.classList.contains("code-block")) return;
    const code = pre.querySelector("code");
    let lang = "TEXT";
    if (code) {
      const m = code.className.match(/language-([a-z0-9_+-]+)/i);
      if (m) lang = m[1].toUpperCase();
    }

    const wrapper = document.createElement("div");
    wrapper.className = "code-block";

    const bar = document.createElement("div");
    bar.className = "code-block-bar";

    const langSpan = document.createElement("span");
    langSpan.setAttribute("translate", "no");
    langSpan.textContent = lang;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "code-copy-btn";
    setCopyButtonState(btn, "idle", copyLabel);

    let timer = null;
    btn.addEventListener("click", async () => {
      const text = code ? code.textContent : pre.textContent;
      try {
        await navigator.clipboard.writeText(text || "");
        setCopyButtonState(btn, "copied", copiedLabel);
        announce(copiedLabel);
      } catch {
        setCopyButtonState(btn, "idle", copyFailLabel);
        announce(copyFailLabel);
      }
      clearTimeout(timer);
      timer = setTimeout(() => {
        setCopyButtonState(btn, "idle", copyLabel);
      }, 1800);
    });

    bar.append(langSpan, btn);
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.append(bar, pre);
  });

  // Bidirectional margin note highlight & narrow-screen toggle
  const noteButtons = document.querySelectorAll(".note-ref-btn[data-note-id]");
  noteButtons.forEach((btn) => {
    const id = btn.dataset.noteId;
    const note = document.getElementById(id);
    if (!note) return;

    const activate = () => {
      btn.classList.add("is-active");
      note.classList.add("is-active");
    };
    const deactivate = () => {
      btn.classList.remove("is-active");
      note.classList.remove("is-active");
    };

    btn.addEventListener("mouseenter", activate);
    btn.addEventListener("mouseleave", deactivate);
    btn.addEventListener("focus", activate);
    btn.addEventListener("blur", deactivate);

    note.addEventListener("mouseenter", activate);
    note.addEventListener("mouseleave", deactivate);
    note.addEventListener("focusin", activate);
    note.addEventListener("focusout", deactivate);
    btn.addEventListener("click", () => {
      if (window.innerWidth < 1200) {
        const open = note.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", String(open));
      } else {
        note.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  });
})();
