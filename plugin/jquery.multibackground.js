/**
 * MultiBackground v1.0.2
 *  - http://multibackground.tonybogdanov.com
 *  - https://github.com/TonyBogdanov/MultiBackground
 *
 * Contributors:
 *  - http://www.tonybogdanov.com
 *
 * You may use this plugin in personal or commercial projects.
 * You can modify and redistribute it freely.
 * You can include it in any packages or projects being sold, but you cannot charge for the plugin or sell it separately.
 * Attribution is appreciated, but not required :)
 */
var mb_YouTubeAPIReady = false, mb_GoogleMapsAPIReady = false;
function onYouTubePlayerAPIReady() {
    mb_YouTubeAPIReady = true;
}
function onGoogleMapsAPIReady() {
    mb_GoogleMapsAPIReady = true;
}
(function($) {
	"use strict";

	// Main plugin definition
	// Accepts a single options object or an array of option objects (if one wants to create multiple background layers) as first argument.
	// Accepts a boolean, true (default) if the plugin should run in silent mode, e.g. all errors should be only logged in the console log, or false if all errors should be "alert"-ed to the browser, as second argument.
	// NOTE: This function set "position: relative" to the parent element(s), to which it is applied and will prepend all background layer elements before any content. Call {action: destroy} to restore the element.
	$.fn.multiBackground = function(options, silent) {
		try {
            return $(this).each(function() {
                // Reference to the parent element
                var $this = $(this);

                // Test type of options variable
                switch(true) {
                    // If the param is an array, walk each element and call the plugin for it (this will, in the default case, create multiple layers)
                    case "object" === typeof options && "[object Array]" === Object.prototype.toString.call(options):
                        if(0 === options.length) {
                            throw "First argument cannot be an empty array";
                        }
                        for(var key in options) {
                            $this.multiBackground(options[key], silent);
                        }
                        return $this;

                    // If the param is an object, continue algorithm
                    case "object" === typeof options:
                        break;

                    // If nothing matched up till here, the argument is not supported
                    default:
                        throw "Unsupported type of first argument: \"" + typeof options + "\"";
                }

                // Extend default plugin options with passed
                options = $.extend(true, {}, $.fn.multiBackground._defaultOptions, options);
                if(!silent) {
                    console.log("MBINFO: The plugin will be run for the following element and options", $this, options);
                }

                // Check action, prepare parent & create layer
                if("string" !== typeof options["action"]) {
                    throw "Plugin options must specify a \"action\" param with a value of type \"string\"";
                }
                switch(options["action"]) {
                    // Prepend layer (put under all other)
                    case "prepend":
                        // Prepare parent
                        if(true !== $this.data("multibackground-prepared")) {
                            $this.data("multibackground-prepared", true);
                            $this.data("multibackground-original-position", $this.css("position"));
                            $this.css("position", "relative");
                        }

                        // Create layer element
                        var $element = $.fn.multiBackground._createLayer(options);

                        // Put as first layer
                        var $layers = $this.find('> [data-multibackground-layer]');
                        if(0 === $layers.length) {
                            $this.wrapInner("<div data-multibackground-content style=\"position: relative;\"/>");
                        }
                        $element.attr("data-multibackground-layer", 0);
                        $this.prepend($element);
                        if(0 < $layers.length) {
                            $layers.each(function(i) {
                                $(this).attr("data-multibackground-layer", i + 1);
                            });
                        }
                        break;

                    // Append layer (put above all other)
                    case "append":
                        // Prepare parent
                        if(true !== $this.data("multibackground-prepared")) {
                            $this.data("multibackground-prepared", true);
                            $this.data("multibackground-original-position", $this.css("position"));
                            $this.css("position", "relative");
                        }

                        // Create layer element
                        var $element = $.fn.multiBackground._createLayer(options);

                        // Find last layer in parent and push after it, or put as first layer
                        var $layers = $this.find('> [data-multibackground-layer]');
                        if(0 === $layers.length) {
                            $this.wrapInner("<div data-multibackground-content style=\"position: relative;\"/>");
                            $element.attr('data-multibackground-layer', 0);
                            $this.prepend($element);
                        } else {
                            $element.attr('data-multibackground-layer', $layers.length);
                            $layers.last().after($element);
                        }
                        break;

                    // Remove layer by index
                    case "remove":
                        // Get layer index
                        var index = parseInt(options["index"]);
                        if(isNaN(index)) {
                            throw "Plugin options must specify a \"index\" param with a value of type \"integer\"";
                        }

                        // Find layer by the given index, deregister callbacks and remove it
                        var $layer = $this.find("> [data-multibackground-layer=\"" + index + "\"]");
                        if(0 === $layer.length) {
                            throw "There is no MultiBackground layer for index: " + index;
                        }
                        if("function" === typeof $layer.data("multibackground-refresh")) {
                            $(window).unbind("resize scroll", $layer.data("multibackground-refresh"));
                        }
                        $layer.remove();

                        // Reindex remaining layers
                        $this.find("> [data-multibackground-layer]").each(function(i) {
                            $(this).attr('data-multibackground-layer', i);
                        });
                        break;

                    // Destroy MultiBackground structure and restore original schema
                    case "destroy":
                        // Deregister all layer callbacks & remove layers
                        $this.find("> [data-multibackground-layer]").each(function() {
                            if("function" === typeof $(this).data("multibackground-refresh")) {
                                $(window).unbind("resize scroll", $(this).data("multibackground-refresh"));
                            }
                            $(this).remove();
                        });

                        // Unwrap content
                        $this.find("> [data-multibackground-content]").contents().unwrap();

                        // Restore parent
                        $this.css("position", $this.data("multibackground-original-position"));
                        $this.removeAttr("data-multibackground-content");
                        $this.data("multibackground-prepared", false);
                        break;

                    // Start video playback
                    case "playVideo":
                        // Get layer index
                        var index = parseInt(options["index"]);
                        if(isNaN(index)) {
                            throw "Plugin options must specify a \"index\" param with a value of type \"integer\"";
                        }

                        // Find layer by the given index and signal attached player
                        var $layer = $this.find("> [data-multibackground-layer=\"" + index + "\"]");
                        $layer.data("multibackground-video-player").play();
                        break;

                    // Pause video playback
                    case "pauseVideo":
                        // Get layer index
                        var index = parseInt(options["index"]);
                        if(isNaN(index)) {
                            throw "Plugin options must specify a \"index\" param with a value of type \"integer\"";
                        }

                        // Find layer by the given index and signal attached player
                        var $layer = $this.find("> [data-multibackground-layer=\"" + index + "\"]");
                        $layer.data("multibackground-video-player").pause();
                        break;

                    // Stop video playback
                    case "stopVideo":
                        // Get layer index
                        var index = parseInt(options["index"]);
                        if(isNaN(index)) {
                            throw "Plugin options must specify a \"index\" param with a value of type \"integer\"";
                        }

                        // Find layer by the given index and signal attached player
                        var $layer = $this.find("> [data-multibackground-layer=\"" + index + "\"]");
                        $layer.data("multibackground-video-player").stop();
                        break;

                    // Mute video playback
                    case "muteVideo":
                        // Get layer index
                        var index = parseInt(options["index"]);
                        if(isNaN(index)) {
                            throw "Plugin options must specify a \"index\" param with a value of type \"integer\"";
                        }

                        // Find layer by the given index and signal attached player
                        var $layer = $this.find("> [data-multibackground-layer=\"" + index + "\"]");
                        $layer.data("multibackground-video-player").mute();
                        break;

                    // Unmute video playback
                    case "unMuteVideo":
                        // Get layer index
                        var index = parseInt(options["index"]);
                        if(isNaN(index)) {
                            throw "Plugin options must specify a \"index\" param with a value of type \"integer\"";
                        }

                        // Find layer by the given index and signal attached player
                        var $layer = $this.find("> [data-multibackground-layer=\"" + index + "\"]");
                        $layer.data("multibackground-video-player").unMute();
                        break;

                    // Unsupported action
                    default:
                        throw "Unsupported action: \"" + options["action"] + "\"";
                }
            });
		} catch(e) {
			if(false === silent) {
				alert("MBERROR: " + e);
			}
			console.log("MBERROR: " + e);
		}
	};
    
    // Initialize the plugin using values extracted from the HTML attributes of the element
    $.fn.multiBackgroundFromAttributes = function() {
        return $(this).each(function() {
            var $this   = $(this);
            var debug   = "debug" === $this.attr("data-multibackground");
            try {
                var options = $.fn.multiBackground._extractOptions($this);
                $this.multiBackground(options, !debug);
            } catch(e) {
                if(debug) {
                    alert("MBERROR: " + e);
                }
                console.log("MBERROR: " + e);
            }
        });
    };
    
    // Initialize the plugin using values extracted from the HTML attributes of an integrator element
    $.fn.multiBackgroundFromIntegrator = function() {
        return $(this).each(function() {
            var $this   = $(this);
            var debug   = "debug" === $this.attr("data-multibackground-integrator");
            try {
                var selector    = $this.attr('data-multibackground-integrator-selector');
                var options     = $.parseJSON($this.attr('data-multibackground-integrator-options'));
                $(selector).multiBackground(options, !debug);
            } catch(e) {
                if(debug) {
                    alert("MBERROR: " + e);
                }
                console.log("MBERROR: " + e);
            }
        });
    };

    // Creates a new layer element for the given options for use in the main plugin definition
    $.fn.multiBackground._createLayer = function(options) {
        // Check background type
        if("string" !== typeof options["type"]) {
            throw "Plugin options must specify a \"type\" param with a value of type \"string\"";
        }
        var $layer;
        switch(options["type"].toLowerCase()) {
            case "solid":
                $layer = $.fn.multiBackground._createSolid(options);
                break;
            case "gradient":
                $layer = $.fn.multiBackground._createGradient(options);
                break;
            case "image":
                $layer = $.fn.multiBackground._createMovable(options, $.fn.multiBackground._createImage);
                break;
            case "pattern":
                $layer = $.fn.multiBackground._createMovable(options, $.fn.multiBackground._createPattern);
                break;
            case "video":
                $layer = $.fn.multiBackground._createMovable(options, $.fn.multiBackground._createVideo);
                break;
            case "youtube":
                $layer = $.fn.multiBackground._createMovable(options, $.fn.multiBackground._createYouTube);
                break;
            case "vimeo":
                $layer = $.fn.multiBackground._createMovable(options, $.fn.multiBackground._createVimeo);
                break;
            case "iframe":
                $layer = $.fn.multiBackground._createIFrame(options);
                break;
            case "gmap":
                $layer = $.fn.multiBackground._createGMap(options);
                break;
            default:
                throw "Unsupported background type: \"" + options["type"] + "\"";
        }

        // Prepare layer
        $layer.css({"position": "absolute", "top": 0, "left": 0});
        return $layer;
    };

    // Plugin definition for type: Solid
    // Available options params and structures are as follows:
    // "color": A parseable string color representation
    $.fn.multiBackground._createSolid = function(options) {
        // Check and create a color
        if("string" !== typeof options["color"]) {
            throw "Plugin options must specify a \"color\" param with a value of type \"string\"";
        }
        var color = new MultiBackgroundColor(options["color"]);

        // Create solid color element
        var $element = $('<div/>');
        $element.css({"width": "100%", "height": "100%", "background": color.getRGBA(), "opacity": 0});
        $.fn.multiBackground._defaultOptions["loadedshowcallback"]($element);
        return $element;
    };

    // Plugin definition for type: Gradient
    // Available options params and structures are as follows:
    // "direction": A string value to specify gradient direction, possible values are: "horizontal", "vertical", "diagonalUp", "diagonalDown", "radial"
    // "points": An array of point objects, each of which have the following structure:
    // "position": A float from 0 to 1, which defines the position of the point (will be converted to %)
    // "color": A MultiBackgroundColor object
    $.fn.multiBackground._createGradient = function(options) {
        // Check direction
        if("string" !== typeof options["direction"]) {
            throw "Plugin options must specify a \"direction\" param with a value of type \"string\"";
        }
        var gType, gMoz, gWebkit, gWebkitR, gO, gMs, gW3, gIE;
        switch(options["direction"]) {
            case "horizontal":
                gType       = "linear";
                gMoz        = "left";
                gWebkit     = "left top, right top";
                gWebkitR    = "left";
                gO          = "left";
                gMs         = "left";
                gW3         = "to right";
                gIE         = "1";
                break;
            case "vertical":
                gType       = "linear";
                gMoz        = "top";
                gWebkit     = "left top, left bottom";
                gWebkitR    = "top";
                gO          = "top";
                gMs         = "top";
                gW3         = "to bottom";
                gIE         = "0";
                break;
            case "diagonalUp":
                gType       = "linear";
                gMoz        = "45deg";
                gWebkit     = "left bottom, right bottom";
                gWebkitR    = "45deg";
                gO          = "45deg";
                gMs         = "45deg";
                gW3         = "45deg";
                gIE         = "1";
                break;
            case "diagonalDown":
                gType       = "linear";
                gMoz        = "-45deg";
                gWebkit     = "left top, right bottom";
                gWebkitR    = "-45deg";
                gO          = "-45deg";
                gMs         = "-45deg";
                gW3         = "135deg";
                gIE         = "1";
                break;
            case "radial":
                gType       = "radial";
                gMoz        = "center, ellipse cover";
                gWebkit     = "radial, center center, 0px, center center, 100%";
                gWebkitR    = "center, ellipse cover";
                gO          = "center, ellipse cover";
                gMs         = "center, ellipse cover";
                gW3         = "ellipse at center";
                gIE         = "1";
                break;
            default:
                throw "Unsupported gradient direction: \"" + options["direction"] + "\"";
        }

        // Check points
        if("object" !== typeof options["points"] || "[object Array]" !== Object.prototype.toString.call(options["points"])) {
            throw "Plugin options must specify a \"points\" param with a value of type \"array\"";
        }
        if(0 === options["points"].length) {
            throw "Plugin options param \"points\" cannot be an empty array";
        }

        // Walk points and build CSS stops
        var colors = [], stopsSimple = [], stopsFull = [];
        for(var key in options["points"]) {
            var position = parseFloat(options["points"][key]["position"]) * 100;
            if(isNaN(position)) {
                throw "Each gradient point must specify a param \"position\" with a value of type \"float\"";
            }
            if("string" !== typeof options["points"][key]["color"]) {
                throw "Each gradient point must specify a param \"color\" with a value of type \"string\"";
            }
            var color = new MultiBackgroundColor(options["points"][key]["color"]);
            colors.push(color);
            stopsSimple.push(color.getRGBA() + " " + position + "%");
            stopsFull.push("color-stop(" + position + "%, " + color.getRGBA() + ")");
        }

        // Create element and apply background gradient CSS
        var $element = $("<div/>");
        $element.attr("style", "width:100%;height:100%;opacity:0;background:" + colors[0].getRGB() + ";background:-moz-" + gType + "-gradient(" + gMoz + "," + stopsSimple.join(",") + ");background:-webkit-gradient(" + gWebkit + "," + stopsFull.join(",") + ");background:-webkit-" + gType + "-gradient(" + gWebkitR + "," + stopsSimple.join(",") + ");background:-o-" + gType + "-gradient(" + gO + "," + stopsSimple.join(",") + ");background:-ms-" + gType + "-gradient(" + gMs + "," + stopsSimple.join(",") + ");background:" + gType + "-gradient(" + gW3 + "," + stopsSimple.join(",") + ");background:progid:DXImageTransform.Microsoft.gradient(startColorstr='" + colors[0].getHEX() + "',endColorstr='" + colors[colors.length - 1].getHEX() + "',GradientType=" + gIE + ")" + ";");
        $.fn.multiBackground._defaultOptions["loadedshowcallback"]($element);
        return $element;
    };

    // Plugin definition for type: Movable
    // Available options params and structures are as follows:
    // "attachment": A string value to specify attachment type, possible values are: "fixed", "static", "parallax"
    // "sizefactor": A float value to specify a size multiplier, if omitted, the default is used: 1
    // "offsetfactor" (only for "attachment": "parallax"): A float value to specify parallax offset factor (ideally from -1 to 1), 0 means no movement (if 0 works for you, do not use parallax attachment!), if omitted, the default is used: 1
    $.fn.multiBackground._createMovable = function(options, innerGenerator) {
        // Check attachment & offsets
        var offsetfactor, sizefactor;
        if("string" !== typeof options["attachment"]) {
            throw "Plugin options must specify an \"attachment\" param with a value of type \"string\"";
        }
        switch(options["attachment"]) {
            case "fixed":
            case "static":
            case "parallax":
                offsetfactor        = parseFloat(options["offsetfactor"]);
                if(isNaN(offsetfactor)) {
                    offsetfactor    = 1;
                }
                sizefactor          = parseFloat(options["sizefactor"]);
                if(isNaN(sizefactor)) {
                    sizefactor      = 1;
                }
                break;
            default:
                throw "Unsupported attachment: \"" + options["attachment"] + "\"";
        }

        // Create and prepare element
        var $element = $("<div/>");
        var $window  = $(window);
        $element.css({"width": "100%", "height": "100%", "overflow": "hidden"});

        // Attach background refresh events
        $element.data("multibackground-refresh", function() {
            if(true !== $element.data("multibackground-ready")) {
                return;
            }
            var $inner = $element.find("> [data-multibackground-inner]");
            var offset = ($window.scrollTop() + $window.height() - $element.offset().top) / ($window.height() + $element.height());
            var bounds = $.fn.multiBackground._calculateBounds($element.width(), $element.height(), $element.data("multibackground-width"), $element.data("multibackground-height"), $element.offset().top, 2 * Math.max(0, Math.min(1, offset)) - 1, offsetfactor, sizefactor, "fixed" === options["attachment"], "static" === options["attachment"]);
            $inner.css({"width": bounds["width"], "height": bounds["height"], "left": bounds["left"], "top": bounds["top"]});
        });
        $element.bind("multibackground-refresh", $element.data("multibackground-refresh"));

        // Refresh the background on window resize, scroll (except for "fixed" attachment)
        if("fixed" === options["attachment"]) {
            $window.bind("resize", $element.data("multibackground-refresh"));
        } else {
            $window.bind("resize scroll", $element.data("multibackground-refresh"));
        }

        // Return element
        return innerGenerator($element, options);
    };

    // Plugin definition for type: Image
    // Available options params and structures are as follows:
    // "url": A string value to specify source image URL
    $.fn.multiBackground._createImage = function($element, options) {
        // Check URL
        if("string" !== typeof options["url"]) {
            throw "Plugin options must specify an \"url\" param with a value of type \"string\"";
        }

        // Load image & trigger background refresh once ready
        var image = new Image();
        $(image).bind('load error', function(e) {
            $(this).unbind('load error');
            if("load" !== e.type) {
                return $(this);
            }
            var $image = $("<img src=\"" + options["url"] + "\" alt=\"\" data-multibackground-inner/>");
            $image.css({"position": "absolute", "left": 0, "top": 0, "opacity": 0});
            $element.data("multibackground-ready", true);
            $element.data("multibackground-width", image.width);
            $element.data("multibackground-height", image.height);
            $element.append($image);
            $element.triggerHandler("multibackground-refresh");
            $.fn.multiBackground._defaultOptions["loadedshowcallback"]($image);
        });
        image.src = options["url"];
        return $element;
    };

    // Plugin definition for type: Pattern
    // Available options params and structures are as follows:
    // "url": A string value to specify source image URL
    $.fn.multiBackground._createPattern = function($element, options) {
        // Check URL
        if("string" !== typeof options["url"]) {
            throw "Plugin options must specify an \"url\" param with a value of type \"string\"";
        }

        // Load image & trigger background refresh once ready
        var image = new Image();
        $(image).bind("load error", function(e) {
            $(this).unbind("load error");
            if("load" !== e.type) {
                return $(this);
            }
            var $pattern = $("<div style=\"background:url(" + options["url"] + ")\" data-multibackground-inner/>");
            $pattern.css({"position": "absolute", "left": 0, "top": 0, "opacity": 0});
            $element.data("multibackground-ready", true);
            $element.data("multibackground-width", image.width);
            $element.data("multibackground-height", image.height);
            $element.append($pattern);
            $element.triggerHandler("multibackground-refresh");
            $.fn.multiBackground._defaultOptions["loadedshowcallback"]($pattern);
        });
        image.src = options["url"];
        return $element;
    };

    // Plugin definition for type: Video
    // Available options params and structures are as follows:
    // "url": An object value to specify source video URLs, keys can be "mp4", "ogg" or "webm", at least one should be present
    // "video": An object value to specify video specific options
    $.fn.multiBackground._createVideo = function($element, options) {
        // Check URL
        if("object" !== typeof options["url"]) {
            throw "Plugin options must specify an \"url\" param with a value of type \"object\"";
        }
        if("string" !== typeof options["url"]["mp4"] && "string" !== typeof options["url"]["ogg"] && "string" !== typeof options["url"]["webm"]) {
            throw "Plugin options must specify an \"url\" param (of type \"object\") with a value of type \"string\" for at least one of the following keys: \"mp4\", \"ogg\" or \"webm\", preferable for all";
        }

        // Create video element
        var $video  = $("<video" + ($.fn.multiBackground._isTrue(options["video"]["autoplay"]) ? " autoplay" : "") + ($.fn.multiBackground._isTrue(options["video"]["loop"]) ? " loop" : "") + ($.fn.multiBackground._isTrue(options["video"]["muted"]) ? " muted" : "") + " data-multibackground-inner>" + ("string" === typeof options["url"]["mp4"] ? "<source src=\"" + options["url"]["mp4"] + "\" type=\"video/mp4\">" : "") + ("string" === typeof options["url"]["webm"] ? "<source src=\"" + options["url"]["webm"] + "\" type=\"video/webm\">" : "") + ("string" === typeof options["url"]["ogg"] ? "<source src=\"" + options["url"]["ogg"] + "\" type=\"video/ogg\">" : "") + "</video>");

        // Load video & trigger background refresh once metadata has been loaded
        $video.bind("loadedmetadata", function() {
            $video.unbind("loadedmetadata");
            $element.data("multibackground-ready", true);
            $element.data("multibackground-width", this.videoWidth);
            $element.data("multibackground-height", this.videoHeight);
            $element.triggerHandler("multibackground-refresh");
            $.fn.multiBackground._defaultOptions["loadedshowcallback"]($video);
        });

        // Prepare video & attach to element
        $video.css({"position": "absolute", "left": 0, "top": 0, "opacity": 0});
        $video.append(options["video"]["nohtml5support"]);
        $element.data("multibackground-video-player", new MultiBackgroundHTML5PlayerWrapper($video.get(0)));
        $element.append($video);
        return $element;
    };

    // Plugin definition for type: YouTube
    // Available options params and structures are as follows:
    // "id": A string value to specify source YouTube video ID
    // "video": An object value to specify video specific options
    $.fn.multiBackground._createYouTube = function($element, options) {
        // Check video id
        if("string" !== typeof options["id"]) {
            throw "Plugin options must specify an \"id\" param with a value of type \"string\"";
        }

        // Create video element
        var id      = "mbswf" + (new Date()).getTime();
        var $video  = $("<div id=\"" + id + "\"/>");

        // Load the YouTube API & wait for it to load
        if(0 === $("#youtube-api").length) {
            var $script = $("<script src=\"http://www.youtube.com/player_api\" id=\"youtube-api\"/>");
            $("script").first().before($script);
        }
        var apiLoaded = function() {
            $element.data("multibackground-video-player", new MultiBackgroundYouTubePlayerWrapper(new YT.Player(id, {
                "width": options["video"]["width"],
                "height": options["video"]["height"],
                "videoId": options["id"],
                "playerVars": {
                    "showinfo": 0,
                    "controls": 0
                },
                "events": {
                    "onReady": function(e) {
                        var $video = $("#" + id);
                        $video.attr("data-multibackground-inner", "")
                        $element.data("multibackground-ready", true);
                        $element.data("multibackground-width", options["video"]["width"]);
                        $element.data("multibackground-height", options["video"]["height"]);
                        if($.fn.multiBackground._isTrue(options["video"]["autoplay"])) {
                            e.target.playVideo()
                        } else {
                            e.target.stop();
                        }
                        if(options["video"]["muted"]) {
                            e.target.mute()
                        } else {
                            e.target.unMute();
                        }
                        $element.triggerHandler("multibackground-refresh");
                        $.fn.multiBackground._defaultOptions["loadedshowcallback"]($video);
                    },
                    "onStateChange": function(e) {
                        if(e.data === YT.PlayerState.ENDED && $.fn.multiBackground._isTrue(options["video"]["loop"])) {
                            e.target.playVideo();
                        }
                    }
                }
            })));
        };
        if(mb_YouTubeAPIReady) {
            apiLoaded();
        } else {
            var interval = setInterval(function() {
                if(mb_YouTubeAPIReady) {
                    clearInterval(interval);
                    apiLoaded();
                }
            }, 100);
        }

        // Prepare video & attach to element
        $video.css({"position": "absolute", "left": 0, "top": 0, "opacity": 0});
        $element.append($video);
        return $element;
    };

    // Plugin definition for type: Vimeo
    // Available options params and structures are as follows:
    // "id": A string value to specify source Vimeo video ID
    // "video": An object value to specify video specific options
    $.fn.multiBackground._createVimeo = function($element, options) {
        // Check video id
        if("string" !== typeof options["id"]) {
            throw "Plugin options must specify an \"id\" param with a value of type \"string\"";
        }

        // Create video element
        var $video  = $("<iframe src=\"http://player.vimeo.com/video/" + options["id"] + "?api=1&badge=0&byline=0&title=0&autoplay=" + ($.fn.multiBackground._isTrue(options["video"]["autoplay"]) ? 1 : 0) + "&loop=" + ($.fn.multiBackground._isTrue(options["video"]["loop"]) ? 1 : 0) + "\" frameborder=\"0\" webkitallowfullscreen mozallowfullscreen allowfullscreen data-multibackground-inner/>");

        // Attach listeners
        var onMessageReceived = function(e) {
            var data = JSON.parse(e.data);
            if("ready" === data.event && true !== $element.data("multibackground-ready")) {
                $video.get(0).contentWindow.postMessage({"method": "setVolume", "value": $.fn.multiBackground._isTrue(options["video"]["muted"]) ? 0 : 1}, "*");
                $element.data("multibackground-ready", true);
                $element.data("multibackground-width", options["video"]["width"]);
                $element.data("multibackground-height", options["video"]["height"]);
                $element.triggerHandler("multibackground-refresh");
                $.fn.multiBackground._defaultOptions["loadedshowcallback"]($video);
            }
        };
        if(window.addEventListener) {
            window.addEventListener("message", onMessageReceived, false);
        } else {
            window.attachEvent("onmessage", onMessageReceived, false);
        }

        // Prepare video & attach to element
        $video.css({"position": "absolute", "left": 0, "top": 0, "opacity": 0});
        $element.append($video);
        $element.data("multibackground-video-player", new MultiBackgroundVimeoPlayerWrapper($video.get(0)));
        return $element;
    };

    // Plugin definition for type: iframe
    // Available options params and structures are as follows:
    // "url": A string value to specify source iframe URL
    $.fn.multiBackground._createIFrame = function(options) {
        // Check URL
        if("string" !== typeof options["url"]) {
            throw "Plugin options must specify an \"url\" param with a value of type \"string\"";
        }

        // Create and prepare the iframe
        var $element  = $("<iframe src=\"" + options["url"] + "\"/>");
        $element.css({"width": "100%", "height": "100%", "border": 0, "opacity": 0});
        $element.bind("load", function() {
            $element.unbind("load");
            $.fn.multiBackground._defaultOptions["loadedshowcallback"]($element);
        });
        return $element;
    };

    // Plugin definition for type: gmap
    // Available options params and structures are as follows:
    // "apikey": A string value to specify google api key
    // "latitude": A float value to specify location latitude
    // "longitude": A float value to specify location longitude
    // "gmap": An object value to specify google map specific options, which (if omitted) use the default values, which are:
    // "zoom": An integer value to specify map zoom
    $.fn.multiBackground._createGMap = function(options) {
        // Check API key
        if("string" !== typeof options["apikey"]) {
            throw "Plugin options must specify an \"apikey\" param with a value of type \"string\"";
        }

        // Check latitude
        if(isNaN(parseFloat(options["latitude"]))) {
            throw "Plugin options must specify an \"latitude\" param with a value of type \"float\"";
        }

        // Check longitude
        if(isNaN(parseFloat(options["longitude"]))) {
            throw "Plugin options must specify an \"longitude\" param with a value of type \"float\"";
        }

        // Load the Google Maps API & wait for it to load
        if(0 === $("#gmaps-api").length) {
            var $script = $("<script src=\"https://maps.googleapis.com/maps/api/js?v=3&language=" + options["gmap"]["language"] + "&key=" + options["apikey"] + "&callback=onGoogleMapsAPIReady\" id=\"gmaps-api\"/>");
            $("script").first().before($script);
        }

        // Continue execution once the API has loaded & is ready
        var apiLoaded = function() {
            // Configure & create map
            var mapOptions = {
                "center": new google.maps.LatLng(parseFloat(options["latitude"]), parseFloat(options["longitude"])),
                "zoom": parseInt(options["gmap"]["zoom"])
            };
            var map = new google.maps.Map($element.get(0), mapOptions);
            if("object" === typeof options["gmap"]["marker"]) {
                var markerOptions = {
                    map: map,
                    position: "object" === typeof options["gmap"]["marker"]["position"] ? options["gmap"]["marker"]["position"] : mapOptions["center"]
                };
                if("string" === typeof options["gmap"]["marker"]["icon"]) {
                    markerOptions["icon"] = options["gmap"]["marker"]["icon"];
                }
                var marker = new google.maps.Marker(markerOptions);
            }
            $.fn.multiBackground._defaultOptions["loadedshowcallback"]($element);
        };
        if(mb_GoogleMapsAPIReady) {
            apiLoaded();
        } else {
            var interval = setInterval(function() {
                if(mb_GoogleMapsAPIReady) {
                    clearInterval(interval);
                    apiLoaded();
                }
            }, 100);
        }

        // Create and prepare the element
        var $element  = $("<div/>");
        $element.css({"width": "100%", "height": "100%", "opacity": 0});
        return $element;
    };

    // Calculates new bounds to fit element inside a parent box (touch from inside)
    $.fn.multiBackground._calculateBounds = function(boxWidth, boxHeight, elementWidth, elementHeight, elementOffsetTop, offset, offsetfactor, sizefactor, fixedAttachment, staticAttachment) {
        var $window = $(window);
        var width   = boxWidth;
        var height  = boxWidth / (elementWidth / elementHeight);
        if(height < boxHeight) {
            height  = boxHeight;
            width   = boxWidth * (elementWidth / elementHeight);
        }
        if(staticAttachment && height * sizefactor < $(window).height()) {
            sizefactor  = $window.height() / height;
        }
        width       *= sizefactor;
        height      *= sizefactor;
        var left    = (boxWidth - width) / 2;
        var top     = staticAttachment ? $window.scrollTop() - elementOffsetTop - height / 2 + $window.height() / 2 : (fixedAttachment ? (boxHeight - height) / 2 : ((boxHeight - height) / 2) * (1 + offset * offsetfactor));
        return {"width": width, "height": height, "left": left, "top": top};
    };

    // Parses the given HTML attribute name substring and value map to a structured tree object
    $.fn.multiBackground._parseMap = function(map) {
        var tree = {};
        for(var key in map) {
            var trail = key.split("-");
            var subTree = map[key];
            for(var i = trail.length - 1; i >= 0; i--) {
                var val = subTree;
                subTree = {};
                subTree[trail[i]] = val;
            }
            tree = $.extend(true, {}, tree, subTree);
        }
        return $.fn.multiBackground._parseObjectIntoArray(tree);
    };

    // Extracts a structured options object from the HTML attributes of the given element
    $.fn.multiBackground._extractOptions = function($element) {
        var regex   = new RegExp("^data\\-multibackground\\-layer\\-(.*)$");
        var map     = {};
        for(var attr, i = 0, attrs = $element.get(0).attributes, l = attrs.length; i < l; i++) {
            attr    = attrs[i];
            if(!regex.test(attr.nodeName)) {
                continue;
            }
            map[regex.exec(attr.nodeName)[1]] = attr.value;
        }
        map         = $.fn.multiBackground._parseMap(map);
        if("object" !== typeof map || "[object Array]" !== Object.prototype.toString.call(map)) {
            console.log("MBDEBUG: Parsed options map:", map);
            throw "Could not initialize MultiBackground from HTML attributes, could not parse proper options map (see console log)";
        }
        return map;
    };

    // Parses the given object (recursively) and converts objects into arrays where possible
    $.fn.multiBackground._parseObjectIntoArray = function(object) {
        if("object" !== typeof object) {
            return object;
        }
        var array = [];
        var found = true;
        var index = 0;
        for(var key in object) {
            if(index !== parseInt(key)) {
                object[key] = $.fn.multiBackground._parseObjectIntoArray(object[key]);
                found = false;
            } else {
                array.push($.fn.multiBackground._parseObjectIntoArray(object[key]));
            }
            index++;
        }
        return found ? array : object;
    };

    // Checks if the given value can be evaluated to boolean true
    $.fn.multiBackground._isTrue = function(value) {
        return true === value || "true" === value || 1 === parseInt(value);
    };

    // Video player controls wrapper for HTML5 videos
    function MultiBackgroundHTML5PlayerWrapper(element) {
        MultiBackgroundHTML5PlayerWrapper.prototype.element = element;
    }
    MultiBackgroundHTML5PlayerWrapper.prototype.element = null;
    MultiBackgroundHTML5PlayerWrapper.prototype.play = function() {
        this.element.play();
    };
    MultiBackgroundHTML5PlayerWrapper.prototype.pause = function() {
        this.element.pause();
    };
    MultiBackgroundHTML5PlayerWrapper.prototype.stop = function() {
        this.element.pause();
        this.element.currentTime = 0;
    };
    MultiBackgroundHTML5PlayerWrapper.prototype.mute = function() {
        this.element.volume = 0;
        this.element.muted = true;
    };
    MultiBackgroundHTML5PlayerWrapper.prototype.unMute = function() {
        this.element.volume = 1;
        this.element.muted = false;
    };

    // Video player controls wrapper for YouTube videos
    function MultiBackgroundYouTubePlayerWrapper(player) {
        MultiBackgroundYouTubePlayerWrapper.prototype.player = player;
    }
    MultiBackgroundYouTubePlayerWrapper.prototype.player = null;
    MultiBackgroundYouTubePlayerWrapper.prototype.play = function() {
        this.player.playVideo();
    };
    MultiBackgroundYouTubePlayerWrapper.prototype.pause = function() {
        this.player.pauseVideo();
    };
    MultiBackgroundYouTubePlayerWrapper.prototype.stop = function() {
        this.player.stopVideo();
    };
    MultiBackgroundYouTubePlayerWrapper.prototype.mute = function() {
        this.player.mute();
        this.player.setVolume(0);
    };
    MultiBackgroundYouTubePlayerWrapper.prototype.unMute = function() {
        this.player.unMute();
        this.player.setVolume(100);
    };

    // Video player controls wrapper for Vimeo videos
    function MultiBackgroundVimeoPlayerWrapper(element) {
        this.element = element;
    }
    MultiBackgroundVimeoPlayerWrapper.prototype.element = null;
    MultiBackgroundVimeoPlayerWrapper.prototype.play = function() {
        this.element.contentWindow.postMessage({"method": "play"}, "*");
    };
    MultiBackgroundVimeoPlayerWrapper.prototype.pause = function() {
        this.element.contentWindow.postMessage({"method": "pause"}, "*");
    };
    MultiBackgroundVimeoPlayerWrapper.prototype.stop = function() {
        this.element.contentWindow.postMessage({"method": "pause"}, "*");
    };
    MultiBackgroundVimeoPlayerWrapper.prototype.mute = function() {
        this.element.contentWindow.postMessage({"method": "setVolume"}, 0);
    };
    MultiBackgroundVimeoPlayerWrapper.prototype.unMute = function() {
        this.element.contentWindow.postMessage({"method": "setVolume"}, 1);
    };

    // Parses a string color representation into a usable color object
    function MultiBackgroundColor(value) {
        // Value should be a parse-able string
        if("string" !== typeof value) {
            throw "Color value must be of type \"string\"";
        }
        value = value.toLowerCase();

        // #09f(f)
        var regex = new RegExp("^#([a-f0-9]{3,4})$");
        if(regex.test(value)) {
            var result = regex.exec(value);
            if(null !== result && "string" === typeof result[1]) {
                this.red        = parseInt(result[1].substring(0, 1) + result[1].substring(0, 1), 16);
                this.green      = parseInt(result[1].substring(1, 2) + result[1].substring(1, 2), 16);
                this.blue       = parseInt(result[1].substring(2, 3) + result[1].substring(2, 3), 16);
                if(4 === result[1].length) {
                    this.alpha  = parseInt(result[1].substring(3, 4) + result[1].substring(3, 4), 16);
                }
                return this;
            }
        }

        // #0099ff(ff)
        var regex = new RegExp("^#([a-f0-9]{6,8})$");
        if(regex.test(value)) {
            var result = regex.exec(value);
            if(null !== result && "string" === typeof result[1]) {
                this.red        = parseInt(result[1].substring(0, 2), 16);
                this.green      = parseInt(result[1].substring(2, 4), 16);
                this.blue       = parseInt(result[1].substring(4, 6), 16);
                if(8 === result[1].length) {
                    this.alpha  = parseInt(result[1].substring(6, 8), 16);
                }
                return this;
            }
        }

        // rgb(0, 128, 255)
        var regex = new RegExp("^\\s*rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)\\s*$");
        if(regex.test(value)) {
            var result = regex.exec(value);
            if(null !== result && "string" === typeof result[1] && "string" === typeof result[2] && "string" === typeof result[3]) {
                this.red    = parseInt(result[1], 10);
                this.green  = parseInt(result[2], 10);
                this.blue   = parseInt(result[3], 10);
                return this;
            }
        }

        // rgba(0, 128, 255, 0.5)
        var regex = new RegExp("^\\s*rgba\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\,\\s*([0-9\\.]+)\\)\\s*$");
        if(regex.test(value)) {
            var result = regex.exec(value);
            if(null !== result && "string" === typeof result[1] && "string" === typeof result[2] && "string" === typeof result[3] && "string" === typeof result[4]) {
                this.red    = parseInt(result[1], 10);
                this.green  = parseInt(result[2], 10);
                this.blue   = parseInt(result[3], 10);
                this.alpha  = Math.round(parseFloat(result[4]) * 255);
                return this;
            }
        }

        // No match
        throw "Color value could not be parsed, supported formats are: #09f, #09ff, #0099ff, #0099ffff, rgb(0, 128, 255), rgba(0, 128, 255, 0.5)";
    };
    MultiBackgroundColor.prototype.red      = 255;
    MultiBackgroundColor.prototype.green    = 255;
    MultiBackgroundColor.prototype.blue     = 255;
    MultiBackgroundColor.prototype.alpha    = 255;
    MultiBackgroundColor.prototype.getHEX   = function() {
        return "#" + (this.red < 16 ? "0" : "") + this.red.toString(16) + (this.green < 16 ? "0" : "") + this.green.toString(16) + (this.blue < 16 ? "0" : "") + this.blue.toString(16);
    };
    MultiBackgroundColor.prototype.getHEXA  = function() {
        return "#" + (this.red < 16 ? "0" : "") + this.red.toString(16) + (this.green < 16 ? "0" : "") + this.green.toString(16) + (this.blue < 16 ? "0" : "") + this.blue.toString(16) + this.alpha.toString(16) + (this.alpha < 16 ? "0" : "") + this.alpha.toString(16);
    };
    MultiBackgroundColor.prototype.getRGB   = function() {
        return "rgb(" + this.red + ", " + this.green + ", " + this.blue + ")";
    };
    MultiBackgroundColor.prototype.getRGBA  = function() {
        return "rgba(" + this.red + ", " + this.green + ", " + this.blue + ", " + (this.alpha / 255) + ")";
    };

    // Default plugin option params
    $.fn.multiBackground._defaultOptions = {
        "action": "append",
        "video": {
            "width": 16,
            "height": 9,
            "autoplay": true,
            "loop": true,
            "muted": true,
            "nohtml5support": "Your browser does not support HTML5 video"
        },
        "gmap": {
            "zoom": 15,
            "language": "en"
        },
        "loadedshowcallback": function($element) {
            $element.stop().animate({"opacity": 1}, 500);
        }
    };

    // Parse and apply plugin from attributes & hidden integrators
    $(function() {
        $("[data-multibackground]").multiBackgroundFromAttributes();
        $("[data-multibackground-integrator]").multiBackgroundFromIntegrator();
    });
}(jQuery));