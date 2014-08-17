(function($) {
    "use strict";

    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function removePreSpaces(text) {
        var lines = text.split("\n");
        var min   = 9007199254740992;
        for(var i = 0; i < lines.length; i++) {
            var res = new RegExp("^(\\s+)").exec(lines[i]);
            if(null === res || "string" !== typeof res[1] || 0 === res[1].length) {
                continue;
            }
            min = Math.min(res[1].length, min);
        }
        for(var i = 0; i < lines.length; i++) {
            lines[i] = lines[i].substring(min + 4);
        }
        return lines.join("\n").trim("\n");
    }

    function beautify(text) {
        text = removePreSpaces(escapeHtml(text));
        text = text.replace(/\s*data-/g, "\n    data-");
        return text;
    }

    $(document).ready(function() {
        $("[data-multibackground]:not(body)").each(function() {
            var $this   = $(this);
            var $parent = $this.parent();
            $parent.append("<div class=\"demo-code\"><h3>HTML only code:</h3><pre><code class=\"prettyprint linenums lang-html\">" + beautify($parent.html()) + "</code></pre><h3>JavaScript only code:</h3><pre><code class=\"prettyprint lang-javascript\">$(\"#element\").multiBackground(" + JSON.stringify($.fn.multiBackground._extractOptions($this)) + ", false);</code></pre></div>");
        });
    });
})(jQuery);