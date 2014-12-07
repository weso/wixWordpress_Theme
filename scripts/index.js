(function() {
  var accordionCallbacks, accordionTabs, button, buttons, count, empowermentCallback, genderTabCallback, host, i, illustrations, index, indicator, indicators, interval, limit, limits, loadAccordionTabs, loadTabsData, neutralityTabCallback, privacyCallback, renderEmpowermentTab, renderGenderTab, renderNeutralityTab, renderPrivacyTab, resize, setPercentage, tab, tendencies, tendency, url, value, values, _accordion, _accordionTabs, _i, _j, _k, _len, _len1, _ref, _ref1, _ref2, _ref3;

  illustrations = document.querySelectorAll(".illustrations article");

  buttons = document.querySelectorAll(".illustration-buttons a");

  count = 0;

  for (_i = 0, _len = buttons.length; _i < _len; _i++) {
    button = buttons[_i];
    button.index = count;
    button.onclick = function() {
      var i, illustration, index, _j, _ref, _results;
      index = this.index;
      _results = [];
      for (i = _j = 0, _ref = illustrations.length - 1; 0 <= _ref ? _j <= _ref : _j >= _ref; i = 0 <= _ref ? ++_j : --_j) {
        illustration = illustrations[i];
        button = buttons[i];
        illustration.style.display = i === index ? "block" : "none";
        _results.push(button.className = i === index ? "circle selected" : "circle");
      }
      return _results;
    };
    count++;
  }

  neutralityTabCallback = function() {
    var path, paths, _j, _len1, _results;
    paths = document.querySelectorAll("#map .land-group");
    _results = [];
    for (_j = 0, _len1 = paths.length; _j < _len1; _j++) {
      path = paths[_j];
      _results.push(path.style.opacity = 0.9);
    }
    return _results;
  };

  genderTabCallback = function() {
    var activeIcons, icon, _j, _len1, _results;
    activeIcons = document.querySelectorAll(".infographic-percentage img.active");
    _results = [];
    for (_j = 0, _len1 = activeIcons.length; _j < _len1; _j++) {
      icon = activeIcons[_j];
      _results.push(icon.style.opacity = 0.8);
    }
    return _results;
  };

  empowermentCallback = function() {
    var circle, circles, inc, increment, r, _j, _len1, _results;
    circles = document.querySelectorAll(".infographic-circles .circle");
    _results = [];
    for (_j = 0, _len1 = circles.length; _j < _len1; _j++) {
      circle = circles[_j];
      r = circle.getAttribute("data-r");
      increment = function(circle, inc, time) {
        return setTimeout(function() {
          return circle.setAttribute("r", "" + inc + "%");
        }, time);
      };
      if (r) {
        _results.push((function() {
          var _k, _results1;
          _results1 = [];
          for (inc = _k = 0; 0 <= r ? _k <= r : _k >= r; inc = 0 <= r ? ++_k : --_k) {
            _results1.push(increment(circle, inc, inc * 30));
          }
          return _results1;
        })());
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  privacyCallback = function() {
    var angle, cx, cy, increaseAngle, maxAngle, percentage, pie, radius, svg, total, width, x1, y1, _j, _results;
    svg = document.getElementById("world");
    pie = document.getElementById("world-pie");
    percentage = pie.getAttribute("percentage");
    percentage = parseInt(percentage);
    width = svg.width.baseVal.value;
    cx = width / 2;
    cy = width / 2;
    radius = width / 2;
    x1 = width / 2;
    y1 = 0;
    total = 100;
    maxAngle = Math.abs(percentage / total * Math.PI * 2);
    _results = [];
    for (angle = _j = 0; _j <= maxAngle; angle = _j += 0.05) {
      increaseAngle = function(angle, time) {
        return setTimeout(function() {
          var big, d, x2, y2;
          x2 = cx + radius * Math.sin(angle);
          y2 = cy - radius * Math.cos(angle);
          big = percentage >= 50 ? 1 : 0;
          d = "M " + cx + "," + cy + " L " + x1 + "," + y1 + " A " + radius + "," + radius + " 0 " + big + " 1 " + x2 + "," + y2 + " Z";
          return pie.setAttribute("d", d);
        }, time);
      };
      _results.push(increaseAngle(angle, angle * 150));
    }
    return _results;
  };

  _accordionTabs = document.querySelectorAll(".accordion article");

  _accordion = document.querySelector(".accordion");

  accordionTabs = [];

  accordionCallbacks = [neutralityTabCallback, empowermentCallback, genderTabCallback, privacyCallback];

  this.tabsData = null;

  for (_j = 0, _len1 = _accordionTabs.length; _j < _len1; _j++) {
    tab = _accordionTabs[_j];
    accordionTabs.unshift(tab);
  }

  loadAccordionTabs = function() {
    var i, _k, _ref, _results;
    _results = [];
    for (i = _k = 0, _ref = accordionTabs.length - 1; 0 <= _ref ? _k <= _ref : _k >= _ref; i = 0 <= _ref ? ++_k : --_k) {
      tab = accordionTabs[i];
      tab.closedPosition = i === accordionTabs.length - 1 ? 0 : 100 - (i + 1) * 10;
      tab.openedPosition = (accordionTabs.length - 1 - i) * 10;
      tab.touched = false;
      tab.tabs = accordionTabs;
      tab.index = i;
      tab.position = void 0;
      tab.opened = void 0;
      tab.touchable = void 0;
      tab.openedTimes = 0;
      tab.close = function() {
        this.setPosition(this.closedPosition + "%");
        this.opened = false;
        return this.position = this.closedPosition;
      };
      tab.closeWithIncrement = function(increment) {
        this.setPosition(increment + "%");
        this.opened = false;
        return this.position = increment;
      };
      tab.open = function() {
        this.setPosition(this.openedPosition + "%");
        this.opened = true;
        return this.position = this.openedPosition;
      };
      tab.isMobile = function() {
        return this.offsetWidth === _accordion.offsetWidth;
      };
      tab.setPosition = function(value) {
        if (this.isMobile()) {
          return this.style.bottom = value;
        } else {
          return this.style.right = value;
        }
      };
      tab.setInitialPosition = function() {
        if (this.position === void 0) {
          if (this.isMobile()) {
            this.opened = this.index === 0;
            this.position = this.openedPosition;
            return this.touchable = this.index !== accordionTabs.length - 1;
          } else {
            this.opened = this.index === accordionTabs.length - 1;
            this.position = this.opened ? this.openedPosition : this.closedPosition;
            return this.touchable = !this.opened;
          }
        }
      };
      tab.onclick = function() {
        var increment, position, tabs, _l, _ref1;
        this.setInitialPosition();
        if (this.opened) {
          return;
        }
        this.isMobile();
        if (!this.openedTimes) {
          this.openedTimes = 0;
        }
        this.openedTimes = this.openedTimes + 1;
        tabs = this.tabs;
        position = tabs.indexOf(this);
        for (i = _l = 0, _ref1 = position - 1; 0 <= _ref1 ? _l <= _ref1 : _l >= _ref1; i = 0 <= _ref1 ? ++_l : --_l) {
          if (i >= 0) {
            tabs[i].close();
          }
        }
        this.open();
        increment = this.openedPosition;
        count = 1;
        i = position + 1;
        while (i < tabs.length) {
          tabs[i].closeWithIncrement(increment - count * 10);
          count++;
          i++;
        }
        if (this.openedTimes === 1 && accordionCallbacks[this.index]) {
          return accordionCallbacks[this.index].call(this);
        }
      };
      tab.onmouseenter = function() {
        var position;
        this.setInitialPosition();
        if (!this.touchable || this.touched || this.opened) {
          return;
        }
        this.touched = true;
        position = this.position - 2;
        return this.setPosition(position + "%");
      };
      _results.push(tab.onmouseout = function() {
        this.setInitialPosition();
        if (!this.touched) {
          return;
        }
        this.touched = false;
        return this.setPosition(this.position + "%");
      });
    }
    return _results;
  };

  loadAccordionTabs();

  resize = function() {
    loadAccordionTabs();
    if (this.tabsData) {
      return loadTabsData(this.tabsData);
    }
  };

  if (window.attachEvent) {
    window.attachEvent("onresize", resize);
  } else {
    window.addEventListener("resize", resize, false);
  }

  interval = setInterval(function() {
    var i, number1, number2, _k, _results;
    _results = [];
    for (i = _k = 0; _k <= 4; i = ++_k) {
      number1 = Math.floor(Math.random() * 10);
      number2 = Math.floor(Math.random() * 10);
      _results.push(setPercentage("#tab" + i, "" + number1 + number2));
    }
    return _results;
  }, 40);

  indicators = [];

  limits = [];

  tendencies = [];

  values = [];

  for (i = _k = 0; _k < 4; i = ++_k) {
    index = 3 - i;
    indicator = (_ref = document.getElementById("home-header-" + index + "-indicator")) != null ? _ref.value : void 0;
    limit = (_ref1 = document.getElementById("home-header-" + index + "-limit")) != null ? _ref1.value : void 0;
    tendency = (_ref2 = document.getElementById("home-header-" + index + "-tendency")) != null ? _ref2.value : void 0;
    value = (_ref3 = document.getElementById("home-header-" + index + "-value")) != null ? _ref3.value : void 0;
    indicators.push(indicator);
    limits.push(limit);
    tendencies.push(tendency);
    values.push(value);
  }

  host = this.settings.server.url;

  url = "" + host + "/home/" + (indicators.join()) + "/" + (limits.join()) + "/" + (tendencies.join()) + "/" + (values.join());

  if (this.settings.server.method === "JSONP") {
    url += "?callback=getDataCallback";
    this.processJSONP(url);
  } else {
    this.processAJAX(url, getDataCallback);
  }

  this.getDataCallback = function(data) {
    this.tabsData = data;
    return loadTabsData(data);
  };

  loadTabsData = function(data) {
    var _l, _ref4;
    clearInterval(interval);
    renderNeutralityTab(data.observations4, data.percentage4);
    renderEmpowermentTab(data.observations3, data.percentage3);
    renderGenderTab(data.percentage2);
    renderPrivacyTab(data.percentage1);
    for (i = _l = 0, _ref4 = accordionTabs.length - 1; 0 <= _ref4 ? _l <= _ref4 : _l >= _ref4; i = 0 <= _ref4 ? ++_l : --_l) {
      tab = accordionTabs[i];
      tab.close();
    }
    return setTimeout(function() {
      var world;
      if (accordionTabs[0].isMobile()) {
        neutralityTabCallback.call();
        world = document.getElementById("world");
        world.setAttribute("width", "10em");
        return world.setAttribute("height", "10em");
      } else {
        return privacyCallback.call();
      }
    }, 100);
  };

  renderNeutralityTab = function(countries, percentage) {
    var path, paths, _l, _len2, _results;
    setPercentage("#tab4", percentage);
    document.getElementById("map").innerHTML = "";
    wesCountry.maps.createMap({
      container: '#map',
      "borderWidth": 0,
      borderColour: "#f93845",
      countries: countries,
      download: false,
      width: 500,
      height: 200,
      zoom: false,
      backgroundColour: "transparent",
      landColour: "#FC6A74",
      hoverColour: "#FC6A74",
      colourRange: ["#E98990", "#C20310"],
      onCountryClick: function(info) {},
      onCountryOver: function(info, visor) {}
    });
    paths = document.querySelectorAll("#map .land-group");
    _results = [];
    for (_l = 0, _len2 = paths.length; _l < _len2; _l++) {
      path = paths[_l];
      _results.push(path.style.opacity = 0.3);
    }
    return _results;
  };

  renderEmpowermentTab = function(observations, percentage) {
    var circle, circleSize, circles, container, newCircle, observation, r, sorter, svg, valueCircle, _l, _len2, _len3, _m, _ref4, _results;
    setPercentage("#tab3", percentage);
    sorter = function(a, b) {
      var a_area, b_area;
      a_area = a.area;
      b_area = b.area;
      if (a_area < b_area) {
        return -1;
      }
      if (a_area > b_area) {
        return 1;
      }
      return 0;
    };
    observations.sort(sorter);
    circle = document.querySelector(".infographic-circles .model");
    container = document.getElementById("infographic-circles");
    circleSize = container.offsetWidth * 0.8 / 24;
    circles = document.querySelectorAll(".infographic-circles > .circle");
    for (_l = 0, _len2 = circles.length; _l < _len2; _l++) {
      circle = circles[_l];
      container.removeChild(circle);
    }
    _results = [];
    for (_m = 0, _len3 = observations.length; _m < _len3; _m++) {
      observation = observations[_m];
      newCircle = circle.cloneNode(true);
      newCircle.setAttribute("class", "circle");
      svg = newCircle.querySelector("svg");
      svg.setAttribute("width", circleSize);
      svg.setAttribute("height", circleSize);
      container.appendChild(newCircle);
      valueCircle = newCircle.querySelector(".circle");
      r = observation.value * 10;
      r = r / 2;
      valueCircle.setAttribute("data-r", "" + r);
      valueCircle.setAttribute("r", "0");
      _results.push((_ref4 = newCircle.querySelector(".country")) != null ? _ref4.innerHTML = observation.area : void 0);
    }
    return _results;
  };

  renderGenderTab = function(percentage) {
    var container, element, icon, iconSrc, img, p, ps, row, _l, _len2, _m, _results;
    setPercentage("#tab2", percentage);
    container = document.querySelector(".infographic-percentage");
    ps = document.querySelectorAll(".infographic-percentage p");
    for (_l = 0, _len2 = ps.length; _l < _len2; _l++) {
      p = ps[_l];
      container.removeChild(p);
    }
    icon = document.querySelector(".infographic-icon");
    iconSrc = icon.src;
    count = 1;
    _results = [];
    for (row = _m = 0; _m <= 3; row = ++_m) {
      p = document.createElement("p");
      container.appendChild(p);
      _results.push((function() {
        var _n, _results1;
        _results1 = [];
        for (element = _n = 0; _n <= 24; element = ++_n) {
          img = document.createElement("img");
          img.src = iconSrc;
          p.appendChild(img);
          if (count <= percentage) {
            img.className = "active";
          }
          _results1.push(count++);
        }
        return _results1;
      })());
    }
    return _results;
  };

  renderPrivacyTab = function(percentage) {
    var pie;
    setPercentage("#tab1", percentage);
    pie = document.getElementById("world-pie");
    return pie.setAttribute("percentage", percentage);
  };

  setPercentage = function(article, percentage) {
    var label, labels, _l, _len2, _results;
    labels = document.querySelectorAll("" + article + " strong.percentage");
    _results = [];
    for (_l = 0, _len2 = labels.length; _l < _len2; _l++) {
      label = labels[_l];
      _results.push(label.innerHTML = "" + percentage + "%");
    }
    return _results;
  };

}).call(this);
