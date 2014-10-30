(function() {

  // TODO
  // Switch to live API urls calls
  var urls = {
    itu_pop: 'http://desolate-caverns-3750.herokuapp.com/json/ITU_pop.json',
    primary: 'http://desolate-caverns-3750.herokuapp.com/json/primary.json',
    net_neutrality: 'http://desolate-caverns-3750.herokuapp.com/json/net_neutrality.json',
    flags: 'http://desolate-caverns-3750.herokuapp.com/json/flags_local.json',
    economic_regional: 'http://desolate-caverns-3750.herokuapp.com/json/economic_regional.json'
  };

  // Uses queue.js to load json async
  // https://github.com/mbostock/queue
  window.loadVizData = function(fn) {
    var q = queue();
    for (var prop in urls) {
      q.defer(d3.json, urls[prop]);
    }
    q.await(function(error, itu, primary, neutrality, flags, economic_regional) {
      // if (error) { console.log(error); }
      fn({
        itu: itu, 
        primary: primary, 
        neutrality: neutrality, 
        flags: flags, 
        economic_regional: economic_regional
      });
    });
  };

})();


// Creating some utility functions
(function() {
  window.Utility = window.Utility || {};

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var vizContext = this, args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        timeout = null;
        if (!immediate) func.apply(vizContext, args);
      }, wait);
      if (immediate && !timeout) func.apply(vizContext, args);
    };
  }
  window.Utility.debounce = debounce;

  function firstIndex(list, key, value) {
    for(var i = 0, ii = list.length; i < ii; ++i) {
      if (list[i][key] === value) {
        return i;
      }
    }
    return -1;
  }
  window.Utility.firstIndex = firstIndex;

  function comma(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  window.Utility.comma = comma;

  function prettyN(n) {
    return n > 1000000000 ? (Math.round(n / 100000000) / 10) + '-billion' :
      n > 1000000 ? (Math.round(n / 100000) / 10) + '-million' :
      comma(Math.round(n));
  }
  window.Utility.prettyN = prettyN;

  // Simple event dispatcher for window resize event
  var $window = $(window);
  var ResizeListener = function() {
    this.dispatches = {};
    var dispatch = this.dispatch.bind(this);
    $window.on('resize', debounce(dispatch, 500, false));
  };
  ResizeListener.prototype.dispatch = function() {
    _.each(this.dispatches, function(dispatch) {
      dispatch.fn.apply(dispatch.context);
    });
  };
  ResizeListener.prototype.addDispatch = function(namespace, fn, context) {
    this.dispatches[namespace] = {fn: fn, context: context};
  };
  ResizeListener.prototype.delDispatch = function(namespace) {
      delete this.dispatches[namespace];
  };
  window.Utility.resize = new ResizeListener();

})();

$(document).on('ready', function() {

  var vizlist = [
    {id: 'censorship-and-surveillance', fn: 'CensorshipViz'},
    {id: 'gender', fn: 'GenderViz'},
    {id: 'surveillance', fn: 'SurveillanceViz'},
    {id: 'neutrality-viz', fn: 'NeutralityViz'},
  ];

  loadVizData(function(resp) {
    for(var i = 0; i < vizlist.length; ++i) {
      var viz = vizlist[i];
      var $container = $('#' + viz.id);
      if ($container.length) {
        viz.$el = $container;
        window[viz.fn](resp, viz);
      }
    }
  });
});
