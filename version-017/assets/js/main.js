(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function htmlEscape(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function initMenu() {
        var button = $('[data-menu-toggle]');
        var nav = $('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var slides = $all('.hero-slide');
        var dots = $all('.hero-dot');
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(i);
                start();
            });
        });

        show(0);
        start();
    }

    function initFilters() {
        var panel = $('[data-filter-area]');
        if (!panel) {
            return;
        }
        var keyword = $('[data-filter-keyword]', panel);
        var type = $('[data-filter-type]', panel);
        var year = $('[data-filter-year]', panel);
        var count = $('[data-filter-count]');
        var empty = $('[data-empty-state]');
        var cards = $all('.movie-card[data-title]');

        function apply() {
            var q = normalize(keyword && keyword.value);
            var t = normalize(type && type.value);
            var y = normalize(year && year.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year')
                ].join(' '));
                var ok = true;
                if (q && haystack.indexOf(q) === -1) {
                    ok = false;
                }
                if (t && normalize(card.getAttribute('data-type')) !== t) {
                    ok = false;
                }
                if (y && normalize(card.getAttribute('data-year')) !== y) {
                    ok = false;
                }
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = visible + ' 部影片';
            }
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [keyword, type, year].forEach(function (node) {
            if (node) {
                node.addEventListener('input', apply);
                node.addEventListener('change', apply);
            }
        });
        apply();
    }

    function renderSearchItem(item) {
        return [
            '<article class="movie-card">',
            '<a class="card-cover" href="./' + htmlEscape(item.file) + '" aria-label="观看' + htmlEscape(item.title) + '">',
            '<img src="' + htmlEscape(item.cover) + '" alt="' + htmlEscape(item.title) + '" loading="lazy">',
            '<span class="card-play">▶</span>',
            '<span class="card-type">' + htmlEscape(item.type) + '</span>',
            '</a>',
            '<div class="card-body">',
            '<a class="card-title" href="./' + htmlEscape(item.file) + '">' + htmlEscape(item.title) + '</a>',
            '<p>' + htmlEscape(item.oneLine) + '</p>',
            '<div class="card-meta"><span>' + htmlEscape(item.region) + '</span><span>' + htmlEscape(item.year) + '</span></div>',
            '<div class="card-tags"><span>' + htmlEscape(item.genre) + '</span></div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function initSearchPage() {
        var grid = $('[data-search-results]');
        var input = $('[data-search-input]');
        var count = $('[data-search-count]');
        if (!grid || !input || !window.SEARCH_ITEMS) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;

        function apply() {
            var q = normalize(input.value);
            var items = window.SEARCH_ITEMS.filter(function (item) {
                if (!q) {
                    return true;
                }
                return normalize([
                    item.title,
                    item.region,
                    item.type,
                    item.year,
                    item.genre,
                    item.tags,
                    item.oneLine
                ].join(' ')).indexOf(q) !== -1;
            }).slice(0, 240);
            grid.innerHTML = items.map(renderSearchItem).join('');
            if (count) {
                count.textContent = items.length + ' 部影片';
            }
        }

        input.addEventListener('input', apply);
        apply();
    }

    window.setupMoviePlayer = function (streamUrl) {
        var video = $('.movie-video');
        var overlay = $('.player-overlay');
        var button = $('.player-start');
        if (!video || !streamUrl) {
            return;
        }
        var ready = false;
        var hlsInstance = null;

        function prepare() {
            if (ready) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            video.controls = true;
        }

        function begin() {
            prepare();
            if (overlay) {
                overlay.style.display = 'none';
            }
            var attempt = video.play();
            if (attempt && attempt.catch) {
                attempt.catch(function () {
                    if (overlay) {
                        overlay.style.display = 'grid';
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                begin();
            });
        }
        if (overlay) {
            overlay.addEventListener('click', begin);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                begin();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
        initSearchPage();
    });
})();
