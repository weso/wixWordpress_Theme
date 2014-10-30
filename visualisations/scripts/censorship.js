(function() {
  "use strict";

  // surveillance chart wrapper
  var Censorship = function(args) {
    var primary = args.primary, itu = args.itu,
      totalItu = 0,
      data = {};

    // keep the variables we need
    for (var key in primary) {

      var users = itu[key].Population * itu[key].ITU / 100;
      totalItu += users;

      data[key] = {
        pop: itu[key].Population,
        itu: users,
        name: key,
        censorship: 10 - primary[key]['P4'],
        surveillance: 10 - primary[key]['P9']
      };
    }

    this.itu = $('#sv-affected-itu');
    this.countries = $('#sv-affected-countries');
    //$('#sv-total-itu').text(Utility.prettyN(totalItu));

    this.data = data;
    // to hold the slider values
    this.metrics = {};
    return this;
  }

  // draws a map
  Censorship.prototype.draw = function() {

    var width = this.$el.width(),
      height = this.$el.height();

    var svg = this.svg = d3.select('#' + this.id).append('svg:svg')
      .attr('class', 'sv-mapbox')
      .attr('width', width)
      .attr('height', height);

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
      //.on('mouseover', tooltip.show)
      //.on('mouseout', tooltip.hide);
    ;

    var data = this.data;
    this.dataCountries = allCountries.filter(function(d) {
      d.country = data[d.id];
      return d.country;
    });

    this.fill();
    // show the affected label after there's something there
    $('.sv-affected-labels').fadeIn(400);

    function toolTipHTML(d) {
      //.attr('class', 'viz-tip sv-viz-tip')
      //.attr('id', 'sv-tooltip')
      //.html(function(d) {
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
    }
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
      itu = 0, countries = 0;

    this.dataCountries.transition()
      .duration(200)
      .style('fill', function(d) {
        // all metrics are less than, or under, the filters
        if (_.every(metrics, function(v, m) { return d.country[m] < v; })) {
          d.stat = false;
          return '#909090';
        } else {
          d.stat = true;
          itu += d.country.itu;
          countries += 1;
          return '#222';
        }
      });

    this.itu.text(Utility.prettyN(itu));
    this.countries.text(countries);
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
      //$label = $el.find('.sv-filter-indicator'),
      $toggle = $el.find('.disable-toggle'),
      active = true;

    $slider.noUiSlider({
      start: [ options.start ],
      step: 1,
      range: options.range
    });

    //$label.text(options.start + '/10');

    $slider.on('slide', function() {
      var val = Math.round($slider.val());
      //$label.text(val + '/10');
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
      {id: 'censorship-slider', start: 2, name: 'censorship', key: 'P4',},
      {id: 'surveillance-slider', start: 4, name: 'surveillance', key: 'P9'},
    ];

    // init sliders
    _.each(sliders, function(slider) {
      var extent = d3.extent(_.values(args.primary), function(d) {
        return d[slider.key];
      });

      slider.UI = new SliderUI({
        id: slider.id,
        start: slider.start,
        name: slider.name,
        range: {
          min: 10 - extent[1] + 1,
          max: 10 - extent[0]
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
