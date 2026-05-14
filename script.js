// Small page scripts: carousel, FAQ, modals, industries strip, HDPE process tabs.

(function () {
  "use strict";

  const carouselRoot = document.querySelector("[data-carousel]");
  if (carouselRoot) {
    const slides = Array.from(
      carouselRoot.querySelectorAll("[data-carousel-slide]")
    );
    const prevBtn = carouselRoot.querySelector("[data-carousel-prev]");
    const nextBtn = carouselRoot.querySelector("[data-carousel-next]");
    const zoomPanel = carouselRoot.querySelector("[data-carousel-zoom]");
    const thumbsHost = carouselRoot.querySelector("[data-carousel-thumbs]");

    let index = slides.findIndex((s) => s.classList.contains("is-active"));
    if (index < 0) index = 0;

    function buildThumbs() {
      if (!thumbsHost) return;
      thumbsHost.innerHTML = ""; // thumbs mirror slide images (src only)
      slides.forEach((slide, idx) => {
        const srcImg = slide.querySelector("img");
        if (!srcImg) return;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "hero__thumb-btn" + (idx === index ? " is-active" : "");
        btn.setAttribute("aria-label", `Show image ${idx + 1}`);
        btn.setAttribute("aria-current", idx === index ? "true" : "false");
        const thumb = document.createElement("img");
        thumb.src = srcImg.getAttribute("src") || "";
        thumb.alt = "";
        btn.appendChild(thumb);
        btn.addEventListener("click", () => setActive(idx));
        thumbsHost.appendChild(btn);
      });
    }

    function syncThumbs() {
      if (!thumbsHost) return;
      thumbsHost.querySelectorAll("button").forEach((btn, idx) => {
        btn.classList.toggle("is-active", idx === index);
        btn.setAttribute("aria-current", idx === index ? "true" : "false");
      });
    }

    function setActive(i) {
      const next = (i + slides.length) % slides.length;
      slides.forEach((slide, idx) => {
        const on = idx === next;
        slide.classList.toggle("is-active", on);
        const hit = slide.querySelector("[data-carousel-item]");
        if (hit) hit.setAttribute("aria-current", on ? "true" : "false");
      });
      index = next;
      syncThumbs();
      hideZoom();
    }

    function hideZoom() {
      if (!zoomPanel) return;
      zoomPanel.classList.remove("is-active");
      zoomPanel.hidden = true;
    }

    function handleZoomMove(event, slideButton) {
      if (!zoomPanel) return;
      const img = slideButton.querySelector("img");
      if (!img) return;
      const hiRes =
        img.getAttribute("data-carousel-src") || img.currentSrc || img.src;
      zoomPanel.style.backgroundImage = `url("${hiRes}")`; // div acts as zoomed crop
      const rect = slideButton.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const posX = Math.min(Math.max(x, 0), 1) * 100;
      const posY = Math.min(Math.max(y, 0), 1) * 100;
      zoomPanel.style.backgroundPosition = `${posX}% ${posY}%`;
      zoomPanel.hidden = false;
      zoomPanel.classList.add("is-active");
    }

    slides.forEach((slide) => {
      const btn = slide.querySelector("[data-carousel-item]");
      if (!btn) return;
      btn.addEventListener("pointermove", (e) => {
        if (slide.classList.contains("is-active")) {
          handleZoomMove(e, btn);
        }
      });
      btn.addEventListener("pointerleave", hideZoom);
      btn.addEventListener("blur", hideZoom);
    });

    if (prevBtn) prevBtn.addEventListener("click", () => setActive(index - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => setActive(index + 1));

    document.addEventListener("keydown", (e) => {
      if (!carouselRoot.contains(document.activeElement)) return; // focus inside gallery only
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActive(index - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setActive(index + 1);
      }
    });

    buildThumbs();
  }

  const faqRoot = document.querySelector("[data-faq-accordion]");
  if (faqRoot) {
    function setFaqItemState(item, open) {
      const trigger = item.querySelector("[data-faq-trigger]");
      const panel = item.querySelector("[data-faq-panel]");
      if (!trigger || !panel) return;
      item.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", String(open));
      if (open) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
    }

    faqRoot.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-faq-trigger]");
      if (!trigger || !faqRoot.contains(trigger)) return;
      const item = trigger.closest("[data-faq-item]");
      if (!item) return;
      const wasOpen = item.classList.contains("is-open");
      faqRoot.querySelectorAll("[data-faq-item]").forEach((i) => {
        setFaqItemState(i, false); // close siblings
      });
      if (!wasOpen) {
        setFaqItemState(item, true);
      }
    });
  }

  const catalogueForm = document.getElementById("catalogue-form");
  if (catalogueForm) {
    catalogueForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!catalogueForm.reportValidity()) return;
      catalogueForm.reset();
    });
  }

  const modalDatasheet = document.getElementById("modal-datasheet");
  const modalQuote = document.getElementById("modal-quote");
  const quoteForm = document.getElementById("quote-form");

  let lastFocus = null; // return focus here after close

  function openModal(id) {
    const el =
      id === "quote" ? modalQuote : id === "datasheet" ? modalDatasheet : null;
    if (!el) return;
    lastFocus = document.activeElement;
    el.hidden = false;
    document.body.style.overflow = "hidden";
    const closeBtn = el.querySelector("[data-close-modal]");
    if (closeBtn instanceof HTMLElement) {
      closeBtn.focus();
    }
  }

  function closeModal(el) {
    if (!el) return;
    el.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus instanceof HTMLElement) {
      lastFocus.focus();
    }
  }

  document.querySelectorAll("[data-open-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-open-modal");
      if (id) openModal(id);
    });
  });

  document.querySelectorAll("[data-close-modal]").forEach((node) => {
    node.addEventListener("click", (e) => {
      const modal = e.currentTarget.closest(".modal");
      closeModal(modal);
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (modalQuote && !modalQuote.hidden) closeModal(modalQuote);
    if (modalDatasheet && !modalDatasheet.hidden) closeModal(modalDatasheet);
  });

  if (quoteForm) {
    quoteForm.addEventListener("submit", (e) => {
      e.preventDefault();
      closeModal(modalQuote);
    });
  }

  const ctaInlineForm = document.getElementById("cta-inline-form");
  if (ctaInlineForm) {
    ctaInlineForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!ctaInlineForm.reportValidity()) return;
      ctaInlineForm.reset();
      openModal("quote"); // hand off to main quote modal
    });
  }

  const industriesViewport = document.querySelector("[data-industries-viewport]");
  const industriesPrev = document.querySelector("[data-industries-prev]");
  const industriesNext = document.querySelector("[data-industries-next]");
  if (industriesViewport && industriesPrev && industriesNext) {
    function industriesStep() {
      const card = industriesViewport.querySelector(".industry-card");
      if (!card) return 436;
      const gap = 16;
      return card.getBoundingClientRect().width + gap; // one card + gutter
    }
    industriesPrev.addEventListener("click", () => {
      industriesViewport.scrollBy({ left: -industriesStep(), behavior: "smooth" });
    });
    industriesNext.addEventListener("click", () => {
      industriesViewport.scrollBy({ left: industriesStep(), behavior: "smooth" });
    });
  }

  const processRoot = document.querySelector("[data-process-tabs]");
  if (processRoot) {
    const tabButtons = Array.from(processRoot.querySelectorAll("[data-process-tab]"));
    const panels = Array.from(processRoot.querySelectorAll("[data-process-panel]"));
    let active = 0;

    function setProcessTab(i) {
      active = (i + tabButtons.length) % tabButtons.length;
      tabButtons.forEach((btn, j) => {
        const on = j === active;
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-selected", String(on));
      });
      panels.forEach((panel, j) => {
        const on = j === active;
        if (on) {
          panel.removeAttribute("hidden");
          panel.classList.add("is-active");
        } else {
          panel.setAttribute("hidden", "");
          panel.classList.remove("is-active");
        }
      });
    }

    processRoot.addEventListener("click", (e) => {
      const tab = e.target.closest("[data-process-tab]");
      if (tab && processRoot.contains(tab)) {
        const idx = Number(tab.getAttribute("data-process-tab"));
        if (!Number.isNaN(idx)) setProcessTab(idx);
        return;
      }
      // image arrows cycle same index set as the pills
      if (e.target.closest("[data-process-img-prev]")) {
        e.preventDefault();
        setProcessTab(active - 1);
      } else if (e.target.closest("[data-process-img-next]")) {
        e.preventDefault();
        setProcessTab(active + 1);
      }
    });
  }
})();
