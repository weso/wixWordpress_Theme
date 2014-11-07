(function() {
  var accordionCallbacks, accordionTabs, button, buttons, count, empowermentCallback, genderTabCallback, host, illustrations, indicator1, indicator2, indicator3, indicator4, interval, loadAccordionTabs, loadTabsData, neutralityTabCallback, privacyCallback, renderEmpowermentTab, renderGenderTab, renderNeutralityTab, renderPrivacyTab, resize, setPercentage, tab, url, _accordion, _accordionTabs, _i, _j, _len, _len1;

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
          return accordionCallbacks[this.index].call();
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

  indicator1 = document.getElementById("home-header-3-indicator").value;

  indicator2 = document.getElementById("home-header-2-indicator").value;

  indicator3 = document.getElementById("home-header-1-indicator").value;

  indicator4 = document.getElementById("home-header-0-indicator").value;

  host = this.settings.server.url;

  url = "" + host + "/home/" + indicator1 + "/" + indicator2 + "/" + indicator3 + "/" + indicator4;

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
    clearInterval(interval);
    renderNeutralityTab(data.observations1, data.percentage1);
    renderEmpowermentTab(data.observations2, data.percentage2);
    renderGenderTab(data.percentage3);
    renderPrivacyTab(data.percentage4);
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
    var path, paths, tendency, _k, _len2, _results;
    tendency = document.getElementById("home-header-0-tendency").value;
    if (parseInt(tendency) === -1) {
      percentage = 100 - percentage;
    }
    setPercentage("#tab1", percentage);
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
    for (_k = 0, _len2 = paths.length; _k < _len2; _k++) {
      path = paths[_k];
      _results.push(path.style.opacity = 0.3);
    }
    return _results;
  };

  renderEmpowermentTab = function(observations, percentage) {
    var circle, circleSize, circles, container, newCircle, observation, r, sorter, svg, tendency, valueCircle, _k, _l, _len2, _len3, _ref, _results;
    tendency = document.getElementById("home-header-1-tendency").value;
    if (parseInt(tendency) === -1) {
      percentage = 100 - percentage;
    }
    setPercentage("#tab2", percentage);
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
    circles = document.querySelector(".infographic-circles .circle");
    for (_k = 0, _len2 = circles.length; _k < _len2; _k++) {
      circle = circles[_k];
      container.removeChild(circle);
    }
    _results = [];
    for (_l = 0, _len3 = observations.length; _l < _len3; _l++) {
      observation = observations[_l];
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
      _results.push((_ref = newCircle.querySelector(".country")) != null ? _ref.innerHTML = observation.area : void 0);
    }
    return _results;
  };

  renderGenderTab = function(percentage) {
    var container, element, icon, iconSrc, img, p, ps, row, tendency, _k, _l, _len2, _ref, _results;
    tendency = document.getElementById("home-header-2-tendency").value;
    if (parseInt(tendency) === -1) {
      percentage = 100 - percentage;
    }
    setPercentage("#tab3", percentage);
    if ((_ref = document.getElementById("gender-percentage")) != null) {
      if (_ref.innerHTML == null) {
        _ref.innerHTML = "" + percentage + "%";
      }
    }
    container = document.querySelector(".infographic-percentage");
    ps = document.querySelectorAll(".infographic-percentage p");
    for (_k = 0, _len2 = ps.length; _k < _len2; _k++) {
      p = ps[_k];
      container.removeChild(p);
    }
    icon = document.querySelector(".infographic-icon");
    iconSrc = icon.src;
    count = 1;
    _results = [];
    for (row = _l = 0; _l <= 3; row = ++_l) {
      p = document.createElement("p");
      container.appendChild(p);
      _results.push((function() {
        var _m, _results1;
        _results1 = [];
        for (element = _m = 0; _m <= 24; element = ++_m) {
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
    var pie, tendency, _ref;
    tendency = document.getElementById("home-header-3-tendency").value;
    if (parseInt(tendency) === -1) {
      percentage = 100 - percentage;
    }
    setPercentage("#tab4", percentage);
    if ((_ref = document.getElementById("privacy-percentage")) != null) {
      if (_ref.innerHTML == null) {
        _ref.innerHTML = "" + percentage + "%";
      }
    }
    pie = document.getElementById("world-pie");
    return pie.setAttribute("percentage", percentage);
  };

  setPercentage = function(article, percentage) {
    var label, labels, _k, _len2, _results;
    labels = document.querySelectorAll("" + article + " strong.percentage");
    _results = [];
    for (_k = 0, _len2 = labels.length; _k < _len2; _k++) {
      label = labels[_k];
      _results.push(label.innerHTML = "" + percentage + "%");
    }
    return _results;
  };

}).call(this);
