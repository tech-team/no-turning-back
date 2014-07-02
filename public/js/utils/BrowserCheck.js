define([
    'modernizr',
    'easel'
],
function(modernizr, createjs) {
    return {
        _modernizrCheck: function(successCallback) {
            if (Modernizr) {
                return successCallback();
            }
            else {
                throw "Modernizr not found";
            }
        },

        browserSupport: function() {
            return this._modernizrCheck(function() {
                return Modernizr.canvas && Modernizr.canvastext && Modernizr.localstorage
                    && Modernizr.audio && Modernizr.multiplebgs
                    && Modernizr.csstransforms && Modernizr.fontface;
            });
        },

        touchSupport: function() {
            return createjs.Touch.isSupported();
        }
    }
});