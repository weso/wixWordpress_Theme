(function() {

  var urls = {
    population: 'bin/population.json',
    primary: 'http://intertip.webfoundation.org/api/observations/P4,P7,P9,S11,S12,ITU_N/ALL/2013?callback=?',
    neutrality: 'bin/neutrality.json',
    equality: 'bin/gni_gini.json',
    ranks: 'http://intertip.webfoundation.org/api/observations/INDEX/ALL/2013?callback=?',
    flags: 'bin/flags_lookup.json',
    economic_regional: 'bin/economic_regional.json',
    labels: 'bin/labels.json'
  };

  // Uses queue.js to load json async
  // https://github.com/mbostock/queue
  window.loadVizData = function(fn) {
    var q = queue();

    function getData(url, cb) { $.getJSON(url, function(data) { cb(null, data); }) }
    for (var prop in urls) {
      q.defer(getData, urls[prop]);
    }

    q.await(function(error, pop, primary, neutrality, equality, ranks, flags, economic_regional, labels) {

      var indicators = {};

      //Format primary data
      _(primary.data).each(function(result) {
        if (typeof indicators[result.code] === 'undefined') {
          indicators[result.code] = {}
        }
        indicators[result.code][result.indicator] = result.value;
        indicators[result.code]['name'] = result.name;
      })

      //Format population data
      var itu = {};
      _(indicators).each(function(val, code) {
        itu[code] = {}; itu[code].ITU = indicators[code].ITU_N
      });

      _(pop).each(function(val, code) {
        if (pop[code] && itu[code]) {
          itu[code].Population = pop[code];
        }
      })

      //Format neutrality data
      _(neutrality).each(function(val, code) {
        if (indicators[code] && neutrality[code]) {
          neutrality[code]['Score'] = indicators[code].P7
        }
      })

      //Format equality data
      _(ranks.data).each(function(record) {
        if (equality[record.code]) {
          equality[record.code]['score'] = record.scored;
          equality[record.code]['rank'] = record.ranked;
        }
      })

      fn({
        itu: itu,
        primary: indicators,
        neutrality: neutrality,
        equality: equality,
        flags: flags,
        economic_regional: economic_regional,
        labels: labels
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
    return n > 1000000000 ? (Math.round(n / 100000000) / 10) + ' billion' :
      n > 1000000 ? (Math.round(n / 100000) / 10) + ' million' :
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
    {id: 'equality-viz', fn: 'EqualityViz'},
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
