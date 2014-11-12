(function() {
  var a, button, chartSelectors, chartTooltip, checkSelectorDataReady, collapsable, collapsableHeader, collapsableSection, collapsables, collapsed, content, createTableCell, firstSection, firstTab, firstTabFixedPosition, firstTabStartedMoving, getCountries, getIndicators, getObservations, getSelectorData, getValue, getYears, global, li, msie6, previousY, renderBoxes, renderCharts, renderContinentLegend, renderCountries, renderExtraTableHeader, renderMap, renderPieChart, renderTable, returnToStoppedPosition, secondTab, secondTabAbsolutePosition, secondTabStartedMoving, selectBar, setBoxesInitialPosition, setBoxesPosition, setIndicatorOptions, setPageStateful, siteHeader, tab, tabs, top, updateInfo, _i, _j, _k, _len, _len1, _len2;

  global = this;

  global.options = {};

  global.selectorDataReady = {};

  global.selections = {
    indicator: null,
    indicatorOption: null,
    indicatorTendency: null,
    countries: null,
    year: null
  };

  global.maxChartBars = 7;

  global.continents = {};

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
            var description, i, name, option, primary, provider_anchor, provider_name, provider_url, republish, tendency, tendencyIcon, tendencyLabel, type, year, years, _i, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
            if (settings.debug) {
              console.log("indicator:onChange index:" + index + " value:" + value);
            }
            option = (_ref = selectors["#indicator-select"]) != null ? (_ref1 = _ref.options) != null ? _ref1[index] : void 0 : void 0;
            tendency = option.getAttribute("data-tendency");
            tendency = tendency === "1";
            global.selections.indicator = value;
            global.selections.indicatorOption = option;
            global.selections.indicatorTendency = tendency;
            updateInfo();
            republish = option.getAttribute("data-republish");
            republish = republish === "true";
            if ((_ref2 = document.getElementById("notifications")) != null) {
              if ((_ref3 = _ref2.style) != null) {
                _ref3.display = republish ? "none" : "block";
              }
            }
            type = option.getAttribute("data-type");
            primary = type.toLowerCase() === "primary";
            if ((_ref4 = document.getElementById("primary-info")) != null) {
              if ((_ref5 = _ref4.style) != null) {
                _ref5.display = primary ? "block" : "none";
              }
            }
            years = global.options.timeline.getElements();
            for (i = _i = 0, _ref6 = years.length - 2; 0 <= _ref6 ? _i <= _ref6 : _i >= _ref6; i = 0 <= _ref6 ? ++_i : --_i) {
              year = years[i];
              if (primary) {
                global.options.timeline.disable(year);
              } else {
                global.options.timeline.enable(year);
              }
            }
            name = option.getAttribute("data-name");
            if ((_ref7 = document.getElementById("indicator-name")) != null) {
              _ref7.innerHTML = name;
            }
            description = option.getAttribute("data-description");
            if ((_ref8 = document.getElementById("indicator-description")) != null) {
              _ref8.innerHTML = description;
            }
            if ((_ref9 = document.getElementById("indicator-type")) != null) {
              _ref9.innerHTML = type;
            }
            if ((_ref10 = document.getElementById("indicator-type-icon")) != null) {
              _ref10.innerHTML = type;
            }
            tendencyLabel = tendency ? (_ref11 = document.getElementById("label_ascending")) != null ? _ref11.value : void 0 : (_ref12 = document.getElementById("label_descending")) != null ? _ref12.value : void 0;
            if ((_ref13 = document.getElementById("indicator-tendency")) != null) {
              _ref13.innerHTML = tendencyLabel;
            }
            if ((_ref14 = document.getElementById("indicator-tendency-icon")) != null) {
              _ref14.innerHTML = tendencyLabel;
            }
            tendencyIcon = tendency ? "fa fa-arrow-up" : "fa fa-arrow-down";
            if ((_ref15 = document.getElementById("indicator-tendency-arrow")) != null) {
              _ref15.className = tendencyIcon;
            }
            provider_name = option.getAttribute("data-provider_name");
            provider_url = option.getAttribute("data-provider_url");
            provider_anchor = "<a href='" + provider_url + "'>" + provider_name + "</a>";
            if ((_ref16 = document.getElementById("indicator-provider")) != null) {
              _ref16.innerHTML = provider_anchor;
            }
            return (_ref17 = document.getElementById("indicator-provider-icon")) != null ? _ref17.innerHTML = provider_anchor : void 0;
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
    var indicators, selector, table;
    indicators = [];
    if (data.success) {
      indicators = data.data;
    }
    selector = document.getElementById("indicator-select");
    table = document.getElementById("indicator-list") || document.createElement("table");
    setIndicatorOptions(selector, table, indicators, 0, false);
    global.selectorDataReady.indicatorSelector = true;
    checkSelectorDataReady();
    return global.options.indicatorSelector = selector;
  };

  setIndicatorOptions = function(select, table, element, level, last) {
    var child, code, count, description, indicator, max, name, option, provider_name, provider_url, republish, space, subindex, tbody, tendency, tr, type, weight, _i, _len, _ref, _results;
    republish = element.republish ? element.republish : false;
    type = element.type ? element.type : "Primary";
    description = element.description ? element.description : "";
    tendency = element.high_low ? element.high_low : "high";
    tendency = tendency === "high" ? 1 : -1;
    provider_name = element.provider_name ? element.provider_name : "";
    provider_url = element.provider_url ? element.provider_url : "";
    weight = element.weight ? element.weight : "";
    subindex = element.subindex ? element.subindex : "";
    indicator = element.indicator ? element.indicator.replace(/_/g, " ") : "";
    code = element.indicator ? element.indicator : "";
    name = element.name ? element.name : "";
    option = document.createElement("option");
    option.value = code;
    option.setAttribute("data-republish", republish);
    option.setAttribute("data-type", type);
    option.setAttribute("data-name", name);
    option.setAttribute("data-description", description);
    option.setAttribute("data-tendency", tendency);
    option.setAttribute("data-provider_name", provider_name);
    option.setAttribute("data-provider_url", provider_url);
    space = Array(level * 3).join('&nbsp');
    option.innerHTML = space + name;
    select.appendChild(option);
    tbody = document.createElement("tbody");
    tbody.code = code;
    tbody.setAttribute("data-subindex", type.toLowerCase() !== "subindex" ? subindex : element.indicator);
    tbody.setAttribute("data-type", type);
    table.appendChild(tbody);
    tbody.onclick = function() {
      code = this.code;
      global.options.indicatorSelector.value = code;
      return global.options.indicatorSelector.refresh();
    };
    if (level === 3 && last) {
      tbody.className = "last";
    }
    tr = document.createElement("tr");
    tbody.appendChild(tr);
    createTableCell(tr, "Indicator", name);
    createTableCell(tr, "Code", code);
    createTableCell(tr, "Type", type);
    createTableCell(tr, "Weight", weight);
    createTableCell(tr, "Provider", "<a href='" + provider_url + "'>" + provider_name + "</a>");
    createTableCell(tr, "Publish", republish ? "Yes" : "No");
    if (description && description !== "") {
      tr = document.createElement("tr");
      tbody.appendChild(tr);
      createTableCell(tr, "Description", description, 6);
    }
    count = 0;
    max = element.children.length - 1;
    _ref = element.children;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      setIndicatorOptions(select, table, child, level + 1, count === max);
      _results.push(count++);
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
      "short_name": "All countries",
      iso3: "ALL"
    });
    global.options.countrySelector = new wesCountry.selector.basic({
      data: countries,
      selectedItems: ["ALL"],
      maxSelectedItems: global.maxChartBars,
      labelName: "short_name",
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
    var countries, observations, observationsByCountry;
    if (!data.success) {
      return;
    }
    observations = data.data;
    global.continents = data.data.continents;
    renderCharts(observations);
    renderTable(observations);
    renderBoxes(observations);
    countries = data.data.countries;
    observationsByCountry = data.data.observationsByCountry;
    return renderCountries(countries, observationsByCountry);
  };

  updateInfo = function() {
    var countries, indicator, indicatorOption, type, year, _ref, _ref1;
    year = global.selections.year;
    countries = global.selections.countries;
    indicator = global.selections.indicator;
    indicatorOption = global.selections.indicatorOption;
    if (settings.debug) {
      console.log("year: " + year + " countries: " + countries + " indicator: " + indicator);
    }
    if (!year || !countries || !indicator) {
      return;
    }
    getObservations(indicator, countries, year);
    if (indicatorOption) {
      type = indicatorOption.getAttribute("data-type");
      if ((_ref = document.getElementById("indicator")) != null) {
        _ref.innerHTML = type;
      }
    }
    return (_ref1 = document.getElementById("year")) != null ? _ref1.innerHTML = year : void 0;
  };

  renderContinentLegend = function(data, options, container, getContinents, getContinentColour) {
    var circle, code, colour, continent, continents, li, name, span, ul, _i, _len, _results;
    continents = getContinents(options);
    ul = document.createElement("ul");
    container.appendChild(ul);
    _results = [];
    for (_i = 0, _len = continents.length; _i < _len; _i++) {
      continent = continents[_i];
      code = continent.code;
      colour = getContinentColour(options, continent);
      name = data.continents[code];
      li = document.createElement("li");
      ul.appendChild(li);
      circle = document.createElement("div");
      circle.className = "circle";
      circle.style.backgroundColor = colour;
      li.appendChild(circle);
      span = document.createElement("span");
      span.className = "continent";
      li.appendChild(span);
      _results.push(span.innerHTML = name);
    }
    return _results;
  };

  renderCharts = function(data) {
    var barContainer, countryView, getContinentColour, getLegendElements, lineContainer, mapContainer, mapView, options, rankingContainer, rankingContainerDiv, rankingLegend, rankingWrapper, resize, serieColours, series, view, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
    mapContainer = "#map";
    barContainer = "#country-bars";
    lineContainer = "#lines";
    rankingContainer = "#ranking-chart";
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
      rankingContainerDiv = document.querySelector(rankingContainer);
      if (rankingContainerDiv != null) {
        rankingContainerDiv.innerHTML = "";
      }
      rankingWrapper = document.createElement("div");
      rankingWrapper.className = "wrapper";
      if (rankingContainerDiv != null) {
        rankingContainerDiv.appendChild(rankingWrapper);
      }
      rankingLegend = document.createElement("div");
      rankingLegend.className = "legend";
      if (rankingContainerDiv != null) {
        rankingContainerDiv.appendChild(rankingLegend);
      }
      getContinentColour = function(options, element, index) {
        var pos;
        pos = 0;
        switch (element.continent) {
          case "ECS":
            pos = 0;
            break;
          case "NAC":
            pos = 5;
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
            pos = 6;
            break;
          case "MEA":
            pos = 4;
        }
        return options.serieColours[pos];
      };
      getLegendElements = function(options) {
        var continent, elements, i, length, range, serie, series, _i, _j, _k, _len, _len1, _ref2, _results;
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
          for (var _j = 0, _ref2 = length - 1; 0 <= _ref2 ? _j <= _ref2 : _j >= _ref2; 0 <= _ref2 ? _j++ : _j--){ _results.push(_j); }
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
      };
      options = {
        maxRankingRows: 10,
        margins: [4, 0, 1, 0],
        container: rankingWrapper,
        chartType: "ranking",
        rankingElementShape: "square",
        rankingDirection: global.selections.indicatorTendency ? "HigherToLower" : "LowerToHigher",
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
          show: false
        },
        serieColours: ["#0489B1", "#088A68", "#FF8000", "#DBA901", "#642EFE", "#795227", "#FA5858"],
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
        getElementColour: getContinentColour,
        getLegendElements: getLegendElements,
        events: {
          onclick: function(info) {
            var code;
            code = info["data-code"];
            global.options.countrySelector.select(code);
            return global.options.countrySelector.refresh();
          },
          onmouseover: function(info) {
            return chartTooltip(info, global);
          }
        }
      };
      wesCountry.charts.chart(options);
      renderContinentLegend(data, options, rankingLegend, getLegendElements, getContinentColour);
    } else {
      if ((_ref2 = document.querySelector(mapView)) != null) {
        _ref2.style.display = 'none';
      }
      if ((_ref3 = document.querySelector(countryView)) != null) {
        _ref3.style.display = 'block';
      }
      if ((_ref4 = document.querySelector(barContainer)) != null) {
        _ref4.innerHTML = "";
      }
      view = document.querySelector(countryView);
      series = data.observations;
      serieColours = wesCountry.makeGradientPalette(["#005475", "#1B4E5A", "#1B7A65", "#83C04C", "#E5E066"], data.bars.length);
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
        series: series,
        mean: {
          show: true
        },
        median: {
          show: true
        },
        width: view.offsetWidth,
        height: view.offsetHeight,
        serieColours: serieColours,
        getElementColour: function(options, element, index) {
          var colour, rank;
          rank = element.ranked ? element.ranked - 1 : index;
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
            return chartTooltip(info, global);
          }
        },
        getName: function(serie) {
          return serie["short_name"];
        }
      };
      wesCountry.charts.chart(options);
      if ((_ref5 = document.querySelector(lineContainer)) != null) {
        _ref5.innerHTML = "";
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
          },
          onmouseover: function(info) {
            return chartTooltip(info, global);
          }
        },
        getName: function(serie) {
          return serie["short_name"] || serie["area_name"];
        }
      };
      wesCountry.charts.chart(options);
    }
    barContainer = "#bars";
    if ((_ref6 = document.querySelector(barContainer)) != null) {
      _ref6.innerHTML = "";
    }
    series = data.bars;
    serieColours = wesCountry.makeGradientPalette(["#005475", "#1B4E5A", "#1B7A65", "#83C04C", "#E5E066"], data.bars.length);
    options = {
      container: barContainer,
      chartType: "bar",
      legend: {
        show: false
      },
      margins: [8, 0, 20, 0],
      yAxis: {
        margin: 0,
        title: "",
        tickColour: "none",
        "font-colour": "none"
      },
      valueOnItem: {
        show: true
      },
      xAxis: {
        values: [],
        title: ""
      },
      groupMargin: 0,
      series: series,
      mean: {
        show: true
      },
      median: {
        show: true
      },
      serieColours: serieColours,
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
          return chartTooltip(info, global);
        }
      },
      getName: function(element) {
        return element.code;
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
    var colours, map, mapContainer, _ref;
    mapContainer = "#map > div.chart";
    if ((_ref = document.querySelector(mapContainer)) != null) {
      _ref.innerHTML = "";
    }
    colours = ["#E5E066", "#83C04C", "#1B7A65", "#1B4E5A", "#005475"];
    if (!global.selections.indicatorTendency) {
      colours.reverse();
    }
    return map = wesCountry.maps.createMap({
      container: mapContainer,
      borderWidth: 1.5,
      landColour: "#dcdcdc",
      borderColour: "#fff",
      backgroundColour: "none",
      countries: global.observations,
      colourRange: colours,
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
        var code, continent, country, flag, img, name, path, ranked, rankedValue, republish, value, _value;
        if (visor) {
          visor.innerHTML = '';
          code = info["data-code"];
          if (!code) {
            return;
          }
          _value = info.value;
          republish = info["data-republish"] ? info["data-republish"] : false;
          _value = getValue(_value, republish);
          value = document.createElement('div');
          value.innerHTML = _value;
          value.className = 'value';
          visor.appendChild(value);
          country = document.createElement('div');
          country.className = 'country';
          visor.appendChild(country);
          ranked = document.createElement('div');
          rankedValue = info["data-ranked"] ? info["data-ranked"] : "";
          ranked.innerHTML = rankedValue;
          ranked.className = 'ranking';
          country.appendChild(ranked);
          flag = document.createElement("flag");
          flag.className = "flag";
          country.appendChild(flag);
          img = document.createElement("img");
          path = document.getElementById("path").value;
          img.src = "" + path + "/images/flags/" + code + ".png";
          flag.appendChild(img);
          name = document.createElement("p");
          name.className = "name";
          name.innerHTML = info["data-short_name"];
          country.appendChild(name);
          name = document.createElement("p");
          name.className = "continent";
          continent = info["data-continent"];
          if (continent) {
            continent = global.continents[continent];
          }
          name.innerHTML = continent;
          return country.appendChild(name);
        }
      }
    });
  };

  renderTable = function(data) {
    var code, continent, empowerment, extraInfo, extraTable, extraTbody, freedomOpenness, globalRank, img, name, observation, observations, path, previousValue, rank, relevantContent, republish, span, table, tbodies, tbody, td, tendency, tr, universalAccess, value, _i, _j, _len, _len1, _ref, _results;
    observations = data.observations;
    table = document.querySelector("#ranking");
    path = (_ref = document.getElementById("path")) != null ? _ref.value : void 0;
    tbodies = document.querySelectorAll("#ranking > tbody");
    for (_i = 0, _len = tbodies.length; _i < _len; _i++) {
      tbody = tbodies[_i];
      table.removeChild(tbody);
    }
    _results = [];
    for (_j = 0, _len1 = observations.length; _j < _len1; _j++) {
      observation = observations[_j];
      code = observation.code;
      name = observation.short_name;
      rank = observation.ranked ? observation.ranked : count;
      value = observation.values && observation.values.length > 0 ? observation.values[0] : observation.value;
      republish = observation.republish ? observation.republish : false;
      value = getValue(value, republish);
      previousValue = observation.previous_value;
      extraInfo = observation.extra;
      continent = "";
      if (observation.continent) {
        continent = observation.continent;
        continent = global.continents[continent];
      }
      if (previousValue) {
        tendency = previousValue.tendency;
      }
      tbody = document.createElement("tbody");
      table.appendChild(tbody);
      tr = document.createElement("tr");
      tbody.appendChild(tr);
      tbody.code = code;
      tbody.onclick = function() {
        code = this.code;
        global.options.countrySelector.select(code);
        return global.options.countrySelector.refresh();
      };
      td = document.createElement("td");
      td.setAttribute("data-title", "Rank");
      td.setAttribute("rowspan", "2");
      td.className = "big-number";
      tr.appendChild(td);
      td.innerHTML = rank;
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
      td.setAttribute("data-title", "Continent");
      tr.appendChild(td);
      td.innerHTML = continent;
      td = document.createElement("td");
      td.setAttribute("data-title", "Value");
      tr.appendChild(td);
      td.innerHTML = "<div><p>value</p> " + value + "</div>";
      globalRank = extraInfo.rank;
      universalAccess = extraInfo["UNIVERSAL_ACCESS"].toFixed(2);
      freedomOpenness = extraInfo["FREEDOM_AND_OPENNESS"].toFixed(2);
      relevantContent = extraInfo["RELEVANT_CONTENT_AND_USE"].toFixed(2);
      empowerment = extraInfo["EMPOWERMENT"].toFixed(2);
      tr = document.createElement("tr");
      tbody.appendChild(tr);
      td = document.createElement("td");
      td.setAttribute("colspan", "3");
      tr.appendChild(td);
      extraTable = document.createElement("table");
      extraTable.className = "extra-table";
      td.appendChild(extraTable);
      renderExtraTableHeader(extraTable);
      extraTbody = document.createElement("tbody");
      extraTable.appendChild(extraTbody);
      tr = document.createElement("tr");
      extraTbody.appendChild(tr);
      td = document.createElement("td");
      td.setAttribute("data-title", "Web Index Rank");
      tr.appendChild(td);
      td.innerHTML = globalRank;
      td = document.createElement("td");
      td.setAttribute("data-title", "Universal Access");
      tr.appendChild(td);
      td.innerHTML = universalAccess;
      td = document.createElement("td");
      td.setAttribute("data-title", "Relevant Content");
      tr.appendChild(td);
      td.innerHTML = relevantContent;
      td = document.createElement("td");
      td.setAttribute("data-title", "Freedom And Openness");
      tr.appendChild(td);
      td.innerHTML = freedomOpenness;
      td = document.createElement("td");
      td.setAttribute("data-title", "Empowerment");
      tr.appendChild(td);
      _results.push(td.innerHTML = empowerment);
    }
    return _results;
  };

  renderExtraTableHeader = function(extraTable) {
    var extraTheader, th, tr;
    extraTheader = document.createElement("thead");
    extraTable.appendChild(extraTheader);
    tr = document.createElement("tr");
    extraTheader.appendChild(tr);
    th = document.createElement("th");
    th.setAttribute("data-title", "Web Index Rank");
    tr.appendChild(th);
    th.innerHTML = "Web Index Rank";
    th = document.createElement("th");
    th.setAttribute("data-title", "Universal Access");
    tr.appendChild(th);
    th.innerHTML = "Universal Access";
    th = document.createElement("th");
    th.setAttribute("data-title", "Relevant Content");
    tr.appendChild(th);
    th.innerHTML = "Relevant Content";
    th = document.createElement("th");
    th.setAttribute("data-title", "Freedom And Openness");
    tr.appendChild(th);
    th.innerHTML = "Freedom And Openness";
    th = document.createElement("th");
    th.setAttribute("data-title", "Empowerment");
    tr.appendChild(th);
    return th.innerHTML = "Empowerment";
  };

  renderBoxes = function(data) {
    var higher, higherArea, higherContainer, labelHigher, labelLower, lower, lowerArea, lowerContainer, mean, median, _ref, _ref1, _ref2, _ref3;
    mean = data.mean;
    median = data.median;
    higher = data.higher["short_name"];
    lower = data.lower["short_name"];
    higherArea = data.higher.area;
    lowerArea = data.lower.area;
    if ((_ref = document.getElementById("mean")) != null) {
      _ref.innerHTML = mean.toFixed(2);
    }
    if ((_ref1 = document.getElementById("median")) != null) {
      _ref1.innerHTML = median.toFixed(2);
    }
    higherContainer = document.getElementById("higher");
    if (higherContainer) {
      higherContainer.innerHTML = global.selections.indicatorTendency ? higher : lower;
      higherContainer.onclick = function() {
        global.options.countrySelector.select(higherArea);
        return global.options.countrySelector.refresh();
      };
    }
    lowerContainer = document.getElementById("lower");
    if (lowerContainer) {
      lowerContainer.innerHTML = global.selections.indicatorTendency ? lower : higher;
      lowerContainer.onclick = function() {
        global.options.countrySelector.select(lowerArea);
        return global.options.countrySelector.refresh();
      };
    }
    labelHigher = (_ref2 = document.getElementById("label_higher")) != null ? _ref2.value : void 0;
    return labelLower = (_ref3 = document.getElementById("label_lower")) != null ? _ref3.value : void 0;

    /*
    higherLegend = document.getElementById("legend-higher")
    if higherLegend
      higherLegend.innerHTML = if global.selections.indicatorTendency then labelHigher else labelLower
    
    lowerLegend = document.getElementById("legend-lower")
    if lowerLegend
      lowerLegend.innerHTML = if global.selections.indicatorTendency then labelLower else labelHigher
     */
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

  msie6 = $.browser === "msie" && $.browser.version < 7;

  selectBar = $(".select-bar > section");

  siteHeader = $(".site-header").height();

  if (!selectBar) {
    return;
  }

  top = null;

  if (!msie6) {
    $(window).scroll(function(event) {
      var y;
      if (top == null) {
        top = selectBar.offset().top;
      }
      y = $(this).scrollTop();
      if (y >= siteHeader) {
        if (!selectBar.collapsed) {
          setBoxesInitialPosition();
          selectBar.addClass("fixed");
          setBoxesPosition();
          selectBar.collapsed = true;
          return selectBar.css("width", selectBar.parent().width());
        }
      } else {
        selectBar.removeClass("fixed");
        return selectBar.collapsed = false;
      }
    });
  }

  setBoxesInitialPosition = function() {
    var box, boxes, _j, _len1, _results;
    boxes = document.querySelectorAll(".select-box");
    _results = [];
    for (_j = 0, _len1 = boxes.length; _j < _len1; _j++) {
      box = boxes[_j];
      top = box.offsetTop;
      _results.push(box.style.top = "" + top + "px");
    }
    return _results;
  };

  setBoxesPosition = function() {
    var box, boxes, headerHeight, previousTop, _j, _len1, _results;
    boxes = document.querySelectorAll(".select-box");
    previousTop = 0;
    _results = [];
    for (_j = 0, _len1 = boxes.length; _j < _len1; _j++) {
      box = boxes[_j];
      headerHeight = box.querySelector("header").offsetHeight;
      top = previousTop - headerHeight;

      /*
      box.collapsedTop = top
      box.uncollapsedTop = previousTop
      
      box.onmouseover = ->
        top = this.uncollapsedTop
        this.style.top = "#{top}px"
      
      box.onmouseout = ->
        top = this.collapsedTop
        this.style.top = "#{top}px"
       */
      box.style.top = "" + top + "px";
      _results.push(previousTop = top + box.offsetHeight);
    }
    return _results;
  };

  collapsables = document.querySelectorAll(".collapsable-header");

  for (_j = 0, _len1 = collapsables.length; _j < _len1; _j++) {
    collapsableHeader = collapsables[_j];
    button = collapsableHeader.querySelector(".button");
    if (!button) {
      continue;
    }
    collapsable = collapsableHeader.parentNode;
    collapsableSection = collapsable.querySelector("section");
    if (!collapsableSection) {
      continue;
    }
    collapsed = collapsable.className.indexOf("collapsed") !== -1;
    button.collapsed = collapsed;
    button.container = collapsable;
    button.setStyles = function() {
      var container, containerClass;
      collapsed = this.collapsed;
      container = this.container;
      containerClass = container.className.replace(" collapsed", "");
      container.className = collapsed ? containerClass + " collapsed" : containerClass;
      return this.className = collapsed ? "button fa fa-toggle-off" : "button fa fa-toggle-on";
    };
    button.onclick = function() {
      this.collapsed = !this.collapsed;
      return this.setStyles();
    };
    button.setStyles();
  }

  chartTooltip = function(info, global) {
    var code, continent, flagSrc, name, path, ranked, republish, text, time, tooltipBody, tooltipHeader, value;
    path = document.getElementById('path').value;
    value = info["data-values"];
    republish = info["data-republish"] ? info["data-republish"] === "true" : false;
    value = getValue(value, republish);
    ranked = info["data-ranked"];
    code = info["data-area"];
    name = info["data-area_name"];
    time = info["data-year"];
    continent = "";
    if (info["data-continent"]) {
      continent = info["data-continent"];
      continent = global.continents[continent];
    }
    flagSrc = "" + path + "/images/flags/" + code + ".png";
    tooltipHeader = String.format('<div class="tooltip-header"><img src="{0}" /><div class="title"><p class="countryName">{1}</p><p class="continentName">{2}</p></div></div>', flagSrc, name, continent);
    tooltipBody = String.format('<div class="tooltip-body"><p class="ranking">{0}</p><p class="time">{1}</p><p class="value">{2}</p></div>', ranked, time, value);
    text = String.format("{0}{1}", tooltipHeader, ranked && time ? tooltipBody : "");
    return wesCountry.charts.showTooltip(text, info.event);
  };

  getValue = function(value, republish) {
    var isNumeric;
    if (!republish) {
      return "N/A";
    }
    isNumeric = !isNaN(parseFloat(value)) && isFinite(value);
    if (isNumeric) {
      return parseFloat(value).toFixed(2);
    } else {
      return value;
    }
  };

  tabs = document.querySelectorAll(".accordion-tabs-minimal li");

  if (tabs.length > 0) {
    a = tabs[0].querySelector("a");
    content = tabs[0].querySelector("div.tab-content");
    a.className += " is-active";
    content.className += " is-open";
  }

  for (_k = 0, _len2 = tabs.length; _k < _len2; _k++) {
    tab = tabs[_k];
    a = tab.querySelector("a");
    if (a != null) {
      a.onclick = function(event) {
        var open;
        if (this.className.indexOf("is-active") === -1) {
          event.preventDefault();
          open = document.querySelector(".accordion-tabs-minimal .is-active");
          if (open != null) {
            open.className = open.className.replace(" is-active", "");
          }
          open = document.querySelector(".accordion-tabs-minimal .is-open");
          if (open != null) {
            open.className = open.className.replace(" is-open", "");
          }
          this.className += " is-active";
          content = this.parentNode.querySelector("div.tab-content");
          return content != null ? content.className += " is-open" : void 0;
        } else {
          return event.preventDefault();
        }
      };
    }
  }

  renderCountries = function(countries, observations) {
    var code, container, continent, count, country, div, empowerment, extraInfo, freedomOpenness, globalRank, img, name, observation, path, ranking, relevantContent, republish, selectedCountries, span, ul, universalAccess, value, _l, _len3, _results;
    container = document.getElementById("country-section");
    if (container != null) {
      container.style.display = global.selections.countries === "ALL" ? "none" : "block";
    }
    selectedCountries = global.selections.countries;
    selectedCountries = selectedCountries.split(",");
    ul = document.getElementById("country-tabs");
    ul.innerHTML = "";
    count = 1;
    _results = [];
    for (_l = 0, _len3 = selectedCountries.length; _l < _len3; _l++) {
      country = selectedCountries[_l];
      country = countries[country];
      if (!country) {
        continue;
      }
      code = country.iso3;
      name = country.name;
      continent = country.area;
      observation = observations[code];
      republish = observation.republish;
      value = observation.value;
      value = getValue(value, republish);
      ranking = observation.ranked;
      extraInfo = observation.extra;
      globalRank = extraInfo.rank;
      universalAccess = extraInfo["UNIVERSAL_ACCESS"].toFixed(2);
      freedomOpenness = extraInfo["FREEDOM_AND_OPENNESS"].toFixed(2);
      relevantContent = extraInfo["RELEVANT_CONTENT_AND_USE"].toFixed(2);
      empowerment = extraInfo["EMPOWERMENT"].toFixed(2);
      if (continent) {
        continent = global.continents[continent];
      } else {
        continent = "";
      }
      li = document.createElement("li");
      li.className = "tab-header-and-content";
      ul.appendChild(li);
      a = document.createElement("a");
      a.href = "javascript:void(0)";
      a.className = count === 1 ? "tab-link is-active" : "tab-link";
      a.opened = false;
      li.appendChild(a);
      img = document.createElement("img");
      img.className = "flag";
      path = document.getElementById("path").value;
      img.src = "" + path + "/images/flags/" + code + ".png";
      a.appendChild(img);
      span = document.createElement("span");
      span.className = "country";
      a.appendChild(span);
      span.innerHTML = country.short_name;
      div = document.createElement("div");
      div.className = count === 1 ? "tab-content is-open" : "tab-content";
      li.appendChild(div);
      a.container = div;
      a.onclick = function() {
        var countryMap, extraTbody, map, open, p, rankingDiv, table, tableWrapper, td, tr, valueDiv, wrapper;
        if (this.className.indexOf("is-active") === -1) {
          event.preventDefault();
          open = document.querySelector(".accordion-tabs-minimal .is-active");
          if (open != null) {
            open.className = open.className.replace(" is-active", "");
          }
          open = document.querySelector(".accordion-tabs-minimal .is-open");
          if (open != null) {
            open.className = open.className.replace(" is-open", "");
          }
          this.className += " is-active";
          content = this.parentNode.querySelector("div.tab-content");
          if (content != null) {
            content.className += " is-open";
          }
        } else {
          event.preventDefault();
        }
        if (this.opened) {
          return;
        }
        this.opened = true;
        div = this.container;
        map = document.createElement("div");
        map.className = "country-map";
        map.id = "m" + wesCountry.guid();
        div.appendChild(map);
        countryMap = wesCountry.maps.createMap({
          container: "#" + map.id,
          "borderWidth": 1.5,
          countries: [
            {
              code: code,
              value: 1
            }
          ],
          download: false,
          "zoom": false,
          landColour: "#ddd",
          borderColour: "#ddd",
          colourRange: ["#0096af"]
        });
        wrapper = document.createElement("div");
        div.appendChild(wrapper);
        valueDiv = document.createElement("div");
        valueDiv.className = "value";
        valueDiv.innerHTML = "<p>value</p>" + value;
        wrapper.appendChild(valueDiv);
        rankingDiv = document.createElement("div");
        rankingDiv.className = "value ranking";
        rankingDiv.innerHTML = "<p>rank</p>" + ranking;
        wrapper.appendChild(rankingDiv);
        p = document.createElement("p");
        wrapper.appendChild(p);
        p.innerHTML = name;
        p = document.createElement("p");
        p.className = "continent";
        wrapper.appendChild(p);
        p.innerHTML = continent;
        tableWrapper = document.createElement("div");
        tableWrapper.className = "table-wrapper";
        div.appendChild(tableWrapper);
        table = document.createElement("table");
        table.className = "extra-table";
        tableWrapper.appendChild(table);
        renderExtraTableHeader(table);
        extraTbody = document.createElement("tbody");
        table.appendChild(extraTbody);
        tr = document.createElement("tr");
        extraTbody.appendChild(tr);
        td = document.createElement("td");
        td.setAttribute("data-title", "Web Index Rank");
        tr.appendChild(td);
        td.innerHTML = globalRank;
        td = document.createElement("td");
        td.setAttribute("data-title", "Universal Access");
        tr.appendChild(td);
        renderPieChart(td, universalAccess, "#f93845");
        td = document.createElement("td");
        td.setAttribute("data-title", "Relevant Content");
        tr.appendChild(td);
        renderPieChart(td, freedomOpenness, "#0096af");
        td = document.createElement("td");
        td.setAttribute("data-title", "Freedom And Openness");
        tr.appendChild(td);
        renderPieChart(td, relevantContent, "#89ba00");
        td = document.createElement("td");
        td.setAttribute("data-title", "Empowerment");
        tr.appendChild(td);
        return renderPieChart(td, empowerment, "#ff761c");
      };
      if (count === 1) {
        a.click();
      }
      _results.push(count++);
    }
    return _results;
  };

  renderPieChart = function(container, value, colour) {
    var chart, pie;
    chart = document.createElement("div");
    chart.className = "chart";
    chart.id = "c" + (wesCountry.guid());
    container.appendChild(chart);
    return pie = wesCountry.charts.chart({
      chartType: "pie",
      container: "#" + chart.id,
      serieColours: ["#ddd", colour],
      series: [
        {
          name: "",
          values: [100 - value]
        }, {
          name: name,
          values: [value]
        }
      ],
      events: {
        onmouseover: function() {}
      },
      valueOnItem: {
        show: false
      },
      xAxis: {
        "font-colour": "none"
      },
      yAxis: {
        "font-colour": "none"
      },
      legend: {
        show: false
      },
      margins: [0, 0, 0, 0]
    });
  };

  createTableCell = function(tr, title, content, colspan) {
    var td;
    td = document.createElement("td");
    td.setAttribute("data-title", title);
    td.innerHTML = content;
    tr.appendChild(td);
    if (colspan) {
      return td.setAttribute("colspan", colspan);
    }
  };

  msie6 = $.browser === "msie" && $.browser.version < 7;

  siteHeader = $(".site-header").height();

  firstSection = $(".first-section");

  firstTab = $(".first-tab");

  secondTab = $(".second-tab");

  firstTabFixedPosition = 0;

  secondTabAbsolutePosition = 0;

  firstTabStartedMoving = 0;

  secondTabStartedMoving = 0;

  if (!selectBar) {
    return;
  }

  top = null;

  previousY = 0;

  if (!msie6) {
    $(window).scroll(function(event) {
      var firstTabTop, fistTabHeight, height, offset, parent, secondTabTop, tendency, windowHeight, y;
      if (top == null) {
        top = section.offset().top;
      }
      windowHeight = $(window).height();
      fistTabHeight = firstTab.height();
      y = $(this).scrollTop();
      tendency = y - previousY;
      firstTabTop = Math.floor(y - firstTab.offset().top);
      secondTabTop = Math.floor(y - secondTab.offset().top);
      if (y >= siteHeader && windowHeight > fistTabHeight) {
        if (!firstSection.collapsed && tendency > 0) {
          parent = firstSection.parent();
          height = parent.height();
          parent.css("min-height", height);
          firstSection.siblings().each(function() {
            var offset;
            offset = $(this).position().top;
            secondTabAbsolutePosition = offset;
            $(this).css("top", offset);
            return $(this).addClass("absolute");
          });
          firstTabFixedPosition = firstTab.position().top;
          firstSection.children().each(function() {
            var width;
            width = $(this).width();
            $(this).css("width", width);
            return $(this).addClass("fixed");
          });
          firstTab.css("top", firstTabFixedPosition);
          firstSection.collapsed = true;
          secondTabStartedMoving = y;
        } else if (!firstTab.moving && tendency > 0 && secondTabTop >= firstTabTop) {
          offset = secondTabAbsolutePosition - 6;
          firstTab.css("top", offset).addClass("absolute").removeClass("fixed");
          firstTab.moving = true;
          firstTabStartedMoving = y;
        } else if (tendency < 0 && firstTab.moving && y <= firstTabStartedMoving) {
          firstTab.css("top", firstTabFixedPosition).addClass("fixed").removeClass("absolute");
          firstTab.moving = false;
        } else if (tendency < 0 && y <= secondTabStartedMoving) {
          returnToStoppedPosition(firstSection, firstTab);
        }
      } else {
        returnToStoppedPosition(firstSection, firstTab);
      }
      return previousY = y;
    });
  }

  returnToStoppedPosition = function(firstSection, firstTab) {
    if (!firstSection.collapsed) {
      return;
    }
    firstSection.children().removeClass("fixed").removeClass("absolute");
    firstSection.collapsed = false;
    firstTab.moving = false;
    return firstSection.siblings().each(function() {
      return $(this).removeClass("absolute");
    });
  };

}).call(this);
