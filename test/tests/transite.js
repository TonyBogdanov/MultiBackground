(function($) {

    // Tests the _transite sub-routine
    QUnit.test("Method _transite", function(assert) {
        var $test, $body = $('body');
        assert.ok("function" === typeof $.fn.multiBackground._transite, "_transite must be a function");

        var customAnimator = function($element, opacity) {
            return [$element.get(0), opacity];
        };
        $test = $('<div>Test</div>');
        $body.append($test);
        assert.deepEqual($.fn.multiBackground._transite(customAnimator, $test, 1), [$test.get(0), 1], "_transite must return whatever the passed custom animator function returns, and the custom animator should be passed the animated element and the target opacity as first and second argument");
        assert.deepEqual($.fn.multiBackground._transite("linear,100", $test, 1), {easing: "linear", duration: 100}, "_transite must return a valid object easing, duration pair for a valid string");
        assert.throws(function() {
            $.fn.multiBackground._transite(1.23, $test, 1);
        }, /Unsupported transition animator type: \"number\"/, "_transite must throw an exception for unsupported animator type");
        $.fn.multiBackground._useGPU = false;
        assert.throws(function() {
            $.fn.multiBackground._transite("nosucheasing,100", $test, 1);
        }, /Easing: nosucheasing is not defined/, "_transite must throw an exception for unsupported jQuery easing in gpu=false mode");
        $test.remove();

        $.testComplete();
    });
    QUnit.asyncTest("Method _transite (async)", function(assert) {
        var $test, $body = $('body');

        var test = function(gpu, callback) {
            if(false === gpu) {
                $.fn.multiBackground._useGPU = gpu;
            } else {
                gpu = "true, if supported by browser";
            }
            $test = $('<div style="opacity:0">Test</div>');
            $body.append($test);
            setTimeout(function() {
                assert.strictEqual($.fn.multiBackground._opacity($test), 0, "_opacity must return 0 for opacity:0 element before _transite (gpu=" + gpu + ")");
                $.fn.multiBackground._transite("linear,100", $test, 1);
                setTimeout(function() {
                    var result = $.fn.multiBackground._opacity($test);
                    assert.strictEqual(0 < result && 1 > result, true, "_opacity must return between 0 and 1 for opacity:0 element during _transite (gpu=" + gpu + ")");
                }, 50);
                setTimeout(function() {
                    assert.strictEqual($.fn.multiBackground._opacity($test), 1, "_opacity must return 1 for opacity:0 element after _transite (gpu=" + gpu + ")");
                    $test.remove();
                    callback();
                }, 150);
            }, 1);
        };

        test(true, function() {
            test(false, function() {
                QUnit.start();
            });
        });
    });

})(jQuery);