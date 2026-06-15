/* =========================================================
   LEGAL IT — Shared interactions
   ========================================================= */
(function () {
  "use strict";

  /* ---- Sticky header state ---- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 24) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
    });
    document.querySelectorAll(".mobile-menu a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
      });
    });
  }

  /* ---- Scroll reveal + counters (rAF scroll-position based) ---- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  var ticking = false;

  function inView(el, frac) {
    var r = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    if (r.height === 0 && r.width === 0) return false;
    var trigger = vh * (frac == null ? 0.92 : frac);
    return r.top < trigger && r.bottom > 0;
  }
  function checkReveals() {
    ticking = false;
    reveals = reveals.filter(function (el) {
      if (inView(el)) { el.classList.add("in"); return false; }
      return true;
    });
    counters = counters.filter(function (el) {
      if (inView(el, 0.85)) { animateCount(el); return false; }
      return true;
    });
  }
  function requestCheck() {
    if (!ticking) { ticking = true; requestAnimationFrame(checkReveals); }
  }
  window.addEventListener("scroll", requestCheck, { passive: true });
  window.addEventListener("resize", requestCheck, { passive: true });
  window.addEventListener("load", checkReveals);
  // initial passes (cover late layout / font load)
  checkReveals();
  setTimeout(checkReveals, 120);
  setTimeout(checkReveals, 500);

  /* ---- Animated counters ---- */
  function animateCount(el) {
    var raw = el.getAttribute("data-count");
    var target = parseFloat(raw);
    var decimals = (raw.split(".")[1] || "").length;
    var suffix = el.getAttribute("data-suffix") || "";
    var prefix = el.getAttribute("data-prefix") || "";
    var dur = 1500, start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = (target * eased).toFixed(decimals);
      el.textContent = prefix + String(val).replace(".", ",") + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = prefix + String(target.toFixed(decimals)).replace(".", ",") + suffix;
    }
    requestAnimationFrame(frame);
  }

  /* ---- Accordion (FAQ / service detail) ---- */
  document.querySelectorAll("[data-accordion] .acc-head").forEach(function (head) {
    head.addEventListener("click", function () {
      var item = head.closest(".acc-item");
      var open = item.classList.contains("open");
      item.parentElement.querySelectorAll(".acc-item").forEach(function (i) { i.classList.remove("open"); });
      if (!open) item.classList.add("open");
    });
  });

  /* ---- Form validation ---- */
  document.querySelectorAll("form[data-validate]").forEach(function (form) {
    var fields = form.querySelectorAll("[required]");
    function validateField(f) {
      var valid = true;
      var val = (f.value || "").trim();
      if (!val) valid = false;
      else if (f.type === "email") valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      else if (f.type === "tel") valid = val.replace(/[^0-9]/g, "").length >= 8;
      var wrap = f.closest(".field");
      if (wrap) wrap.classList.toggle("invalid", !valid);
      return valid;
    }
    fields.forEach(function (f) {
      f.addEventListener("blur", function () { if (f.dataset.touched) validateField(f); });
      f.addEventListener("input", function () {
        f.dataset.touched = "1";
        var wrap = f.closest(".field");
        if (wrap && wrap.classList.contains("invalid")) validateField(f);
      });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      fields.forEach(function (f) { f.dataset.touched = "1"; if (!validateField(f)) ok = false; });
      if (!ok) {
        var firstBad = form.querySelector(".field.invalid [required]");
        if (firstBad) firstBad.focus();
        return;
      }
      var success = document.querySelector(form.getAttribute("data-success") || ".form-success");
      if (success) {
        form.style.display = "none";
        success.hidden = false;
        success.classList.add("in");
        var name = form.querySelector("[data-name-field]");
        var slot = success.querySelector("[data-name-slot]");
        if (name && slot && name.value.trim()) slot.textContent = " " + name.value.trim().split(" ")[0];
      }
    });
  });

  /* ---- Multi-step (plan een gesprek) ---- */
  var stepForm = document.querySelector("[data-steps]");
  if (stepForm) {
    var steps = Array.prototype.slice.call(stepForm.querySelectorAll(".step"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-step-dot]"));
    var current = 0;
    function show(i) {
      steps.forEach(function (s, idx) { s.hidden = idx !== i; });
      dots.forEach(function (d, idx) {
        d.classList.toggle("done", idx < i);
        d.classList.toggle("active", idx === i);
      });
      current = i;
      var bar = document.querySelector("[data-step-bar]");
      if (bar) bar.style.width = ((i) / (steps.length - 1) * 100) + "%";
    }
    function validateStep(i) {
      var ok = true;
      steps[i].querySelectorAll("[required]").forEach(function (f) {
        f.dataset.touched = "1";
        var val = (f.value || "").trim();
        var v = !!val;
        if (f.type === "email") v = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        if (f.type === "tel") v = val.replace(/[^0-9]/g, "").length >= 8;
        var wrap = f.closest(".field");
        if (wrap) wrap.classList.toggle("invalid", !v);
        if (!v) ok = false;
      });
      return ok;
    }
    stepForm.querySelectorAll("[data-next]").forEach(function (b) {
      b.addEventListener("click", function () { if (validateStep(current)) show(Math.min(current + 1, steps.length - 1)); });
    });
    stepForm.querySelectorAll("[data-prev]").forEach(function (b) {
      b.addEventListener("click", function () { show(Math.max(current - 1, 0)); });
    });
    // choice chips
    stepForm.querySelectorAll("[data-choice]").forEach(function (group) {
      group.querySelectorAll(".chip").forEach(function (chip) {
        chip.addEventListener("click", function () {
          group.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("sel"); });
          chip.classList.add("sel");
          var hidden = group.querySelector("input[type=hidden]");
          if (hidden) hidden.value = chip.textContent.trim();
        });
      });
    });
    stepForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateStep(current)) return;
      var success = document.querySelector(".form-success");
      if (success) {
        stepForm.style.display = "none";
        var prog = document.querySelector("[data-step-progress]");
        if (prog) prog.style.display = "none";
        success.hidden = false; success.classList.add("in");
        var name = stepForm.querySelector("[data-name-field]");
        var slot = success.querySelector("[data-name-slot]");
        if (name && slot && name.value.trim()) slot.textContent = " " + name.value.trim().split(" ")[0];
      }
    });
    show(0);
  }

  /* ---- Footer year ---- */
  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- Hero "flits" over goud-accent ---- */
  function litShine() {
    document.querySelectorAll(".hero-shine").forEach(function (el) { el.classList.add("lit"); });
  }
  window.addEventListener("load", function () { setTimeout(litShine, 60); });
  setTimeout(litShine, 700);

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---- Hero parallax-diepte ---- */
  var hero = document.querySelector('[data-screen-label="Hero"]');
  if (hero && finePointer && !reduceMotion) {
    var pImg = hero.querySelector(".ph img");
    var pCard = hero.querySelector('[style*="backdrop-filter"]');
    if (pImg) pImg.classList.add("hero-parallax-img");
    if (pCard) pCard.classList.add("hero-parallax-card");
    var hx = 0, hy = 0, chx = 0, chy = 0;
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      hx = (e.clientX - r.left) / r.width - 0.5;
      hy = (e.clientY - r.top) / r.height - 0.5;
    });
    hero.addEventListener("mouseleave", function () { hx = 0; hy = 0; });
    (function heroLoop() {
      chx += (hx - chx) * 0.08;
      chy += (hy - chy) * 0.08;
      if (pImg) pImg.style.transform = "scale(1.06) translate(" + (-chx * 16) + "px," + (-chy * 16) + "px)";
      if (pCard) pCard.style.transform = "translate(" + (chx * 22) + "px," + (chy * 18) + "px)";
      requestAnimationFrame(heroLoop);
    })();
  }

  /* ---- Muiscursor: gouden vulpen ---- */
  if (finePointer) {
    var penSVG =
      '<svg viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
        '<linearGradient id="penNib" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="#FBEFC8"/><stop offset=".55" stop-color="#ECCE84"/><stop offset="1" stop-color="#D8B25E"/>' +
        '</linearGradient>' +
        '<linearGradient id="penBarrel" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="#1C3C68"/><stop offset="1" stop-color="#0B1F3A"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<path d="M16.5 22 L22 16.5 L34 28.5 L28.5 34 Z" fill="url(#penBarrel)" stroke="#06122a" stroke-width=".8" stroke-linejoin="round"/>' +
      '<circle cx="32.5" cy="32.5" r="3.4" fill="url(#penNib)" stroke="#06122a" stroke-width=".8"/>' +
      '<path d="M13 18.5 L18.5 13 L22.4 16.9 L16.9 22.4 Z" fill="#E7C77B" stroke="#06122a" stroke-width=".8" stroke-linejoin="round"/>' +
      '<path d="M5 5 L18.7 13 L13 18.7 Z" fill="url(#penNib)" stroke="#7A5E25" stroke-width=".7" stroke-linejoin="round"/>' +
      '<line x1="5.6" y1="5.6" x2="14.8" y2="14.8" stroke="#9A7728" stroke-width=".9"/>' +
      '<circle cx="13.4" cy="13.4" r="1.25" fill="#0B1F3A"/>' +
      '</svg>';
    var pen = document.createElement("div");
    pen.id = "pen-cursor";
    pen.innerHTML = penSVG;
    document.body.appendChild(pen);

    var px = window.innerWidth / 2, py = window.innerHeight / 2, cpx = px, cpy = py;
    var hotX = 5, hotY = 5, active = false;

    document.addEventListener("mousemove", function (e) {
      px = e.clientX; py = e.clientY;
      if (!active) {
        active = true;
        document.documentElement.classList.add("has-pen");
        pen.classList.add("ready");
        cpx = px; cpy = py;
      }
      var t = e.target;
      var overText = t.closest && t.closest("input,textarea,select,[contenteditable]");
      pen.classList.toggle("over-text", !!overText);
      var act = t.closest && t.closest('a,button,.btn,.chip,.acc-head,label,[role="button"],.nav-toggle');
      pen.classList.toggle("writing", !!act && !overText);
    }, { passive: true });

    document.addEventListener("mouseleave", function () { pen.classList.remove("ready"); });
    document.addEventListener("mouseenter", function () { if (active) pen.classList.add("ready"); });
    document.addEventListener("mousedown", function () { pen.classList.add("press"); });
    document.addEventListener("mouseup", function () { pen.classList.remove("press"); });

    var ease = reduceMotion ? 1 : 0.3;
    (function penLoop() {
      cpx += (px - cpx) * ease;
      cpy += (py - cpy) * ease;
      pen.style.transform = "translate3d(" + (cpx - hotX) + "px," + (cpy - hotY) + "px,0)";
      requestAnimationFrame(penLoop);
    })();
  }
})();
