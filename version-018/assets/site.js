(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = qs('[data-menu-button]');
  var mobilePanel = qs('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  qsa('[data-global-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = qs('input[name="q"]', form);
      if (!input || !input.value.trim()) {
        event.preventDefault();
        return;
      }
      input.value = input.value.trim();
    });
  });

  var hero = qs('[data-hero]');

  if (hero) {
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('hero-slide-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });

    setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  qsa('[data-filter-panel]').forEach(function (panel) {
    var section = panel.closest('section');
    var cards = qsa('[data-card]', section || document);
    var searchInput = qs('[data-filter-search]', panel);
    var activeRegion = '全部';
    var activeYear = '全部';

    function applyFilters() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var genre = (card.getAttribute('data-genre') || '').toLowerCase();
        var region = card.getAttribute('data-region') || '';
        var year = card.getAttribute('data-year') || '';
        var keywordMatch = !keyword || title.indexOf(keyword) !== -1 || genre.indexOf(keyword) !== -1 || region.toLowerCase().indexOf(keyword) !== -1 || year.indexOf(keyword) !== -1;
        var regionMatch = activeRegion === '全部' || region.indexOf(activeRegion) !== -1;
        var yearMatch = activeYear === '全部' || year === activeYear;
        card.classList.toggle('is-hidden', !(keywordMatch && regionMatch && yearMatch));
      });
    }

    qsa('[data-filter-region]', panel).forEach(function (button) {
      button.addEventListener('click', function () {
        activeRegion = button.getAttribute('data-filter-region');
        qsa('[data-filter-region]', panel).forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applyFilters();
      });
    });

    qsa('[data-filter-year]', panel).forEach(function (button) {
      button.addEventListener('click', function () {
        activeYear = button.getAttribute('data-filter-year');
        qsa('[data-filter-year]', panel).forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applyFilters();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }
  });

  var searchResults = qs('[data-search-results]');
  var searchInput = qs('[data-search-page-input]');

  if (searchResults && typeof SEARCH_MOVIES !== 'undefined') {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    if (searchInput) {
      searchInput.value = query;
    }

    function createCard(movie) {
      return '<a class="movie-card" href="./' + movie.file + '">' +
        '<span class="card-cover"><img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="card-play">▶</span><span class="card-type">' + escapeHtml(movie.type) + '</span></span>' +
        '<span class="card-content"><span class="card-kicker">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + '</span><span class="card-title">' + escapeHtml(movie.title) + '</span><span class="card-desc">' + escapeHtml(movie.oneLine) + '</span><span class="card-tags"><span>' + escapeHtml(movie.genre) + '</span></span></span>' +
        '</a>';
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }

    function renderSearch(value) {
      var keyword = String(value || '').trim().toLowerCase();
      var results = SEARCH_MOVIES.filter(function (movie) {
        var source = [movie.title, movie.region, movie.year, movie.type, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase();
        return !keyword || source.indexOf(keyword) !== -1;
      }).slice(0, 120);
      searchResults.innerHTML = results.map(createCard).join('');
    }

    renderSearch(query);

    var form = qs('[data-search-page-form]');
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var value = searchInput ? searchInput.value.trim() : '';
        var nextUrl = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
        window.history.replaceState({}, '', nextUrl);
        renderSearch(value);
      });
    }
  }

  qsa('[data-player]').forEach(function (player) {
    var video = qs('video', player);
    var button = qs('[data-play-button]', player);
    var streamUrl = player.getAttribute('data-stream');
    var attached = false;

    function attachStream() {
      if (!video || !streamUrl || attached) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        attached = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        attached = true;
        return;
      }
      video.src = streamUrl;
      attached = true;
    }

    function startVideo() {
      attachStream();
      if (button) {
        button.hidden = true;
      }
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          setTimeout(function () {
            video.play().catch(function () {});
          }, 300);
        });
      }
    }

    if (button && video) {
      button.addEventListener('click', startVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startVideo();
        }
      });
      video.addEventListener('pause', function () {
        if (button && video.currentTime > 0 && !video.ended) {
          button.hidden = false;
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.hidden = true;
        }
      });
    }
  });
})();
