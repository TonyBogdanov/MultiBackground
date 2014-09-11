(function($) {
    var tests   = [
        "api-flags",
        "is-true",
        "is-visible",
        "opacity",
        "transite"
    ];
    $.testComplete = function() {
        if(0 === tests.length) {
            return;
        }
        $('body').append($('<script src="./tests/' + tests[0] + '.js"/>'));
        tests.shift();
    };
    $.testComplete();
})(jQuery);