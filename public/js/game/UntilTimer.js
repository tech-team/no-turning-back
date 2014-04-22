define([
    'underscore',
    'classy',
    'easel'
],
    function(_, Class, createjs) {
        var UntilTimer = Class.$extend({
            __init__: function(millis, onTick) {
                this.millis = millis;
                this.startTime = easeljs.Ticker.getTime();
                this.onTick = onTick;

                easeljs.Ticker.addEventListener("tick", this);
            },

            update: function() {
                if (easeljs.Ticker.getTime() >= this.startTime + this.millis)
                    easeljs.Ticker.removeEventListener("tick", this);
                else
                    this.onTick();
            }
        });

        return UntilTimer;
    }
);