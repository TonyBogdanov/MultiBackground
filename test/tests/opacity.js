(function($) {

    // Tests the _opacity sub-routine
    QUnit.test("Method _opacity", function(assert) {
        var $test, $body = $('body');
        assert.ok("function" === typeof $.fn.multiBackground._opacity, "_opacity must be a function");

        $test = $('<div>Test</div>');
        $body.append($test);
        assert.strictEqual($.fn.multiBackground._opacity($test), 1, "_opacity must return 1 for opacity:1 element");
        $test.remove();

        $test = $('<div style="opacity:0">Test</div>');
        $body.append($test);
        assert.strictEqual($.fn.multiBackground._opacity($test), 0, "_opacity must return 0 for opacity:0 element");
        $test.remove();

        $test = $('<div style="opacity:0.5">Test</div>');
        $body.append($test);
        assert.strictEqual($.fn.multiBackground._opacity($test), 0.5, "_opacity must return 0.5 for opacity:0.5 element");
        $test.remove();

        $test = $('<div style="opacity:0.999">Test</div>');
        $body.append($test);
        assert.strictEqual($.fn.multiBackground._opacity($test), 0.999, "_opacity must return 0.999 for opacity:0.999 element");
        $test.remove();

        $.testComplete();
    });
    QUnit.asyncTest("Method _opacity (async)", function(assert) {
        var $test, $body = $('body');

        var testJQuery = function() {
            $test = $('<div style="opacity:0">Test</div>');
            $body.append($test);
            assert.strictEqual($.fn.multiBackground._opacity($test), 0, "_opacity must return 0 for opacity:0 element before jQuery animate()");
            $test.animate({opacity: 1}, 100, function() {
                assert.strictEqual($.fn.multiBackground._opacity($test), 1, "_opacity must return 1 for opacity:0 element after jQuery animate()");
                testCSSTransition();
            });
            setTimeout(function() {
                var result = $.fn.multiBackground._opacity($test);
                assert.strictEqual(0 < result && 1 > result, true, "_opacity must return between 0 and 1 for element during jQuery animate");
            }, 50);
            $test.remove();
        };

        var testCSSTransition = function() {
            var props = ["-webkit-transition", "-moz-transition", "-ms-transition", "-o-transition", "transition"];
            var found = false;

            for(var i in props) {
                if("undefined" !== typeof $('body').css(props[i])) {
                    found = true;
                    break;
                }
            }

            if(!found) {
                QUnit.start();
                return;
            }

            $test = $('<div style="opacity:0;transition:opacity 100ms linear;-webkit-transition:opacity 100ms linear;-moz-transition:opacity 100ms linear;-ms-transition:opacity 100ms linear;-o-transition:opacity 100ms linear;">Test</div>');
            $body.append($test);
            setTimeout(function() {
                assert.strictEqual($.fn.multiBackground._opacity($test), 0, "_opacity must return 0 for opacity:0 element before CSS transition");
                $test.css('opacity', 1);
                setTimeout(function() {
                    var result = $.fn.multiBackground._opacity($test);
                    assert.strictEqual(0 < result && 1 > result, true, "_opacity must return between 0 and 1 for element during CSS transition");
                }, 50);
                setTimeout(function() {
                    assert.strictEqual($.fn.multiBackground._opacity($test), 1, "_opacity must return 1 for element after CSS transition");
                    $test.remove();
                    QUnit.start();
                }, 150);
            }, 1);
        };

        testJQuery();
    });

})(jQuery);