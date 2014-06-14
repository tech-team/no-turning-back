define([
],
function() {
    var CssUtils = {
        invert: function(jqElem) {
            jqElem.addClass('image-inverted');
        },

        uninvert: function(jqElem) {
            jqElem.removeClass('image-inverted');
        },

        addWhiteBackground: function(jqElem) {
            jqElem.addClass('white-background');
        },

        removeWhiteBackground: function(jqElem) {
            jqElem.removeClass('white-background');
        },

        showBlackOnWhite: function(image) {
            this.uninvert(image);
            this.addWhiteBackground(image);
        },

        showWhiteOnBlack: function(image) {
            this.invert(image);
            this.removeWhiteBackground(image);
        }
    };

    return CssUtils;

});