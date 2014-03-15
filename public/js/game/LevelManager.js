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
            tex: "ground",
            type: "background",
            name: "Dummy level",
            draggable: false,
            w: 1280,
            h: 768,

            player: {
                type: "player",
                tex: "player",
                x: 128, y: 128,
                r: 0,
                w: "", h: "",
                health: 100,
                inventory: ["silver_key", "key"]
            },

            mobs: [
                {type: "mob", name: "Vasja", tex: "zombie", r: "", x: 200, y: 200, w: "", h: "", drops: ["golden_key"]}
            ],

            chests: [
                {type: "chest", tex: "chest", x: 500, y: 500, r: 0, w: "", h: "", storage: ["shotgun"]}
                // TODO: activation zone for chests
            ],

            doors: [
                {type: "door", tex: "door", x: 250, y: 250, r: 0, w: "", h: "", require: "golden_key", role: "exit", state: "closed"}
            ],

            walls: [
                {type: "wall", tex: "brick_wall2", x: 64, y: 64, r: 10, w: "", h: ""},
            ],

            objects: [
            ]
		}
	});

	return LevelManager;
});