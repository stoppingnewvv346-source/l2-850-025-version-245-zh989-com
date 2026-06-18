(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  function initPlayers() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll(".player-box"));
    boxes.forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector(".player-start");
      var source = video ? video.querySelector("source") : null;
      var url = source ? source.getAttribute("src") : "";
      var started = false;

      function attach() {
        if (!video || !url || started) {
          return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          box.hlsPlayer = hls;
        } else {
          video.src = url;
        }
      }

      function play() {
        attach();
        box.classList.add("is-playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });
        video.addEventListener("play", function () {
          box.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          if (!video.ended) {
            box.classList.remove("is-playing");
          }
        });
      }
    });
  }

  function initLocalFilters() {
    var areas = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]"));
    areas.forEach(function (area) {
      var input = area.querySelector("[data-filter-input]");
      var sort = area.querySelector("[data-sort-select]");
      var grid = area.querySelector("[data-card-grid]");
      var empty = area.querySelector(".empty-state");
      if (!grid) {
        return;
      }

      function apply() {
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        var query = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var match = !query || text.indexOf(query) !== -1;
          card.style.display = match ? "" : "none";
          if (match) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      function applySort() {
        if (!sort) {
          apply();
          return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        var value = sort.value;
        cards.sort(function (a, b) {
          if (value === "year") {
            return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
          }
          if (value === "score") {
            return Number(b.getAttribute("data-score") || 0) - Number(a.getAttribute("data-score") || 0);
          }
          return Number(b.getAttribute("data-hot") || 0) - Number(a.getAttribute("data-hot") || 0);
        });
        cards.forEach(function (card) {
          grid.appendChild(card);
        });
        apply();
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (sort) {
        sort.addEventListener("change", applySort);
      }
      applySort();
    });
  }

  function buildSearchCard(item) {
    return [
      '<article class="movie-card" data-search="', escapeHtml(item.search), '" data-year="', item.year, '" data-score="', item.score, '" data-hot="', item.hot, '">',
      '<a href="', item.url, '" class="poster">',
      '<img src="', item.image, '" alt="', escapeHtml(item.title), '" loading="lazy">',
      '<span class="poster-badge">', escapeHtml(item.category), '</span>',
      '<span class="poster-score">', item.score, '</span>',
      '</a>',
      '<div class="card-body">',
      '<h2 class="card-title line-clamp-2"><a href="', item.url, '">', escapeHtml(item.title), '</a></h2>',
      '<p class="card-text line-clamp-2">', escapeHtml(item.desc), '</p>',
      '<div class="card-meta"><span>', escapeHtml(item.year), '</span><span>', escapeHtml(item.region), '</span><span>', escapeHtml(item.genre), '</span></div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page || !window.searchItems) {
      return;
    }
    var input = page.querySelector("[data-search-main]");
    var grid = page.querySelector("[data-search-results]");
    var empty = page.querySelector(".empty-state");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    function render(value) {
      var q = value.trim().toLowerCase();
      if (!q) {
        grid.innerHTML = "";
        if (empty) {
          empty.classList.add("is-visible");
        }
        return;
      }
      var results = window.searchItems.filter(function (item) {
        return item.search.toLowerCase().indexOf(q) !== -1;
      }).slice(0, 240);
      grid.innerHTML = results.map(buildSearchCard).join("");
      if (empty) {
        empty.classList.toggle("is-visible", results.length === 0);
      }
    }

    if (input) {
      input.value = query;
      input.addEventListener("input", function () {
        render(input.value);
      });
      var form = input.closest("form");
      if (form) {
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          var next = input.value.trim();
          var url = next ? "search.html?q=" + encodeURIComponent(next) : "search.html";
          window.history.replaceState({}, "", url);
          render(next);
        });
      }
    }
    render(query);
  }

  ready(function () {
    initMenu();
    initHero();
    initPlayers();
    initLocalFilters();
    initSearchPage();
  });
})();
