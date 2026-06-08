(function () {
    var toggle = document.querySelector('.nav-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var slider = document.querySelector('.hero-slider');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var index = 0;
        var timer = null;

        function showSlide(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function startSlider() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
                startSlider();
            });
        });

        slider.addEventListener('mouseenter', function () {
            if (timer) {
                clearInterval(timer);
            }
        });

        slider.addEventListener('mouseleave', startSlider);
        showSlide(0);
        startSlider();
    }

    var panel = document.querySelector('.filter-panel');

    if (panel) {
        var search = panel.querySelector('.filter-search');
        var region = panel.querySelector('.filter-region');
        var type = panel.querySelector('.filter-type');
        var year = panel.querySelector('.filter-year');
        var category = panel.querySelector('.filter-category');
        var empty = panel.querySelector('.filter-empty');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

        function valueOf(control) {
            return control ? control.value.trim().toLowerCase() : '';
        }

        function textOf(card) {
            return [
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.tags
            ].join(' ').toLowerCase();
        }

        function applyFilter() {
            var keyword = valueOf(search);
            var regionValue = valueOf(region);
            var typeValue = valueOf(type);
            var yearValue = valueOf(year);
            var categoryValue = valueOf(category);
            var visible = 0;

            cards.forEach(function (card) {
                var text = textOf(card);
                var matched = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (regionValue && String(card.dataset.region || '').toLowerCase() !== regionValue) {
                    matched = false;
                }
                if (typeValue && String(card.dataset.type || '').toLowerCase() !== typeValue) {
                    matched = false;
                }
                if (yearValue && String(card.dataset.year || '').toLowerCase() !== yearValue) {
                    matched = false;
                }
                if (categoryValue && String(card.dataset.category || '').toLowerCase() !== categoryValue) {
                    matched = false;
                }

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [search, region, type, year, category].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    }

    var scrollPlayer = document.querySelector('[data-scroll-player]');
    var player = document.querySelector('.player-section');

    if (scrollPlayer && player) {
        scrollPlayer.addEventListener('click', function (event) {
            event.preventDefault();
            player.scrollIntoView({ behavior: 'smooth', block: 'center' });
            var overlay = player.querySelector('.play-overlay');
            if (overlay) {
                setTimeout(function () {
                    overlay.click();
                }, 260);
            }
        });
    }
})();
