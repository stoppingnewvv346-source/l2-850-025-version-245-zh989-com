(function () {
    window.initMoviePlayer = function (source) {
        var video = document.getElementById('movie-video');
        var button = document.getElementById('movie-play');
        if (!video || !button || !source) {
            return;
        }
        var hls = null;
        var ready = false;
        function setup() {
            if (ready) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }
        function play() {
            setup();
            video.controls = true;
            button.classList.add('is-hidden');
            var request = video.play();
            if (request && typeof request.catch === 'function') {
                request.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        }
        button.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            button.classList.remove('is-hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
