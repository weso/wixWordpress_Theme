(function() {
  var accordionCallbacks, accordionTabs, button, buttons, container, count, element, empowermentCallback, empowermentIndicator, genderTabCallback, host, i, icon, iconSrc, illustrations, img, p, percentage, row, tab, url, year, _accordionTabs, _i, _j, _k, _l, _len, _len1, _m, _ref;

  illustrations = document.querySelectorAll(".illustrations img");

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

  _accordionTabs = document.querySelectorAll(".accordion article");

  accordionTabs = [];

  accordionCallbacks = [null, empowermentCallback, genderTabCallback, null];

  for (_j = 0, _len1 = _accordionTabs.length; _j < _len1; _j++) {
    tab = _accordionTabs[_j];
    accordionTabs.unshift(tab);
  }

  for (i = _k = 0, _ref = accordionTabs.length - 1; 0 <= _ref ? _k <= _ref : _k >= _ref; i = 0 <= _ref ? ++_k : --_k) {
    tab = accordionTabs[i];
    tab.closedPosition = tab.style.right;
    tab.openedPosition = (accordionTabs.length - 1 - i) * 10;
    tab.opened = i === accordionTabs.length - 1;
    tab.tabs = accordionTabs;
    tab.index = i;
    tab.close = function() {
      this.style.right = this.closedPosition;
      return this.opened = false;
    };
    tab.closeWithIncrement = function(increment) {
      this.style.right = increment + "%";
      return this.opened = false;
    };
    tab.open = function() {
      this.style.right = this.openedPosition + "%";
      return this.opened = true;
    };
    tab.onclick = function() {
      var increment, position, tabs, _l, _ref1;
      if (this.opened) {
        return;
      }
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
  }

  container = document.querySelector(".infographic-percentage");

  icon = document.querySelector(".infographic-icon");

  iconSrc = icon.src;

  percentage = 65;

  count = 1;

  for (row = _l = 0; _l <= 3; row = ++_l) {
    p = document.createElement("p");
    container.appendChild(p);
    for (element = _m = 0; _m <= 24; element = ++_m) {
      img = document.createElement("img");
      img.src = iconSrc;
      p.appendChild(img);
      if (count <= percentage) {
        img.className = "active";
      }
      count++;
    }
  }

  year = 2013;

  empowermentIndicator = "EMPOWERMENT";

  host = this.settings.server.url;

  url = "" + host + "/observations/" + empowermentIndicator + "/ALL/" + 2013;

  if (this.settings.server.method === "JSONP") {
    url += "?callback=getEmpowermentObservationsCallback";
    this.processJSONP(url);
  } else {
    this.processAJAX(url, getEmpowermentObservationsCallback);
  }

  this.getEmpowermentObservationsCallback = function(data) {
    var circle, circleSize, newCircle, observation, observations, r, size, sorter, svg, value, valueCircle, _len2, _n, _ref1, _results;
    if (!data.success) {
      return;
    }
    observations = data.data;
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
    _results = [];
    for (_n = 0, _len2 = observations.length; _n < _len2; _n++) {
      observation = observations[_n];
      newCircle = circle.cloneNode(true);
      newCircle.setAttribute("class", "circle");
      svg = newCircle.querySelector("svg");
      svg.setAttribute("width", circleSize);
      svg.setAttribute("height", circleSize);
      container.appendChild(newCircle);
      valueCircle = newCircle.querySelector(".circle");
      size = valueCircle.getBoundingClientRect().width;
      value = observation.values[0];
      r = size * value / 100;
      valueCircle.setAttribute("data-r", "" + r);
      valueCircle.setAttribute("r", "0");
      _results.push((_ref1 = newCircle.querySelector(".country")) != null ? _ref1.innerHTML = observation.area : void 0);
    }
    return _results;
  };

}).call(this);
