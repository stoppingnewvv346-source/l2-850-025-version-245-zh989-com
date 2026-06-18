(function() {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMobileNav() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function() {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function() {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        show(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function() {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(current + 1);
        restart();
      });
    }

    restart();
  }

  function valueOf(element) {
    return element ? element.value.trim().toLowerCase() : '';
  }

  function initFilters() {
    document.querySelectorAll('[data-filter-root]').forEach(function(panel) {
      var scope = panel.parentElement || document;
      var list = scope.querySelector('[data-filter-list]');
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
      var keyword = panel.querySelector('[data-filter-keyword]');
      var year = panel.querySelector('[data-filter-year]');
      var region = panel.querySelector('[data-filter-region]');
      var channel = panel.querySelector('[data-filter-channel]');

      function apply() {
        var key = valueOf(keyword);
        var selectedYear = valueOf(year);
        var selectedRegion = valueOf(region);
        var selectedChannel = valueOf(channel);

        cards.forEach(function(card) {
          var text = [
            card.dataset.title || '',
            card.dataset.region || '',
            card.dataset.genre || '',
            card.dataset.year || '',
            card.dataset.channel || ''
          ].join(' ').toLowerCase();
          var matchKey = !key || text.indexOf(key) !== -1;
          var matchYear = !selectedYear || (card.dataset.year || '').toLowerCase().indexOf(selectedYear) !== -1;
          var matchRegion = !selectedRegion || (card.dataset.region || '').toLowerCase().indexOf(selectedRegion) !== -1;
          var matchChannel = !selectedChannel || (card.dataset.channel || '').toLowerCase() === selectedChannel;
          card.classList.toggle('is-hidden', !(matchKey && matchYear && matchRegion && matchChannel));
        });
      }

      [keyword, year, region, channel].forEach(function(control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  ready(function() {
    initMobileNav();
    initHero();
    initFilters();
  });
}());
