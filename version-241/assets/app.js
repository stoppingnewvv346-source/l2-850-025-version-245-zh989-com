(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var open = panel.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var index = 0;
      var timer = null;
      var show = function (next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      };
      var start = function () {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          if (timer) {
            window.clearInterval(timer);
          }
          show(i);
          start();
        });
      });
      if (slides.length > 1) {
        start();
      }
    }

    var scope = document.querySelector(".filter-scope");
    if (scope) {
      var search = document.querySelector(".movie-search");
      var selects = Array.prototype.slice.call(document.querySelectorAll(".filter-select"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var empty = document.querySelector(".empty-state");
      var normalize = function (value) {
        return String(value || "").trim().toLowerCase();
      };
      var apply = function () {
        var query = normalize(search ? search.value : "");
        var active = {};
        selects.forEach(function (select) {
          active[select.getAttribute("data-filter")] = normalize(select.value);
        });
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags")
          ].join(" "));
          var ok = !query || text.indexOf(query) !== -1;
          if (active.region) {
            ok = ok && normalize(card.getAttribute("data-region")) === active.region;
          }
          if (active.type) {
            ok = ok && normalize(card.getAttribute("data-type")) === active.type;
          }
          if (active.year) {
            ok = ok && normalize(card.getAttribute("data-year")) === active.year;
          }
          card.classList.toggle("is-hidden-card", !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      };
      if (search) {
        search.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
    }
  });

  window.initVideoPlayer = function (videoId, streamUrl) {
    var video = document.getElementById(videoId);
    if (!video || !streamUrl) {
      return;
    }
    var shell = video.closest(".player-shell");
    var overlay = shell ? shell.querySelector(".player-overlay") : null;
    var attached = false;
    var hls = null;

    var attach = function () {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 60
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    };

    var hideOverlay = function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    };

    var showOverlay = function () {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    };

    var play = function () {
      attach();
      hideOverlay();
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          showOverlay();
        });
      }
    };

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (!attached) {
        play();
      }
    });
    video.addEventListener("play", hideOverlay);
    video.addEventListener("ended", showOverlay);
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
})();
