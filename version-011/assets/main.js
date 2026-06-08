(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMobileMenu() {
        var toggle = document.querySelector('.mobile-menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var isOpen = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!isOpen));
            panel.hidden = isOpen;
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        selectAll('[data-filter-scope]').forEach(function (scope) {
            var root = scope.parentElement || document;
            var input = scope.querySelector('.site-filter-input');
            var cards = selectAll('[data-filter-card]', root);
            var empty = scope.querySelector('.filter-empty');
            var clear = scope.querySelector('.clear-filter');
            var chips = selectAll('[data-filter-chip]', scope);
            var chipValue = '';

            function textFor(card) {
                return [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-tags'),
                    card.textContent
                ].join(' ').toLowerCase();
            }

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : '';
                var activeChip = chipValue.toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = textFor(card);
                    var matched = (!query || haystack.indexOf(query) !== -1) && (!activeChip || haystack.indexOf(activeChip) !== -1);
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            if (clear) {
                clear.addEventListener('click', function () {
                    if (input) {
                        input.value = '';
                    }
                    chipValue = '';
                    chips.forEach(function (chip) {
                        chip.classList.remove('is-active');
                    });
                    apply();
                });
            }
            chips.forEach(function (chip) {
                chip.addEventListener('click', function () {
                    var value = chip.getAttribute('data-filter-chip') || '';
                    if (chipValue === value) {
                        chipValue = '';
                        chip.classList.remove('is-active');
                    } else {
                        chipValue = value;
                        chips.forEach(function (item) {
                            item.classList.toggle('is-active', item === chip);
                        });
                    }
                    apply();
                });
            });
        });
    }

    function movieCardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '' +
            '<article class="movie-card">' +
                '<a class="movie-poster" href="./' + escapeHtml(movie.file) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy">' +
                    '<span class="poster-badge">' + escapeHtml(movie.type) + '</span>' +
                    '<span class="poster-year">' + escapeHtml(movie.year) + '</span>' +
                '</a>' +
                '<div class="movie-card-body">' +
                    '<a class="movie-title" href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a>' +
                    '<p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>' +
                    '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initSearchPage() {
        var results = document.getElementById('search-results');
        var input = document.getElementById('search-page-input');
        var summary = document.getElementById('search-summary');
        if (!results || !input || !window.MOVIES_SEARCH) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        input.value = initialQuery;

        function render() {
            var query = input.value.trim().toLowerCase();
            var source = window.MOVIES_SEARCH;
            var matched = query ? source.filter(function (movie) {
                return movie.searchText.indexOf(query) !== -1;
            }) : source.slice(0, 24);
            if (summary) {
                summary.textContent = query ? '搜索结果' : '热门推荐';
            }
            results.innerHTML = matched.slice(0, 120).map(movieCardTemplate).join('');
            if (query && matched.length === 0) {
                results.innerHTML = '<p class="filter-empty">没有找到匹配的影片。</p>';
            }
        }

        input.addEventListener('input', render);
        render();
    }

    function attachHls(video, url) {
        if (!video || !url) {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (video.src !== url) {
                video.src = url;
            }
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (!video.__hlsInstance) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                video.__hlsInstance = hls;
            }
            return;
        }
        if (video.src !== url) {
            video.src = url;
        }
    }

    function initPlayers() {
        selectAll('.player-shell').forEach(function (shell) {
            var video = shell.querySelector('video');
            var button = shell.querySelector('.player-start');
            var url = shell.getAttribute('data-video-url') || (video ? video.getAttribute('data-video-url') : '');
            attachHls(video, url);
            if (button && video) {
                button.addEventListener('click', function () {
                    attachHls(video, url);
                    var playPromise = video.play();
                    shell.classList.add('is-playing');
                    if (playPromise && typeof playPromise.catch === 'function') {
                        playPromise.catch(function () {
                            shell.classList.remove('is-playing');
                        });
                    }
                });
                video.addEventListener('play', function () {
                    shell.classList.add('is-playing');
                });
                video.addEventListener('pause', function () {
                    shell.classList.remove('is-playing');
                });
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initFilters();
        initSearchPage();
        initPlayers();
    });
})();
