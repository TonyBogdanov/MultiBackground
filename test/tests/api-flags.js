(function($) {

    // This tests that the initial state of the "API ready" flags is false
    // And that the callback functions change the flags to true
    QUnit.test("API flag modifications", function(assert) {
        assert.ok("function" === typeof onYouTubePlayerAPIReady, "onYouTubePlayerAPIReady must be a function");
        assert.ok("function" === typeof onGoogleMapsAPIReady, "onGoogleMapsAPIReady must be a function");

        assert.strictEqual(mb_YouTubeAPIReady, false, "mb_YouTubeAPIReady must be false");
        assert.strictEqual(mb_GoogleMapsAPIReady, false, "mb_GoogleMapsAPIReady must be false");

        onYouTubePlayerAPIReady();
        assert.strictEqual(mb_YouTubeAPIReady, true, "mb_YouTubeAPIReady must be true after call to onYouTubePlayerAPIReady()");

        onGoogleMapsAPIReady();
        assert.strictEqual(mb_GoogleMapsAPIReady, true, "mb_GoogleMapsAPIReady must be true after call to onGoogleMapsAPIReady()");

        $.testComplete();
    });

})(jQuery);