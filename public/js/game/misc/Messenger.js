define([
    'classy',
    'easel',
    'underscore',
    'game/misc/UntilTimer'
],
    function(Class, easeljs, _, UntilTimer) {
        var Messenger = Class.$extend({
            __classvars__: {
                stage: null,
                showingMessagesCount: 0,

                healPackPicked: {
                    text: ["Healed {0}%", "Oh, sweet lemonade!", "That's better!", "Feels good!"],
                    color: "#1397F0",
                    period: 5
                },
                ammoPicked: {
                    text: ["+{0} ammo for {1}", "Much ammo, very for {1}, wow!"],
                    color: "#A7FA16",
                    period: 5
                },
                newWeaponPicked: {
                    text: ["New weapon: {0}", "Such gun, very power, wow", "Now you all gonna die!"],
                    color: "#0BB389",
                    period: 5
                },
                keyPicked: {
                    text: ["{0} picked up", "I've got {0}! Now i can try to open something...", "{0} picked up, cool!"],
                    color: "#A1BF26",
                    period: 5
                },
                newItemPicked: {
                    text: ["You've picked: {0}"],
                    color: "#A1BF26",
                    period: 5
                },
                outOfAmmo: {
                    text: ["Out of AMMO", "I can't fire, NO AMMO", "I'm gonna die, i have no AMMO!"],
                    color: "#459DBA",
                    period: 5
                },
                levelLoaded: {
                    text: ["{0} started...", "Welcome to {0}"],
                    color: "#7755FF",
                    period: 5
                },
                levelStarted: {
                    text: ["Let's kill them all!", "Let's get started!", "Come get me, zombies!"],
                    color: "#9977AA",
                    period: 7
                },
                levelFinished: {
                    text: ["Well done!", "Level finished"],
                    color: "#00AA22",
                    period: 7
                },
                doorLocked: {
                    text: ["I need a {0} to open that door", "Crap, it's locked!", "Locked..."],
                    color: "#0FFFF0",
                    period: 5
                },
                doorLockedKillAll: {
                    text: ["I need to kill everybody first!", "Not enough corps, i should kill them all!"],
                    color: "#0FFFF0",
                    period: 5
                },
                doorLockedPuzzle: {
                    text: ["Hmm, strange mechanism...", "This door open from somewhere else...", "I need to find buttons to open this door!"],
                    color: "#0FFFF0",
                    period: 5
                },
                chestLocked: {
                    text: ["Locked, I need a {0}...", "Crap, it's locked!", "I hate this chest, it locked!"],
                    color: "#0FFFF0",
                    period: 5
                },
                puzzleSolved: {
                    text: ["Puzzle solved!", "Yeah, i did it!"],
                    color: "#0FFFF0",
                    period: 5
                },
                puzzleFailed: {
                    text: ["Nope, i should try another pattern...", "Nope, that was wrong order", "Argh, buttons! Much hate!"],
                    color: "#0FFFF0",
                    period: 5
                },

                setStage: function(stage) {
                    this.stage = stage;
                },

                //some kind of sprintf()
                prepareMessage: function(message) {
                    var msg = _.clone(message);
                    msg.prepared = true;

                    var str = msg.text[0];

                    //text[0] is more likely to appear
                    //consider it as a main message
                    if (_.random(0, 3) == 0) {
                        var messageId = _.random(0, msg.text.length-1);
                        str = msg.text[messageId];
                    }

                    for (var i = 1; i < arguments.length; ++i) {
                        str = str.replace("{" + (i - 1) + "}", arguments[i]);
                    }
                    msg.preparedText = str;

                    return msg;
                },

                showMessage: function(message) {
                    var msg = message;
                    if (!msg.prepared)
                        msg = this.prepareMessage.apply(this, arguments);

                    this._showMessage(msg.preparedText, msg.color, msg.period * 1000);
                },

                _showMessage: function(str, color, period) {
                    this.showingMessagesCount++;

                    var text = new easeljs.Text(str, "28px MacondoRegular", color || Level.MessageColor.Default);
                    text.x = this.stage.canvas.width / 2 - text.getMeasuredWidth() / 2;
                    text.y = text.getMeasuredHeight() * this.showingMessagesCount;
                    text.shadow = new easeljs.Shadow("#22AA22", -1, -1, 0);

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