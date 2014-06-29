define([
    'jquery',
    'classy'
],
function($, Class) {
    var MessageHelper = Class.$extend({
        __init__: function($parent) {
            this.$parent = $parent || $(document);
            this.$message = null;
            this.$messageText = null;
            this.$messageTextbox = null;
            this.$messageControls = null;
            this.$messageDimmer = null;

            this.buttonClass = 'message__controls__button';
            this.buttonHtml = '<div class="' + this.buttonClass +'">{0}</div>';

            this._findElements();
        },

        _findElements: function() {
            this.$message = this.$parent.find('.message');
            this.$messageTextbox = this.$message.find('.message__textbox');
            this.$messageText = this.$messageTextbox.find('.message__textbox__text');
            this.$messageControls = this.$message.find('.message__controls');

            this.$messageDimmer = this.$parent.find('.message-dimmer');
        },

        _hideControls: function() {
            this.$messageControls.hide();
        },

        _showControls: function() {
            this.$messageControls.show();
        },

        _buttonHtml: function(name) {
            return this.buttonHtml.format(name);
        },

        _removeControls: function() {
            this.$messageControls.empty();
        },

        _createControls: function(controls) {
            if (!controls) throw "No controls passed!";

            for (var i = 0; i < controls.length; ++i) {
                var control = controls[i];

                var $button = $(this._buttonHtml(control.name));
                $button.click(control.action);

                this.$messageControls.append($button);
            }
        },

        _onMessageEvents: function(callbackOnClose) {
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

        _offMessageEvents: function() {
            this.$messageDimmer.off('click');
            this.$message.off('click');
        },


        showMessage: function(messageText, disallowHide, callbackOnClose, controls) {
            /*
             * controls - Array. Consists of objects:
             * {
             *    name: [String] - control display name
             *    action: [Function] - function to be called after clicking on the control
             * }
             *
             * if you don't need any controls - nothing should passed (undefined or null expected)
             *
             */

            callbackOnClose || (callbackOnClose = function() {});

            this._hideControls();
            this._removeControls();

            if (controls) {
                this._createControls(controls);
                this._showControls();
            }


            if (disallowHide)
                this._offMessageEvents();
            else
                this._onMessageEvents(callbackOnClose);
            this.$messageText.text(messageText);
            this.$messageDimmer.show();
            this.$message.show();
        },

        hideMessage: function(keepDimmer) {
            this.$message.hide();
            this._removeControls();
            this._hideControls();
            if (!keepDimmer)
                this.$messageDimmer.hide();
        }
    });

    return MessageHelper;
});