(function () {
    var container = document.getElementById('searchResult');
    var defaults = document.getElementById('searchDefault');
    if (!container || !window.SITE_MOVIES) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var heroInput = document.querySelector('.hero-search input[name="q"]');
    if (heroInput && query) {
        heroInput.value = query;
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function card(movie) {
        return '<a href="' + escapeHtml(movie.url) + '" class="movie-card compact-card">' +
            '<span class="poster-frame">' +
            '<img src="./' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="handleImageError(this)">' +
            '<span class="poster-title">' + escapeHtml(movie.title) + '</span>' +
            '<span class="poster-mask"></span>' +
            '<span class="duration-badge">' + escapeHtml(movie.duration) + '</span>' +
            '<span class="category-badge">' + escapeHtml(movie.category) + '</span>' +
            '</span>' +
            '<span class="card-content">' +
            '<span class="movie-title">' + escapeHtml(movie.title) + '</span>' +
            '<span class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</span>' +
            '<span class="movie-desc">' + escapeHtml(movie.oneLine) + '</span>' +
            '</span>' +
            '</a>';
    }

    if (!query) {
        return;
    }

    var normalized = query.toLowerCase();
    var results = window.SITE_MOVIES.filter(function (movie) {
        var text = [
            movie.title,
            movie.year,
            movie.region,
            movie.type,
            movie.genre,
            movie.oneLine,
            movie.summary,
            movie.category,
            movie.tags.join(' ')
        ].join(' ').toLowerCase();
        return text.indexOf(normalized) >= 0;
    });

    if (defaults) {
        defaults.style.display = 'none';
    }

    if (results.length) {
        container.innerHTML = '<div class="section-heading"><div><h2>搜索结果</h2><p>关键词：' + escapeHtml(query) + '，找到 ' + results.length + ' 个相关内容</p></div></div>' +
            '<div class="movie-grid four-col">' + results.map(card).join('') + '</div>';
    } else {
        container.innerHTML = '<div class="section-heading"><div><h2>搜索结果</h2><p>关键词：' + escapeHtml(query) + '</p></div></div>' +
            '<div class="empty-state">未找到匹配内容，可以尝试更换关键词。</div>';
    }
})();
