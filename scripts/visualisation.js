(function() {
  var captureKeys, expand, expands, maximise, maximiseVisualisationClick, minimise, visualisations, _i, _len;

  visualisations = document.querySelectorAll(".visualisation");

  expands = document.querySelectorAll(".visualisation .expand");

  maximiseVisualisationClick = function(element) {
    return maximise(this.parentNode);
  };

  maximise = function(element) {
    var anchor, button, esc, expand;
    expand = element.querySelector(".expand");
    expand.onclick = minimise;
    button = element.querySelector("i");
    button.className = "fa fa-compress";
    anchor = element.querySelector(".expand a");
    anchor.title = "Minimise";
    element.className = element.className + " maximised";
    document.body.className = "noscroll";
    esc = element.querySelector(".esc");
    if (esc != null) {
      esc.style.opacity = 1;
    }
    if (esc != null) {
      esc.style.display = "block";
    }
    return setTimeout(function() {
      if (esc != null) {
        esc.style.opacity = 0;
      }
      return setTimeout(function() {
        var _ref;
        return (_ref = element.querySelector(".esc")) != null ? _ref.style.display = "none" : void 0;
      }, 1500);
    }, 1500);
  };

  minimise = function(element) {
    var anchor, button, expand;
    element = document.querySelector(".visualisation.maximised");
    if (!element) {
      return;
    }
    expand = element.querySelector(".expand");
    expand.onclick = maximiseVisualisationClick;
    button = element.querySelector("i");
    button.className = "fa fa-expand";
    anchor = element.querySelector(".expand a");
    anchor.title = "Maximise";
    element.className = element.className.replace(" maximised", "");
    document.body.className = "";
    anchor = element.getAttribute("data-anchor");
    if (anchor) {
      document.location.hash = "";
      return document.location.hash = anchor;
    }
  };

  for (_i = 0, _len = expands.length; _i < _len; _i++) {
    expand = expands[_i];
    expand.onclick = maximiseVisualisationClick;
  }

  captureKeys = function(evt) {
    evt = evt || window.event;
    if (evt.keyCode === 27) {
      minimise();
    }
    return evt.preventDefault();
  };

  if (document.attachEvent) {
    document.attachEvent("onkeydown", captureKeys);
  } else {
    document.addEventListener("keydown", captureKeys, false);
  }

}).call(this);
