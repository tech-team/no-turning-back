define([
    'classy',
    'easel',
    'game/UntilTimer'
],
    function(Class, easeljs, UntilTimer) {
        var Messenger = Class.$extend({
            __classvars__: {
                stage: null,
                showingMessagesCount: 0,

                MessageColor: {
                    Default: "#00FF00",
                    NewWeapon: "#0BB389",
                    NewItem: "#A1BF26",
                    Medkit: "#1397F0",
                    Ammo: "#A7FA16",
                    DoorClosed: "#0FFFF0",
                    NoAmmo: "#459DBA",
                    LevelLoaded: "#7755FF",
                    LevelFinished: "#00FF00"
                },

                setStage: function(stage) {
                    this.stage = stage;
                },

                showMessage: function(message, color, period) {
                    this.showingMessagesCount++;

                    var text = new easeljs.Text(message, "20px Arial", color || Level.MessageColor.Default);
                    text.x = this.stage.canvas.width / 2 - text.getMeasuredWidth() / 2;
                    text.y = text.getMeasuredHeight() * this.showingMessagesCount;
                    text.shadow = new easeljs.Shadow("#000000", 5, 5, 10);

                    var dispObjText = this.stage.addChild(text);

                    var self = this;
                    period = period || 3000;

                    new UntilTimer(period,
                        function() {
                            text.alpha = (period - this.elapsed)/period;
                        },
                        function() {
                            self.stage.removeChild(dispObjText);
                            self.showingMessagesCount--;
                        }
                    );
                }
            }
        });

        return Messenger;
    }
);