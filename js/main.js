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
})();
