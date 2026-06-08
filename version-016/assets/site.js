document.addEventListener("DOMContentLoaded", function () {
    const mobileToggle = document.querySelector("[data-mobile-toggle]");
    const mobilePanel = document.querySelector("[data-mobile-panel]");

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            const input = form.querySelector("input[name='q']");
            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = "./search.html";
            }
        });
    });

    const hero = document.querySelector("[data-hero-carousel]");
    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        let active = 0;

        const showSlide = function (index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }
    }

    const filterInput = document.querySelector("[data-filter-input]");
    const filterSelect = document.querySelector("[data-filter-select]");
    const cards = Array.from(document.querySelectorAll("[data-search-card]"));
    const empty = document.querySelector("[data-empty-state]");

    const applyFilter = function () {
        if (!filterInput && !filterSelect) {
            return;
        }

        const keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
        const selected = filterSelect ? filterSelect.value.trim().toLowerCase() : "";
        let visible = 0;

        cards.forEach(function (card) {
            const text = (card.getAttribute("data-search") || "").toLowerCase();
            const matchKeyword = !keyword || text.indexOf(keyword) !== -1;
            const matchSelected = !selected || text.indexOf(selected) !== -1;
            const show = matchKeyword && matchSelected;
            card.style.display = show ? "" : "none";
            if (show) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    };

    if (filterInput) {
        const params = new URLSearchParams(window.location.search);
        const query = params.get("q");
        if (query) {
            filterInput.value = query;
        }
        filterInput.addEventListener("input", applyFilter);
    }

    if (filterSelect) {
        filterSelect.addEventListener("change", applyFilter);
    }

    applyFilter();
});
