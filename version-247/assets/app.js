(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
            document.body.classList.toggle("menu-open", nav.classList.contains("open"));
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
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

        hero.addEventListener("mouseenter", function () {
            window.clearInterval(timer);
        });

        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var input = document.querySelector("[data-search-input]");
        var filters = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
        var empty = document.querySelector("[data-empty-state]");
        if (!input && !filters.length) {
            return;
        }

        function currentValue(name) {
            var field = document.querySelector('[data-filter="' + name + '"]');
            return field ? field.value : "";
        }

        function apply() {
            var term = input ? input.value.trim().toLowerCase() : "";
            var category = currentValue("category");
            var type = currentValue("type");
            var shown = 0;
            cards.forEach(function (card) {
                var searchText = (card.getAttribute("data-search") || "").toLowerCase();
                var ok = true;
                if (term && searchText.indexOf(term) === -1) {
                    ok = false;
                }
                if (category && card.getAttribute("data-category") !== category) {
                    ok = false;
                }
                if (type && card.getAttribute("data-type") !== type) {
                    ok = false;
                }
                card.classList.toggle("hidden-card", !ok);
                if (ok) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("show", shown === 0);
            }
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        filters.forEach(function (field) {
            field.addEventListener("change", apply);
        });
        apply();
    }

    window.startMoviePlayer = function (videoId, overlayId, url) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        if (!video || !overlay || !url) {
            return;
        }
        var loaded = false;
        var hls = null;

        function loadAndPlay() {
            overlay.classList.add("is-hidden");
            if (!loaded) {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        var parsedPlay = video.play();
                        if (parsedPlay && parsedPlay.catch) {
                            parsedPlay.catch(function () {});
                        }
                    });
                } else {
                    video.src = url;
                }
                loaded = true;
            }
            var playPromise = video.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch(function () {});
            }
        }

        overlay.addEventListener("click", loadAndPlay);
        video.addEventListener("click", function () {
            if (video.paused) {
                loadAndPlay();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
    });
})();
