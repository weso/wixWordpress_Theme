(function() {
  var accordionCallbacks, accordionTabs, button, buttons, count, empowermentCallback, genderTabCallback, host, i, illustrations, indicator1, indicator2, indicator3, indicator4, interval, neutralityTabCallback, renderEmpowermentTab, renderGenderTab, renderNeutralityTab, renderPrivacyTab, renderTable, setPercentage, tab, url, _accordionTabs, _i, _j, _k, _len, _len1, _ref;

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

  _accordionTabs = document.querySelectorAll(".accordion article");

  accordionTabs = [];

  accordionCallbacks = [neutralityTabCallback, empowermentCallback, genderTabCallback, null];

  for (_j = 0, _len1 = _accordionTabs.length; _j < _len1; _j++) {
    tab = _accordionTabs[_j];
    accordionTabs.unshift(tab);
  }

  for (i = _k = 0, _ref = accordionTabs.length - 1; 0 <= _ref ? _k <= _ref : _k >= _ref; i = 0 <= _ref ? ++_k : --_k) {
    tab = accordionTabs[i];
    tab.closedPosition = i === accordionTabs.length - 1 ? 100 - i * 10 : 0;
    tab.openedPosition = (accordionTabs.length - 1 - i) * 10;
    tab.opened = i === accordionTabs.length - 1;
    tab.tabs = accordionTabs;
    tab.index = i;
    tab.close = function() {
      this.style.right = this.closedPosition + "%";
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
    tab.onmouseenter = function() {
      var position;
      this.rememberedPosition = this.style.right;
      position = this.opened ? this.openedPosition : this.closedPosition - 1;
      return this.style.right = position + "%";
    };
    tab.onmouseout = function() {
      if (!this.opened) {
        return this.style.right = this.rememberedPosition;
      }
    };
  }

  interval = setInterval(function() {
    var number1, number2, _l, _results;
    _results = [];
    for (i = _l = 0; _l <= 4; i = ++_l) {
      number1 = Math.floor(Math.random() * 10);
      number2 = Math.floor(Math.random() * 10);
      _results.push(setPercentage("#tab" + i, "" + number1 + number2));
    }
    return _results;
  }, 40);

  indicator1 = "INDEX";

  indicator2 = "INDEX";

  indicator3 = "INDEX";

  indicator4 = "INDEX";

  host = this.settings.server.url;

  url = "" + host + "/home/" + indicator1 + "/" + indicator2 + "/" + indicator3 + "/" + indicator4;

  if (this.settings.server.method === "JSONP") {
    url += "?callback=getDataCallback";
    this.processJSONP(url);
  } else {
    this.processAJAX(url, getDataCallback);
  }

  this.getDataCallback = function(data) {
    clearInterval(interval);
    renderTable(data.rankings);
    renderNeutralityTab(data.observations1, data.percentage1);
    renderEmpowermentTab(data.observations2, data.percentage2);
    renderGenderTab(data.percentage3);
    return renderPrivacyTab(data.percentage4);
  };

  renderTable = function(data) {
    var area, country, empowerment, flag, freedom_openness, index, p, path, rank, relevant_content, tableBody, td, tr, universal_access, value, values, _l, _len2, _ref1;
    tableBody = document.querySelector("table.ranking tbody");
    values = data.values ? data.values : [];
    path = (_ref1 = document.getElementById("path")) != null ? _ref1.value : void 0;
    count = 0;
    for (_l = 0, _len2 = values.length; _l < _len2; _l++) {
      value = values[_l];
      count++;
      if (count > 5) {
        break;
      }
      country = value["name"];
      area = value["area"];
      rank = value["rank"];
      index = value["index"];
      empowerment = value["EMPOWERMENT"];
      universal_access = value["UNIVERSAL_ACCESS"];
      freedom_openness = value["FREEDOM_&_OPENNESS"];
      relevant_content = value["RELEVANT_CONTENT_&_USE"];
      tr = document.createElement("tr");
      tableBody.appendChild(tr);
      td = document.createElement("td");
      tr.appendChild(td);
      flag = document.createElement("img");
      flag.className = "flag";
      flag.src = "" + path + "/images/flags/" + area + ".png";
      td.appendChild(flag);
      p = document.createElement("p");
      p.className = "country-name";
      p.innerHTML = country;
      td.appendChild(p);
      td = document.createElement("td");
      td.setAttribute("data-title", "Rank");
      td.innerHTML = rank;
      tr.appendChild(td);
      td = document.createElement("td");
      td.setAttribute("data-title", "Universal Access");
      tr.appendChild(td);
      td.innerHTML = universal_access.toFixed(2);
      td = document.createElement("td");
      td.setAttribute("data-title", "Relevant Content");
      tr.appendChild(td);
      td.innerHTML = relevant_content.toFixed(2);
      td = document.createElement("td");
      td.setAttribute("data-title", "Freedom And Openness");
      tr.appendChild(td);
      td.innerHTML = freedom_openness.toFixed(2);
      td = document.createElement("td");
      td.setAttribute("data-title", "Empowerment");
      tr.appendChild(td);
      td.innerHTML = empowerment.toFixed(2);
    }
    return wesCountry.table.sort.apply();
  };

  renderNeutralityTab = function(countries, percentage) {
    var path, paths, _l, _len2, _results;
    setPercentage("#tab1", percentage);
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
      colourRange: ["#E98990", "#C20310"]
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
    var circle, circleSize, container, newCircle, observation, r, size, sorter, svg, value, valueCircle, _l, _len2, _ref1, _results;
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
    _results = [];
    for (_l = 0, _len2 = observations.length; _l < _len2; _l++) {
      observation = observations[_l];
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

  renderGenderTab = function(percentage) {
    var container, element, icon, iconSrc, img, p, row, _l, _results;
    setPercentage("#tab3", percentage);
    container = document.querySelector(".infographic-percentage");
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
    var angle, cx, cy, increaseAngle, maxAngle, pie, radius, svg, total, width, x1, y1, _l, _results;
    setPercentage("#tab4", percentage);
    percentage = 100 - percentage;
    svg = document.getElementById("world");
    pie = document.getElementById("world-pie");
    width = svg.width.baseVal.value;
    cx = width / 2;
    cy = width / 2;
    radius = width / 2;
    x1 = width / 2;
    y1 = 0;
    total = 100;
    maxAngle = Math.abs(percentage / total * Math.PI * 2);
    _results = [];
    for (angle = _l = 0; _l <= maxAngle; angle = _l += 0.05) {
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
