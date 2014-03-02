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
            width: 1280,
            height: 768,
            tex: "ground",

            name: "Dummy level",

            player: {
                x: 100, y: 100, angle: 1.62,
                tex: "player",
                health: 100,
                inventory: ["silver_key"]
            },

            enemies: [
                {name: "Vasja", type: "zombie", tex: "zombie", x: 10, y: 10, width: 32, height: 32, drops: ["golden_key"]}
            ],

            chests: [
                {tex: "chest", x: 500, y: 500, width: 32, height: 32, inventory: ["shotgun"]}
            ],

            doors: [
                {tex: "door", role: "exit", state: "closed", require: "golden_key", x: 50, y: 50, width: 32, height: 32}
            ],

            walls: [
                {tex: "wall", x: 10, y: 100, width: 128, height: 32},
                {tex: "wall", x: 10, y: 150, width: 128, height: 32}
            ],

            objects: [
                {tex: "rubbish", x: 50, y: 80, width: 10, height: 10} //something like a rubbish
            ]
		}
	});

	return LevelManager;
});