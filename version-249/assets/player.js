(function () {
  function getElement(id) {
    return id ? document.getElementById(id) : null;
  }

  function setButtonText(button, text) {
    if (button) {
      button.textContent = text;
    }
  }

  window.initMoviePlayer = function (videoId, sourceUrl, options) {
    var video = getElement(videoId);
    if (!video || !sourceUrl) {
      return;
    }
    var config = options || {};
    var overlay = getElement(config.overlayId);
    var toggle = getElement(config.toggleId);
    var mute = getElement(config.muteId);
    var fullscreen = getElement(config.fullscreenId);
    var hls = null;

    function attachSource() {
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else {
        video.src = sourceUrl;
      }
    }

    function play() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    function togglePlay() {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    }

    attachSource();

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    if (toggle) {
      toggle.addEventListener("click", togglePlay);
    }
    video.addEventListener("click", togglePlay);
    video.addEventListener("play", function () {
      setButtonText(toggle, "❚❚");
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    video.addEventListener("pause", function () {
      setButtonText(toggle, "▶");
    });
    video.addEventListener("ended", function () {
      setButtonText(toggle, "▶");
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    });
    if (mute) {
      mute.addEventListener("click", function () {
        video.muted = !video.muted;
        setButtonText(mute, video.muted ? "🔇" : "🔊");
      });
    }
    if (fullscreen) {
      fullscreen.addEventListener("click", function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (video.parentElement && video.parentElement.requestFullscreen) {
          video.parentElement.requestFullscreen();
        }
      });
    }
    window.addEventListener("pagehide", function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  };
})();
