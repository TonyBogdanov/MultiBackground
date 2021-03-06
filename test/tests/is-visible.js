(function($) {

    // Tests the _isVisible sub-routine
    QUnit.test("Method _isVisible", function(assert) {
        var $test, $test1, $test2, $test3, $body = $('body');
        assert.ok("function" === typeof $.fn.multiBackground._isVisible, "_isVisible must be a function");

        $test = $('<div style="display:none">Test</div>');
        $body.append($test);
        assert.strictEqual($.fn.multiBackground._isVisible($test), false, "_isVisible must return false for a display:none element");
        $test.remove();

        $test = $('<div>Test</div>');
        $body.append($test);
        $test.wrap('<div style="display:none"/>');
        assert.strictEqual($.fn.multiBackground._isVisible($test), false, "_isVisible must return false for an element with display:none parent");
        $test.parent().remove();

        $test = $('<div style="opacity:0">Test</div>');
        $body.append($test);
        assert.strictEqual($.fn.multiBackground._isVisible($test), false, "_isVisible must return false for an opacity:0 element");
        $test.remove();

        $test = $('<div style="opacity:0.999">Test</div>');
        $body.prepend($test);
        assert.strictEqual($.fn.multiBackground._isVisible($test), true, "_isVisible must return true for an opacity:0.999 element");
        $test.remove();

        $test = $('<div>Test</div>');
        $body.prepend($test);
        $test.wrap('<div style="opacity:0.5;"/>');
        assert.strictEqual($.fn.multiBackground._isVisible($test), true, "_isVisible must return true for an opacity:1 element with opacity:0.5 parent");
        $test.parent().remove();

        $test = $('<div>Test</div>');
        $body.append($test);
        $test.wrap('<div style="opacity:0;"/>');
        assert.strictEqual($.fn.multiBackground._isVisible($test), false, "_isVisible must return false for an opacity:1 element with opacity:0 parent");
        $test.parent().remove();

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

        $test = $('<div style="position:absolute;bottom:-50px;left:0;height:100px">Test</div>');
        $body.append($test);
        assert.strictEqual($.fn.multiBackground._isVisible($test), true, "_isVisible must return true for a partially off-canvas element");
        $test.remove();

        $test = $('<div style="position:absolute;top:25px;left:0;width:100px;height:50px">Test</div>');
        $test.wrap('<div style="position:absolute;top:0;left:0;width:100px;height:100px;overflow:hidden"/>');
        $body.append($test.parent());
        assert.strictEqual($.fn.multiBackground._isVisible($test), true, "_isVisible must return true for a completely on-canvas element inside an overflow:hidden container");
        $test.parent().remove();
        $test = $('<div style="position:absolute;top:75px;left:0;width:100px;height:50px;background:red">Test</div>');
        $test.wrap('<div style="position:absolute;top:0;left:0;width:100px;height:100px;overflow:hidden;background:yellow;"/>');
        $body.append($test.parent());
        assert.strictEqual($.fn.multiBackground._isVisible($test), true, "_isVisible must return true for a partially off-canvas element inside an overflow:hidden container");
        $test.parent().remove();

        $test = $('<div style="position:absolute;top:200px;left:0;width:100px;height:50px">Test</div>');
        $test.wrap('<div style="position:relative;width:100px;height:100px;overflow:hidden"/>');
        $body.append($test.parent());
        assert.strictEqual($.fn.multiBackground._isVisible($test), false, "_isVisible must return false for a completely off-canvas element inside an overflow:hidden container");
        $test.parent().remove();

        $test = $('<div style="position:absolute;top:0px;left:0;width:100px;height:50px;background:red;">Test</div>');
        $test.wrap('<div/>');
        $test.wrap('<div style="position:absolute;top:-25px;left:0;width:100px;height:100px;overflow:hidden"/>');
        $body.prepend($test.parent().parent());
        assert.strictEqual($.fn.multiBackground._isVisible($test), true, "_isVisible must return true for a partially off-canvas element inside an overflow:hidden container (deep)");
        $test.parent().parent().remove();

        $test = $('<div style="position:absolute;top:200px;left:0;width:100px;height:50px">Test</div>');
        $test.wrap('<div/>');
        $test.wrap('<div style="position:relative;width:100px;height:100px;overflow:hidden"/>');
        $body.append($test.parent().parent());
        assert.strictEqual($.fn.multiBackground._isVisible($test), false, "_isVisible must return false for a completely off-canvas element inside an overflow:hidden container (deep)");
        $test.parent().parent().remove();

        $test = $('<div style="position:absolute;top:25px;left:0;width:100px;height:50px">Test</div>');
        $test.wrap('<div/>');
        $test.parent().wrap('<div style="position:absolute;top:0;left:0;width:100px;height:100px;overflow:hidden"/>');
        $body.append($test.parent().parent());
        assert.strictEqual($.fn.multiBackground._isVisible($test), true, "_isVisible must return true for a completely on-canvas element inside an overflow:hidden container (deep)");
        $test.parent().parent().remove();

        $test1 = $('<div style="position:absolute;top:100px;left:100px;width:100px;height:100px">1</div>');
        $test2 = $('<div style="position:absolute;top:300px;left:300px;width:100px;height:100px">2</div>');
        $body.append($test1);
        $body.append($test2);
        assert.strictEqual($.fn.multiBackground._isVisible($test1, true), true, "_isVisible must return true for an element that is not overlapped by another visible element");
        $test1.remove();
        $test2.remove();

        $test1 = $('<div style="position:absolute;top:100px;left:100px;width:100px;height:100px">1</div>');
        $test2 = $('<div style="position:absolute;top:150px;left:150px;width:100px;height:100px">2</div>');
        $body.append($test1);
        $body.append($test2);
        assert.strictEqual($.fn.multiBackground._isVisible($test1, true), true, "_isVisible must return true for an element that is partially overlapped by another visible element");
        $test1.remove();
        $test2.remove();

        $test1 = $('<div style="position:absolute;top:100px;left:100px;width:100px;height:100px">1</div>');
        $test2 = $('<div style="position:absolute;top:100px;left:100px;width:100px;height:100px">2</div>');
        $body.append($test1);
        $body.append($test2);
        assert.strictEqual($.fn.multiBackground._isVisible($test1, true), false, "_isVisible must return false for an element that is completely overlapped by another visible element");
        $test1.remove();
        $test2.remove();

        $test1 = $('<div style="position:absolute;top:100px;left:100px;width:100px;height:100px">1</div>');
        $test2 = $('<div style="position:absolute;top:100px;left:100px;width:100px;height:100px;opacity:0.5;">2</div>');
        $body.append($test1);
        $body.append($test2);
        assert.strictEqual($.fn.multiBackground._isVisible($test1, true), true, "_isVisible must return true for an element that is completely overlapped by another visible element, which opacity is less than 1.");
        $test1.remove();
        $test2.remove();

        $test1 = $('<div style="position:absolute;top:100px;left:100px;width:100px;height:100px">1</div>');
        $test2 = $('<div style="position:absolute;top:100px;left:100px;width:100px;height:100px" data-multibackground-content>2</div>');
        $body.append($test1);
        $body.append($test2);
        assert.strictEqual($.fn.multiBackground._isVisible($test1, true), true, "_isVisible must return true for an element that is completely overlapped by another visible element marked as [data-multibackground-content]");
        $test1.remove();
        $test2.remove();

        $test1 = $('<div style="position:absolute;top:100px;left:100px;width:100px;height:100px">1</div>');
        $test2 = $('<div style="position:absolute;top:100px;left:100px;width:100px;height:100px" data-multibackground-translucent>2</div>');
        $body.append($test1);
        $body.append($test2);
        assert.strictEqual($.fn.multiBackground._isVisible($test1, true), true, "_isVisible must return true for an element that is completely overlapped by another visible element marked as [data-multibackground-translucent]");
        $test1.remove();
        $test2.remove();

        $test1 = $('<div style="position:absolute;top:100px;left:100px;width:100px;height:100px;background:red">1</div>');
        $test2 = $('<div style="position:absolute;top:0;left:0;width:100px;height:100px;background:green">2</div>');
        $test1.append($test2);
        $body.append($test1);
        assert.strictEqual($.fn.multiBackground._isVisible($test1, true), true, "_isVisible must return true for an element that is completely overlapped by another visible element, which is a direct ascendant");
        $test1.remove();

        $test1 = $('<div style="position:absolute;top:100px;left:100px;width:100px;height:100px;background:red">1</div>');
        $test2 = $('<div style="position:absolute;top:150px;left:150px;width:100px;height:100px;background:green">2</div>');
        $test3 = $('<div style="position:absolute;top:-150px;left:-150px;width:100px;height:100px;background:yellow">3</div>');
        $test2.append($test3);
        $test1.append($test2);
        $body.append($test1);
        assert.strictEqual($.fn.multiBackground._isVisible($test1, true), true, "_isVisible must return true for an element that is completely overlapped by another visible element, which is an in-direct ascendant");
        $test1.remove();

        $test = $('<div style="position:absolute;top:0;left:0">Test</div>');
        $body.append($test);
        assert.strictEqual($.fn.multiBackground._isVisible($test), true, "_isVisible must return true for a visible element");
        $test.remove();

        $.testComplete();
    });
    QUnit.asyncTest("Method _isVisible (async)", function(assert) {
        var $test, $test1, $body = $('body');

        $test = $('<div style="position:absolute;top:0;left:0;">Test</div>');
        $test1 = $('<div style="position:absolute;top:0;left:0;width:200px;height:200px;opacity:0"><div style="opacity:1">Test</div></div>');
        $body.append($test);
        $body.append($test1);
        assert.strictEqual($.fn.multiBackground._isVisible($test, true), true, "_isVisible must return true for a visible element completely covered by a opacity:0 element with opacity:1 child before _transite");
        $.fn.multiBackground._transite("linear,100", $test1, 1);
        setTimeout(function() {
            assert.strictEqual($.fn.multiBackground._isVisible($test, true), true, "_isVisible must return true for a visible element completely covered by a opacity:0 element with opacity:1 child during _transite");
        }, 50);
        setTimeout(function() {
            assert.strictEqual($.fn.multiBackground._isVisible($test, true), false, "_isVisible must return false for a visible element completely covered by a opacity:0 element with opacity:1 child after _transite");
            $test1.remove();
            $test.remove();
            QUnit.start();
        }, 150);
    });

})(jQuery);