define([
	'classy'
],
function(Class) {
	var LevelManager = Class.$extend({
		__init__: function() {
			this.currentLevelId = null;
		},

        loadNextLevel: function() {
			if (this.currentLevelId === null)
				this.currentLevelId = 0;
			else
                ++this.currentLevelId;

			return this.loadLevel(this.currentLevelId);
		},

        loadLevel: function(levelId) {
            // TODO: load a level over the Internet
            return this.dummyLevel;
        },

		dummyLevel: {
            width: 800,
            height: 600,

            name: "Dummy level",

            player: {
                x: 100, y: 100, angle: 1.62,
                health: 100,
                inventory: ["silver_key"]
            },

            enemies: [
                {name: "Vasja", type: "zombie", tex: "zombie", x: 10, y: 10, width: 32, height: 32, drops: ["golden_key"]}
            ],

            chests: [
                {tex: "chest", x: 10, y: 100, width: 32, height: 32, inventory: ["shotgun"]}
            ],

            doors: [
                {tex: "door", role: "exit", state: "closed", require: "golden_key", x: 50, y: 50, width: 32, height: 32}
            ],

            walls: [
                {tex: "wall", x: 10, y: 10, width: 100, height: 10},
                {tex: "wall", x: 10, y: 30, width: 100, height: 10}
            ],

            objects: [
                {tex: "rubbish", x: 50, y: 80, width: 10, height: 10} //something like a rubbish
            ]
		}
	});

	return LevelManager;
});