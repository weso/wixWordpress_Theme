(function() {
  var chartSelectors, checkSelectorDataReady, getCountries, getIndicators, getObservations, getSelectorData, getYears, global, li, renderBoxes, renderCharts, renderMap, renderTable, renderTendencyChart, setIndicatorOptions, setPageStateful, updateInfo, _i, _len;

  global = this;

  global.options = {};

  global.selectorDataReady = {};

  global.selections = {
    indicator: null,
    countries: null,
    year: null
  };

  global.maxTableRows = 7;

  setPageStateful = function() {
    return wesCountry.stateful.start({
      init: function(parameters, selectors) {
        if (settings.debug) {
          return console.log("init");
        }
      },
      urlChanged: function(parameters, selectors) {
        var url;
        url = wesCountry.stateful.getFullURL();
        if (settings.debug) {
          return console.log(url);
        }
      },
      elements: [
        {
          name: "indicator",
          selector: "#indicator-select",
          onChange: function(index, value, parameters, selectors) {
            if (settings.debug) {
              console.log("indicator:onChange index:" + index + " value:" + value);
            }
            global.selections.indicator = value;
            return updateInfo();
          }
        }, {
          name: "time",
          selector: global.options.timeline,
          onChange: function(index, value, parameters, selectors) {
            if (settings.debug) {
              console.log("year:onChange index:" + index + " value:" + value);
            }
            global.selections.year = value;
            return updateInfo();
          }
        }, {
          name: "country",
          selector: global.options.countrySelector,
          value: "ALL",
          onChange: function(index, value, parameters, selectors) {
            if (settings.debug) {
              console.log("country:onChange index:" + index + " value:" + value);
            }
            global.selections.countries = value;
            return updateInfo();
          }
        }
      ]
    });
  };

  getSelectorData = function() {
    getIndicators();
    getYears();
    return getCountries();
  };

  getIndicators = function() {
    var host, url;
    host = this.settings.server.url;
    url = "" + host + "/indicators/INDEX";
    if (this.settings.server.method === "JSONP") {
      url += "?callback=getIndicatorsCallback";
      return this.processJSONP(url);
    } else {
      return this.processAJAX(url, getYearsCallback);
    }
  };

  this.getIndicatorsCallback = function(data) {
    var indicators;
    indicators = [];
    if (data.success) {
      indicators = data.data;
    }
    setIndicatorOptions(document.getElementById("indicator-select"), indicators, 0);
    global.selectorDataReady.indicatorSelector = true;
    return checkSelectorDataReady();
  };

  setIndicatorOptions = function(select, element, level) {
    var child, option, space, _i, _len, _ref, _results;
    option = document.createElement("option");
    option.value = element.indicator;
    space = Array(level * 3).join('&nbsp');
    option.innerHTML = space + element.name;
    select.appendChild(option);
    _ref = element.children;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      _results.push(setIndicatorOptions(select, child, level + 1));
    }
    return _results;
  };

  getYears = function() {
    var host, url;
    host = this.settings.server.url;
    url = "" + host + "/years/array";
    if (this.settings.server.method === "JSONP") {
      url += "?callback=getYearsCallback";
      return this.processJSONP(url);
    } else {
      return this.processAJAX(url, getYearsCallback);
    }
  };

  this.getYearsCallback = function(data) {
    var years;
    years = [];
    if (data.success) {
      years = data.data.sort();
    }
    global.options.timeline = wesCountry.selector.timeline({
      container: '#timeline',
      maxShownElements: 10,
      elements: years
    });
    global.selectorDataReady.timeline = true;
    return checkSelectorDataReady();
  };

  getCountries = function() {
    var host, url;
    host = this.settings.server.url;
    url = "" + host + "/areas/continents";
    if (this.settings.server.method === "JSONP") {
      url += "?callback=getCountriesCallback";
      return this.processJSONP(url);
    } else {
      return this.processAJAX(url, getYearsCallback);
    }
  };

  this.getCountriesCallback = function(data) {
    var countries;
    countries = [];
    if (data.success) {
      countries = data.data;
    }
    countries.unshift({
      name: "All countries",
      iso3: "ALL"
    });
    global.options.countrySelector = new wesCountry.selector.basic({
      data: countries,
      selectedItems: ["ALL"],
      maxSelectedItems: global.maxTableRows,
      labelName: "name",
      valueName: "iso3",
      childrenName: "countries",
      autoClose: true,
      selectParentNodes: false,
      beforeChange: function(selectedItems, element) {
        if (!global.options.countrySelector) {
          return;
        }
        if (selectedItems.length === 0) {
          return global.options.countrySelector.select("ALL");
        } else if (element.code === "ALL") {
          if (selectedItems.length > 1) {
            global.options.countrySelector.clear();
            return global.options.countrySelector.select("ALL");
          }
        } else if (selectedItems.search("ALL") !== -1) {
          return global.options.countrySelector.unselect("ALL");
        }
      },
      sort: false
    });
    document.getElementById("country-selector").appendChild(global.options.countrySelector.render());
    global.selectorDataReady.countries = true;
    return checkSelectorDataReady();
  };

  checkSelectorDataReady = function() {
    if (global.selectorDataReady.timeline && global.selectorDataReady.countries && global.selectorDataReady.indicatorSelector) {
      return setPageStateful();
    }
  };

  getObservations = function(indicator, countries, year) {
    var host, url;
    host = this.settings.server.url;
    url = "" + host + "/visualisations/" + indicator + "/" + countries + "/" + year;
    if (this.settings.server.method === "JSONP") {
      url += "?callback=getObservationsCallback";
      return this.processJSONP(url);
    } else {
      return this.processAJAX(url, getObservationsCallback);
    }
  };

  this.getObservationsCallback = function(data) {
    var observations;
    if (!data.success) {
      return;
    }
    observations = data.data;
    renderCharts(observations);
    renderTable(observations);
    return renderBoxes(observations);
  };

  updateInfo = function() {
    var countries, indicator, year;
    year = global.selections.year;
    countries = global.selections.countries;
    indicator = global.selections.indicator;
    if (settings.debug) {
      console.log("year: " + year + " countries: " + countries + " indicator: " + indicator);
    }
    if (!year || !countries || !indicator) {
      return;
    }
    return getObservations(indicator, countries, year);
  };

  renderCharts = function(data) {
    var barContainer, countryView, lineContainer, mapContainer, mapView, options, rankingContainer, resize, view, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
    mapContainer = "#map";
    barContainer = "#country-bars";
    lineContainer = "#lines";
    rankingContainer = "#ranking";
    mapView = "#map-view";
    countryView = "#country-view";
    if (global.selections.countries === "ALL") {
      if ((_ref = document.querySelector(mapView)) != null) {
        _ref.style.display = 'block';
      }
      if ((_ref1 = document.querySelector(countryView)) != null) {
        _ref1.style.display = 'none';
      }
      view = document.querySelector(mapView);
      global.observations = data.observations;
      renderMap();
      if ((_ref2 = document.querySelector(rankingContainer)) != null) {
        _ref2.innerHTML = "";
      }
      options = {
        maxRankingRows: 10,
        margins: [4, 12, 1, 0],
        container: rankingContainer,
        chartType: "ranking",
        rankingElementShape: "square",
        rankingDirection: "HigherToLower",
        sortSeries: true,
        mean: {
          show: true,
          margin: 10,
          stroke: 1
        },
        median: {
          show: true,
          margin: 10,
          stroke: 1
        },
        xAxis: {
          title: "",
          colour: "#ccc",
          "font-family": "'Kite One', sans-serif",
          "font-size": "14px"
        },
        yAxis: {
          margin: 1,
          title: "",
          "font-family": "'Kite One', sans-serif",
          "font-size": "12px"
        },
        legend: {
          "font-family": "'Kite One', sans-serif",
          "font-size": "14px"
        },
        serieColours: ["#0489B1", "#088A68", "#21610B", "#DBA901", "#084B8A"],
        valueOnItem: {
          "font-family": "Helvetica",
          "font-colour": "#fff",
          "font-size": "11px"
        },
        width: view.offsetWidth,
        height: view.offsetHeight,
        series: data.secondVisualisation,
        getName: function(serie) {
          return serie.code;
        },
        getElementColour: function(options, element, index) {
          var pos;
          pos = 0;
          switch (element.continent) {
            case "ECS":
              pos = 0;
              break;
            case "NAC":
              pos = 1;
              break;
            case "LCN":
              pos = 1;
              break;
            case "AFR":
              pos = 2;
              break;
            case "SAS":
              pos = 3;
              break;
            case "EAS":
              pos = 3;
              break;
            case "MEA":
              pos = 4;
          }
          return options.serieColours[pos];
        },
        getLegendElements: function(options) {
          var continent, elements, i, length, range, serie, series, _i, _j, _k, _len, _len1, _ref3, _results;
          elements = [];
          series = options.series;
          length = series.length;
          for (_i = 0, _len = series.length; _i < _len; _i++) {
            serie = series[_i];
            continent = serie.continent;
            if (elements.indexOf(continent) === -1) {
              elements.push(continent);
            }
          }
          elements = elements.sort();
          length = elements.length;
          range = (function() {
            _results = [];
            for (var _j = 0, _ref3 = length - 1; 0 <= _ref3 ? _j <= _ref3 : _j >= _ref3; 0 <= _ref3 ? _j++ : _j--){ _results.push(_j); }
            return _results;
          }).apply(this);
          for (_k = 0, _len1 = range.length; _k < _len1; _k++) {
            i = range[_k];
            elements[i] = {
              code: elements[i],
              continent: elements[i]
            };
          }
          return elements;
        },
        events: {
          onclick: function(info) {
            var code;
            code = info["data-code"];
            global.options.countrySelector.select(code);
            return global.options.countrySelector.refresh();
          }
        }
      };
      wesCountry.charts.chart(options);
    } else {
      if ((_ref3 = document.querySelector(mapView)) != null) {
        _ref3.style.display = 'none';
      }
      if ((_ref4 = document.querySelector(countryView)) != null) {
        _ref4.style.display = 'block';
      }
      if ((_ref5 = document.querySelector(barContainer)) != null) {
        _ref5.innerHTML = "";
      }
      view = document.querySelector(countryView);
      options = {
        container: barContainer,
        chartType: "bar",
        legend: {
          show: false
        },
        margins: [8, 1, 0, 2.5],
        yAxis: {
          margin: 2,
          title: ""
        },
        valueOnItem: {
          show: true
        },
        xAxis: {
          values: [],
          title: ""
        },
        groupMargin: 0,
        series: data.observations,
        mean: {
          show: true
        },
        median: {
          show: true
        },
        width: view.offsetWidth,
        height: view.offsetHeight,
        serieColours: wesCountry.makeGradientPalette(["#005475", "#1B4E5A", "#1B7A65", "#83C04C", "#E5E066"], data.bars.length),
        getElementColour: function(options, element, index) {
          var colour, rank;
          rank = element.rank ? element.rank - 1 : index;
          rank = rank >= 0 && rank < options.serieColours.length ? rank : index;
          colour = options.serieColours[rank];
          colour = element.selected ? colour : wesCountry.shadeColour(colour, 0.5);
          return colour;
        },
        events: {
          onclick: function(info) {
            var code;
            code = info["data-code"];
            global.options.countrySelector.select(code);
            return global.options.countrySelector.refresh();
          },
          onmouseover: function(info) {
            var country, ranked, text, value;
            country = info["data-area_name"];
            value = info["data-values"];
            ranked = info["data-ranked"];
            text = "" + country + ": " + value + " #" + ranked;
            return wesCountry.charts.showTooltip(text, info.event);
          }
        }
      };
      wesCountry.charts.chart(options);
      if ((_ref6 = document.querySelector(lineContainer)) != null) {
        _ref6.innerHTML = "";
      }
      options = {
        container: lineContainer,
        chartType: "line",
        margins: [5, 15, 5, 1],
        groupMargin: 0,
        yAxis: {
          title: ""
        },
        xAxis: {
          title: "",
          values: data.years ? data.years : []
        },
        series: data.secondVisualisation ? data.secondVisualisation : [],
        width: view.offsetWidth,
        height: view.offsetHeight,
        valueOnItem: {
          show: false
        },
        vertex: {
          show: true
        },
        serieColours: ["#FF9900", "#E3493B", "#23B5AF", "#336699", "#FF6600", "#931FC4", "#795227"],
        events: {
          onclick: function(info) {
            var code;
            code = info["data-code"];
            global.options.countrySelector.select(code);
            return global.options.countrySelector.refresh();
          }
        },
        getName: function(serie) {
          return serie.area_name;
        }
      };
      wesCountry.charts.chart(options);
    }
    barContainer = "#bars";
    if ((_ref7 = document.querySelector(barContainer)) != null) {
      _ref7.innerHTML = "";
    }
    options = {
      container: barContainer,
      chartType: "bar",
      legend: {
        show: false
      },
      margins: [8, 1, 0, 2.5],
      yAxis: {
        margin: 2,
        title: ""
      },
      valueOnItem: {
        show: false
      },
      xAxis: {
        values: [],
        title: ""
      },
      groupMargin: 0,
      series: data.bars,
      mean: {
        show: true
      },
      median: {
        show: true
      },
      serieColours: wesCountry.makeGradientPalette(["#005475", "#1B4E5A", "#1B7A65", "#83C04C", "#E5E066"], data.bars.length),
      getElementColour: function(options, element, index) {
        var colour;
        colour = options.serieColours[index];
        colour = element.selected ? colour : wesCountry.shadeColour(colour, 0.3);
        return colour;
      },
      events: {
        onclick: function(info) {
          var code;
          code = info["data-code"];
          global.options.countrySelector.select(code);
          return global.options.countrySelector.refresh();
        },
        onmouseover: function(info) {
          var country, ranked, text, value;
          country = info["data-area_name"];
          value = info["data-values"];
          ranked = info["data-ranked"];
          text = "" + country + ": " + value + " #" + ranked;
          return wesCountry.charts.showTooltip(text, info.event);
        }
      }
    };
    wesCountry.charts.chart(options);
    if (window.attachEvent) {
      window.attachEvent("onresize", resize);
    } else {
      window.addEventListener("resize", resize, false);
    }
    return resize = function() {};
  };

  renderMap = function() {
    var map, mapContainer, _ref;
    mapContainer = "#map";
    if ((_ref = document.querySelector(mapContainer)) != null) {
      _ref.innerHTML = "";
    }
    return map = wesCountry.maps.createMap({
      container: mapContainer,
      borderWidth: 1.5,
      landColour: "#E4E5D8",
      borderColour: "#E4E5D8",
      backgroundColour: "none",
      countries: global.observations,
      colourRange: ["#E5E066", "#83C04C", "#1B7A65", "#1B4E5A", "#005475"],
      onCountryClick: function(info) {
        var code;
        code = info.iso3;
        global.options.countrySelector.select(code);
        return global.options.countrySelector.refresh();
      },
      getValue: function(country) {
        if (country.values || country.values.length > 0) {
          return country.values[0];
        } else {
          return country.value;
        }
      },
      onCountryOver: function(info, visor) {
        var name, ranked, rankedValue, value;
        if (visor) {
          visor.innerHTML = '';
          name = document.createElement('span');
          name.innerHTML = info.name;
          name.className = 'name';
          visor.appendChild(name);
          value = document.createElement('span');
          value.innerHTML = info.value;
          value.className = 'value';
          visor.appendChild(value);
          ranked = document.createElement('span');
          rankedValue = info["data-ranked"] ? "#" + info["data-ranked"] : "";
          ranked.innerHTML = rankedValue;
          ranked.className = 'value';
          return visor.appendChild(ranked);
        }
      }
    });
  };

  renderTable = function(data) {
    var a, byCountry, code, count, img, name, observation, observations, path, previousValue, rank, row, rows, span, table, td, tendency, tr, value, years, _i, _j, _len, _len1, _ref;
    observations = data.observations;
    byCountry = data.byCountry;
    years = data.years;
    table = document.querySelector("#data-table tbody");
    path = (_ref = document.getElementById("path")) != null ? _ref.value : void 0;
    table.innerHTML = "";
    count = 0;
    for (_i = 0, _len = observations.length; _i < _len; _i++) {
      observation = observations[_i];
      count++;
      code = observation.code;
      name = observation.area_name;
      rank = observation.ranked ? observation.ranked : count;
      value = observation.values && observation.values.length > 0 ? observation.values[0] : observation.value;
      previousValue = observation.previous_value;
      if (previousValue) {
        tendency = previousValue.tendency;
      }
      tr = document.createElement("tr");
      table.appendChild(tr);
      if (count > global.maxTableRows) {
        tr.className = "to-hide";
      }
      td = document.createElement("td");
      td.setAttribute("data-title", "Country");
      tr.appendChild(td);
      img = document.createElement("img");
      img.className = "flag";
      img.src = "" + path + "/images/flags/" + code + ".png";
      td.appendChild(img);
      span = document.createElement("span");
      span.innerHTML = name;
      td.appendChild(span);
      td = document.createElement("td");
      td.setAttribute("data-title", "Rank");
      tr.appendChild(td);
      td.innerHTML = rank;
      td = document.createElement("td");
      td.setAttribute("data-title", "Value");
      tr.appendChild(td);
      td.innerHTML = value.toFixed(2);
    }
    if (count > global.maxTableRows) {
      rows = table.querySelectorAll(".to-hide");
      for (_j = 0, _len1 = rows.length; _j < _len1; _j++) {
        row = rows[_j];
        row.className = "hidden";
      }
      tr = document.createElement("tr");
      table.appendChild(tr);
      td = document.createElement("td");
      td.colSpan = 4;
      td.className = "view-more";
      tr.appendChild(td);
      a = document.createElement("a");
      a.innerHTML = "View more";
      td.appendChild(a);
      a.collapsed = true;
      a.table = table;
      return a.onclick = function() {
        var className, collapsed, newClassName, text, _k, _len2, _results;
        collapsed = this.collapsed;
        this.collapsed = !collapsed;
        className = collapsed ? "hidden" : "shown";
        newClassName = collapsed ? "shown" : "hidden";
        text = collapsed ? "View less" : "View more";
        this.innerHTML = text;
        rows = this.table.querySelectorAll("tr." + className);
        _results = [];
        for (_k = 0, _len2 = rows.length; _k < _len2; _k++) {
          row = rows[_k];
          _results.push(row.className = newClassName);
        }
        return _results;
      };
    }
  };

  renderTendencyChart = function(container, serie, years) {
    var options;
    if (!serie) {
      return;
    }
    options = {
      container: container,
      chartType: "line",
      margins: [0, 0, 0, 0],
      groupMargin: 0,
      yAxis: {
        title: "",
        "font-colour": "transparent",
        tickColour: "none"
      },
      xAxis: {
        title: "",
        "font-colour": "transparent",
        values: years
      },
      series: [serie],
      valueOnItem: {
        show: false
      },
      vertex: {
        show: false
      },
      legend: {
        show: false
      },
      serieColours: ["#333"]
    };
    return wesCountry.charts.chart(options);
  };

  renderBoxes = function(data) {
    var higher, lower, mean, median, _ref, _ref1, _ref2, _ref3;
    mean = data.mean;
    median = data.median;
    higher = data.higher.area;
    lower = data.lower.area;
    if ((_ref = document.getElementById("mean")) != null) {
      _ref.innerHTML = mean.toFixed(2);
    }
    if ((_ref1 = document.getElementById("median")) != null) {
      _ref1.innerHTML = median.toFixed(2);
    }
    if ((_ref2 = document.getElementById("higher")) != null) {
      _ref2.innerHTML = higher;
    }
    return (_ref3 = document.getElementById("lower")) != null ? _ref3.innerHTML = lower : void 0;
  };

  setTimeout(function() {
    return getSelectorData();
  }, this.settings.elapseTimeout);

  chartSelectors = document.querySelectorAll(".tabs ul[data-selector] li");

  for (_i = 0, _len = chartSelectors.length; _i < _len; _i++) {
    li = chartSelectors[_i];
    li.onclick = function() {
      var block, blockSelector, blocks, elementSelector, info, lis, parent, _j, _k, _l, _len1, _len2, _len3;
      parent = this.parentNode;
      lis = parent.querySelectorAll("li");
      for (_j = 0, _len1 = lis.length; _j < _len1; _j++) {
        li = lis[_j];
        li.className = "";
      }
      this.className = "selected";
      blockSelector = parent.getAttribute("data-selector");
      elementSelector = this.getAttribute("data-selector");
      blocks = document.querySelectorAll("." + blockSelector + " > div");
      for (_k = 0, _len2 = blocks.length; _k < _len2; _k++) {
        block = blocks[_k];
        block.style.display = 'none';
      }
      blocks = document.querySelectorAll("." + blockSelector + " > div." + elementSelector);
      for (_l = 0, _len3 = blocks.length; _l < _len3; _l++) {
        block = blocks[_l];
        block.style.display = 'block';
      }
      info = this.getAttribute("data-info");
      if (info && info === "map") {
        return renderMap();
      }
    };
  }

}).call(this);
