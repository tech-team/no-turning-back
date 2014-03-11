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
            type: "background",
            draggable: false,

            name: "Dummy level",

            player: {
                x: 128, y: 128,
                tex: "player",
                type: "player",
                health: 100,
                inventory: ["silver_key"]
            },

            mobs: [
                {type: "mob", name: "Vasja", tex: "zombie", x: 200, y: 200, width: 32, height: 32, drops: ["golden_key"]}
            ],

            chests: [
                {type: "chest", tex: "chest", x: 500, y: 500, width: 32, height: 32, storage: ["shotgun"]}
                // TODO: activation zone for chests
            ],

            doors: [
                {type: "door", tex: "door", role: "exit", state: "closed", require: "golden_key", x: 250, y: 250, width: 32, height: 32}
            ],

            walls: [
                {type: "wall", tex: "brick_wall1", x: 32, y: 64, width: 32, height: 160},
                {type: "wall", tex: "brick_wall2", x: 64, y: 64, r: 10, width: 128, height: 32},
                {type: "wall", tex: "brick_wall3", x: 192, y: 64, width: 32, height: 160},
                {type: "wall", tex: "brick_wall4", x: 32, y: 224, width: 64, height: 32},
                {type: "wall", tex: "brick_wall1", x: 160, y: 224, width: 64, height: 32},
                {type: "wall", tex: "brick_wall2", x: 64, y: 256, width: 32, height: 192},
                {type: "wall", tex: "brick_wall3", x: 160, y: 256, width: 32, height: 96},
                {type: "wall", tex: "brick_wall4", x: 96, y: 416, width: 288, height: 32},
                {type: "wall", tex: "brick_wall1", x: 192, y: 320, width: 192, height: 32},
            ],

            objects: [
                {type: "object", tex: "rubbish", x: 50, y: 80, width: 10, height: 10}
            ]
		}
	});

	return LevelManager;
});