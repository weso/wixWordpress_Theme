(function() {
  var init;

  init = function() {
    var colour1, colour2, colourLength, colours, container, countries, i, index, intervalLength, length, options, range, _i, _j, _len, _ref, _results;
    options = {
      sortSeries: true,
      mean: {
        show: true,
        margin: 10,
        stroke: 1
      },
      median: {
        show: true,
        margin: 10,
        stroke: 1
      },
      xAxis: {
        "font-family": "'Kite One', sans-serif",
        "font-size": "14px",
        title: ""
      },
      yAxis: {
        "font-family": "'Kite One', sans-serif",
        "font-size": "12px",
        "font-colour": "#fff",
        title: ""
      },
      legend: {
        "font-family": "'Kite One', sans-serif",
        "font-size": "14px"
      },
      serieColours: ["#009ad1", "#088A68", "#9B7806", "#ffbe2c", "#084B8A"],
      valueOnItem: {
        "font-family": "Helvetica",
        "font-colour": "#fff",
        "font-size": "11px"
      }
    };
    options.xAxis.colour = "#ccc";
    countries = [
      {
        name: 'SWE',
        code: 'SWE',
        fullname: 'Sweden',
        values: [100.0],
        value: 100.0,
        continent: 'Europe'
      }, {
        name: 'NOR',
        code: 'NOR',
        fullname: 'Norway',
        values: [97.5],
        value: 97.5,
        continent: 'Europe'
      }, {
        name: 'GBR',
        code: 'GBR',
        fullname: 'United Kingdom Of Great Britain And Northern Ireland',
        values: [95.6],
        value: 95.6,
        continent: 'Europe'
      }, {
        name: 'USA',
        code: 'USA',
        fullname: 'United States Of America',
        values: [95.2],
        value: 95.2,
        continent: 'America'
      }, {
        name: 'NEW',
        code: 'NEW',
        fullname: 'New Zealand',
        values: [92.4],
        value: 92.4,
        continent: 'Oceania'
      }, {
        name: 'DEN',
        code: 'DEN',
        fullname: 'Denmark',
        values: [92.4],
        value: 92.4,
        continent: 'Europe'
      }, {
        name: 'FIN',
        code: 'FIN',
        fullname: 'Finland',
        values: [91.9],
        value: 91.9,
        continent: 'Europe'
      }, {
        name: 'ISL',
        code: 'ISL',
        fullname: 'Iceland',
        values: [91.9],
        value: 91.9,
        continent: 'Europe'
      }, {
        name: 'FRA',
        code: 'FRA',
        fullname: 'France',
        values: [90.9],
        value: 90.9,
        continent: 'Europe'
      }, {
        name: 'REP',
        code: 'REP',
        fullname: 'Republic Of Korea',
        values: [87.4],
        value: 87.4,
        continent: 'Asia'
      }, {
        name: 'AUS',
        code: 'AUS',
        fullname: 'Australia',
        values: [86.4],
        value: 86.4,
        continent: 'Oceania'
      }, {
        name: 'NET',
        code: 'NET',
        fullname: 'Netherlands',
        values: [86.4],
        value: 86.4,
        continent: 'Europe'
      }, {
        name: 'JPN',
        code: 'JPN',
        fullname: 'Japan',
        values: [86.4],
        value: 86.4,
        continent: 'Asia'
      }, {
        name: 'AUS',
        code: 'AUS',
        fullname: 'Austria',
        values: [84.8],
        value: 84.8,
        continent: 'Europe'
      }, {
        name: 'CAN',
        code: 'CAN',
        fullname: 'Canada',
        values: [84.3],
        value: 84.3,
        continent: 'America'
      }, {
        name: 'GER',
        code: 'GER',
        fullname: 'Germany',
        values: [83.1],
        value: 83.1,
        continent: 'Europe'
      }, {
        name: 'SWI',
        code: 'SWI',
        fullname: 'Switzerland',
        values: [79.3],
        value: 79.3,
        continent: 'Europe'
      }, {
        name: 'EST',
        code: 'EST',
        fullname: 'Estonia',
        values: [77.3],
        value: 77.3,
        continent: 'Europe'
      }, {
        name: 'IRL',
        code: 'IRL',
        fullname: 'Ireland',
        values: [76.0],
        value: 76.0,
        continent: 'Europe'
      }, {
        name: 'BEL',
        code: 'BEL',
        fullname: 'Belgium',
        values: [75.2],
        value: 75.2,
        continent: 'Europe'
      }, {
        name: 'POL',
        code: 'POL',
        fullname: 'Poland',
        values: [74.2],
        value: 74.2,
        continent: 'Europe'
      }, {
        name: 'ITA',
        code: 'ITA',
        fullname: 'Italy',
        values: [74.1],
        value: 74.1,
        continent: 'Europe'
      }, {
        name: 'PRT',
        code: 'PRT',
        fullname: 'Portugal',
        values: [72.8],
        value: 72.8,
        continent: 'Europe'
      }, {
        name: 'CZE',
        code: 'CZE',
        fullname: 'Czech Republic',
        values: [72.5],
        value: 72.5,
        continent: 'Europe'
      }, {
        name: 'ISR',
        code: 'ISR',
        fullname: 'Israel',
        values: [72.3],
        value: 72.3,
        continent: 'Asia'
      }, {
        name: 'GRE',
        code: 'GRE',
        fullname: 'Greece',
        values: [70.8],
        value: 70.8,
        continent: 'Europe'
      }, {
        name: 'CHL',
        code: 'CHL',
        fullname: 'Chile',
        values: [68.9],
        value: 68.9,
        continent: 'America'
      }, {
        name: 'ESP',
        code: 'ESP',
        fullname: 'Spain',
        values: [66.8],
        value: 66.8,
        continent: 'Europe'
      }, {
        name: 'URU',
        code: 'URU',
        fullname: 'Uruguay',
        values: [62.0],
        value: 62.0,
        continent: 'America'
      }, {
        name: 'MEX',
        code: 'MEX',
        fullname: 'Mexico',
        values: [61.6],
        value: 61.6,
        continent: 'America'
      }, {
        name: 'SIN',
        code: 'SIN',
        fullname: 'Singapore',
        values: [60.7],
        value: 60.7,
        continent: 'Asia'
      }, {
        name: 'COL',
        code: 'COL',
        fullname: 'Colombia',
        values: [60.1],
        value: 60.1,
        continent: 'America'
      }, {
        name: 'BRA',
        code: 'BRA',
        fullname: 'Brazil',
        values: [58.7],
        value: 58.7,
        continent: 'America'
      }, {
        name: 'COS',
        code: 'COS',
        fullname: 'Costa Rica',
        values: [57.2],
        value: 57.2,
        continent: 'America'
      }, {
        name: 'ZAF',
        code: 'ZAF',
        fullname: 'South Africa',
        values: [55.8],
        value: 55.8,
        continent: 'Africa'
      }, {
        name: 'ARG',
        code: 'ARG',
        fullname: 'Argentina',
        values: [55.2],
        value: 55.2,
        continent: 'America'
      }, {
        name: 'MAL',
        code: 'MAL',
        fullname: 'Malaysia',
        values: [53.5],
        value: 53.5,
        continent: 'Asia'
      }, {
        name: 'PHI',
        code: 'PHI',
        fullname: 'Philippines',
        values: [48.2],
        value: 48.2,
        continent: 'Asia'
      }, {
        name: 'PER',
        code: 'PER',
        fullname: 'Peru',
        values: [48.1],
        value: 48.1,
        continent: 'America'
      }, {
        name: 'MAU',
        code: 'MAU',
        fullname: 'Mauritius',
        values: [47.8],
        value: 47.8,
        continent: 'Africa'
      }, {
        name: 'RUS',
        code: 'RUS',
        fullname: 'Russian Federation',
        values: [47.1],
        value: 47.1,
        continent: 'Europe'
      }, {
        name: 'HUN',
        code: 'HUN',
        fullname: 'Hungary',
        values: [46.3],
        value: 46.3,
        continent: 'Europe'
      }, {
        name: 'ECU',
        code: 'ECU',
        fullname: 'Ecuador',
        values: [43.9],
        value: 43.9,
        continent: 'America'
      }, {
        name: 'TUN',
        code: 'TUN',
        fullname: 'Tunisia',
        values: [43.6],
        value: 43.6,
        continent: 'Africa'
      }, {
        name: 'UNI',
        code: 'UNI',
        fullname: 'United Arab Emirates',
        values: [42.7],
        value: 42.7,
        continent: 'Asia'
      }, {
        name: 'THA',
        code: 'THA',
        fullname: 'Thailand',
        values: [41.5],
        value: 41.5,
        continent: 'Asia'
      }, {
        name: 'JAM',
        code: 'JAM',
        fullname: 'Jamaica',
        values: [40.0],
        value: 40.0,
        continent: 'America'
      }, {
        name: 'IND',
        code: 'IND',
        fullname: 'Indonesia',
        values: [39.7],
        value: 39.7,
        continent: 'Asia'
      }, {
        name: 'KAZ',
        code: 'KAZ',
        fullname: 'Kazakhstan',
        values: [38.5],
        value: 38.5,
        continent: 'Asia'
      }, {
        name: 'BAH',
        code: 'BAH',
        fullname: 'Bahrain',
        values: [38.4],
        value: 38.4,
        continent: 'Asia'
      }, {
        name: 'QAT',
        code: 'QAT',
        fullname: 'Qatar',
        values: [38.0],
        value: 38.0,
        continent: 'Asia'
      }, {
        name: 'VEN',
        code: 'VEN',
        fullname: 'Venezuela (Bolivarian Republic Of)',
        values: [37.7],
        value: 37.7,
        continent: 'America'
      }, {
        name: 'KEN',
        code: 'KEN',
        fullname: 'Kenya',
        values: [36.8],
        value: 36.8,
        continent: 'Africa'
      }, {
        name: 'MAR',
        code: 'MAR',
        fullname: 'Morocco',
        values: [34.4],
        value: 34.4,
        continent: 'Africa'
      }, {
        name: 'GHA',
        code: 'GHA',
        fullname: 'Ghana',
        values: [32.7],
        value: 32.7,
        continent: 'Africa'
      }, {
        name: 'IND',
        code: 'IND',
        fullname: 'India',
        values: [32.4],
        value: 32.4,
        continent: 'Asia'
      }, {
        name: 'CHN',
        code: 'CHN',
        fullname: 'China',
        values: [31.1],
        value: 31.1,
        continent: 'Asia'
      }, {
        name: 'TUR',
        code: 'TUR',
        fullname: 'Turkey',
        values: [30.9],
        value: 30.9,
        continent: 'Asia'
      }, {
        name: 'UNI',
        code: 'UNI',
        fullname: 'United Republic Of Tanzania',
        values: [30.6],
        value: 30.6,
        continent: 'Africa'
      }, {
        name: 'NAM',
        code: 'NAM',
        fullname: 'Namibia',
        values: [30.2],
        value: 30.2,
        continent: 'Africa'
      }, {
        name: 'SEN',
        code: 'SEN',
        fullname: 'Senegal',
        values: [28.4],
        value: 28.4,
        continent: 'Africa'
      }, {
        name: 'JOR',
        code: 'JOR',
        fullname: 'Jordan',
        values: [27.1],
        value: 27.1,
        continent: 'Africa'
      }, {
        name: 'EGY',
        code: 'EGY',
        fullname: 'Egypt',
        values: [24.5],
        value: 24.5,
        continent: 'Africa'
      }, {
        name: 'BAN',
        code: 'BAN',
        fullname: 'Bangladesh',
        values: [24.4],
        value: 24.4,
        continent: 'Asia'
      }, {
        name: 'UGA',
        code: 'UGA',
        fullname: 'Uganda',
        values: [20.8],
        value: 20.8,
        continent: 'Africa'
      }, {
        name: 'ZAM',
        code: 'ZAM',
        fullname: 'Zambia',
        values: [20.4],
        value: 20.4,
        continent: 'Africa'
      }, {
        name: 'NIG',
        code: 'NIG',
        fullname: 'Nigeria',
        values: [20.2],
        value: 20.2,
        continent: 'Africa'
      }, {
        name: 'BOT',
        code: 'BOT',
        fullname: 'Botswana',
        values: [17.4],
        value: 17.4,
        continent: 'Africa'
      }, {
        name: 'SAU',
        code: 'SAU',
        fullname: 'Saudi Arabia',
        values: [16.5],
        value: 16.5,
        continent: 'Asia'
      }, {
        name: 'BEN',
        code: 'BEN',
        fullname: 'Benin',
        values: [16.1],
        value: 16.1,
        continent: 'Africa'
      }, {
        name: 'NEP',
        code: 'NEP',
        fullname: 'Nepal',
        values: [14.7],
        value: 14.7,
        continent: 'Asia'
      }, {
        name: 'VIE',
        code: 'VIE',
        fullname: 'Viet Nam',
        values: [13.8],
        value: 13.8,
        continent: 'Asia'
      }, {
        name: 'BUR',
        code: 'BUR',
        fullname: 'Burkina Faso',
        values: [13.6],
        value: 13.6,
        continent: 'Africa'
      }, {
        name: 'MAL',
        code: 'MAL',
        fullname: 'Malawi',
        values: [12.2],
        value: 12.2,
        continent: 'Africa'
      }, {
        name: 'RWA',
        code: 'RWA',
        fullname: 'Rwanda',
        values: [12.0],
        value: 12.0,
        continent: 'Africa'
      }, {
        name: 'CAM',
        code: 'CAM',
        fullname: 'Cameroon',
        values: [10.6],
        value: 10.6,
        continent: 'Africa'
      }, {
        name: 'PAK',
        code: 'PAK',
        fullname: 'Pakistan',
        values: [10.4],
        value: 10.4,
        continent: 'Asia'
      }, {
        name: 'ZIM',
        code: 'ZIM',
        fullname: 'Zimbabwe',
        values: [10.1],
        value: 10.1,
        continent: 'Africa'
      }, {
        name: 'MAL',
        code: 'MAL',
        fullname: 'Mali',
        values: [7.7],
        value: 7.7,
        continent: 'Africa'
      }, {
        name: 'ETH',
        code: 'ETH',
        fullname: 'Ethiopia',
        values: [1.8],
        value: 1.8,
        continent: 'Africa'
      }, {
        name: 'YEM',
        code: 'YEM',
        fullname: 'Yemen',
        values: [0.0],
        value: 0.0,
        continent: 'Asia'
      }
    ];
    options.series = countries;
    container = "ranking-bars";
    if ((_ref = document.getElementById(container)) != null) {
      _ref.innerHTML = "";
    }
    options.container = "\#" + container;
    options.height = document.getElementById("ranking-bars").offsetHeight;
    options.height = options.height > 0 ? options.height : "200";
    options.chartType = "bar";
    options.legend.show = false;
    options.margins = [0, 0, 25, 0];
    options.yAxis.margin = 0;
    options.valueOnItem.show = false;
    options.xAxis.values = [];
    options.mean.show = false;
    options.median.show = false;
    options.yAxis.tickColour = "none";
    options.yAxis["font-colour"] = "none";
    options.valueOnItem = {
      show: true,
      "font-size": "0.6em",
      "font-colour": "#888"
    };
    options.groupMargin = 0;
    colours = [
      {
        r: 60,
        g: 130,
        b: 131
      }, {
        r: 141,
        g: 172,
        b: 50
      }, {
        r: 131,
        g: 192,
        b: 76
      }, {
        r: 212,
        g: 207,
        b: 75
      }
    ];
    options.serieColours = [];
    index = 0;
    colourLength = colours.length;
    length = countries.length;
    intervalLength = length / (colourLength - 1);
    range = (function() {
      _results = [];
      for (var _i = 0; 0 <= intervalLength ? _i <= intervalLength : _i >= intervalLength; 0 <= intervalLength ? _i++ : _i--){ _results.push(_i); }
      return _results;
    }).apply(this);
    while (index < colourLength - 1) {
      for (_j = 0, _len = range.length; _j < _len; _j++) {
        i = range[_j];
        colour1 = colours[index];
        colour2 = colours[index + 1];
        options.serieColours.push(wesCountry.makeGradientColour(colour1, colour2, (i / intervalLength) * 100).cssColour);
      }
      index++;
    }
    options.getElementColour = function(options, element, index) {
      return options.serieColours[index];
    };
    return wesCountry.charts.chart(options);
  };

  if (window.attachEvent) {
    window.attachEvent("onresize", init);
  } else {
    window.addEventListener("resize", init, false);
  }

  setTimeout(function() {
    return init();
  }, this.settings.elapseTimeout);

}).call(this);
