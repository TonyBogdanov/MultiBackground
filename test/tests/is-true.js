(function($) {

    // Tests the _isVisible sub-routine
    // Should return true for: true, "true", 1, "1"
    // Should return false for anything else.
    QUnit.test("Method _isTrue", function(assert) {
        assert.ok("function" === typeof $.fn.multiBackground._isTrue, "_isTrue must be a function");
        assert.strictEqual($.fn.multiBackground._isTrue(true), true, "_isTrue must return true for true");
        assert.strictEqual($.fn.multiBackground._isTrue("true"), true, "_isTrue must return true for \"true\"");
        assert.strictEqual($.fn.multiBackground._isTrue(1), true, "_isTrue must return true for 1");
        assert.strictEqual($.fn.multiBackground._isTrue("1"), true, "_isTrue must return true for \"1\"");
        assert.strictEqual($.fn.multiBackground._isTrue(false), false, "_isTrue must return false for false");
        assert.strictEqual($.fn.multiBackground._isTrue("false"), false, "_isTrue must return false for \"false\"");
        assert.strictEqual($.fn.multiBackground._isTrue("random"), false, "_isTrue must return false for \"random\"");
        assert.strictEqual($.fn.multiBackground._isTrue(0), false, "_isTrue must return false for 0");
        assert.strictEqual($.fn.multiBackground._isTrue(12), false, "_isTrue must return false for 12");
        assert.strictEqual($.fn.multiBackground._isTrue("0"), false, "_isTrue must return false for \"0\"");
        assert.strictEqual($.fn.multiBackground._isTrue("12"), false, "_isTrue must return false for \"12\"");
        $.testComplete();
    });

})(jQuery);