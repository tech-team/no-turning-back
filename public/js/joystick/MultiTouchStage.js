define([
    'jquery',
    'hammer'
], function($, Hammer) {
        var MultiTouchStage = {
            _primaryPointerID: 1,
            _hammer_events: "Hold Tap DoubleTap Drag DragStart DragEnd DragUp DragDown DragLeft DragRight Swipe SwipeUp SwipeDown SwipeLeft SwipeRight Transform TransformStart TransformEnd Rotate Pinch PinchIn PinchOut Touch Release".split(' '),

            enableDOMEvents: function(enable) {
                var event_name, hammer, k, ls, v, i;
                ls = this._eventListeners;
                if (!enable && ls) { // Remove event listeners
                    for (k in ls) {
                        v = ls[k];
                        v.t.off(k, v.f);
                    }
                    this._eventListeners = null;
                } else if (enable && this.canvas) { // Add event listeners
                    hammer = Hammer(this.canvas);
                    if (!ls) {
                        ls = this._eventListeners = {};
                    }
                    for (i = 0; i < this._hammer_events.length; i++) {
                        event_name = this._hammer_events[i];
                        ls[event_name.toLowerCase()] = (function(_this, event_name) {
                            return {
                                t: hammer,
                                f: function(e) {
                                    return _this._handleTouchEvent(event_name, e);
                                }
                            };
                        })(this, event_name);
                    }
                    for (k in ls) {
                        v = ls[k];
                        hammer.on(k, v.f);
                    }
                }
            },

            _handleTouchEvent: function(event_name, e) {
                /* All HammerJS events end up here - let's find the touch targets and fire any event handlers.
                 * This also adds event propagation (only bubbling).
                 */
                var evt, i, o, obj, original_target, target;

                // Add a fake "pointer", set's up mouseX, mouseY as the gesture center point

                this._updatePointerPosition(this._primaryPointerID, e.gesture.center.pageX, e.gesture.center.pageY);

                var pos = this.canvas.getBoundingClientRect();
                pos.x = e.gesture.center.pageX - pos.left;
                pos.y = e.gesture.center.pageY - pos.top;

                // Finds the front-most inner-most child
                target = original_target = this._getObjectsUnderPoint(pos.x, pos.y, null, null, true);
                if (!target) {
                    target = this; // Stage will always receive touch events
                }

                while (target) { // Event propagation loop
                    if (target["on" + event_name] || target.hasEventListener(event_name.toLowerCase())) {
                        // Call any event handlers
                        evt = new TouchEvent(event_name.toLowerCase(), target, original_target, e, pos.x, pos.y);
                        if (target["on" + event_name]) {
                            target["on" + event_name](evt);
                        }
                        target.dispatchEvent(evt);
                        if (!evt._propagates) { // stopPropagation() support
                            break;
                        }
                    }
                    target = target.parent;
                }
            }
        };

        function TouchEvent(type, target, original_target, original_event, stageX, stageY) {
            this.type = type;
            this.target = target;
            this.original_target = original_target;
            this.original_event = original_event;
            this.stageX = stageX;
            this.stageY = stageY;
            this._propagates = true;
        }

        TouchEvent.prototype.clone = function() {
            return new createjs.ext.TouchEvent(this.type, this.target, this.original_target, this.original_event, this.stageX, this.stageY);
        };

        TouchEvent.prototype.toString = function() {
            return "[TouchEvent (type=" + this.type + " x=" + this.stageX + " y=" + this.stageY + ")]";
        };

        TouchEvent.prototype.stopPropagation = function() {
            return this._propagates = false;
        };

        return MultiTouchStage;
    }
);