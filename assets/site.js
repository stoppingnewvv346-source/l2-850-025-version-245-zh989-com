(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-site-nav]");

        if (!button || !nav) {
            return;
        }

        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHeroCarousel() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        if (!slides.length || !dots.length) {
            return;
        }

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = Number(dot.getAttribute("data-hero-dot") || "0");
                show(index);
                start();
            });
        });

        show(0);
        start();
        document.addEventListener("visibilitychange", function () {
            if (document.hidden) {
                stop();
            } else {
                start();
            }
        });
    }

    function uniqueSorted(values) {
        var seen = Object.create(null);
        values.forEach(function (value) {
            if (value) {
                seen[value] = true;
            }
        });
        return Object.keys(seen).sort(function (a, b) {
            return String(a).localeCompare(String(b), "zh-Hans-CN");
        });
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }
        values.forEach(function (value) {
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

        panels.forEach(function (panel) {
            var root = panel.closest("section") || document;
            var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
            var search = panel.querySelector("[data-filter-search]");
            var region = panel.querySelector("[data-filter-region]");
            var type = panel.querySelector("[data-filter-type]");
            var genre = panel.querySelector("[data-filter-genre]");
            var year = panel.querySelector("[data-filter-year]");
            var count = panel.querySelector("[data-filter-count]");

            fillSelect(region, uniqueSorted(cards.map(function (card) { return card.getAttribute("data-region") || ""; })));
            fillSelect(type, uniqueSorted(cards.map(function (card) { return card.getAttribute("data-type") || ""; })));
            fillSelect(genre, uniqueSorted(cards.map(function (card) { return card.getAttribute("data-genre") || ""; })));
            fillSelect(year, uniqueSorted(cards.map(function (card) { return card.getAttribute("data-year") || ""; })).reverse());

            function matches(card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.textContent
                ].join(" ").toLowerCase();
                var query = search ? search.value.trim().toLowerCase() : "";
                var regionValue = region ? region.value : "";
                var typeValue = type ? type.value : "";
                var genreValue = genre ? genre.value : "";
                var yearValue = year ? year.value : "";

                if (query && text.indexOf(query) === -1) {
                    return false;
                }
                if (regionValue && card.getAttribute("data-region") !== regionValue) {
                    return false;
                }
                if (typeValue && card.getAttribute("data-type") !== typeValue) {
                    return false;
                }
                if (genreValue && card.getAttribute("data-genre") !== genreValue) {
                    return false;
                }
                if (yearValue && card.getAttribute("data-year") !== yearValue) {
                    return false;
                }
                return true;
            }

            function update() {
                var visible = 0;
                cards.forEach(function (card) {
                    var ok = matches(card);
                    card.classList.toggle("is-filter-hidden", !ok);
                    if (ok) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = "匹配 " + visible + " 部";
                }
            }

            [search, region, type, genre, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", update);
                    control.addEventListener("change", update);
                }
            });

            update();
        });
    }

    function initImageFallbacks() {
        var images = Array.prototype.slice.call(document.querySelectorAll(".cover-image"));

        images.forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-missing");
                if (image.parentElement) {
                    image.parentElement.classList.add("image-missing");
                }
            });
        });
    }

    function initVideoPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

        players.forEach(function (player) {
            var video = player.querySelector("video[data-src]");
            var button = player.querySelector("[data-play-button]");
            var status = player.querySelector("[data-player-status]");
            var hlsInstance = null;

            if (!video || !button) {
                return;
            }

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function play() {
                var source = video.getAttribute("data-src");
                button.classList.add("is-hidden");
                video.setAttribute("controls", "controls");

                if (!source) {
                    setStatus("未找到播放源。");
                    return;
                }

                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus("播放源已加载，正在播放。");
                        video.play().catch(function () {
                            setStatus("播放源已就绪，浏览器需要再次点击视频才能播放。");
                        });
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setStatus("播放遇到网络或格式问题，可稍后重试。");
                        }
                    });
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    setStatus("正在使用浏览器原生 HLS 播放。");
                    video.play().catch(function () {
                        setStatus("播放源已就绪，浏览器需要再次点击视频才能播放。");
                    });
                    return;
                }

                video.src = source;
                setStatus("当前浏览器无法直接播放该视频，请更换支持 m3u8 的浏览器或检查网络。");
            }

            button.addEventListener("click", play);
        });
    }

    ready(function () {
        initMobileMenu();
        initHeroCarousel();
        initFilters();
        initImageFallbacks();
        initVideoPlayers();
    });
})();
