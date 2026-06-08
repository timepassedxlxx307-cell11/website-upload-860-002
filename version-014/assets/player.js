(function () {
    var boxes = Array.prototype.slice.call(document.querySelectorAll('.player-box'));

    boxes.forEach(function (box) {
        var video = box.querySelector('video');
        var overlay = box.querySelector('.play-overlay');
        var configNode = box.querySelector('.playback-config');
        var source = '';
        var hls = null;
        var initialized = false;

        if (!video || !overlay || !configNode) {
            return;
        }

        try {
            source = JSON.parse(configNode.textContent).source || '';
        } catch (error) {
            source = '';
        }

        function prepare() {
            if (initialized || !source) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }

            initialized = true;
        }

        function play() {
            prepare();
            overlay.classList.add('is-hidden');
            video.setAttribute('controls', 'controls');
            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            }
        }

        overlay.addEventListener('click', play);
        overlay.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                play();
            }
        });

        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    });
})();
