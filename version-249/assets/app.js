(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      button.textContent = menu.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function textOf(card) {
    return [
      card.getAttribute("data-title"),
      card.getAttribute("data-year"),
      card.getAttribute("data-region"),
      card.getAttribute("data-type"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-tags")
    ].join(" ").toLowerCase();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll(".js-filter-scope"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector(".js-filter-input");
      var selects = Array.prototype.slice.call(scope.querySelectorAll(".js-filter-select"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".filter-card"));
      var count = scope.querySelector(".js-filter-count");
      if (!cards.length) {
        return;
      }

      function update() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var matched = true;
          if (query && textOf(card).indexOf(query) === -1) {
            matched = false;
          }
          selects.forEach(function (select) {
            var key = select.getAttribute("data-filter-key");
            var value = select.value;
            if (value && card.getAttribute("data-" + key) !== value) {
              matched = false;
            }
          });
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = "当前显示 " + visible + " 部";
        }
      }

      if (input) {
        input.addEventListener("input", update);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", update);
      });
      if (scope.hasAttribute("data-search-page") && input) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q) {
          input.value = q;
        }
      }
      update();
    });
  }

  ready(function () {
    initMobileMenu();
    initHeroSlider();
    initFilters();
  });
})();
