// This tests that the initial state of the "API ready" flags is false
// And that the callback functions change the flags to true
QUnit.test("API flag modifications", function(assert) {
    assert.ok("function" === typeof onYouTubePlayerAPIReady);
    assert.ok("function" === typeof onGoogleMapsAPIReady);

    assert.strictEqual(mb_YouTubeAPIReady, false);
    assert.strictEqual(mb_GoogleMapsAPIReady, false);

    onYouTubePlayerAPIReady();
    assert.strictEqual(mb_YouTubeAPIReady, true);

    onGoogleMapsAPIReady();
    assert.strictEqual(mb_GoogleMapsAPIReady, true);
});