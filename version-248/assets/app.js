(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var navButton = $('[data-nav-toggle]');
  var navMenu = $('[data-nav-menu]');

  if (navButton && navMenu) {
    navButton.addEventListener('click', function () {
      var opened = navMenu.classList.toggle('is-open');
      navButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var carousel = $('[data-hero-carousel]');

  if (carousel) {
    var slides = $all('[data-hero-slide]', carousel);
    var backs = $all('[data-hero-bg]', carousel);
    var dots = $all('[data-hero-dot]', carousel);
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });

      backs.forEach(function (back, i) {
        back.classList.toggle('is-active', i === current);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    showSlide(0);

    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  $all('[data-search-scope]').forEach(function (scope) {
    var input = $('[data-search-input]', scope);
    var chips = $all('[data-filter-chip]', scope);
    var cards = $all('[data-card]', scope);
    var empty = $('[data-empty-state]', scope);
    var activeFilter = 'all';

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-tags') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        var typeText = (card.getAttribute('data-type') || '').toLowerCase();
        var filterOk = activeFilter === 'all' || text.indexOf(activeFilter) !== -1 || typeText.indexOf(activeFilter) !== -1;
        var queryOk = !query || text.indexOf(query) !== -1;
        var show = filterOk && queryOk;

        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('is-active');
        });
        chip.classList.add('is-active');
        activeFilter = (chip.getAttribute('data-filter-chip') || 'all').toLowerCase();
        applyFilter();
      });
    });
  });

  window.initMoviePlayer = function (playlistUrl) {
    var box = $('[data-player-box]');

    if (!box || !playlistUrl) {
      return;
    }

    var video = $('video', box);
    var overlay = $('[data-player-overlay]', box);
    var attached = false;

    function attachStream() {
      if (attached || !video) {
        return;
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playlistUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(playlistUrl);
        hls.attachMedia(video);
      } else {
        video.src = playlistUrl;
      }
    }

    function startPlayback() {
      attachStream();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
  };
})();
