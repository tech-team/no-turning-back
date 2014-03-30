define([
	'classy'
],
function(Class) {
	var LevelManager = Class.$extend({
        levels: [
            'Default level'
        ],
		__init__: function() {
			this.currentLevelId = null;
		},

        loadNextLevel: function(callback) {
			if (this.currentLevelId === null)
				this.currentLevelId = 0;
			else
                ++this.currentLevelId;

			return this.loadLevel(this.currentLevelId, callback);
		},

        loadLevel: function(levelId, callback) {
            var self = this;
            $.ajax({
                    type: 'GET',
                    url: 'levels',
                    data: {
                        name: self.levels[levelId]
                    },
                    dataType: 'json',
                    beforeSend: function() {
                    },
                    success: function(data) {
                        callback({
                            levelData: data
                        });
                    },
                    error: function(data) {
                        alert("Unable to load level");
                    }
            });
        },

        generatedLevel: {"type":"background","tex":"ground","name":"Default level","x":0,"y":0,"w":1280,"h":768,"draggable":false,"player":{"type":"player","tex":"player","name":"","x":100,"y":100,"r":0,"w":"","h":"","health":100,"inventory":[]},"zombies":[{"type":"zombie","tex":"zombie","name":"","x":693,"y":436,"r":0,"w":"","h":"","speed":2,"drops":[],"waypoints":[{"type":"waypoint","tex":"waypoint","name":"","x":797,"y":455,"r":0,"w":"","h":""},{"type":"waypoint","tex":"waypoint","name":"","x":781,"y":636,"r":0,"w":"","h":""},{"type":"waypoint","tex":"waypoint","name":"","x":878,"y":575,"r":0,"w":"","h":""},{"type":"waypoint","tex":"waypoint","name":"","x":784,"y":565,"r":0,"w":"","h":""},{"type":"waypoint","tex":"waypoint","name":"","x":692,"y":597,"r":0,"w":"","h":""}]},{"type":"zombie","tex":"zombie","name":"","x":505,"y":206,"r":0,"w":"","h":"","speed":2,"drops":[],"waypoints":[{"type":"waypoint","tex":"waypoint","name":"","x":594,"y":220,"r":0,"w":"","h":""},{"type":"waypoint","tex":"waypoint","name":"","x":673,"y":134,"r":0,"w":"","h":""},{"type":"waypoint","tex":"waypoint","name":"","x":735,"y":206,"r":0,"w":"","h":""}]},{"type":"zombie","tex":"zombie","name":"","x":544,"y":444,"r":29,"w":"","h":"","speed":2,"drops":[],"waypoints":[{"type":"waypoint","tex":"waypoint","name":"","x":555,"y":435,"r":0,"w":"","h":""},{"type":"waypoint","tex":"waypoint","name":"","x":552,"y":505,"r":0,"w":"","h":""}]}],"walls":[{"type":"wall","tex":"brick_wall1","name":"","x":485,"y":382,"r":0,"w":"","h":""},{"type":"wall","tex":"brick_wall2","name":"","x":194,"y":23,"r":90,"w":"","h":""},{"type":"wall","tex":"brick_wall3","name":"","x":64,"y":23,"r":90,"w":"","h":""},{"type":"wall","tex":"brick_wall4","name":"","x":67,"y":169,"r":90,"w":"","h":""},{"type":"wall","tex":"brick_wall4","name":"","x":197,"y":169,"r":90,"w":"","h":""},{"type":"wall","tex":"brick_wall1","name":"","x":617,"y":381,"r":0,"w":"","h":""},{"type":"wall","tex":"brick_wall1","name":"","x":485,"y":485,"r":0,"w":"","h":""},{"type":"wall","tex":"brick_wall1","name":"","x":435,"y":535,"r":90,"w":"","h":""},{"type":"wall","tex":"brick_wall1","name":"","x":317,"y":535,"r":90,"w":"","h":""},{"type":"wall","tex":"brick_wall4","name":"","x":617,"y":491,"r":"0","w":"","h":""},{"type":"wall","tex":"brick_wall4","name":"","x":267,"y":584,"r":"0","w":"","h":""},{"type":"wall","tex":"brick_wall4","name":"","x":267,"y":659,"r":"0","w":"","h":""},{"type":"wall","tex":"brick_wall1","name":"","x":666,"y":538,"r":90,"w":"","h":""}],"doors":[{"type":"door","tex":"door-closed","name":"","x":516,"y":322,"r":0,"w":"","h":"","role":"exit","state":"closed","require":[]},{"type":"door","tex":"door-open","name":"","x":549,"y":333,"r":"0","w":"","h":"","role":"exit","state":"opened","require":[""]},{"type":"door","tex":"door-closed","name":"","x":583,"y":322,"r":0,"w":"","h":"","role":"exit","state":"closed","require":[]},{"type":"door","tex":"door-closed","name":"","x":7,"y":96,"r":90,"w":"","h":"","role":"exit","state":"closed","require":[""]}],"chests":[{"type":"chest","tex":"chest","name":"","x":410,"y":629,"r":0,"w":"","h":""},{"type":"chest","tex":"chest","name":"","x":555,"y":386,"r":0,"w":"","h":""}]},

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

            zombies: [
                {type: "zombie", name: "Vasja", tex: "zombie", r: 0, x: 500, y: 600, w: "", h: "", speed: 2,
                    drops: ["golden_key"],
                    waypoints: [
                        {type: "waypoint", tex: "waypoint", x: 400, y: 400, w: "", h: ""},
                        {type: "waypoint", tex: "waypoint", x: 400, y: 600, w: "", h: ""},
                        {type: "waypoint", tex: "waypoint", x: 700, y: 600, w: "", h: ""}
                    ]},
                {type: "zombie", name: "Vasja", tex: "zombie", r: 0, x: 700, y: 150, w: "", h: "", speed: 2,
                    drops: ["golden_key"],
                    waypoints: [
                        {type: "waypoint", tex: "waypoint", x: 600, y: 200, w: "", h: ""},
                        {type: "waypoint", tex: "waypoint", x: 700, y: 500, w: "", h: ""},
                        {type: "waypoint", tex: "waypoint", x: 800, y: 500, w: "", h: ""}
                    ]},
                {type: "zombie", name: "Vasja", tex: "zombie", r: 0, x: 150, y: 500, w: "", h: "", speed: 2,
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
                {type: "wall", tex: "brick_wall2", x: 256, y: 256, r: 270, w: "", h: ""},
                {type: "wall", tex: "brick_wall2", x: 256, y: 256, r: 90, w: "", h: ""}
            ],

            objects: [
            ],
		}
	});

	return LevelManager;
});