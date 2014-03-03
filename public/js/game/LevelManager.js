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
                x: 128, y: 128,
                tex: "player",
                health: 100,
                inventory: ["silver_key"]
            },

            enemies: [
                {name: "Vasja", type: "zombie", tex: "zombie", x: 200, y: 200, width: 32, height: 32, drops: ["golden_key"]}
            ],

            chests: [
                {tex: "chest", x: 500, y: 500, width: 32, height: 32, inventory: ["shotgun"]}
                // TODO: activation zone for chests
            ],

            doors: [
                {tex: "door", role: "exit", state: "closed", require: "golden_key", x: 250, y: 250, width: 32, height: 32}
            ],

            walls: [
                {tex: "wall", x: 32, y: 64, width: 32, height: 160},
                {tex: "wall", x: 64, y: 64, width: 128, height: 32},
                {tex: "wall", x: 192, y: 64, width: 32, height: 160},
                {tex: "wall", x: 32, y: 224, width: 64, height: 32},
                {tex: "wall", x: 160, y: 224, width: 64, height: 32},
                {tex: "wall", x: 64, y: 256, width: 32, height: 192},
                {tex: "wall", x: 160, y: 256, width: 32, height: 96},
                {tex: "wall", x: 96, y: 416, width: 288, height: 32},
                {tex: "wall", x: 192, y: 320, width: 192, height: 32},
            ],

            objects: [
                {tex: "rubbish", x: 50, y: 80, width: 10, height: 10} //something like a rubbish
            ]
		}
	});

	return LevelManager;
});