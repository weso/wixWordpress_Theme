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
