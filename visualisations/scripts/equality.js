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

    data = this.data = _.chain(data)
      // ignore countries that don't have a GNI index value
      // in data these are empty strings
      .filter(function(d) { return d.inequality; })
      .sortBy(function(d) { return -d.inequality; })
      .value();

    var margin = this.margin = [50, 25, 50, 25],
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

    var radius = d3.scale.sqrt()
      .domain(d3.extent(data, function(d) {
        return d.inequality;
      }))
      .range([7, 40]);

    var svg = this.svg = d3.select('#' + viz.id)
      .append('svg')
      .attr('class', 'eq-svg')
      .attr('width', width + margin[1] + margin[3])
      .attr('height', height + margin[0] + margin[2]);

    var g = this.g = svg.append('g')
      .attr('transform', 'translate(' + margin[3] + ',' + margin[0] + ')');

    var xTicks = [
      {dy: '-2em', dx: '-50px', text: this.labels['eq_low_index_score'], anchor: 'end'},
      {dy: '-2em', dx: '50px', text: this.labels['eq_high_index_score'], anchor: 'start'}
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
      .attr('class', 'eq-country');

    var labels = this.labels, clicked = false, clickTarget, selected;

    var that = this, needReset = false, timeout;

    var circles = this.circles = countries.append('circle')
      .attr('class', 'eq-circle')
      .attr('data-name', function(d) { return d.code})
      .attr('r', 0)
      .attr('cx', function(d) { return x(d.rank); })
      .attr('cy', function(d) { return y(d.income); });

    var filterByAttribute = function(match) {
      var attr = this.attribute;
      circles
        .attr('class', function(d) {
          return d[attr] === match ? 'eq-circle' : 'eq-circle eq-hide';
        })
    }.bind(this);

    circles
      .on('mouseover', function(d) {
        selected = d3.select(this)

        if (that.width > 480) {
          showToolTip(d);
        }

        if (!clicked) {
          needReset = false;
          timeout = window.setTimeout(function() {
            // check if we haven't already clicked and filtered already
            if (needReset) { return; }
            needReset = true;
            filterByAttribute(d[that.attribute]);
          }, 1000)

        }
      })

      .on('mouseout', function() {
        hideToolTip();

        if (!clicked) {
          window.clearTimeout(timeout);
          if (needReset) { circles.attr('class','eq-circle'); }
        }
      })

      .on('click', function(d) {

        // if already clicked, fade out last click target
        if (clicked) {
          selected.transition()
            .duration(200)
            .style('stroke-width', '.1em');

          if (needReset) { circles.attr('class','eq-circle'); }
        }

        // clicking on the current selection
        if (clickTarget === d.code) {
          clickTarget = null;
          clicked = false;
          $tooltip.hide();

          circles.attr('class','eq-circle');
        }

        else {
          clicked = true;
          selected = d3.select(this)
          clickTarget = d.code;
          if (that.width > 480) {
            showToolTip(d);
          }

          needReset = true;
          filterByAttribute(d[that.attribute]);
        }
      });

    viz.$el.on('click', function(e) {
      if (clicked && e.target.nodeName !== 'circle') {
        clicked = false;
        hideToolTip();
        if (needReset) { circles.attr('class','eq-circle'); }
      }
    });

    circles.transition()
      .duration(200)
      .delay(function(d, i) { return i * 5 })
      .attr('r', function(d) { return radius(d.inequality); });

    var showToolTip = function(d) {
      var attribute = this.attribute === 'region' ?
        labels['region_translation_' + d.region] :
        labels['econ_translation_' + d.econ];

      selected.transition()
        .duration(200)
        .style('stroke-width', '.5em');

      $tooltip.html(tooltipTemplate({
        country: d.name,
        score_label: labels['eq_score_label'],
        score: d.overall.toFixed(2),
        income_label: labels["eq_gni_label"],
        income: '$' + Utility.comma(d.income),
        inequality_label: labels["eq_inequality_label"],
        inequality: d.inequality,
        sort: attribute

      })).show();
    }.bind(this);

    function hideToolTip() {
      selected.transition()
        .duration(200)
        .style('stroke-width', '.1em');
      $tooltip.hide();
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
      .transition()
      .attr('transform', function(d) { return 'translate(' + [width/2, 0] + ')'; })

    this.yTicks.select('line').attr('x2', width)
    this.yTicks.select('text').attr('dx', width/2 + 'px');

    this.yTicks
      .transition()
      .attr('transform', function(d) { return 'translate(0,' + y(d.pos) + ')'; });

    this.circles
      .transition()
      .attr('cx', function(d) { return x(d.rank); })
      .attr('cy', function(d) { return y(d.income); });
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
