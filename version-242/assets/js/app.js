(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');
    if (menuButton && mobileMenu) {
      menuButton.addEventListener('click', function () {
        mobileMenu.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          show(dotIndex);
          start();
        });
      });

      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    });

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
      var targetSelector = panel.getAttribute('data-target');
      var target = targetSelector ? document.querySelector(targetSelector) : null;
      if (!target) {
        return;
      }

      var input = panel.querySelector('[data-filter-input]');
      var typeSelect = panel.querySelector('[data-filter-type]');
      var yearSelect = panel.querySelector('[data-filter-year]');
      var regionSelect = panel.querySelector('[data-filter-region]');
      var count = panel.querySelector('[data-filter-count]');
      var cards = Array.prototype.slice.call(target.querySelectorAll('.movie-card'));
      var empty = document.querySelector('[data-empty-for="' + target.id + '"]');

      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }

      function apply() {
        var keyword = normalize(input && input.value);
        var type = normalize(typeSelect && typeSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var region = normalize(regionSelect && regionSelect.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search'));
          var cardType = normalize(card.getAttribute('data-type'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardRegion = normalize(card.getAttribute('data-region'));
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (type && cardType !== type) {
            matched = false;
          }
          if (year && cardYear !== year) {
            matched = false;
          }
          if (region && cardRegion !== region) {
            matched = false;
          }

          card.classList.toggle('is-hidden', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '显示 ' + visible + ' 部';
        }
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [input, typeSelect, yearSelect, regionSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });

    document.querySelectorAll('[data-player]').forEach(function (box) {
      var video = box.querySelector('video');
      var button = box.querySelector('[data-player-start]');
      var source = box.getAttribute('data-src');
      var hls = null;
      var loaded = false;

      function startPlayback() {
        if (button) {
          button.classList.add('is-hidden');
        }
        box.classList.add('is-playing');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      function playVideo() {
        if (!video || !source) {
          return;
        }

        if (!loaded) {
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, startPlayback);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                video.src = source;
                startPlayback();
              }
            });
            loaded = true;
            return;
          }

          video.src = source;
          loaded = true;
        }

        startPlayback();
      }

      if (button) {
        button.addEventListener('click', playVideo);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!loaded || video.paused) {
            playVideo();
          }
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
