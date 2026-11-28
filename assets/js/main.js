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
          spawnLampHalo(x, y, true);
          root.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${maxR}px at ${x}px ${y}px)`,
              ],
              filter: ["brightness(1.06)", "brightness(1)"],
            },
            {
              duration: 420,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
              fill: "both",
              pseudoElement: "::view-transition-new(root)",
            }
          );
          root.animate(
            { filter: ["brightness(1)", "brightness(0.92)"] },
            {
              duration: 420,
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
              filter: ["brightness(1)", "brightness(0.84)"],
            },
            {
              duration: 360,
              easing: "cubic-bezier(0.4, 0, 0.7, 1)",
              fill: "both",
              pseudoElement: "::view-transition-old(root)",
            }
          );
          root.animate(
            { filter: ["brightness(0.92)", "brightness(1)"] },
            {
              duration: 360,
              easing: "cubic-bezier(0.4, 0, 0.7, 1)",
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
      if (!toLight) spawnLampHalo(x, y, false);
    });
  }

  // Init 3-state theme switcher
  const themeControl = document.querySelector(".theme-control");
  const themeBtns = Array.from(document.querySelectorAll("[data-theme-btn]"));
  function syncThemeThumb(animate = true) {
    if (!themeControl) return;
    const activeBtn = themeBtns.find((b) => b.getAttribute("aria-checked") === "true");
    const label = activeBtn?.querySelector(".theme-btn-label");
    if (!label) return;
    const ctrlRect = themeControl.getBoundingClientRect();
    const labelRect = label.getBoundingClientRect();
    if (!ctrlRect.width || !labelRect.width) return;
    if (!animate) themeControl.classList.remove("is-thumb-ready");
    themeControl.style.setProperty("--thumb-x", `${(labelRect.left - ctrlRect.left).toFixed(2)}px`);
    themeControl.style.setProperty("--thumb-w", `${labelRect.width.toFixed(2)}px`);
    themeControl.style.setProperty("--thumb-h", `${labelRect.height.toFixed(2)}px`);
    themeControl.classList.add("has-thumb");
    if (!animate) {
      requestAnimationFrame(() => {
        themeControl.classList.add("is-thumb-ready");
      });
    }
  }
  function syncThemeButtons(mode) {
    themeBtns.forEach((btn) => {
      const active = btn.dataset.themeBtn === mode;
      btn.setAttribute("aria-checked", active ? "true" : "false");
      btn.tabIndex = active ? 0 : -1;
    });
    syncThemeThumb(themeControl?.classList.contains("is-thumb-ready"));
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
  window.addEventListener("resize", () => syncThemeThumb(false), { passive: true });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => syncThemeThumb(false)).catch(() => {});
  }

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

  // Note shortcode interactions across margin, inline, and popover modes
  const articleLayout = document.querySelector(".article-layout");
  const noteStyle = articleLayout?.dataset.noteStyle || "margin";
  const noteButtons = Array.from(document.querySelectorAll(".note-ref-btn[data-note-id]"));

  function closePopover(exceptBtn = null) {
    noteButtons.forEach((btn) => {
      if (btn === exceptBtn) return;
      const note = document.getElementById(btn.dataset.noteId);
      if (!note) return;
      note.classList.remove("is-open", "is-active");
      btn.classList.remove("is-active");
      btn.setAttribute("aria-expanded", "false");
    });
  }

  function positionPopover(btn, note) {
    const btnRect = btn.getBoundingClientRect();
    const noteRect = note.getBoundingClientRect();
    const pad = 16;
    const gap = 8;
    let left = btnRect.left;
    if (left + noteRect.width > window.innerWidth - pad) {
      left = window.innerWidth - pad - noteRect.width;
    }
    if (left < pad) left = pad;

    let top = btnRect.bottom + gap;
    if (top + noteRect.height > window.innerHeight - pad) {
      const above = btnRect.top - gap - noteRect.height;
      if (above >= pad) {
        top = above;
      } else {
        top = Math.max(pad, window.innerHeight - pad - noteRect.height);
      }
    }
    note.style.setProperty("--popover-left", `${Math.round(left)}px`);
    note.style.setProperty("--popover-top", `${Math.round(top)}px`);
  }

  noteButtons.forEach((btn) => {
    const id = btn.dataset.noteId;
    const note = document.getElementById(id);
    if (!note) return;

    const activate = () => {
      btn.classList.add("is-active");
      note.classList.add("is-active");
    };
    const deactivate = () => {
      if (noteStyle === "popover" && note.classList.contains("is-open")) return;
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

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (noteStyle === "popover") {
        const willOpen = !note.classList.contains("is-open");
        closePopover(willOpen ? btn : null);
        note.classList.toggle("is-open", willOpen);
        btn.classList.toggle("is-active", willOpen);
        note.classList.toggle("is-active", willOpen);
        btn.setAttribute("aria-expanded", String(willOpen));
        if (willOpen) {
          positionPopover(btn, note);
        }
        return;
      }
      if (noteStyle === "inline" || window.innerWidth < 1200) {
        const open = note.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", String(open));
      } else {
        note.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  });

  if (noteStyle === "popover" && noteButtons.length) {
    document.addEventListener("click", (e) => {
      if (e.target.closest(".note-ref, .note")) return;
      closePopover();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const openBtn = noteButtons.find((b) => b.getAttribute("aria-expanded") === "true");
      closePopover();
      if (openBtn) openBtn.focus();
    });
    const syncOpenPopover = () => {
      const openBtn = noteButtons.find((b) => b.getAttribute("aria-expanded") === "true");
      if (!openBtn) return;
      const openNote = document.getElementById(openBtn.dataset.noteId);
      if (openNote) positionPopover(openBtn, openNote);
    };
    window.addEventListener("resize", syncOpenPopover);
    window.addEventListener("scroll", syncOpenPopover, { passive: true });
  }
})();
