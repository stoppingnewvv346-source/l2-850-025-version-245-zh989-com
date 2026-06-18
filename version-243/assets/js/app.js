(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return (value || '').toString().toLowerCase().replace(/\s+/g, '');
    }

    function initMenu() {
        var button = document.querySelector('.menu-toggle');
        var nav = document.querySelector('.mobile-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            document.body.classList.toggle('is-menu-open', open);
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
            button.textContent = open ? '×' : '☰';
        });
    }

    function initHero() {
        var root = document.querySelector('.hero-carousel');
        if (!root) {
            return;
        }
        var slides = selectAll('.hero-slide', root);
        var dots = selectAll('.hero-dot', root);
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }
        function start() {
            if (slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(index);
                start();
            });
        });
        show(0);
        start();
    }

    function applyFilter(input) {
        var cards = selectAll('.movie-card');
        var empty = document.querySelector('.empty-state');
        var value = normalize(input.value);
        var matched = 0;
        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-search'));
            var visible = !value || haystack.indexOf(value) !== -1;
            card.hidden = !visible;
            if (visible) {
                matched += 1;
            }
        });
        if (empty) {
            empty.hidden = matched !== 0;
        }
    }

    function initFilter() {
        var input = document.getElementById('movie-filter');
        if (!input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (query) {
            input.value = query;
        }
        input.addEventListener('input', function () {
            applyFilter(input);
        });
        applyFilter(input);
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilter();
    });
})();
