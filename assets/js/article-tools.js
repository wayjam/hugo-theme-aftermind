(() => {
  const dialog = document.getElementById("article-lightbox");
  if (!dialog) return;

  const liveRegion = document.getElementById("a11y-live");
  function announce(message) {
    if (!liveRegion || !message) return;
    liveRegion.textContent = "";
    requestAnimationFrame(() => {
      liveRegion.textContent = message;
    });
  }

  const config = {
    math: dialog.dataset.math === "true",
    diagrams: dialog.dataset.diagrams === "true",
    openLabel: dialog.dataset.openLabel || "Inspect image",
    viewerLabel: dialog.dataset.viewerLabel || "Image viewer",
    closeLabel: dialog.dataset.closeLabel || "Close image viewer",
    prevLabel: dialog.dataset.prevLabel || "Previous image",
    nextLabel: dialog.dataset.nextLabel || "Next image",
    diagramLabel: dialog.dataset.diagramLabel || "Mermaid diagram",
    diagramFailed: dialog.dataset.diagramFailed || "Diagram unavailable — showing source",
  };

  /* ------------------------------------------------------------------ *
   * 1. Accessible Article Lightbox (cover + prose images)
   * ------------------------------------------------------------------ */
  function initLightbox() {
    const imgEl = dialog.querySelector("[data-lightbox-img]");
    const stageEl = dialog.querySelector("[data-lightbox-stage]");
    const counterEl = dialog.querySelector("[data-lightbox-counter]");
    const metaEl = dialog.querySelector("[data-lightbox-meta]");
    const captionEl = dialog.querySelector("[data-lightbox-caption]");
    const altEl = dialog.querySelector("[data-lightbox-alt]");
    const prevBtn = dialog.querySelector("[data-lightbox-prev]");
    const nextBtn = dialog.querySelector("[data-lightbox-next]");
    const closeBtn = dialog.querySelector("[data-lightbox-close]");
    if (!imgEl || !stageEl || !closeBtn) return;
    const zoomIcon = document.getElementById("tpl-icon-zoom")?.content.firstElementChild;

    const candidates = Array.from(
      document.querySelectorAll(".article-cover img, .prose img")
    );

    const items = [];

    function isEligibleImage(img) {
      if (!img.getAttribute("src") && !img.currentSrc) return false;
      if (img.complete && img.naturalWidth === 0) return false;
      if (img.hasAttribute("data-no-lightbox")) return false;
      if (img.getAttribute("aria-hidden") === "true") return false;
      const role = img.getAttribute("role");
      if (role === "presentation" || role === "none") return false;
      // Respect author links and exclude interactive/math/diagram subtrees
      if (img.closest("a, button, [data-no-lightbox], .katex, .article-diagram")) {
        return false;
      }
      return true;
    }

    function hasSiblingContent(img) {
      const parent = img.parentElement;
      if (!parent || parent.tagName !== "P") return false;
      for (const node of parent.childNodes) {
        if (node === img) continue;
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
          return true;
        }
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== "BR") {
          return true;
        }
      }
      return false;
    }

    function extractCaption(img) {
      const fig = img.closest("figure");
      if (fig) {
        const fc = fig.querySelector("figcaption");
        if (fc) {
          const text = fc.textContent.replace(/\s+/g, " ").trim();
          if (text) return text;
        }
      }
      const title = (img.getAttribute("title") || "").replace(/\s+/g, " ").trim();
      return title;
    }

    candidates.forEach((img) => {
      if (!isEligibleImage(img)) return;
      const parent = img.parentNode;
      if (!parent) return;

      const inline = hasSiblingContent(img);
      const alt = (img.getAttribute("alt") || "").replace(/\s+/g, " ").trim();
      const caption = extractCaption(img);
      const desc = caption || alt;

      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = inline
        ? "lightbox-trigger lightbox-trigger--inline"
        : "lightbox-trigger";
      trigger.setAttribute("aria-haspopup", "dialog");
      trigger.setAttribute(
        "aria-label",
        desc ? `${config.openLabel}: ${desc}` : config.openLabel
      );

      parent.insertBefore(trigger, img);
      trigger.appendChild(img);

      if (!inline && zoomIcon) trigger.appendChild(zoomIcon.cloneNode(true));

      const index = items.length;
      items.push({ img, trigger, alt, caption });

      trigger.addEventListener("click", () => {
        if (img.complete && img.naturalWidth === 0) return;
        openAt(index, trigger);
      });
    });

    if (!items.length) return;

    let currentIndex = -1;
    let openerEl = null;

    function formatCounter(index, total) {
      const pad = (n) => String(n).padStart(2, "0");
      return `FIG. ${pad(index + 1)} / ${pad(total)}`;
    }

    function updateView(index, shouldAnnounce) {
      const total = items.length;
      currentIndex = ((index % total) + total) % total;
      const item = items[currentIndex];
      const src = item.img.currentSrc || item.img.getAttribute("src") || "";

      imgEl.src = src;
      imgEl.alt = item.alt;

      if (counterEl) {
        if (total > 1) {
          counterEl.textContent = formatCounter(currentIndex, total);
          counterEl.hidden = false;
        } else {
          counterEl.textContent = "";
          counterEl.hidden = true;
        }
      }

      if (prevBtn && nextBtn) {
        const showNav = total > 1;
        prevBtn.hidden = !showNav;
        nextBtn.hidden = !showNav;
      }

      const caption = item.caption;
      const alt = item.alt;
      if (metaEl && captionEl && altEl) {
        if (caption && alt && caption !== alt) {
          captionEl.textContent = caption;
          altEl.textContent = alt;
          altEl.hidden = false;
          metaEl.hidden = false;
        } else if (caption || alt) {
          captionEl.textContent = caption || alt;
          altEl.textContent = "";
          altEl.hidden = true;
          metaEl.hidden = false;
        } else {
          captionEl.textContent = "";
          altEl.textContent = "";
          altEl.hidden = true;
          metaEl.hidden = true;
        }
      }

      if (shouldAnnounce && total > 1) {
        const summary = caption || alt;
        const counterText = formatCounter(currentIndex, total);
        announce(summary ? `${counterText}: ${summary}` : counterText);
      }
    }

    function getFocusableControls() {
      return [prevBtn, nextBtn, closeBtn].filter(
        (el) => el && !el.hidden && !el.disabled
      );
    }

    function openAt(index, triggerEl) {
      openerEl = triggerEl || document.activeElement;
      updateView(index, false);
      document.documentElement.classList.add("has-lightbox-open");

      if (typeof dialog.showModal === "function") {
        if (!dialog.open) dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }

      closeBtn.focus();
    }

    function closeLightbox() {
      if (typeof dialog.close === "function" && dialog.open) {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
        onDialogClosed();
      }
    }

    function onDialogClosed() {
      document.documentElement.classList.remove("has-lightbox-open");
      const target =
        openerEl && openerEl.isConnected
          ? openerEl
          : items[currentIndex] && items[currentIndex].trigger;
      if (target && typeof target.focus === "function") {
        target.focus();
      }
      openerEl = null;
    }

    closeBtn.addEventListener("click", closeLightbox);

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (items.length > 1) updateView(currentIndex - 1, true);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (items.length > 1) updateView(currentIndex + 1, true);
      });
    }

    // Backdrop or outside-image stage click closes lightbox
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog || e.target === stageEl) {
        closeLightbox();
      }
    });

    dialog.addEventListener("close", onDialogClosed);

    dialog.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeLightbox();
        return;
      }

      if (items.length > 1) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          updateView(currentIndex - 1, true);
          return;
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          updateView(currentIndex + 1, true);
          return;
        }
        if (e.key === "Home") {
          e.preventDefault();
          updateView(0, true);
          return;
        }
        if (e.key === "End") {
          e.preventDefault();
          updateView(items.length - 1, true);
          return;
        }
      }

      if (e.key === "Tab") {
        const focusable = getFocusableControls();
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * 2. Per-page KaTeX Math Rendering (opt-in via math = true)
   * ------------------------------------------------------------------ */
  function initMath() {
    if (!config.math) return;
    if (typeof window.renderMathInElement !== "function") return;

    const prose = document.querySelector(".article-main .prose");
    if (!prose) return;

    try {
      window.renderMathInElement(prose, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\[", right: "\\]", display: true },
          { left: "\\(", right: "\\)", display: false },
        ],
        ignoredTags: [
          "script",
          "noscript",
          "style",
          "textarea",
          "pre",
          "code",
          "option",
        ],
        ignoredClasses: ["article-diagram", "code-block"],
        throwOnError: false,
        strict: "warn",
        trust: false,
      });
    } catch {
      // Preserve author math source text untouched on runtime error
    }
  }

  /* ------------------------------------------------------------------ *
   * 3. Per-page Mermaid Diagram Rendering (opt-in via diagrams = true)
   * ------------------------------------------------------------------ */
  function initDiagrams() {
    if (!config.diagrams) return;

    const blocks = Array.from(document.querySelectorAll("[data-mermaid-block]"));
    if (!blocks.length) return;

    const entries = blocks
      .map((block, index) => {
        const sourceWrap = block.querySelector("[data-mermaid-source-wrap]");
        const sourceEl = block.querySelector("[data-mermaid-source]");
        const stage = block.querySelector("[data-mermaid-stage]");
        const status = block.querySelector("[data-mermaid-status]");
        const source = sourceEl ? sourceEl.textContent : "";
        return { block, index, sourceWrap, stage, status, source };
      })
      .filter((entry) => entry.source.trim().length > 0 && entry.stage);

    if (!entries.length) return;

    function showFallback(entry) {
      entry.block.classList.add("is-error");
      if (entry.sourceWrap) entry.sourceWrap.hidden = false;
      entry.stage.textContent = "";
      entry.stage.hidden = true;
      if (entry.status) {
        entry.status.textContent = config.diagramFailed;
        entry.status.hidden = false;
      }
    }

    function showRendered(entry, svgNode) {
      entry.block.classList.remove("is-error");
      entry.stage.textContent = "";
      entry.stage.appendChild(svgNode);
      entry.stage.hidden = false;
      if (entry.sourceWrap) entry.sourceWrap.hidden = true;
      if (entry.status) {
        entry.status.textContent = "";
        entry.status.hidden = true;
      }
    }

    function sanitizeSvg(svgMarkup) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgMarkup, "image/svg+xml");
      if (doc.querySelector("parsererror")) return null;
      const svg = doc.documentElement;
      if (!svg || svg.tagName.toLowerCase() !== "svg") return null;

      // Strip potentially unsafe elements even under securityLevel: "strict"
      const forbidden = svg.querySelectorAll(
        "script, foreignObject, iframe, object, embed, link"
      );
      forbidden.forEach((node) => node.remove());

      const allNodes = [svg, ...svg.querySelectorAll("*")];
      for (const el of allNodes) {
        for (const attr of Array.from(el.attributes)) {
          const name = attr.name.toLowerCase();
          const val = attr.value.trim();
          if (name.startsWith("on")) {
            el.removeAttribute(attr.name);
            continue;
          }
          if (
            (name === "href" || name === "xlink:href") &&
            /^(?:javascript:|vbscript:|data:text\/html)/i.test(val)
          ) {
            el.removeAttribute(attr.name);
          }
        }
      }

      svg.removeAttribute("height");
      svg.style.maxWidth = "100%";
      svg.style.height = "auto";
      return document.importNode(svg, true);
    }

    function readThemePalette() {
      const styles = getComputedStyle(document.documentElement);
      const get = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
      const bg = get("--bg", "#E9E6DD");
      const bgSubtle = get("--bg-subtle", "#DDD9CD");
      const fg = get("--fg", "#282822");
      const fgMuted = get("--fg-muted", "#565349");
      const rule = get("--rule", "#9A9383");
      const accent = get("--accent", "#7A3B2E");
      const fontSans = get("--font-sans", "sans-serif");
      const isDark =
        document.documentElement.getAttribute("data-theme") === "dark" ||
        (!document.documentElement.getAttribute("data-theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

      return {
        darkMode: isDark,
        background: bgSubtle,
        primaryColor: bg,
        primaryTextColor: fg,
        primaryBorderColor: rule,
        secondaryColor: bgSubtle,
        secondaryTextColor: fg,
        secondaryBorderColor: rule,
        tertiaryColor: bg,
        tertiaryTextColor: fgMuted,
        tertiaryBorderColor: rule,
        lineColor: rule,
        textColor: fg,
        mainBkg: bg,
        nodeBorder: rule,
        clusterBkg: bgSubtle,
        clusterBorder: rule,
        edgeLabelBackground: bgSubtle,
        actorBkg: bg,
        actorBorder: rule,
        actorTextColor: fg,
        actorLineColor: rule,
        signalColor: fg,
        signalTextColor: fg,
        labelBoxBkgColor: bg,
        labelBoxBorderColor: rule,
        labelTextColor: fg,
        noteBkgColor: bg,
        noteBorderColor: accent,
        noteTextColor: fg,
        fontFamily: fontSans,
        fontSize: "14px",
      };
    }

    if (typeof window.mermaid === "undefined" || typeof window.mermaid.render !== "function") {
      entries.forEach(showFallback);
      return;
    }

    let renderGeneration = 0;

    async function renderAll() {
      const gen = ++renderGeneration;
      const themeVariables = readThemePalette();

      try {
        window.mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          htmlLabels: false,
          flowchart: { htmlLabels: false },
          class: { htmlLabels: false },
          suppressErrorRendering: true,
          theme: "base",
          themeVariables,
        });
      } catch {
        entries.forEach(showFallback);
        return;
      }

      for (const entry of entries) {
        if (gen !== renderGeneration) return;
        const renderId = `aftermind-mermaid-${entry.index}-${gen}`;
        try {
          const result = await window.mermaid.render(renderId, entry.source);
          if (gen !== renderGeneration) return;
          const svgMarkup = typeof result === "string" ? result : result && result.svg;
          const svgNode = svgMarkup ? sanitizeSvg(svgMarkup) : null;
          if (!svgNode) {
            showFallback(entry);
            continue;
          }
          showRendered(entry, svgNode);
        } catch {
          const orphan =
            document.getElementById(renderId) ||
            document.getElementById(`d${renderId}`);
          if (orphan) orphan.remove();
          showFallback(entry);
        }
      }
    }

    renderAll();

    // Re-render diagrams cleanly when Light / Dark theme changes
    const themeObserver = new MutationObserver(() => {
      renderAll();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const colorSchemeMedia = window.matchMedia("(prefers-color-scheme: dark)");
    colorSchemeMedia.addEventListener("change", () => {
      if (!document.documentElement.getAttribute("data-theme")) {
        renderAll();
      }
    });
  }

  function boot() {
    initLightbox();
    initMath();
    initDiagrams();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
