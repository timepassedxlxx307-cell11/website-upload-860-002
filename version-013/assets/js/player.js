(function () {
    function setupPlayer(card) {
        var video = card.querySelector('video');
        var layer = card.querySelector('[data-play-layer]');
        var hlsUrl = card.getAttribute('data-hls');
        var ready = false;
        var hlsInstance = null;

        function attachSource() {
            if (ready || !video || !hlsUrl) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = hlsUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(hlsUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = hlsUrl;
            }
        }

        function playVideo() {
            attachSource();
            if (layer) {
                layer.classList.add('is-hidden');
            }
            var result = video.play();
            if (result && result.catch) {
                result.catch(function () {
                    if (layer) {
                        layer.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (layer) {
            layer.addEventListener('click', playVideo);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                } else {
                    video.pause();
                }
            });
            video.addEventListener('play', function () {
                if (layer) {
                    layer.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (layer && video.currentTime === 0) {
                    layer.classList.remove('is-hidden');
                }
            });
        }
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    var players = document.querySelectorAll('.js-player');
    Array.prototype.forEach.call(players, setupPlayer);
})();
