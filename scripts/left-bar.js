(function() {
  var clearActive, li, _i, _len, _ref;

  $(function() {
    var leftBar, msie6, top;
    msie6 = $.browser === "msie" && $.browser.version < 7;
    leftBar = $(".left-bar");
    top = null;
    if (!msie6) {
      return $(window).scroll(function(event) {
        var y;
        if (top == null) {
          top = leftBar.offset().top;
        }
        y = $(this).scrollTop();
        if (y >= top) {
          return leftBar.addClass("fixed");
        } else {
          return leftBar.removeClass("fixed");
        }
      });
    }
  });

  $('article.text-article').scrolledIntoView().on('scrolledin', function() {
    var a, id;
    id = $(this).attr('id');
    a = document.querySelector("a[href='\#" + id + "']");
    clearActive();
    return a.parentNode.className = "active";
  }).on('scrolledout', function() {});

  clearActive = function() {
    var li, _i, _len, _ref, _results;
    _ref = document.querySelectorAll(".left-bar .tags li.active");
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      li = _ref[_i];
      _results.push(li.className = "");
    }
    return _results;
  };

  _ref = document.querySelectorAll(".left-bar .tags li");
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    li = _ref[_i];
    li.onclick = function() {
      clearActive();
      return this.className = "active";
    };
  }

}).call(this);
