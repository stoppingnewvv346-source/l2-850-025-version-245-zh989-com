
(function () {
  var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));

  shells.forEach(function (shell) {
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".player-overlay");
    var stream = shell.getAttribute("data-stream");
    var loaded = false;

    function loadAndPlay() {
      if (!video || !stream) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (video.getAttribute("src") !== stream) {
          video.setAttribute("src", stream);
        }
        video.play().catch(function () {});
      } else if (window.Hls && window.Hls.isSupported()) {
        if (!loaded) {
          var hls = new window.Hls();
          hls.loadSource(stream);
          hls.attachMedia(video);
          loaded = true;
        }
        video.play().catch(function () {});
      } else {
        if (video.getAttribute("src") !== stream) {
          video.setAttribute("src", stream);
        }
        video.play().catch(function () {});
      }

      if (overlay) {
        overlay.classList.add("hidden");
      }
    }

    if (overlay) {
      overlay.addEventListener("click", loadAndPlay);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          loadAndPlay();
        }
      });
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("hidden");
        }
      });
    }
  });
})();
