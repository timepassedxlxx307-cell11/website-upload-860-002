(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

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
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupFilters() {
        var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
        roots.forEach(function (root) {
            var searchInput = root.querySelector("[data-filter-search]");
            var typeSelect = root.querySelector("[data-filter-type]");
            var genreSelect = root.querySelector("[data-filter-genre]");
            var yearSelect = root.querySelector("[data-filter-year]");
            var sortSelect = root.querySelector("[data-filter-sort]");
            var grid = document.querySelector("[data-card-grid]");
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
            var params = new URLSearchParams(window.location.search);
            var queryValue = params.get("q") || "";
            var queryInput = root.querySelector("[data-query-input]");
            if (queryInput && queryValue) {
                queryInput.value = queryValue;
            }

            function filterCards() {
                var query = normalize(searchInput && searchInput.value);
                var type = normalize(typeSelect && typeSelect.value);
                var genre = normalize(genreSelect && genreSelect.value);
                var year = normalize(yearSelect && yearSelect.value);
                cards.forEach(function (card) {
                    var keywords = normalize(card.getAttribute("data-keywords"));
                    var cardType = normalize(card.getAttribute("data-type"));
                    var cardGenre = normalize(card.getAttribute("data-genre"));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var visible = true;
                    if (query && keywords.indexOf(query) === -1) {
                        visible = false;
                    }
                    if (type && cardType !== type) {
                        visible = false;
                    }
                    if (genre && cardGenre.indexOf(genre) === -1) {
                        visible = false;
                    }
                    if (year && cardYear !== year) {
                        visible = false;
                    }
                    card.classList.toggle("hidden", !visible);
                });
                sortCards();
            }

            function sortCards() {
                var sortMode = sortSelect ? sortSelect.value : "default";
                var visibleCards = cards.filter(function (card) {
                    return !card.classList.contains("hidden");
                });
                if (sortMode === "year") {
                    visibleCards.sort(function (a, b) {
                        return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
                    });
                }
                if (sortMode === "title") {
                    visibleCards.sort(function (a, b) {
                        return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-Hans-CN");
                    });
                }
                visibleCards.forEach(function (card) {
                    grid.appendChild(card);
                });
            }

            [searchInput, typeSelect, genreSelect, yearSelect, sortSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", filterCards);
                    control.addEventListener("change", filterCards);
                }
            });
            filterCards();
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
    });
})();

function initMoviePlayer(source) {
    var player = document.querySelector("[data-player]");
    if (!player) {
        return;
    }
    var video = player.querySelector("video");
    var overlay = player.querySelector(".player-overlay");
    var hlsInstance = null;
    var started = false;

    function loadAndPlay() {
        if (!video || started) {
            return;
        }
        started = true;
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            var nativePlay = video.play();
            if (nativePlay && typeof nativePlay.catch === "function") {
                nativePlay.catch(function () {});
            }
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {});
                }
            });
            return;
        }
        video.src = source;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", loadAndPlay);
    }

    player.addEventListener("click", function (event) {
        if (event.target === video && !started) {
            loadAndPlay();
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
