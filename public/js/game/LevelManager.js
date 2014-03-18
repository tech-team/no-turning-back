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
                {type: "mob", name: "Vasja", tex: "zombie", r: 0, x: 500, y: 600, w: "", h: "", speed: 2,
                    drops: ["golden_key"],
                    waypoints: [
                        {type: "waypoint", tex: "waypoint", x: 400, y: 400, w: "", h: ""},
                        {type: "waypoint", tex: "waypoint", x: 400, y: 600, w: "", h: ""},
                        {type: "waypoint", tex: "waypoint", x: 700, y: 600, w: "", h: ""}
                    ]},
                {type: "mob", name: "Vasja", tex: "zombie", r: 0, x: 700, y: 150, w: "", h: "", speed: 2,
                    drops: ["golden_key"],
                    waypoints: [
                        {type: "waypoint", tex: "waypoint", x: 600, y: 200, w: "", h: ""},
                        {type: "waypoint", tex: "waypoint", x: 700, y: 500, w: "", h: ""},
                        {type: "waypoint", tex: "waypoint", x: 800, y: 500, w: "", h: ""}
                    ]},
                {type: "mob", name: "Vasja", tex: "zombie", r: 0, x: 150, y: 500, w: "", h: "", speed: 2,
                    drops: ["golden_key"],
                    waypoints: [
                        {type: "waypoint", tex: "waypoint", x: 100, y: 450, w: "", h: ""},
                        {type: "waypoint", tex: "waypoint", x: 1000, y: 450, w: "", h: ""}
                    ]}
            ],

            chests: [
                {type: "chest", tex: "chest", x: 500, y: 500, r: 0, w: "", h: "", storage: ["shotgun"], state: "closed"}
                // TODO: activation zone for chests
            ],

            doors: [
                {type: "door", tex: "door-closed", x: 300, y: 300, r: 0, w: "", h: "", require: "golden_key", role: "exit", state: "closed"}
            ],

            walls: [
                {type: "wall", tex: "brick_wall2", x: 64, y: 64, r: 10, w: "", h: ""},
                {type: "wall", tex: "brick_wall2", x: 180, y: 180, r: 0, w: "", h: ""},
                {type: "wall", tex: "brick_wall2", x: 256, y: 256, r: 270, w: "", h: ""}
            ],

            objects: [
            ],


		}
	});

	return LevelManager;
});