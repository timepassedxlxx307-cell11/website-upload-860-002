(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = qs('.menu-button');
    var menu = qs('.mobile-nav');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var opened = menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function setupBackTop() {
    var button = qs('.back-top');
    if (!button) {
      return;
    }
    var update = function () {
      if (window.scrollY > 480) {
        button.classList.add('is-visible');
      } else {
        button.classList.remove('is-visible');
      }
    };
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function setupHero() {
    qsa('[data-hero-carousel]').forEach(function (carousel) {
      var slides = qsa('[data-hero-slide]', carousel);
      var dots = qsa('[data-hero-dot]', carousel);
      var prev = qs('[data-hero-prev]', carousel);
      var next = qs('[data-hero-next]', carousel);
      if (slides.length < 2) {
        return;
      }
      var index = 0;
      var timer = null;
      var activate = function (nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      };
      var start = function () {
        stop();
        timer = window.setInterval(function () {
          activate(index + 1);
        }, 5200);
      };
      var stop = function () {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          activate(i);
          start();
        });
      });
      if (prev) {
        prev.addEventListener('click', function () {
          activate(index - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          activate(index + 1);
          start();
        });
      }
      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
      start();
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupGridFilters() {
    qsa('[data-card-grid]').forEach(function (grid) {
      var gridId = grid.getAttribute('data-card-grid');
      var input = qs('[data-grid-search="' + gridId + '"]');
      var filters = qsa('[data-grid-filter="' + gridId + '"]');
      var activeFilter = 'all';
      var cards = qsa('.searchable-card', grid);
      var apply = function () {
        var query = input ? normalize(input.value) : '';
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-genre')
          ].join(' '));
          var queryMatched = !query || haystack.indexOf(query) !== -1;
          var filterMatched = activeFilter === 'all' || haystack.indexOf(normalize(activeFilter)) !== -1;
          card.hidden = !(queryMatched && filterMatched);
        });
      };
      if (input) {
        input.addEventListener('input', apply);
      }
      filters.forEach(function (button) {
        button.addEventListener('click', function () {
          activeFilter = button.getAttribute('data-filter-value') || 'all';
          filters.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          apply();
        });
      });
      apply();
    });
  }

  function setupPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var overlay = qs('.play-overlay', player);
      var stream = player.getAttribute('data-stream');
      if (!video || !stream) {
        return;
      }
      var hls = null;
      var ready = false;
      var attach = function () {
        if (ready) {
          return;
        }
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            }
          });
          return;
        }
        video.src = stream;
      };
      var start = function () {
        attach();
        if (overlay) {
          overlay.hidden = true;
        }
        var playAction = video.play();
        if (playAction && typeof playAction.catch === 'function') {
          playAction.catch(function () {
            if (overlay) {
              overlay.hidden = false;
            }
          });
        }
      };
      attach();
      if (overlay) {
        overlay.addEventListener('click', start);
      }
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.hidden = true;
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupBackTop();
    setupHero();
    setupGridFilters();
    setupPlayers();
  });
})();
