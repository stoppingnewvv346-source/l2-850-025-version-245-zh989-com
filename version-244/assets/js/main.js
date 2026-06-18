
(function () {
  var toggle = document.querySelector("[data-mobile-toggle]");
  var nav = document.querySelector("[data-mobile-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var active = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === active);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      showSlide(i);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  var searchInput = document.querySelector("[data-search-input]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-text]"));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
  var currentFilter = "all";

  function applyFilter() {
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
    cards.forEach(function (card) {
      var text = (card.getAttribute("data-search-text") || "").toLowerCase();
      var category = card.getAttribute("data-category") || "";
      var passText = !keyword || text.indexOf(keyword) !== -1;
      var passCategory = currentFilter === "all" || category === currentFilter;
      card.classList.toggle("hidden-card", !(passText && passCategory));
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilter);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      currentFilter = button.getAttribute("data-filter") || "all";
      filterButtons.forEach(function (item) {
        item.classList.toggle("active", item === button);
      });
      applyFilter();
    });
  });
})();
