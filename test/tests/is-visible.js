(function($) {

    // Tests the _isVisible sub-routine
    QUnit.test("Method _isVisible", function(assert) {
        var $test, $body = $('body');
        assert.ok("function" === typeof $.fn.multiBackground._isVisible, "_isVisible must be a function");

        $test = $('<div style="position:absolute;top:0;left:0">Test</div>');
        $body.append($test);
        assert.strictEqual($.fn.multiBackground._isVisible($test), true, "_isVisible must return true for a visible element");
        $test.remove();

        $test = $('<div style="display:none">Test</div>');
        $body.append($test);
        assert.strictEqual($.fn.multiBackground._isVisible($test), false, "_isVisible must return false for a display:none element");
        $test.remove();

        $test = $('<div style="opacity:0">Test</div>');
        $body.append($test);
        assert.strictEqual($.fn.multiBackground._isVisible($test), false, "_isVisible must return false for a opacity:0 element");
        $test.remove();

        $test = $('<div style="position:absolute;top:10000px;left:0">Test</div>');
        $body.append($test);
        assert.strictEqual($.fn.multiBackground._isVisible($test), false, "_isVisible must return false for a completely off-canvas element (under)");
        $test.remove();

        $test1 = $('<div style="position:absolute;top:0;left:0">Test</div>');
        $test2 = $('<div style="position:absolute;top:10000px;left:0">Test2</div>');
        $body.append($test1);
        $body.append($test2);
        window.scrollTo(0, 5000);
        assert.strictEqual($.fn.multiBackground._isVisible($test1), false, "_isVisible must return false for a completely off-canvas element (above)");
        $test1.remove();
        $test2.remove();
        window.scrollTo(0, 0);

        $test = $('<div style="position:absolute;bottom:-50px;left:0;height:100px;background:red">Test</div>');
        $body.append($test);
        assert.strictEqual($.fn.multiBackground._isVisible($test), true, "_isVisible must return true for a partially off-canvas element");
        $test.remove();

        $test = $('<div style="position:absolute;top:25px;left:0;width:100px;height:50px">Test</div>');
        $test.wrap('<div style="position:relative;width:100px;height:100px;overflow:hidden"/>');
        $body.append($test.parent());
        assert.strictEqual($.fn.multiBackground._isVisible($test), true, "_isVisible must return true for a completely on-canvas element inside an overflow:hidden container");
        $test.parent().remove();

        $test = $('<div style="position:absolute;top:75px;left:0;width:100px;height:50px">Test</div>');
        $test.wrap('<div style="position:relative;width:100px;height:100px;overflow:hidden"/>');
        $body.append($test.parent());
        assert.strictEqual($.fn.multiBackground._isVisible($test), true, "_isVisible must return true for a partially off-canvas element inside an overflow:hidden container");
        $test.parent().remove();

        $test = $('<div style="position:absolute;top:200px;left:0;width:100px;height:50px;background:green">Test</div>');
        $test.wrap('<div style="position:relative;width:100px;height:100px;overflow:hidden;background:red"/>');
        $body.append($test.parent());
        assert.strictEqual($.fn.multiBackground._isVisible($test), false, "_isVisible must return false for a completely off-canvas element inside an overflow:hidden container");
        $test.parent().remove();

        $test = $('<div style="position:absolute;top:25px;left:0;width:100px;height:50px">Test</div>');
        $test.wrap('<div/>');
        $test.parent().wrap('<div style="position:relative;width:100px;height:100px;overflow:hidden"/>');
        $body.append($test.parent().parent());
        assert.strictEqual($.fn.multiBackground._isVisible($test), true, "_isVisible must return true for a completely on-canvas element inside an overflow:hidden container");
        $test.parent().parent().remove();

        $test = $('<div style="position:absolute;top:75px;left:0;width:100px;height:50px">Test</div>');
        $test.wrap('<div/>');
        $test.wrap('<div style="position:relative;width:100px;height:100px;overflow:hidden"/>');
        $body.append($test.parent().parent());
        assert.strictEqual($.fn.multiBackground._isVisible($test), true, "_isVisible must return true for a partially off-canvas element inside an overflow:hidden container");
        $test.parent().parent().remove();

        $test = $('<div style="position:absolute;top:200px;left:0;width:100px;height:50px">Test</div>');
        $test.wrap('<div/>');
        $test.wrap('<div style="position:relative;width:100px;height:100px;overflow:hidden"/>');
        $body.append($test.parent().parent());
        assert.strictEqual($.fn.multiBackground._isVisible($test), false, "_isVisible must return false for a completely off-canvas element inside an overflow:hidden container");
        $test.parent().parent().remove();

        $test1 = $('<div style="position:absolute;top:100px;left:100px;width:100px;height:100px;background:red">1</div>');
        $test2 = $('<div style="position:absolute;top:300px;left:300px;width:100px;height:100px;background:green">2</div>');
        $body.append($test1);
        $body.append($test2);
        assert.strictEqual($.fn.multiBackground._isVisible($test1, true), true, "_isVisible must return true for an element that is not overlapped by another visible element");
        $test1.remove();
        $test2.remove();

        $test1 = $('<div style="position:absolute;top:100px;left:100px;width:100px;height:100px;background:red">1</div>');
        $test2 = $('<div style="position:absolute;top:150px;left:150px;width:100px;height:100px;background:green">2</div>');
        $body.append($test1);
        $body.append($test2);
        assert.strictEqual($.fn.multiBackground._isVisible($test1, true), true, "_isVisible must return true for an element that is partially overlapped by another visible element");
        $test1.remove();
        $test2.remove();

        $test1 = $('<div style="position:absolute;top:100px;left:100px;width:100px;height:100px;background:red">1</div>');
        $test2 = $('<div style="position:absolute;top:100px;left:100px;width:100px;height:100px;background:green">2</div>');
        $body.append($test1);
        $body.append($test2);
        assert.strictEqual($.fn.multiBackground._isVisible($test1, true), false, "_isVisible must return false for an element that is completely overlapped by another visible element");
        $test1.remove();
        $test2.remove();
    });

})(jQuery);