(function($) {
    var tests   = [
        "api-flags",
        "is-visible",
        "is-true"
    ];
    for(var key in tests) {
        $('body').append($('<script src="./tests/' + tests[key] + '.js"/>'));
    }
})(jQuery);