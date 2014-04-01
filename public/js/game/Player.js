define([
	'classy',
	'game/AliveObject',
    'game/KeyCoder',
    'collision'
],
function(Class, AliveObject, KeyCoder, ndgmr) {
	var Player = AliveObject.$extend({
		__init__: function() {
            this.health = 100;
            this.dead = false;
			this.score = 0;
            this.cooldown = 0;
            this.effects = null;
		},

        setEffects: function(effects) {
            this.effects = effects;
        },

		update: function(event) {

        },

        damage: function(howMuch) {
            this.health -= howMuch;

            var damageEffect = this.effects.damage;
            damageEffect.alpha = 1;
            damageEffect.visible = true;
            var tid = setInterval(function() {
                if (damageEffect.alpha > 0)
                    damageEffect.alpha -= 0.05;
                else {
                    damageEffect.visible = false;
                    clearInterval(tid);
                }
            }, 50);
        },

        isDead: function() {
            return this.health <= 0;
        }
	});

	return Player;
});