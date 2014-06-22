define([
    'classy'
],
function(Class) {
    var MessageHelper = Class.$extend({
        __init__: function($parent) {
            this.$parent = $parent || $(document);
            this.$message = null;
            this.$messageText = null;
            this.$messageDimmer = null;

            this._findElements();
        },

        _findElements: function() {
            this.$message = this.$parent.find('.message');
            this.$messageText = this.$message.find('.message__textbox__text');
            this.$messageDimmer = this.$parent.find('.message-dimmer');
        },

        onMessageEvents: function(callbackOnClose) {
            var self = this;
            this.$messageDimmer.on('click', function () {
                self.hideMessage();
                callbackOnClose();
            });

            this.$message.on('click', function () {
                self.hideMessage();
                callbackOnClose();
            });
        },

        offMessageEvents: function() {
            this.$messageDimmer.off('click');
            this.$message.off('click');
        },


        showMessage: function(messageText, disallowHide, callbackOnClose) {
            callbackOnClose || (callbackOnClose = function() {});

            if (disallowHide)
                this.offMessageEvents();
            else
                this.onMessageEvents(callbackOnClose);
            this.$messageText.text(messageText);
            this.$messageDimmer.show();
            this.$message.show();
        },

        hideMessage: function(keepDimmer) {
            this.$message.hide();
            if (!keepDimmer)
                this.$messageDimmer.hide();
        }
    });

    return MessageHelper;
});