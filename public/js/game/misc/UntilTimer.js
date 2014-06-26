define([
    'lodash',
    'classy',
    'easel'
],
    function(_, Class, createjs) {
        var UntilTimer = Class.$extend({
            __init__: function(millis, onTick, onFinished) {
                this.millis = millis;
                this.startTime = createjs.Ticker.getTime();
                this.onTick = onTick;
                this.onFinished = onFinished;
                this.elapsed = 0;

                var self = this;
                this.updateHandler = function() {
                    self.update();
                };

                createjs.Ticker.addEventListener("tick", this.updateHandler);
            },

            update: function() {
                this.elapsed = createjs.Ticker.getTime() - this.startTime;

                if (this.elapsed >= this.millis) {
                    createjs.Ticker.removeEventListener("tick", this.updateHandler);
                    this.onFinished();
                }
                else
                    this.onTick();
            }
        });

        return UntilTimer;
    }
);