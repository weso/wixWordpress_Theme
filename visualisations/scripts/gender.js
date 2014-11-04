(function() {

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

    var fontSize = this.fontSize = calculateFontScale(height);

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
      {text: [this.labels["gn_xaxis_supports_1"], this.labels["gn_xaxis_supports_2"]], x: max/2},
      {text: [this.labels["gn_xaxis_equal_1"], this.labels["gn_xaxis_equal_2"]], x: 0},
      {text: [this.labels["gn_xaxis_prosecutes_1"], this.labels["gn_xaxis_prosecutes_2"]], x: -max/2}
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
        {text: this.labels["gn_yaxis_best"], y: 0},
        {text: this.labels["gn_yaxis_median"], y: median},
        {text: this.labels["gn_yaxis_worst"], y: ranked.length - 1}
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

    var that = this;
    function toolTipHTML(d) {
      return ['<label>', d.name, '</label><hr /><table><tbody><tr><td>', that.labels['region_translation_' + d.region],
        '</td><td>' + that.labels['gn_tooltip_supports']+': ', d.support, '<span class="gn-score-', d.scores.support,
        '"> (', d.scores.support, ')</span></td></tr><tr><td>', that.labels['econ_translation_' + d.econ],
        '</td><td>' + that.labels['gn_tooltip_prosecutes'] + ': ', d.action, '<span class="gn-score-', d.scores.action,
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
    var labels = args.labels;
    var econ_region = args.economic_regional;

    // create new data file containing what we need
    var data = _.map(args.primary, function(d, name) {
      var support = d['S11'], action = d['S12'];
      return {
        support: support,
        action: action,
        overall: (support + action) / 2,
        scores: {
          support: singleIndicatorScore(support, labels),
          action: singleIndicatorScore(action, labels),
          overall: singleIndicatorScore((support + action)/2, labels)
        },
        diff: support - action,
        name: name,
        econ: econ_region[name].econ,
        region: econ_region[name].region
      };
    });

    // init gender viz
    var gender = new GenderViz();
    gender.labels = args.labels;
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

    // fill labels for UI
    var labelMap = {
      'gn-main-action': 'gn_nn_main_action',
      'gn-toggle-region': 'gn_nn_toggle_region',
      'gn-toggle-econ': 'gn_nn_toggle_econ'
    }
    _(labelMap).each(function(labelKey, selector) {
      if (labels[labelKey]) {
        $('#' + selector).html(labels[labelKey]); 
      }
    })

    // listen for page resize
    Utility.resize.addDispatch('gender', gender.resize, gender);
  }

  function singleIndicatorScore(score, labels) {
    return score <= 3 ? labels['gn_tooltip_low'] : score <= 7 ? labels['gn_tooltip_medium'] : labels['gn_tooltip_high'];
  }

  function doubleIndicatorScore(score, labels) {
      return score <= 6 ? labels['gn_tooltip_low'] : score <= 13 ? labels['gn_tooltip_medium'] : labels['gn_tooltip_high'];
  }

  function calculateFontScale(height) {
    var fontSize = this.fontSize = d3.scale.quantize()
      .domain([0, height]);
    // adjust fontsize smaller if height is very small
    if (height <= 450) {
      fontSize.range([15, 14, 13.5, 13, 13.5, 12, 11.5, 11, 10.5, 10, 9, 8, 7, 6, 5, 4]);
    } else {
      fontSize.range([23, 19, 17, 15, 14, 13.5, 13, 13.5, 12, 11.5, 11, 10.5, 10, 9, 8, 7]);
    }
    return fontSize;
  }

  window.GenderViz = init;


})();
