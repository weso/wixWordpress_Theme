(function() {
  var anchor, container, nav, position, visualisation, visualisations, wrapper, _i, _len;

  visualisations = document.querySelectorAll(".hidden-visualisations div.visualisation");

  for (_i = 0, _len = visualisations.length; _i < _len; _i++) {
    visualisation = visualisations[_i];
    anchor = visualisation.getAttribute("data-anchor");
    if (anchor) {
      wrapper = document.querySelector(".visualisation-wrapper[data-visualisation='" + anchor + "']");
      if (wrapper) {
        wrapper.appendChild(visualisation);
        continue;
      }
    }
    position = visualisation.getAttribute("data-position");
    if (!position) {
      continue;
    }
    container = document.querySelector(".report-articles article:nth-child(" + position + ")");
    if (!container) {
      continue;
    }
    nav = container.querySelector("nav");
    if (!nav) {
      continue;
    }
    nav.parentNode.insertBefore(visualisation, nav.nextSibling);
  }

}).call(this);
