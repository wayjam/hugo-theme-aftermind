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

  function applyTheme(mode) {
    if (mode === "light" || mode === "dark") {
      root.setAttribute("data-theme", mode);
    } else {
      root.removeAttribute("data-theme");
    }
    const effective = mode === "system" ? (media.matches ? "dark" : "light") : mode;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_COLORS[effective]);
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
        const val = btn.dataset.themeBtn;
        setStored(val);
        applyTheme(val);
        syncThemeButtons(val);
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
