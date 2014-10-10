(function() {
  var checkSelectorDataReady, getCountries, getIndicators, getObservations, getSelectorData, getYears, global, processAJAX, processJSONP, renderCharts, setIndicatorOptions, setPageStateful, updateInfo;

  global = this;

  global.options = {};

  global.selectorDataReady = {};

  global.selections = {
    indicator: null,
    countries: null,
    year: null
  };

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
          name: "year",
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
      return processJSONP(url);
    } else {
      return processAJAX(url, getYearsCallback);
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
      return processJSONP(url);
    } else {
      return processAJAX(url, getYearsCallback);
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
      return processJSONP(url);
    } else {
      return processAJAX(url, getYearsCallback);
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
      onChange: null,
      selectedItems: ["ALL"],
      maxSelectedItems: 3,
      labelName: "name",
      valueName: "iso3",
      childrenName: "countries",
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
      return processJSONP(url);
    } else {
      return processAJAX(url, getObservationsCallback);
    }
  };

  this.getObservationsCallback = function(data) {
    var observations;
    if (!data.success) {
      return;
    }
    observations = data.data;
    return renderCharts(observations);
  };

  processJSONP = function(url) {
    var head, script;
    head = document.head;
    script = document.createElement("script");
    script.setAttribute("src", url);
    head.appendChild(script);
    return head.removeChild(script);
  };

  processAJAX = function(url, callback) {};

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
    var barContainer, colour1, colour2, colourLength, colours, i, index, intervalLength, length, map, mapContainer, options, range, resize, _i, _j, _len, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _results;
    console.log(data);
    mapContainer = "#map";
    barContainer = "#country-bars";
    if (global.selections.countries === "ALL") {
      if ((_ref = document.querySelector(mapContainer)) != null) {
        _ref.style.display = 'block';
      }
      if ((_ref1 = document.querySelector(barContainer)) != null) {
        _ref1.style.display = 'none';
      }
      if ((_ref2 = document.querySelector(mapContainer)) != null) {
        _ref2.innerHTML = "";
      }
      map = wesCountry.maps.createMap({
        container: mapContainer,
        borderWidth: 1.5,
        landColour: "#E4E5D8",
        borderColour: "#E4E5D8",
        backgroundColour: "none",
        countries: data.observations,
        colourRange: ["#E5E066", "#83C04C", "#1B7A65", "#1B4E5A", "#005475"]
      });
    } else {
      if ((_ref3 = document.querySelector(barContainer)) != null) {
        _ref3.style.display = 'block';
      }
      if ((_ref4 = document.querySelector(mapContainer)) != null) {
        _ref4.style.display = 'none';
      }
      if ((_ref5 = document.querySelector(barContainer)) != null) {
        _ref5.innerHTML = "";
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
        series: data.observations,
        mean: {
          show: true
        },
        median: {
          show: true
        }
      };
    }
    wesCountry.charts.chart(options);
    barContainer = "#bars";
    if ((_ref6 = document.querySelector(barContainer)) != null) {
      _ref6.innerHTML = "";
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
      }
    };
    length = data.bars.length;
    colours = [
      {
        r: 0,
        g: 84,
        b: 117
      }, {
        r: 27,
        g: 78,
        b: 90
      }, {
        r: 27,
        g: 122,
        b: 101
      }, {
        r: 131,
        g: 192,
        b: 76
      }, {
        r: 229,
        g: 224,
        b: 102
      }
    ];
    options.serieColours = [];
    index = 0;
    colourLength = colours.length;
    intervalLength = length / (colourLength - 1);
    range = (function() {
      _results = [];
      for (var _i = 0; 0 <= intervalLength ? _i <= intervalLength : _i >= intervalLength; 0 <= intervalLength ? _i++ : _i--){ _results.push(_i); }
      return _results;
    }).apply(this);
    while (index < colourLength - 1) {
      for (_j = 0, _len = range.length; _j < _len; _j++) {
        i = range[_j];
        colour1 = colours[index];
        colour2 = colours[index + 1];
        options.serieColours.push(wesCountry.makeGradientColour(colour1, colour2, (i / intervalLength) * 100).cssColour);
      }
      index++;
    }
    options.getElementColour = function(options, element, index) {
      return options.serieColours[index];
    };
    wesCountry.charts.chart(options);
    if (window.attachEvent) {
      window.attachEvent("onresize", resize);
    } else {
      window.addEventListener("resize", resize, false);
    }
    return resize = function() {
      return createMap();
    };
  };

  setTimeout(function() {
    return getSelectorData();
  }, this.settings.elapseTimeout);

}).call(this);
