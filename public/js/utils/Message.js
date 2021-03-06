define([
    'jquery',
    'classy',
    'tmpl/_message'
],
function($, Class, msgTmpl) {
    var Message = Class.$extend({
        __init__: function($parent) {
            this.msgTemplate = msgTmpl;
            this.$msgContainer = null;

            this.$parent = $parent;
            this.$message = null;
            this.$messageText = null;
            this.$messageTextbox = null;
            this.$messageControls = null;
            this.$messageDimmer = null;

            this.buttonClass = 'message__controls__button';
            this.buttonHtml = '<div class="' + this.buttonClass +'">{0}</div>';

            this.visibleMessage = false;
            this.visibleDimmer = false;
        },

        _findElements: function(parent) {
            this.$message = parent.find('.message');
            this.$messageControls = this.$message.find('.message__controls');

            this.$messageDimmer = parent.find('.message-dimmer');
        },

        _addToDOM: function() {
            this.$parent.append(this.$msgContainer[0]);
            this.$parent.append(this.$msgContainer[1]);
            this._findElements(this.$parent);
        },

        _removeFromDOM: function(keepDimmer) {
            if (!keepDimmer) {
                this.$messageDimmer && this.$messageDimmer.remove();
            }
            this.$message && this.$message.remove();
        },

        _hideControls: function() {
            this.$messageControls && this.$messageControls.hide();
        },

        _showControls: function() {
            this.$messageControls && this.$messageControls.show();
        },

        _buttonHtml: function(name) {
            return this.buttonHtml.format(name);
        },

        _removeControls: function() {
            this.$messageControls && this.$messageControls.empty();
        },

        _createControls: function(controls) {
            if (!controls) throw "No controls passed!";

            for (var i = 0; i < controls.length; ++i) {
                var control = controls[i];

                var $button = $(this._buttonHtml(control.name));
                $button.click(control.action);

                $button.off('touchstart touchend');
                $button.on('touchstart touchend', function(e) {
                    $(this).toggleClass('hover_effect');
                    return true;
                });

                this.$messageControls.append($button);
            }
        },

        _onMessageEvents: function(callbackOnClose) {
            var self = this;
            this.$messageDimmer && this.$messageDimmer.on('click', function () {
                self.hideMessage();
                callbackOnClose();
            });

            this.$message && this.$message.on('click', function () {
                self.hideMessage();
                callbackOnClose();
            });
        },

        _offMessageEvents: function() {
            this.$messageDimmer && this.$messageDimmer.off('click');
            this.$message && this.$message.off('click');
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

            if (this.visibleMessage) {
                console.warn('Another message is active');
                return;
            }

            callbackOnClose || (callbackOnClose = function() {});
            this._removeFromDOM();

            var data = {
                message: messageText
            };
            this.$msgContainer = $(this.msgTemplate(data));
            if (!this.$parent)
                this.$parent = $(document);

            this._addToDOM();

            if (controls) {
                this._createControls(controls);
                this._showControls();
            }


            if (disallowHide)
                this._offMessageEvents();
            else
                this._onMessageEvents(callbackOnClose);

            this.$messageDimmer.show();
            this.$message.show();

            this.visibleMessage = true;
            this.visibleDimmer = true;

        },

        hideMessage: function(keepDimmer) {
            this.$message && this.$message.hide();
            this._removeControls();
            this._hideControls();
            if (!keepDimmer) {
                this.$messageDimmer && this.$messageDimmer.hide();
                this.visibleDimmer = false;
            }
            this._removeFromDOM(keepDimmer);
            this.visibleMessage = false;
        }
    });

    return Message;
});