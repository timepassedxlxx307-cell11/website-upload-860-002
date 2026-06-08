(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function bindMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function bindHero() {
    var slides = selectAll("[data-hero-slide]");
    var dots = selectAll("[data-hero-dot]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var activate = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle("is-active", pos === index);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle("is-active", pos === index);
      });
    };
    dots.forEach(function (dot, pos) {
      dot.addEventListener("click", function () {
        activate(pos);
      });
    });
    setInterval(function () {
      activate(index + 1);
    }, 5200);
  }

  function bindSearch() {
    var inputs = selectAll("[data-search]");
    if (!inputs.length) {
      return;
    }
    inputs.forEach(function (input) {
      var scope = input.closest(".page-main") || document;
      var items = selectAll(".movie-card, .rank-row", scope);
      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        items.forEach(function (item) {
          var haystack = [
            item.getAttribute("data-title"),
            item.getAttribute("data-region"),
            item.getAttribute("data-genre"),
            item.getAttribute("data-year"),
            item.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          item.classList.toggle("is-hidden", keyword && haystack.indexOf(keyword) === -1);
        });
      });
    });
  }

  function bindFilters() {
    selectAll("[data-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        var group = button.closest(".search-panel") || document;
        var scope = button.closest(".page-main") || document;
        var value = button.getAttribute("data-filter");
        selectAll("[data-filter]", group).forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        selectAll(".movie-card, .rank-row", scope).forEach(function (item) {
          var haystack = [
            item.getAttribute("data-title"),
            item.getAttribute("data-region"),
            item.getAttribute("data-genre"),
            item.getAttribute("data-tags")
          ].join(" ");
          item.classList.toggle("is-hidden", value !== "all" && haystack.indexOf(value) === -1);
        });
      });
    });
  }

  function startPlayback(box) {
    var video = box.querySelector("video");
    var cover = box.querySelector(".player-cover");
    if (!video) {
      return;
    }
    var stream = video.getAttribute("data-stream");
    if (!stream) {
      return;
    }
    var begin = function () {
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
      }
      if (cover) {
        cover.classList.add("player-cover-hidden");
      }
    };
    if (video.dataset.ready === "yes") {
      begin();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.dataset.ready = "yes";
        begin();
      });
      hls.on(window.Hls.Events.ERROR, function () {
        video.dataset.ready = "yes";
      });
      return;
    }
    video.src = stream;
    video.dataset.ready = "yes";
    begin();
  }

  function bindPlayers() {
    selectAll(".player-shell").forEach(function (box) {
      var video = box.querySelector("video");
      var cover = box.querySelector(".player-cover");
      if (cover) {
        cover.addEventListener("click", function (event) {
          event.preventDefault();
          startPlayback(box);
        });
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            startPlayback(box);
          }
        });
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindMenu();
    bindHero();
    bindSearch();
    bindFilters();
    bindPlayers();
  });
})();
