(function() {
  var settings;

  settings = {
    debug: {
      debug: true,
      elapseTimeout: 100,
      server: {
        method: "JSONP",
        url: "http://intertip.webfoundation.org/api"
      }
    },
    release: {
      debug: false,
      elapseTimeout: 0,
      server: {
        method: "JSONP",
        url: "http://intertip.webfoundation.org/api"
      }
    },
    mode: this.mode ? this.mode : "release"
  };

  this.settings = settings[settings.mode];

  this.processJSONP = function(url) {
    var head, script;
    head = document.head;
    script = document.createElement("script");
    script.setAttribute("src", url);
    head.appendChild(script);
    return head.removeChild(script);
  };

  this.processAJAX = function(url, callback) {};

}).call(this);
