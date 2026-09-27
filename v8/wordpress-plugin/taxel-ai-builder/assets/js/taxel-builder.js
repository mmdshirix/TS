/* Taxel AI Builder — front-end controller (no dependencies) */
(function () {
  "use strict";

  var cfg = window.TaxelBuilderConfig || {};
  var i18n = cfg.i18n || {};

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "class") node.className = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else if (k.indexOf("on") === 0) node.addEventListener(k.slice(2), attrs[k]);
        else node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (c) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function visitorId() {
    try {
      var k = "taxel_visitor";
      var v = localStorage.getItem(k);
      if (!v) {
        v = "v_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem(k, v);
      }
      return v;
    } catch (e) {
      return "";
    }
  }

  function api(path, payload) {
    var url = cfg.proxy ? cfg.endpoint + "/" + path : cfg.endpoint + "/" + path;
    var headers = { "Content-Type": "application/json" };
    if (cfg.proxy && cfg.nonce) headers["X-WP-Nonce"] = cfg.nonce;
    if (!cfg.proxy && cfg.apiKey) headers["X-Taxel-Key"] = cfg.apiKey;
    return fetch(url, { method: "POST", headers: headers, body: JSON.stringify(payload) }).then(function (r) {
      return r.json().then(function (d) {
        if (!r.ok) throw new Error(d && d.error ? d.error : i18n.error || "Error");
        return d;
      });
    });
  }

  function init(root) {
    if (root.__taxelInit) return;
    root.__taxelInit = true;

    var form = root.querySelector("[data-taxel-form]");
    var input = root.querySelector("[data-taxel-input]");
    var submit = root.querySelector("[data-taxel-submit]");
    var chips = root.querySelector("[data-taxel-chips]");
    var typewriter = root.querySelector("[data-taxel-typewriter]");
    var stages = {
      prompt: root.querySelector('[data-stage="prompt"]'),
      questions: root.querySelector('[data-stage="questions"]'),
      done: root.querySelector('[data-stage="done"]'),
    };
    var errorBox = root.querySelector("[data-taxel-error]");
    var state = { token: null, detected: null, stage: 0, total: 0, questions: [], answers: {}, history: [] };

    // Auto-grow textarea
    input.addEventListener("input", function () {
      input.style.height = "auto";
      input.style.height = Math.min(160, input.scrollHeight) + "px";
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        form.dispatchEvent(new Event("submit", { cancelable: true }));
      }
    });

    // Example chips + typewriter
    var examples = i18n.examples || [];
    examples.forEach(function (ex) {
      chips.appendChild(
        el("button", {
          type: "button",
          class: "taxel-chip",
          text: ex,
          onclick: function () {
            input.value = ex;
            input.dispatchEvent(new Event("input"));
            input.focus();
          },
        })
      );
    });
    var twIdx = 0, twChar = 0, twDir = 1;
    function tick() {
      if (!examples.length || document.activeElement === input || input.value) {
        typewriter.textContent = "";
        return setTimeout(tick, 800);
      }
      var word = "مثلاً: " + examples[twIdx];
      twChar += twDir;
      typewriter.textContent = word.slice(0, twChar);
      var delay = 45;
      if (twChar >= word.length) { twDir = -1; delay = 1600; }
      if (twChar <= 0) { twDir = 1; twIdx = (twIdx + 1) % examples.length; delay = 400; }
      setTimeout(tick, delay);
    }
    tick();

    function show(stage) {
      Object.keys(stages).forEach(function (k) {
        stages[k].hidden = k !== stage;
      });
      errorBox.hidden = true;
    }
    function showError(msg) {
      errorBox.textContent = msg;
      errorBox.hidden = false;
    }
    function loading(container, text) {
      container.innerHTML = "";
      container.appendChild(el("div", { class: "taxel-loading" }, [el("span", { class: "taxel-loader" }), el("span", { text: text })]));
    }

    function detectedCard() {
      var d = state.detected || {};
      var tags = [el("span", { class: "taxel-tag", html: (i18n.template || "قالب") + ": <b>" + (d.categoryLabel || "") + "</b>" })];
      if (d.storeName) tags.push(el("span", { class: "taxel-tag", html: "نام: <b>" + escapeHtml(d.storeName) + "</b>" }));
      (d.features || []).slice(0, 3).forEach(function (f) {
        tags.push(el("span", { class: "taxel-tag", text: f }));
      });
      return el("div", { class: "taxel-detected" }, [
        el("div", { class: "taxel-detected-kicker", text: "✦ " + (i18n.detected || "") }),
        el("p", { class: "taxel-detected-prompt", text: "«" + state.prompt + "»" }),
        el("div", { class: "taxel-tags" }, tags),
      ]);
    }

    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    function renderQuestions() {
      var c = stages.questions;
      c.innerHTML = "";
      c.appendChild(detectedCard());
      var dots = el("div", { class: "taxel-dots" });
      for (var i = 0; i < state.total; i++) dots.appendChild(el("span", { class: "taxel-dot" + (i <= state.stage ? " is-on" : "") }));
      c.appendChild(el("div", { class: "taxel-progress" }, [el("span", { text: (i18n.stage || "مرحله") + " " + toFa(state.stage + 1) + " " + (i18n.of || "از") + " " + toFa(state.total) }), dots]));

      state.answers = {};
      state.questions.forEach(function (q, idx) {
        var wrap = el("div", { class: "taxel-q", style: "animation-delay:" + idx * 60 + "ms" });
        var label = el("label", { text: q.label });
        if (q.required) label.appendChild(el("span", { class: "req", text: " *" }));
        wrap.appendChild(label);
        if (q.type === "text") {
          wrap.appendChild(
            el("input", {
              type: "text",
              class: "taxel-text",
              placeholder: q.placeholder || "",
              oninput: function (e) {
                state.answers[q.id] = e.target.value;
              },
            })
          );
        } else {
          var opts = el("div", { class: "taxel-options" });
          (q.options || []).forEach(function (o) {
            var b = el("button", {
              type: "button",
              class: "taxel-option",
              text: o,
              onclick: function () {
                if (q.type === "choice") {
                  Array.prototype.forEach.call(opts.children, function (x) { x.classList.remove("is-selected"); });
                  b.classList.add("is-selected");
                  state.answers[q.id] = o;
                } else {
                  b.classList.toggle("is-selected");
                  var cur = state.answers[q.id] || [];
                  state.answers[q.id] = b.classList.contains("is-selected") ? cur.concat([o]) : cur.filter(function (x) { return x !== o; });
                }
              },
            });
            opts.appendChild(b);
          });
          wrap.appendChild(opts);
        }
        c.appendChild(wrap);
      });

      var next = el("button", { type: "button", class: "taxel-btn", onclick: submitStage }, [el("span", { text: i18n.nextStep || "ادامه" }), el("span", { class: "taxel-btn-arrow", text: "←" })]);
      var back = el("button", {
        type: "button",
        class: "taxel-ghost",
        text: i18n.back || "قبلی",
        onclick: function () {
          show("prompt");
          input.focus();
        },
      });
      c.appendChild(el("div", { class: "taxel-actions" }, [back, next]));
    }

    function submitStage() {
      for (var i = 0; i < state.questions.length; i++) {
        var q = state.questions[i];
        if (q.required && !state.answers[q.id]) return showError("لطفاً فیلدهای ضروری را پر کنید");
      }
      var c = stages.questions;
      var payload = { token: state.token, answers: state.answers };
      loading(c, i18n.thinking || "…");
      api("answer", payload)
        .then(function (d) {
          state.detected = d.detected || state.detected;
          state.stage = d.stage;
          state.total = d.totalStages;
          if (d.done) return renderDone(d);
          state.questions = d.questions || [];
          renderQuestions();
        })
        .catch(function (e) {
          renderQuestions();
          showError(e.message);
        });
    }

    function renderDone(d) {
      var c = stages.done;
      c.innerHTML = "";
      c.appendChild(detectedCard());
      var url = d.continueUrl || cfg.platformUrl + "/start?intake=" + state.token;
      var cta = el("a", { class: "taxel-btn taxel-cta", href: url, target: "_blank", rel: "noopener" }, [el("span", { text: i18n.finish || "دریافت سایت من" }), el("span", { class: "taxel-btn-arrow", text: "←" })]);
      c.appendChild(
        el("div", { class: "taxel-done" }, [
          el("div", { class: "taxel-check", text: "✓" }),
          el("h4", { text: "همه چیز آماده است!" }),
          el("p", { text: i18n.ready || "" }),
          cta,
        ])
      );
      show("done");
      // Auto-redirect after a short pause so the user sees the confirmation.
      setTimeout(function () {
        c.querySelector("p").textContent = i18n.redirecting || "";
        window.location.href = url;
      }, 2200);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var prompt = input.value.trim();
      if (prompt.length < 5) return;
      state.prompt = prompt;
      submit.disabled = true;
      errorBox.hidden = true;
      var c = stages.questions;
      loading(c, i18n.thinking || "…");
      show("questions");
      api("start", { prompt: prompt, pageUrl: window.location.href, visitorId: visitorId(), site: cfg.site })
        .then(function (d) {
          state.token = d.token;
          state.detected = d.detected;
          state.stage = d.stage || 0;
          state.total = d.totalStages || 1;
          state.questions = d.questions || [];
          if (!state.questions.length) return renderDone(d);
          renderQuestions();
        })
        .catch(function (e) {
          show("prompt");
          showError(e.message);
        })
        .finally(function () {
          submit.disabled = false;
        });
    });
  }

  function toFa(n) {
    return String(n).replace(/\d/g, function (d) {
      return "۰۱۲۳۴۵۶۷۸۹"[d];
    });
  }

  function boot() {
    document.querySelectorAll("[data-taxel-builder]").forEach(init);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  // Elementor / AJAX-loaded content
  document.addEventListener("taxel:refresh", boot);
})();
