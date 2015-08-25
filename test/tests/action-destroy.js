(function($) {

    // Tests the "destroy" action
    QUnit.test("Action destroy", function(assert) {
        var $mb = $('<div style="width:100px;height:100px;color:#fff;"/>');
        var $wr = $('<div style="width:100px;height:100px;position:absolute;top:0;left:0;"/>');
        $wr.append($mb);
        $('body').append($wr);
        
        var before  = $mb.html();
        
        $mb.multiBackground([{"type":"solid","color":"#b32e67"}], false);
        assert.ok(before !== $mb.html(), "Before create and after create HTML must be different (no content).");
        
        $mb.multiBackground({"action":"destroy"});
        
        assert.strictEqual(before, $mb.html(), "Before create and after destroy HTML must be identical (no content).");
        
        $mb.html('Some content');
        
        var before  = $mb.html();
        
        $mb.multiBackground([{"type":"solid","color":"#b32e67"}], false);
        assert.ok(before !== $mb.html(), "Before create and after create HTML must be different (some content).");
        
        $mb.multiBackground({"action":"destroy"});
        
        assert.strictEqual(before, $mb.html(), "Before create and after destroy HTML must be identical (some content).");
        
        $wr.remove();
        
        $.testComplete();
    });

})(jQuery);