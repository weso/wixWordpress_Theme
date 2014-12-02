  (function() {
  "use strict";

  var Equality = function(args, viz) {
    this.labels = args.labels;

    var primary = args.primary, econ = args.economic_regional;

    var data = _.map(args.equality, function(data, countryCode) {
      return {
        code: countryCode,
        name: primary[countryCode].name,
        region: econ[countryCode].region,
        econ: econ[countryCode].econ,
        income: data['gni'],
        inequality: data['gini'],
        rank: data['rank'],
        overall: data['score']
      }
    });

    // Keep countries that have no gini coefficient
    // display no-data markers for these.
    data = _.sortBy(data, function(d) {
      return -d.inequality;
    });

    var margin = this.margin = [10, 25, 25, 25],
      topLabelHeight = this.topLabelHeight = 40,
      height = viz.$el.height() - margin[0] - margin[2],
      width = viz.$el.width() - margin[1] - margin[3];

    this.width = width;

    var x = this.x = d3.scale.linear()
      .domain(d3.extent(data, function(d) {
        return d.rank
      }))
      .range([width, 0]);

    var y = this.y = d3.scale.linear()
      .domain(d3.extent(data, function(d) {
        return d.income;
      }))
      .range([height, 0]);

    var radiusDomain = _.filter(data, function(d) {
        return d.inequality;
    });

    var radius = d3.scale.sqrt()
      .domain(d3.extent(radiusDomain, function(d) {
        return d.inequality;
      }))
      .range([5, 30]);

    console.log(radius.domain());

    var svg = this.svg = d3.select('#' + viz.id)
      .append('svg')
      .attr('class', 'eq-svg')
      .attr('width', width + margin[1] + margin[3])
      .attr('height', height + margin[0] + margin[2]);

    var g = this.g = svg.append('g')
      .attr('transform', 'translate(' + margin[3] + ',' + margin[0] + ')');

    var xTicks = [
      {dy: '1em', dx: '-50px', text: this.labels['eq_low_index_score'], anchor: 'end'},
      {dy: '1em', dx: '50px', text: this.labels['eq_high_index_score'], anchor: 'start'}
    ];

    this.xTicks = g.append('g').selectAll('.xtick')
      .data(xTicks)
    .enter().append('text')
      .attr('class', 'xtick')
      .text(function(d) { return d.text; })
      .attr('transform', function(d) { return 'translate(' + [(width/2), 0] + ')'; })
      .attr('dy', function(d) { return d.dy; })
      .attr('dx', function(d) { return d.dx; })
      .attr('text-anchor', function(d) { return d.anchor; });

    var yTicks = [
      {pos: 20000, label: this.labels['eq_20k'],},
      {pos: 40000, label: this.labels['eq_40k']},
      {pos: 80000, label: this.labels['eq_80k']},
    ];

    this.yTicks = g.append('g').selectAll('.ytick')
      .data(yTicks)
    .enter().append('g')
      .attr('class', 'ytick')
      .attr('transform', function(d) { return 'translate(0,' + y(d.pos) + ')'; });

    this.yTicks.append('line')
      .attr('x1', 0).attr('x2', width)
      .attr('y1', 0).attr('y2', 0)
      .attr('class', 'eq-divider')
      .attr('stroke-dasharray', '5,5');

    this.yTicks.append('text')
      .text(function(d) { return d.label; })
      .attr('text-anchor', 'middle')
      .attr('dx', width/2 + 'px')
      .attr('dy', '-4px');

    var $tooltip = this.$tooltip = $('#eq-overlay-tip');
    var tooltipTemplate = _.template($('#eq-tooltip').html());

    var countries = this.countries = g.selectAll('.eq-country')
      .data(data)
    .enter().append('g')
      .attr('transform', function(d) {
        return 'translate(' + x(d.rank) + ',' + y(d.income) + ')';
      })
      .attr('class', 'eq-country');

    var filterByAttribute = function(match) {
      var attr = this.attribute;
      countries.attr('class', function(d) {
        return d[attr] === match ? 'eq-country' : 'eq-country eq-hide';
      })
    }.bind(this);

    var labels = this.labels, clicked = false, clickTarget, selected;
    var self = this, needReset = false, timeout;

    countries
      .on('mouseover', function(d) {
        selected = d3.select(this)

        if (self.width > 480) {
          showToolTip(d);
        }

        if (!clicked) {
          needReset = false;
          timeout = window.setTimeout(function() {
            // check if we haven't already clicked and filtered already
            if (needReset) { return; }
            needReset = true;
            filterByAttribute(d[self.attribute]);
          }, 1000)

        }
      })

      .on('mouseout', function() {
        hideToolTip();

        if (!clicked) {
          window.clearTimeout(timeout);
          if (needReset) { countries.attr('class','eq-country'); }
        }
      })

      .on('click', function(d) {

        // if already clicked, fade out last click target
        if (clicked) {
          removeHoverClass(selected);
          if (needReset) { countries.attr('class','eq-country'); }
        }

        // clicking on the current selection
        if (clickTarget === d.code) {
          clickTarget = null;
          clicked = false;
          $tooltip.hide();

          countries.attr('class','eq-country');
        }

        else {
          clicked = true;
          selected = d3.select(this)
          clickTarget = d.code;
          if (self.width > 480) {
            showToolTip(d);
          }

          needReset = true;
          filterByAttribute(d[self.attribute]);
        }
      });

    viz.$el.on('click', function(e) {
      if (clicked && e.target.nodeName !== 'circle') {
        clicked = false;
        hideToolTip();
        if (needReset) { countries.attr('class','eq-country'); }
      }
    });

    var circles = this.circles = countries.filter(function(d) {
      return d.inequality !== '';
    }).append('circle')
      .attr('r', 0);

    circles.transition()
      .duration(200)
      .delay(function(d, i) { return i * 5 })
      .attr('r', function(d) { return radius(d.inequality); });

    var crosses = this.crosses = countries.filter(function(d) {
      return d.inequality === '';
    }).append('text')
      .text('x')
      .style('opacity', 0);

    var delay = circles[0].length * 5;
    crosses.transition()
      .duration(400)
      .delay(function(d, i) { return delay + (i * 10); })
      .style('opacity', 1);

    var showToolTip = function(d) {
      var attribute = this.attribute === 'region' ?
        labels['region_translation_' + d.region] :
        labels['econ_translation_' + d.econ];

      addHoverClass(selected);

      $tooltip.html(tooltipTemplate({
        country: d.name,
        score_label: labels['eq_score_label'],
        score: d.overall.toFixed(2),
        income_label: labels["eq_gni_label"],
        income: '$' + Utility.comma(d.income),
        inequality_label: labels["eq_inequality_label"],
        inequality: (d.inequality || 'N/A'),
        sort: attribute

      })).show();
    }.bind(this);

    function hideToolTip() {
      removeHoverClass(selected);
      $tooltip.hide();
    }

    function removeHoverClass(el) {
      el.attr('class', el.attr('class').replace('hover-over', ''));
    }

    function addHoverClass(el) {
      el.attr('class', el.attr('class') + ' hover-over');
    }

  };

  Equality.prototype.resize = function() {
    var margin = this.margin,
      height = this.$el.height() - margin[0] - margin[2],
      width = this.$el.width() - margin[1] - margin[3];

    this.width = width;

    this.svg
      .attr('width', width + margin[1] + margin[3])
      .attr('height', height + margin[0] + margin[2]);

    var x = this.x, y = this.y;

    x.range([width, 0]);
    y.range([height, 0]);

    this.xTicks
      .attr('transform', function(d) { return 'translate(' + [width/2, 0] + ')'; });

    this.yTicks.select('line').attr('x2', width)
    this.yTicks.select('text').attr('dx', width/2 + 'px');

    this.yTicks
      .transition()
      .attr('transform', function(d) { return 'translate(0,' + y(d.pos) + ')'; });

    this.countries.transition()
      .attr('transform', function(d) {
        return 'translate(' + x(d.rank) + ',' + y(d.income) + ')';
      });
  }

  function init(args, viz) {
    var labels = args.labels;

    var equality = new Equality(args, viz);
    equality.$el = viz.$el;

    var $toggles = $('#eq-ui-container');
    if ($toggles.length) {
      $toggles.on('click', 'button', function() {
        var $target = $(this);
        if ($target.hasClass('selected')) { return false; }

        $toggles.find('.selected').removeClass('selected');
        $target.addClass('selected');

        equality.attribute = $target.attr('data-type');
      });
    }

    equality.attribute = 'region'

    // fill labels for UI
    var labelMap = {
      'eq-main-action': 'gn_nn_main_action',
      'eq-toggle-region': 'gn_nn_toggle_region',
      'eq-toggle-econ': 'gn_nn_toggle_econ'
    }

    _(labelMap).each(function(labelKey, selector) {
      if (labels[labelKey]) {
        $('#' + selector).html(labels[labelKey]);
      }
    })

    Utility.resize.addDispatch('equality', equality.resize, equality);

  }

  window.EqualityViz = init;
})();
