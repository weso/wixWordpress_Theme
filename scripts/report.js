(function() {
  var anchor, container, nav, position, rankingTable, viewMore, visualisation, visualisations, wrapper, _i, _len, _ref, _ref1;

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

  rankingTable = document.querySelector("section.ranking-table");

  viewMore = rankingTable.querySelector("a.ranking-view-more");

  if (rankingTable && viewMore) {
    viewMore.onclick = function(event) {
      var opened;
      opened = rankingTable.opened ? rankingTable.opened : false;
      opened = !opened;
      rankingTable.opened = opened;
      rankingTable.className = opened ? "report-ranking opened" : "report-ranking";
      return this.innerHTML = opened ? "<span>&#171;</span> VIEW LESS" : "VIEW MORE <span>&#187;</span>";
    };
  }

  wrapper = document.querySelector(".ranking-wrapper");

  if (wrapper) {
    wrapper.appendChild(rankingTable);
    if (rankingTable != null) {
      if ((_ref = rankingTable.style) != null) {
        _ref.display = "table";
      }
    }
  } else {
    if (rankingTable != null) {
      if ((_ref1 = rankingTable.style) != null) {
        _ref1.display = "none";
      }
    }
  }

}).call(this);
