(function() {

  // TODO
  // Switch to live API urls calls
  var urls = {
    itu_pop: 'http://desolate-caverns-3750.herokuapp.com/json/ITU_pop.json',
    primary: 'http://desolate-caverns-3750.herokuapp.com/json/primary.json',
    net_neutrality: 'http://desolate-caverns-3750.herokuapp.com/json/net_neutrality.json',
    flags: 'http://desolate-caverns-3750.herokuapp.com/json/flags_local.json'
  };

  // Uses queue.js to load json async
  // https://github.com/mbostock/queue
  window.loadVizData = function(fn) {
    var q = queue();
    for (var prop in urls) {
      q.defer(d3.json, urls[prop]);
    }
    q.await(function(error, itu, primary, neutrality, flags) {
      // if (error) { console.log(error); }
      fn({itu: itu, primary: primary, neutrality: neutrality, flags: flags});
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

(function() {
  "use strict";

  // surveillance chart wrapper
  var Censorship = function(args) {
    var primary = args.primary, itu = args.itu,
      data = {};

    // keep the variables we need
    for (var key in primary) {
      data[key] = {
        pop: itu[key].Population,
        itu: itu[key].Population * itu[key].ITU / 100,
        name: key,
        censorship: 10 - primary[key]['P4'],
        surveillance: 10 - primary[key]['P9']
      };
    }

    this.itu = $('#sv-affected-itu');
    this.pop = $('#sv-affected-pop');

    this.data = data;
    // to hold the slider values
    this.metrics = {};
    return this;
  }

  // draws a map
  Censorship.prototype.draw = function() {

    var width = this.$el.width(),
      height = this.$el.height();

    var tooltip = d3.tip()
      .attr('class', 'viz-tip sv-viz-tip')
      .attr('id', 'sv-tooltip')
      .html(function(d) {
        if (!d.country) {
          return ['<h5>', d.id, '</h5><hr /><h6>No data available</h6>'].join('');
        }
        var affected = d.stat ? 'Directly affected' : 'Not directly affected';
        return ['<h5>', d.id, '</h5><h6>', Utility.prettyN(d.country.itu),
                ' internet users</h6><h6 class="sv-affected-', d.stat, '">',
                affected, '</h6><hr /><table><tbody><tr><td>', d.country.censorship,
                '</td><td>Degree of government censorship</td></tr><tr><td>', d.country.surveillance,
                '</td><td>Degree of vulnerability to government surveillance</td></tr><tr><td>',
                '</tbody</table>',
        ].join('');
      });


    var svg = this.svg = d3.select('#' + this.id).append('svg:svg')
      .attr('class', 'sv-mapbox')
      .attr('width', width)
      .attr('height', height)
      .call(tooltip);

    var mercator = this.projection = d3.geo.mercator()
      .scale((width + 1) / 2 / Math.PI)
      .translate([width / 2, height / 1.41])
      .precision(.1);

    var path = this.path = d3.geo.path().projection(mercator);

    var allCountries = this.allCountries = svg.append('g')
      .attr('class', 'sv-boundary-layer')
      .style('stroke-linejoin', 'round')
    .selectAll('path')
      .data(this.topo)
    .enter().append('path')
      .attr('class', 'sv-boundary')
      .attr('d', path)
      .on('mouseover', tooltip.show)
      .on('mouseout', tooltip.hide);

    var data = this.data;
    this.dataCountries = allCountries.filter(function(d) {
      d.country = data[d.id];
      return d.country;
    });

    this.fill();
  };

  Censorship.prototype.onDrag = function(val, name) {
    this.metrics[name] = val;
    this.fill();
  };

  Censorship.prototype.disableMetric = function(name) {
    delete this.metrics[name];
    this.fill();
  };

  Censorship.prototype.fill = function() {
    var metrics = this.metrics,
      itu = 0;
      //pop = 0;
    this.dataCountries.transition()
      .duration(200)
      .style('fill', function(d) {
        // all metrics are less than, or under, the filters
        if (_.every(metrics, function(v, m) { return d.country[m] < v; })) {
          d.stat = false;
          return '#909090';
        } else {
          d.stat = true;
          //pop += d.country.pop;
          itu += d.country.itu;
          return '#222';
        }
      });

    this.itu.text(Utility.prettyN(itu));
    //this.pop.text(Utility.prettyN(pop));
  };

  Censorship.prototype.resize = function(args) {
    var width = this.$el.width(),
      height = this.$el.height();

    this.svg.attr('width', width).attr('height', height);

    this.projection.scale((width + 1) / 2 / Math.PI)
      .translate([width / 2, height / 1.41])

    this.path.projection(this.projection);
    this.allCountries.attr('d', this.path);
  };

  var SliderUI = function(options) {

    var $el = $('#' + options.id),
      $slider = $el.find('.slider'),
      $label = $el.find('.sv-filter-indicator'),
      $toggle = $el.find('.disable-toggle'),
      active = true;

    $slider.noUiSlider({
      start: [ options.start ],
      step: 1,
      range: options.range
    });

    $label.text(options.start + '/10');

    $slider.on('slide', function() {
      var val = Math.round($slider.val());
      $label.text(val + '/10');
      options.dragFn(val, options.name);
    });

    $toggle.click(function() {
      if (active) {
        $slider.attr('disabled', 'disabled');
        $el.addClass('sv-disabled');
        options.stopFn(options.name);
      } else {
        $slider.removeAttr('disabled');
        $el.removeClass('sv-disabled');
        options.dragFn(Math.round($slider.val()), options.name);
      }
      active = !active;
    });
  };


  // called from base.js when the proper id exists on the page
  var init = function (args, settings) {

    // create a new instance of the surveillance chart
    var surveillance = new Censorship(args);
    surveillance.id = settings.id
    surveillance.$el = settings.$el;

    // binding
    var resize = surveillance.resize.bind(surveillance),
      remove = surveillance.disableMetric.bind(surveillance),
      drag = surveillance.onDrag.bind(surveillance);

    // listen for page resize
    Utility.resize.addDispatch('censorship', surveillance.resize, surveillance);

    // data for initial slider position
    var sliders = [
      {id: 'censorship-slider', start: 2, name: 'censorship'},
      {id: 'surveillance-slider', start: 3, name: 'surveillance'},
    ];

    // init sliders
    _.each(sliders, function(slider) {
      slider.UI = new SliderUI({
        id: slider.id,
        start: slider.start,
        name: slider.name,
        range: {
          min: 0,
          max: 10
        },
        dragFn: Utility.debounce(drag, 400, false),
        stopFn: remove
      });

      // tell the map our initial slider values
      surveillance.metrics[slider.name] = slider.start;
    });

    // query topojson, then draw chart
    d3.json('bin/wi_name_countries.topojson', function(topo) {
      surveillance.topo = topojson.feature(topo, topo.objects.countries).features;
      surveillance.draw();
    });

  }

  window.CensorshipViz = init;
})();

(function() {

  var regionTranslation = {
    1: 'Latin America & Caribbean',
    2: 'Sub-Saharan Africa',
    3: 'Europe & Central Asia',
    4: 'Middle East & North Africa',
    5: 'East Asia & Pacific',
    6: 'Antarctica',
    7: 'South Asia',
    8: 'North America',
  };

  var econTranslation = {
    1: 'Most Developed Economy',
    2: 'Developed, Non-G7 Economy',
    3: 'Emerging Economy (Upper)',
    4: 'Emerging Economy (Middle)',
    5: 'Emerging Economy (Lower)',
    6: 'Developing Economy',
    7: 'Least Developed Economy',
  };

  var GenderViz = function() {
    return this;
  };

  GenderViz.prototype.draw = function(data, viz) {

    this.$el = viz.$el;

    var margin = this.margin = [50, 0, 40, 0],
      topLabelHeight = this.topLabelHeight = 40,
      height = viz.$el.height() - margin[0] - margin[2],
      width = viz.$el.width() - margin[1] - margin[3];

    var max = d3.max(data, function(d) { return Math.abs(d.diff); }) + 1;

    var x = this.x = d3.scale.linear()
      .domain([-max, max])
      .range([0, width]);

    var y = this.y = d3.fisheye.scale(d3.scale.linear)
      .distortion(5)
      .domain([0, data.length])
      .range([0, height]);

    var fontSize = this.fontSize = d3.scale.quantize()
      .domain([0, height])
      .range([23, 19, 17, 15, 14, 13.5, 13, 13.5, 12, 11.5, 11, 10.5, 10, 9, 8, 7]);

    var fill = this.fill = d3.scale.quantize()
      .domain([0, height])
      .range(['#141414', '#292929', '#3d3d3d', '#525252', '#666666', '#a1a1a1', '#bfbfbf', '#dcdcdc']);

    var position = this.position.bind(this);
    var svg = this.svg = d3.select('#' + viz.id).append('svg')
      .attr('class', 'gn-viz')
      .attr('width', width + margin[1] + margin[3])
      .attr('height', height + margin[0] + margin[2])
      .on('mousemove', function() { position(d3.mouse(this)); })
      .attr('stroke-dasharray', '5,5');

    svg.append('line')
      .attr('class', 'gn-viz-divide')
      .attr('x1', width/2)
      .attr('x2', width/2)
      .attr('y1', topLabelHeight)
      .attr('y2', height + margin[2] + margin[0] - topLabelHeight);

    var xLabels = [
      {text: ['Better at supporting', 'victims'], x: max/2},
      {text: ['Equal at', 'support and prosecution'], x: 0},
      {text: ['Better at prosecuting', 'perpetrators'], x: -max/2}
    ];

    this.xLabels = svg.selectAll('.gn-viz-label')
      .data(xLabels)
    .enter().append('text')
      .attr('class', 'gn-viz-label')
      .attr('transform', function(d) {
        return 'translate(' + x(d.x) + ',0)';
      })
      .attr('dy', -4);

    this.xLabels.selectAll('tspan')
      .data(function(d) { return d.text; })
    .enter().append('tspan')
      .text(function(d) { return d; })
      .attr('x', 0)
      .attr('dy', '1.2em');

    var g = svg.append('g')
      .attr('transform', 'translate(' + margin[3] + ',' + margin[0] + ')');

    // rank countries by the SUM of their indicator scores
    var ranked = _.sortBy(data, function(d) {
      return -d.overall;
    });

    // Generate the median, to create a y-axis
    var median = (ranked.length - 1) / 2,
      yLabelStart = 115,
      yLabels = [
        {text: 'Best score', y: 0},
        {text: 'Median score', y: median},
        {text: 'Worst score', y: ranked.length - 1}
      ];

    var yLabelPaths = this.yLabelPaths = g.selectAll('.y-label')
      .data(yLabels)
    .enter().append('g')
      .attr('class', 'gn-y-label')
      .attr('transform', function(d, i) { return 'translate(0,' + y(d.y) + ')'; });

    yLabelPaths.append('text')
      .text(function(d) { return d.text; })
      .attr('x', yLabelStart)
      .attr('dx', '-5px')
      .attr('dy', '4px');

    yLabelPaths.append('line')
      .attr('x1', yLabelStart)
      .attr('x2', width)
      .attr('y1', 0)
      .attr('y2', 0);

    // this is the default attribute
    var needReset = false, that = this, timeout;
    this.attribute = 'region';

    var $tooltip = this.$tooltip;

    var countries = this.countries = g.append('g')
      .attr('class', 'gn-countries')
    .selectAll('text')
      .data(ranked)
    .enter().append('text')
      .attr('text-anchor', 'middle')
      .attr('x', function(d) { return x(d.diff); })
      .text(function(d) { return d.name; })
      .on('mouseover', function(d) {
        // show tooltip immediately on hover
        $tooltip.html(toolTipHTML(d)).show();
        // if the event fires, we need to reset on mouseout
        needReset = false;
        timeout = window.setTimeout(function() {
          needReset = true;
          focusByAttribute(d[that.attribute]);
        }, 1000);
      })
      .on('mouseout', function() {
        $tooltip.hide();
        window.clearTimeout(timeout);
        if (needReset) {
          countries.style('opacity', 1)
        }
      });

    var center = [width * .5, height * .05];
    position(center);


    // Show countries in the same economic level or region;
    // if the attribute doesn't match, fade it out
    function focusByAttribute(match) {
      countries
        .each(function(d) {
          d.match = d[that.attribute] === match;
        })
        .style('opacity', function(d) {
          return d.match ? 1 : .2;
        })
        .style('fill', function(d) {
          return d.match ? '#993333' : '#999';
        });

    }

    function toolTipHTML(d) {
      return ['<label>', d.name, '</label><hr /><table><tbody><tr><td>', regionTranslation[d.region],
        '</td><td>Supports victims: ', d.support, '<span class="gn-score-', d.scores.support,
        '"> (', d.scores.support, ')</span></td></tr><tr><td>', econTranslation[d.econ],
        '</td><td>Prosecutes perpetrators: ', d.action, '<span class="gn-score-', d.scores.action,
        '"> (', d.scores.action, ')</span></td></tr></tbody</table>',
      ].join('');
    }

  };

  GenderViz.prototype.position = function(pos) {

    // account for top y margin
    pos[1] -= this.margin[0];

    // focus scale on mouse y-pos
    this.y.focus(pos[1]);

    // local variables
    var y = this.y,
      fontSize = this.fontSize,
      fill = this.fill;

    // adjust country y, font-size, and fill
    this.countries
      .attr('y', function(d, i) {
        d.y = y(i);
        return d.y;
      })
      .style('font-size', function(d) {
        d.distance = Math.abs(d.y - pos[1]);
        return fontSize(d.distance) + 'px';
      })
      .style('fill', function(d) {
        return fill(d.distance);
      });

    // adjust median, best, and worst scores
    this.yLabelPaths.attr('transform', function(d) {
      return 'translate(0,' + y(d.y) + ')';
    });

    // save current position in case screen resize
    this.pos = pos;
  }

  GenderViz.prototype.resize = function(a, b) {
    var margin = this.margin,
      height = this.$el.height() - margin[0] - margin[2],
      width = this.$el.width() - margin[1] - margin[3];

    this.svg
      .attr('width', width + margin[1] + margin[3])
      .attr('height', height + margin[0] + margin[2])
    .select('.gn-viz-divide')
      .attr('x1', width/2)
      .attr('x2', width/2)
      .attr('y2', height + margin[2] + margin[0] - this.topLabelHeight);

    this.x.range([0, width]);
    this.y.range([0, height]);

    var x = this.x,
      y = this.y;

    this.xLabels.transition()
      .duration(400)
      .attr('transform', function(d) {
        return 'translate(' + x(d.x) + ',0)';
      });

    this.fill.domain([0, height]);
    this.fontSize.domain([0, height]);

    this.position([width * .5, height * .05]);
    this.countries.transition()
      .duration(400)
      .attr('x', function(d) { return x(d.diff); })
  };

  function init(args, viz) {

    // file that contains economic levels and regions
    d3.json('bin/economic_regional.json', function(resp) {

      // create new data file containing what we need
      var data = _.map(args.primary, function(d, name) {
        var support = d['S11'], action = d['S12'];
        return {
          support: support,
          action: action,
          overall: (support + action) / 2,
          scores: {
            support: singleIndicatorScore(support),
            action: singleIndicatorScore(action),
            overall: singleIndicatorScore((support + action)/2)
          },
          diff: support - action,
          name: name,
          econ: resp[name].econ,
          region: resp[name].region
        };
      });

      // init gender viz
      var gender = new GenderViz();
      gender.$tooltip = $('#gn-overlay-tip');
      gender.draw(data, viz);

      var $toggles = $('#gn-ui-container');
      if ($toggles.length) {
        $toggles.on('click', 'button', function() {
          var $target = $(this);
          if ($target.hasClass('selected')) { return false; }

          $toggles.find('.selected').removeClass('selected');
          $target.addClass('selected');

          gender.attribute = $target.attr('data-type');
        });
      }

      // listen for page resize
      Utility.resize.addDispatch('gender', gender.resize, gender);


    });
  }

  function singleIndicatorScore(score) {
    return score <= 3 ? 'low' : score <= 7 ? 'medium' : 'high';
  }

  function doubleIndicatorScore(score) {
      return score <= 6 ? 'low' : score <= 13 ? 'medium' : 'high';
  }

  window.GenderViz = init;


})();

(function() {
  "use strict";

  var labels = {
    discrimination: 'Evidence of discrimination',
    no_discrimination: 'No evidence of discrimination',
    law: 'Has effective law and regulations',
    no_law: 'No effective law and regulations'
  }

  var Neutrality = function(args, viz) {
    this.dataset = []

    var economic_regional = _(args.economic_regional).map(function(countryVal, country) {
      return {country: country, region: countryVal.region, econ: country.econ}
    })

    var totalPop = 0;
    _(args.itu).each(function(countryVal, countryName) {
        totalPop += args.itu[countryName]['Population']*args.itu[countryName]['ITU'];
    })

    for (var country in args.neutrality) {
      if (args.itu[country]) {
        this.dataset.push({
          country: country,
          discriminates: ((args.neutrality[country]['Discriminates Traffic'].trim() === 'Yes')?1:-1),
          has_law: ((args.neutrality[country]['Has Law'].trim() === 'Yes')?1:-1),
          score: args.neutrality[country]['Score'],
          pop: args.itu[country]['Population'] * args.itu[country]['ITU']/totalPop,
          id: args.flags[country]['ID'],
          region: args.economic_regional[country]['region']
        });
      }
    }

    // ********************
    // APPEND SVG AND ELEMENTS
    // *********************

    this.svg = d3.select('#' + viz.id)
              .append('svg')
              .attr('class', 'nn-svg')

    this.svg.selectAll('rect')
            .data(this.dataset)
            .enter()
            .append('rect')
            .attr('class', 'nn-rect')
            .attr('data-name', function(d) { return d.country})

    var ne = this.svg.append('text').attr('class', 'nn-text-ne nn-text')
    ne.append('tspan').text('●').attr('class', 'nn-pos-dot')
    ne.append('tspan').attr('x', 10).attr('dy', 0).attr('dx', -20).text(labels.no_discrimination)
    ne.append('tspan').text('●').attr('dy', '20').attr('class', 'nn-pos-dot')
    ne.append('tspan').attr('x', 0).attr('dy', '20').attr('dx', -20).text(labels.law);

    var nw = this.svg.append('text').attr('class', 'nn-text-nw nn-text')
    nw.append('tspan').text('●').attr('class', 'nn-neg-dot')
    nw.append('tspan').attr('x', 0).attr('dy', 0).attr('dx', 20).text(labels.discrimination)
    nw.append('tspan').text('●').attr('dy', '20').attr('class', 'nn-pos-dot')
    nw.append('tspan').attr('x', 0).attr('dy', '20').attr('dx', 20).text(labels.law);

    var sw = this.svg.append('text').attr('class', 'nn-text-sw nn-text')
    sw.append('tspan').text('●').attr('class', 'nn-neg-dot')
    sw.append('tspan').attr('x', 0).attr('dy', 0).attr('dx', 20).text(labels.discrimination)
    sw.append('tspan').text('●').attr('dy', '20').attr('class', 'nn-neg-dot')
    sw.append('tspan').attr('x', 0).attr('dy', 20).attr('dx', 20).text(labels.no_law)

    var se = this.svg.append('text').attr('class', 'nn-text-se nn-text')
    se.append('tspan').text('●').attr('class', 'nn-pos-dot')
    se.append('tspan').attr('x', 0).attr('dy', 0).attr('dx', -20).text(labels.no_discrimination)
    se.append('tspan').text('●').attr('dy', '20').attr('class', 'nn-neg-dot')
    se.append('tspan').attr('x', 0).attr('dy', 20).attr('dx', -20).text(labels.no_law)

    // ********************
    // APPEND AXES
    // *********************

    this.svg.append("line").attr('class','nn-xLine-nw')
    this.svg.append("line").attr('class','nn-yLine-nw')

    this.svg.append("line").attr('class','nn-xLine-ne')
    this.svg.append("line").attr('class','nn-yLine-ne')

    this.svg.append("line").attr('class','nn-xLine-sw')
    this.svg.append("line").attr('class','nn-yLine-sw')

    this.svg.append("line").attr('class','nn-xLine-se')
    this.svg.append("line").attr('class','nn-yLine-se')

    // ********************
    // GROUP DATA INTO CATEGORIES
    // *********************

    this.groupBy = {}
    var groupByLaw = _(this.dataset).groupBy(function(country) {
      return country.has_law
    });

    this.groupBy[-1] = _(groupByLaw[-1]).chain().sortBy(function(country) {
      return country.score
    }).groupBy(function(country) {
      return country.discriminates
    }).value()

    this.groupBy[1] = _(groupByLaw[1]).chain().sortBy(function(country) {
      return country.score
    }).groupBy(function(country) {
      return country.discriminates
    }).value()

    this.groupByRegion = _(economic_regional).groupBy(function(country) {
      return country.region
    })

    function MaybeLen(arg) { return ((arg)?arg.length:0) }
    this.maxSetSize = Math.max(
      MaybeLen(this.groupBy[1][-1]),
      MaybeLen(this.groupBy[-1][-1]),
      MaybeLen(this.groupBy[1][1]),
      MaybeLen(this.groupBy[-1][1])
    );

    // ********************
    // INSERT FLAGS INTO SVG
    // *********************

    var FLAG_DOMAIN = 'bin/flags/';
    var FLAG_EXTENSION = '.png';
    this.svg.append('defs');
    var defs = this.svg.select('defs');
    _(args.flags).each(function(val, name) {
      defs
        .append('pattern')
        .attr('id', 'image_' + val.ID)
        .attr({
          x: 0,
          y: 0,
          'width': 1,
          'height': 1,
          'patternContentUnits': 'objectBoundingBox'
        })
        .append('image')
        .attr({
          x: -0.5,
          y: -0.5,
          width: 2,
          height: 2
        })
        .attr('xlink:href', FLAG_DOMAIN + val.Flag_Name + FLAG_EXTENSION)
    })
  };

  Neutrality.prototype.resize = function() {
    this.draw();
  }

  Neutrality.prototype.draw = function() {
    if (this.$el.width() > this.$el.height()) {
      this.width = this.$el.width();
      this.height = this.$el.height();
    } else {
      this.width = this.$el.width();
      this.height = this.$el.width() * .8;
    }

    this.svg
      .attr('width', this.width)
      .attr('height', this.height)

    var maxFittedSquares = Math.floor(Math.sqrt(this.maxSetSize)) * (this.width + this.height)/this.width;
    this.rectSize = Math.floor( Math.min( (this.width/2)/maxFittedSquares,  (this.height/2)/maxFittedSquares) );
    this.margin = this.rectSize;

    this.centerX = this.width/2;
    this.centerY = this.height/3 + this.margin/3;

    this.svg.select('#nn-tooltip-text').style('opacity', 0)

    this.box = {
      top: -this.centerY + this.margin/2,
      bottom: this.height - this.margin,
      right: this.centerX + this.width/2 - this.margin,
      left: this.centerX - this.width/2 + this.margin
    }

    // ********************
    // CREATE QUADRANT SCALE
    // *********************
    var maxRows = 8;
    var maxColumns=  12;
    this.quad = new Quadrant(maxColumns,maxRows,this.maxSetSize)
    this.quad.fill();

    var that = this;

    // ********************
    // DRAW TEXT
    // *********************

    this.svg.selectAll('.nn-text-nw tspan').attr({
      x: 0 + this.margin ,
      y: 0 + this.margin,
      'text-anchor': "start"
    })

    this.svg.selectAll('.nn-text-ne tspan').attr({
      x: this.width - this.margin,
      y: 0 + this.margin,
      'text-anchor': "end"
    })

    this.svg.selectAll('.nn-text-sw tspan').attr({
      x: 0 + this.margin,
      y: this.height - this.margin * 2,
      'text-anchor': "start"
    })

    this.svg.selectAll('.nn-text-se tspan').attr({
      x: this.width - this.margin,
      y: this.height - this.margin * 2,
      'text-anchor': "end"
    })

    // *************************
    // CHANGE SCALES AND DRAW AXES
    // **************************

    this.rightScale = d3.scale.ordinal().domain(d3.range(0,12)).rangePoints([this.centerX + this.margin/2, this.box.right]).range();
    this.leftScale = d3.scale.ordinal().domain(d3.range(0,12)).rangePoints([this.centerX - this.margin/2 - this.rectSize, this.box.left]).range();
    this.bottomScale = d3.scale.ordinal().domain(d3.range(0,12)).rangePoints([this.centerY + this.margin/2, this.box.bottom]).range();
    this.topScale = d3.scale.ordinal().domain(d3.range(0,12)).rangePoints([this.centerY - this.rectSize/2 - this.margin, this.box.top]).range();
    this.colors = d3.scale.linear().domain(d3.range(0,9)).range(colorbrewer.RdBu[10]);

    var axesMargin = this.margin / 6
    this.svg.select('.nn-xLine-nw').attr({'x1': this.centerX - axesMargin, 'x2': 0, 'y1': this.centerY - axesMargin, 'y2': this.centerY - axesMargin, 'stroke-width': 2, 'stroke': 'black'})
    this.svg.select('.nn-yLine-nw').attr({'x1': this.centerX - axesMargin, 'x2': this.centerX - axesMargin, 'y1': this.centerY - axesMargin, 'y2': 0, 'stroke-width': 2, 'stroke': 'black'})

    this.svg.select('.nn-xLine-ne').attr({'x1': this.centerX + axesMargin, 'x2': this.width, 'y1': this.centerY - axesMargin, 'y2': this.centerY - axesMargin, 'stroke-width': 2, 'stroke': 'black'})
    this.svg.select('.nn-yLine-ne').attr({'x1': this.centerX + axesMargin, 'x2': this.centerX + axesMargin, 'y1': this.centerY - axesMargin, 'y2': 0, 'stroke-width': 2, 'stroke': 'black'})

    this.svg.select('.nn-xLine-sw').attr({'x1': this.centerX - axesMargin, 'x2': 0, 'y1': this.centerY + axesMargin, 'y2': this.centerY + axesMargin, 'stroke-width': 2, 'stroke': 'black'})
    this.svg.select('.nn-yLine-sw').attr({'x1': this.centerX - axesMargin, 'x2': this.centerX - axesMargin, 'y1': this.centerY + axesMargin, 'y2':this.height, 'stroke-width': 2, 'stroke': 'black'})

    this.svg.select('.nn-xLine-se').attr({'x1': this.centerX + axesMargin, 'x2': this.width, 'y1': this.centerY + axesMargin, 'y2': this.centerY + axesMargin, 'stroke-width': 2, 'stroke': 'black'})
    this.svg.select('.nn-yLine-se').attr({'x1': this.centerX + axesMargin, 'x2': this.centerX + axesMargin, 'y1': this.centerY + axesMargin, 'y2': this.height, 'stroke-width': 2, 'stroke': 'black'})

    this.svg.selectAll('line').attr('stroke', '#b1b1b1');
    // ********************
    // DRAW SQUARES
    // *********************
    var groupBy = this.groupBy;

    this.svg.selectAll('.nn-rect')
    .attr('y', function(d) {
      var rank = that.quad.getPosition(_(groupBy[d.has_law][d.discriminates]).chain().pluck('country').map(function(country) {
        return country.toLowerCase();
      }).indexOf(d.country.toLowerCase()).value());
      if (rank) {
        var y = ((d.has_law > 0 )?that.topScale[rank.y]:that.bottomScale[rank.y])
        return y
      }
    })
    .attr('x', function(d) {
      var rank = that.quad.getPosition(_(groupBy[d.has_law][d.discriminates]).chain().pluck('country').map(function(country) {
        return country.toLowerCase();
      }).indexOf(d.country.toLowerCase()).value());
      if (rank) {
        var x = ((d.discriminates > 0)?that.leftScale[rank.x]:that.rightScale[rank.x])
        return x
      }
    })
    .attr({
      "rx": 3,
      'ry': 3,
      'width': that.rectSize,
      'height': that.rectSize,
      'fill': function(d) { return "url(#image_" + d.id+ ")"},
    })
    .style('stroke', function(d) { return that.colors(d.score)})

    // ********************
    // MOUSE EVENTS
    // *********************

    // cache selectors that you use frequently
    var $tooltip = $('#nn-overlay-tip');

    this.svg.selectAll('.nn-rect')
    .on('mouseover', function(d) {
      var tmpl = _.template($('#nn-tooltip').html())
      var discriminationText = '', lawText = ''
      if (d.has_law > 0) {
        if (d.discriminates > 0) {
          discriminationText = 'Evidence of discrimination'
          lawText = 'Has effective net neutrality law and regulations'
        } else {
          discriminationText = 'No Evidence of discrimination'
          lawText = 'Has effective net neutrality law and regulations'
        }
      } else {
        if (d.discriminates > 0) {
          discriminationText = 'Evidence of discrimination'
          lawText = 'No effective net neutrality law and regulations'
        } else {
          discriminationText = 'No Evidence of discrimination'
          lawText = 'No effective net neutrality law and regulations'
        }
      }
      $tooltip.html(tmpl({
        country: d.country,
        score: d.score,
        discriminationText: discriminationText,
        lawText: lawText
      })).show();

      that.svg.selectAll('.nn-rect').attr('class','nn-rect nn-rect-hover')
      d3.select(this).attr('class', 'nn-rect nn-rect-not-hover');

      _(that.groupByRegion[d.region]).pluck('country').forEach(function(countryName) {
        d3.select('[data-name="'+ countryName+ '"]').attr('class', 'nn-rect nn-rect-not-hover')
      })

    })
    .on('mouseout', function(d) {
      $tooltip.hide();

      that.svg.selectAll('.nn-rect').attr('class','nn-rect nn-rect-not-hover')
      that.svg.selectAll('.nn-text').transition().duration(300).style('opacity', 1);

    })

    return;
  }

  function init(args, viz) {
    d3.json('bin/economic_regional.json', function(resp) {
      args.economic_regional = resp
      var neutrality = new Neutrality(args, viz);
      neutrality.$el = viz.$el;
      Utility.resize.addDispatch('neutrality', neutrality.resize, neutrality);
      neutrality.draw();
    })

  }

  window.NeutralityViz = init;

  function Quadrant(maxRow, maxColumn, maxItems) {
    this.maxColumn = maxColumn || Infinity;
    this.maxRow = maxRow || Infinity;
    this.qu = [[0,0]];
    this.positions = {0:{x:0,y:0}};
    this.matrix = {0:{0:1}};
    this.cursor = 0;
    this.numItems = 1;

    this.fill = function() {
      while (this.qu.length > 0 && this.numItems < maxItems) {
        var item = this.qu.shift();
        var itemx = item[0], itemy = item[1];

        if (!this.matrix[itemx] || !this.matrix[itemx][itemy]) {
          this.positions[this.numItems] = {x: itemx, y: itemy};
          if (!this.matrix[itemx]) this.matrix[itemx] = {};
          this.matrix[itemx][itemy] = 1;
          this.numItems += 1;
        }
        if (itemx + 1 < maxRow) this.qu.push([itemx + 1, itemy]);
        if (itemy + 1 < maxColumn) this.qu.push([itemx, itemy + 1])
      }
    }

    this.getPosition = function(rank) {
      return this.positions[rank];
    }
  }

})();

/*

(function() {
  var Rank = function(el, type) {
    var initFn;
    switch type {
      case '':
      break;

    }
  };

  Rank.prototype.init = function() {
  };



})();

$(document).on('ready', function() {


});

*/
