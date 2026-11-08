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

  /* ---- Form verzending (FormSubmit AJAX) ---- */
  function liPostForm(form) {
    var endpoint = form.getAttribute("data-endpoint");
    if (!endpoint) return Promise.resolve(true); // geen endpoint = alleen UI
    return fetch(endpoint, {
      method: "POST",
      body: new FormData(form),
      headers: { "Accept": "application/json" }
    }).then(function (r) { return r.ok; }).catch(function () { return false; });
  }
  function liFormError(form) {
    var box = form.querySelector("[data-form-error]");
    if (!box) {
      box = document.createElement("p");
      box.setAttribute("data-form-error", "");
      box.style.cssText = "color:#b3261e; font-size:.85rem; margin:14px 0 0; text-align:center;";
      form.appendChild(box);
    }
    box.textContent = "Er ging iets mis bij het versturen. Probeer het opnieuw of mail naar info@legal-it.nl.";
  }
  function liSubmitForm(form, onSuccess) {
    var btn = form.querySelector("[type=submit]");
    var label = btn ? btn.innerHTML : "";
    if (btn) { btn.disabled = true; btn.textContent = "Versturen…"; }
    liPostForm(form).then(function (ok) {
      if (ok) { onSuccess(); }
      else { if (btn) { btn.disabled = false; btn.innerHTML = label; } liFormError(form); }
    });
  }

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
      liSubmitForm(form, function () {
        var success = document.querySelector(form.getAttribute("data-success") || ".form-success");
        if (typeof window.gtag === "function") window.gtag("event", "generate_lead", { event_category: "lead", form: "contact" });
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
    // choice chips (enkel- of meervoudige keuze via data-multi)
    stepForm.querySelectorAll("[data-choice]").forEach(function (group) {
      var multi = group.hasAttribute("data-multi");
      var hidden = group.querySelector("input[type=hidden]");
      function syncMulti() {
        var vals = [];
        group.querySelectorAll(".chip.sel").forEach(function (c) { vals.push(c.textContent.trim()); });
        if (hidden) hidden.value = vals.join(", ");
      }
      group.querySelectorAll(".chip").forEach(function (chip) {
        chip.setAttribute("aria-pressed", chip.classList.contains("sel") ? "true" : "false");
        chip.addEventListener("click", function () {
          if (multi) {
            chip.classList.toggle("sel");
            chip.setAttribute("aria-pressed", chip.classList.contains("sel") ? "true" : "false");
            syncMulti();
          } else {
            group.querySelectorAll(".chip").forEach(function (c) {
              c.classList.remove("sel"); c.setAttribute("aria-pressed", "false");
            });
            chip.classList.add("sel"); chip.setAttribute("aria-pressed", "true");
            if (hidden) hidden.value = chip.textContent.trim();
          }
        });
      });
    });
    stepForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateStep(current)) return;
      liSubmitForm(stepForm, function () {
        var success = document.querySelector(".form-success");
        if (typeof window.gtag === "function") window.gtag("event", "generate_lead", { event_category: "lead", form: "plan-een-gesprek" });
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
    });
    show(0);
  }

  /* ---- Footer year ---- */
  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Hero-video: respecteer reduced-motion (toon poster) ---- */
  if (reduceMotion) {
    document.querySelectorAll("video.hero-video").forEach(function (v) {
      v.removeAttribute("autoplay");
      try { v.pause(); } catch (e) {}
    });
  }

  /* ---- Cookiebanner + Consent Mode ---- */
  (function () {
    var KEY = "li-cookie-consent";
    var stored = null;
    try { stored = localStorage.getItem(KEY); } catch (e) {}
    if (stored === "granted" || stored === "denied") return; // keuze al gemaakt

    function apply(state) {
      try { localStorage.setItem(KEY, state); } catch (e) {}
      if (typeof window.gtag === "function") {
        var g = state === "granted" ? "granted" : "denied";
        window.gtag("consent", "update", {
          analytics_storage: g
        });
      }
    }

    var banner = document.createElement("div");
    banner.className = "cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-live", "polite");
    banner.setAttribute("aria-label", "Cookievoorkeuren");
    banner.innerHTML =
      '<p><strong>Cookies op deze website.</strong> We gebruiken analytische cookies om de website te ' +
      'verbeteren. U bepaalt zelf of we deze mogen plaatsen. Zie ons ' +
      '<a href="/privacy" data-cookie-privacy>privacybeleid</a>.</p>' +
      '<div class="cookie-actions">' +
        '<button type="button" class="btn-cookie-ghost" data-cookie="denied">Weigeren</button>' +
        '<button type="button" class="btn btn-gold" data-cookie="granted">Accepteren</button>' +
      '</div>';
    document.body.appendChild(banner);
    document.body.classList.add("cookie-open");
    requestAnimationFrame(function () { banner.classList.add("in"); });

    function close() {
      banner.classList.remove("in");
      document.body.classList.remove("cookie-open");
      setTimeout(function () { if (banner.parentNode) banner.parentNode.removeChild(banner); }, 450);
    }
    banner.querySelectorAll("[data-cookie]").forEach(function (btn) {
      btn.addEventListener("click", function () { apply(btn.getAttribute("data-cookie")); close(); });
    });
  })();

  /* ---- GA4 conversie-events (bellen / mailen / gesprek plannen) ---- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a") : null;
    if (!a || typeof window.gtag !== "function") return;
    var href = a.getAttribute("href") || "";
    if (href.indexOf("tel:") === 0) {
      window.gtag("event", "click_telefoon", { event_category: "contact", transport_type: "beacon" });
    } else if (href.indexOf("mailto:") === 0) {
      window.gtag("event", "click_email", { event_category: "contact", transport_type: "beacon" });
    } else if (href.indexOf("plan-een-gesprek") !== -1) {
      window.gtag("event", "plan_gesprek_klik", { event_category: "lead" });
    }
  }, true);

  /* ---- Sticky mobiele CTA-balk (bellen / gesprek plannen) ---- */
  (function () {
    if (document.querySelector(".mobile-cta")) return;
    var bar = document.createElement("div");
    bar.className = "mobile-cta";
    bar.innerHTML =
      '<a class="mcta-btn mcta-tel" href="tel:+31732200700">' +
        '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/></svg>' +
        'Bellen</a>' +
      '<a class="mcta-btn mcta-plan" href="/plan-een-gesprek">Plan een gesprek</a>';
    document.body.appendChild(bar);
  })();
})();

