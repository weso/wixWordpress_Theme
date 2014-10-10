(function() {
  var settings;

  settings = {
    debug: {
      debug: true,
      elapseTimeout: 100,
      server: {
        method: "JSONP",
        url: "http://localhost:5000"
      }
    },
    release: {
      debug: false,
      elapseTimeout: 0,
      server: {
        method: "JSONP",
        url: "http://localhost:5000"
      }
    },
    mode: this.mode ? this.mode : "release"
  };

  this.settings = settings[settings.mode];

}).call(this);
