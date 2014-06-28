define([
    'jquery',
    'lodash',
    'easel',
    'alertify',
    'game/misc/KeyCoder',
    'game/ResourceManager',
    'game/LevelManager',
    'game/DefaultObjects',
    'game/StageManager'
],
    function($, _, easeljs, alertify, KeyCoder, ResourceManager, LevelManager, DefaultObjects, StageManager) {
        var Editor = StageManager.$extend({
            __classvars__: {
                duplicateDelta: 30,
                helpMessage:
                        "<h2>Quick help</h2>" +
                        "<div align='left'>" +
                        "Use mouse to select and move objects<br>" +
                        "Ctrl+click to select multiple objects<br>" +
                        "WASD to move<br>" +
                        "QE to rotate<br>" +
                        "FB to bring to front or back<br>" +
                        "Double click or Ctrl+V to clone<br>" +
                        "DEL to delete selected objects<br>" +
                        "Shift + mouse to drag whole level</div>"
            },

            __init__: function(stage, resourceManager, levelManager) {
                this.$super(stage, resourceManager);

                this.levelManager = levelManager;
                this.keyCoder = new KeyCoder();

                this.showingWpsOwner = null;
                this.selectedObject = null;
                this.multiselection = []; //used for multiple selection using Ctrl and Ctr+C/V

                this.selectionFilter = new easeljs.ColorFilter(1, 1, 1, 1, 10, 60, 10, 100);
                this.wpPath = null;

                var self = this;
                $('#levelSave').click(function(evt) {
                    self.onLevelSaveClick();
                    return false;
                });

                $('#levelLoad').click(function(evt) {
                    self.onLevelLoadClick();
                    return false;
                });

                $('#levelNew').click(function(evt) {
                    self.onLevelNewClick();
                    return false;
                });

                $('#help').click(function(evt) {
                    alertify.alert(Editor.helpMessage);
                    return false;
                });

                $('#addObject').click(function() {
                    var type = $('#add-type-select').val();
                    var tex = $('#add-texture-select').val();

                    self.createObject(type, tex);
                    return false;
                });

                var onDeleteObjects = function() {
                    _.each(self.multiselection, function(obj) {
                        self.deleteObject(obj);
                    });
                };

                $('#deleteObject').click(function() {
                    onDeleteObjects();
                    return false;
                });

                $('#applyToObject').click(function() {
                    self.applyToObject();
                    return false;
                });

                $('#applyToLevel').click(function() {
                    self.applyToLevel();
                    return false;
                });

                $(window).bind("mousewheel", function(evt) {
                    if (!self.selectedObject)
                        return false;

                    if (evt.originalEvent.wheelDelta >= 0){
                        self.selectedObject.rotation--;
                        self.selectedObject.data.r--;
                    } else {
                        self.selectedObject.rotation++;
                        self.selectedObject.data.r++;
                    }

                    self.regenerateObjectPropertiesTable();

                    return false;
                });

                this.keyCoder.addEventListener("keyup", KeyCoder.F, function(event) {
                    self.bringToFront(self.selectedObject);
                });

                this.keyCoder.addEventListener("keyup", KeyCoder.B, function(event) {
                    self.bringToBack(self.selectedObject);
                });

                this.keyCoder.addEventListener("keyup", KeyCoder.V, function(event) {
                    if (event.ctrlKey)
                        self.duplicateObjects();
                });

                this.keyCoder.addEventListener("keyup", KeyCoder.DEL, function(event) {
                    onDeleteObjects();
                });

                alertify.alert(Editor.helpMessage);

                this.onLevelLoadClick(); //ask level to load

                this.regenerateLevelPropertiesTable();
                this.populateTexSelect();
                this.populateTypeSelect();
            },

            load: function(data) {
                //reset stage
                this.$super(data);
                this.setMainContainer(this.mainContainer); //setter in JS, oh wow, lol

                var self = this;
                this.levelData = data;

                //add background
                this.background = this.addToStage(data, true);

                var add = function(obj) {
                    //ensure calling with one argument
                    self.addToStage(obj);
                };
                
                _.each(data.walls,   add);
                _.each(data.doors,   add);
                _.each(data.chests,  add);
                _.each(data.buttons, add);
                _.each(data.zombies, add);

                //add player
                this.addToStage(data.player);
            },

            update: function(event) {
                this.keyFunc(event);
            },

            addToStage: function(objData, doNotCenter, id) {
                var dispObj = this.$super(objData, doNotCenter, id);
                this.setObjectHandlers(dispObj);

                return dispObj;
            },   
            
            setMainContainer: function(container) {
                this.mainContainer = container;

                var point = {x: 0, y: 0};

                container.on("mousedown", function(evt) {
                    point = container.globalToLocal(evt.stageX, evt.stageY);
                });

                container.on("pressmove", function(evt) {
                    if (evt.nativeEvent.shiftKey == true) {
                        container.x = evt.stageX - point.x;
                        container.y = evt.stageY - point.y;
                    }
                });
            },

            applyToObject: function() {
                if (!this.selectedObject)
                    return;

                var data = {};
                var inputs = $("#selected-object").find("input, select");
                inputs.each(function(i, input) {
                    var $input = $(input);

                    var field = input.id.split('-');

                    if (field[0] == 'object') {
                        var prop = field[1];
                        if ($input.data('isArray') == true) {
                            try {
                                data[prop] = JSON.parse($input.val());
                            }
                            catch(e) {
                                alertify.error("Unable to parse array for '" + prop + "' property. Changes will be rejected.");
                            }
                        }
                        else
                            data[prop] = parseInt($input.val()) || $input.val();
                    }
                });

                this.updateObjectData(this.selectedObject, data);
                this.regenerateObjectPropertiesTable();
                this.updateWpPath();
            },

            applyToLevel: function() {
                var data = {};
                var inputs = $("#level-object").find("input, select");
                inputs.each(function(i, input) {
                    var $input = $(input);
                    var field = input.id.split('-');

                    if (field[0] == 'level') {
                        var prop = field[1];
                        data[prop] = parseInt($input.val()) || $input.val();
                    }
                });

                this.updateObjectData(this.background, data);
                this.regenerateLevelPropertiesTable();
            },

            populateTexSelect: function(select) {
                var textureSelect = select || $('.texture-select');

                _.each(ResourceManager.texList, function(tex) {
                    textureSelect.append($("<option />").val(tex).text(tex));
                });
            },

            populateTypeSelect: function(select) {
                var typeSelect = select || $('.type-select');

                var excludedKeys = ['level', 'build', '$extend', '$withData', 'constructor'];
                var types = _.difference(_.keys(DefaultObjects), excludedKeys);

                _.each(types, function(tex) {
                    typeSelect.append($("<option />").val(tex).text(tex));
                });
            },

            setObjectHandlers: function(dispObj) {
                var self = this;

                if (dispObj.data.draggable === false) {
                    //clear selection
                    dispObj.on("click", function(evt) {
                        self.selectObject(null);
                    });
                    return;
                }

                dispObj.on("mousedown", function(evt) {
                    var dispObj = evt.currentTarget;

                    if (evt.nativeEvent.ctrlKey) {
                        self.selectOneMoreObject(dispObj);
                        return;
                    }

                    if (!_.contains(self.multiselection, dispObj))
                        self.selectObject(dispObj);

                    var point = dispObj.globalToLocal(evt.stageX + self.mainContainer.x, evt.stageY + self.mainContainer.y);
                    dispObj.oldReg = {
                        x: dispObj.regX,
                        y: dispObj.regY
                    };

                    dispObj.regX = point.x;
                    dispObj.regY = point.y;

                    dispObj.x = evt.stageX;
                    dispObj.y = evt.stageY;
                });

                dispObj.on("pressmove", function(evt) {
                    var origin = {
                        x: evt.currentTarget.x,
                        y: evt.currentTarget.y
                    };

                    _.each(self.multiselection, function(obj) {
                        obj.x = evt.stageX + (obj.x - origin.x);
                        obj.y = evt.stageY + (obj.y - origin.y);
                    });

                    self.updateWpPath();
                    self.regenerateObjectPropertiesTable();
                });

                //for some reason mouseup doesn't work, but 'click' works well
                dispObj.on("click", function(evt) {
                    var dispObj = evt.currentTarget;

                    var dx = dispObj.regX - dispObj.oldReg.x;
                    var dy = dispObj.regY - dispObj.oldReg.y;

                    dispObj.regX = dispObj.oldReg.x;
                    dispObj.regY = dispObj.oldReg.y;

                    var a = dispObj.rotation * Math.PI / 180;

                    dispObj.x -= dx*Math.cos(a) - dy*Math.sin(a);
                    dispObj.y -= dy*Math.cos(a) + dx*Math.sin(a);

                    //save data
                    _.each(self.multiselection, function(obj) {
                        obj.data.x = obj.x;
                        obj.data.y = obj.y;
                    });
                });

                dispObj.on("dblclick", function(evt) {
                    self.duplicateObject(self.selectedObject);
                });
            },

            loadDefaultLevel: function() {
                var player = DefaultObjects.build('player');
                var level = DefaultObjects.level;
                level.player = player;

                this.load(level);
                this.regenerateLevelPropertiesTable();
            },

            keyFunc: function(event) {
                if (_.isEmpty(this.multiselection))
                    return;

                if (event.keys[KeyCoder.A]) {
                    _.each(this.multiselection, function(obj) {
                        obj.x--;
                        obj.data.x--;
                    });
                }

                if (event.keys[KeyCoder.D]) {
                    _.each(this.multiselection, function(obj) {
                        obj.x++;
                        obj.data.x++;
                    });
                }

                if (event.keys[KeyCoder.W]) {
                    _.each(this.multiselection, function(obj) {
                        obj.y--;
                        obj.data.y--;
                    });
                }

                if (event.keys[KeyCoder.S]) {
                    _.each(this.multiselection, function(obj) {
                        obj.y++;
                        obj.data.y++;
                    });
                }

                if (event.keys[KeyCoder.Q]) {
                    _.each(this.multiselection, function(obj) {
                        obj.rotation--;
                        obj.data.r--;
                    });
                }

                if (event.keys[KeyCoder.E]) {
                    _.each(this.multiselection, function(obj) {
                        obj.rotation++;
                        obj.data.r++;
                    });
                }

                //TODO: move it to KeyCoder maybe?
                var somethingPressed = _.any(event.keys, function(key) {
                    return key == true;
                });

                if (somethingPressed) {
                    this.regenerateObjectPropertiesTable();
                    this.updateWpPath();
                }
            },

            onLevelSaveClick: function() {
                //ensure everything is saved
                this.applyToLevel();

                var levelStr = JSON.stringify(this.levelData);

                var self = this;
                var actualSaveLevel = function() {
                    self.levelManager.saveLevel(self.levelData, function(result) {
                        if (result)
                            alertify.success("Level successfully saved!");
                        else
                            alertify.error("Unable to save level");
                    });
                };

                this.levelManager.isLevelExists(this.levelData.name,
                    function(result) {
                        if (result === null) {
                            alertify.error("Unable to save level");
                            return;
                        }

                        if (result == false)
                            actualSaveLevel();
                        else {
                            alertify.confirm("Level \"" + self.levelData.name + "\" already exists.\nDo you want to rewrite it?",
                                function (e) {
                                    e && actualSaveLevel();
                            });
                        }
                    });
            },

            onLevelLoadClick: function() {
                var self = this;

                var loader = function(ok, levelName) {
                    if (!ok)
                        return;

                    if (levelName == "") {
                        self.loadDefaultLevel();
                        return;
                    }

                    self.levelManager.loadLevelByName(levelName, function(data) {
                        if (data) {
                            self.load(data);
                            self.regenerateLevelPropertiesTable();
                            self.regenerateObjectPropertiesTable();
                        }
                        else
                            alertify.error("Unable to load level");
                    });
                };

                alertify.prompt("Input level name, or leave it empty to load empty level",
                    loader, "Level1");
            },

            onLevelNewClick: function() {
                var self = this;

                alertify.confirm("All unsaved data wil be lost, load new level?",
                    function (e) {
                        if (e)
                            self.loadDefaultLevel();
                    });
            },

            applyFilters: function(dispObj, filters) {
                dispObj.filters = filters;

                dispObj.cache(0, 0,
                    dispObj.getBounds().width,
                    dispObj.getBounds().height);
                dispObj.updateCache();
            },

            selectObject: function(dispObj) {
                var self = this;

                //reset filters
                _.each(this.multiselection, function(sel) {
                    self.applyFilters(sel, null);
                });
                this.multiselection = [];
                this.selectedObject = null;

                //select object
                this.selectedObject = dispObj;
                if (this.selectedObject) {
                    this.multiselection.push(this.selectedObject);

                    this.applyFilters(this.selectedObject, [this.selectionFilter]);

                    if (this.selectedObject.data.type == 'zombie') {
                        this.showObjectWayPoints(this.selectedObject);
                    }
                    else if(this.selectedObject.data.type != 'waypoint') {
                        this.hideObjectWayPoints();
                    }
                }

                this.regenerateObjectPropertiesTable();
            },

            selectOneMoreObject: function(dispObj) {
                if (_.isEmpty(this.multiselection))
                    this.selectObject(dispObj);
                else {
                    if (_.contains(this.multiselection, dispObj))
                        return;

                    this.selectedObject = null;

                    this.applyFilters(dispObj, [this.selectionFilter]);
                    this.multiselection.push(dispObj);

                    this.regenerateObjectPropertiesTable();
                }
            },

            addObjectByData: function(data, id) {
                this.levelData[data.type + 's'].push(data);

                var dispObj = this.addToStage(data, false, id);
                this.selectOneMoreObject(dispObj);

                return dispObj;
            },

            addWayPoint: function(data, after) {
                //insert after clicked wp
                var wps = this.showingWpsOwner.data.waypoints;

                var index = wps.indexOf(after) + 1;
                wps.splice(index, 0, data);

                var dispObj = this.addToStage(data);
                this.selectObject(dispObj);
            },

            createObject: function(type, tex, w, h) {
                var params = {
                    x: this.stage.getBounds().width/2,
                    y: this.stage.getBounds().height/2,

                    type: type,
                    tex: tex
                };

                if (w && h) {
                    params.w = w;
                    params.h = h;
                }

                var data = DefaultObjects.build(type, params);
                if (data.type == 'zombie') {
                    //create first WP
                    var wp = DefaultObjects.build('waypoint', {x: data.x + Editor.duplicateDelta, y: data.y});
                    data.waypoints.push(wp);
                }

                var dispObj = this.addObjectByData(data);
            },

            duplicateObjects: function() {
                var self = this;

                var selection = _.clone(self.multiselection);
                self.selectObject(null);

                _.each(selection, function(obj) {
                    self.duplicateObject(obj);
                });
            },

            duplicateObject: function(dispObj) {
                if (!dispObj)
                    return;

                var newData = _.cloneDeep(dispObj.data);
                newData.x += Editor.duplicateDelta;

                if (newData.type == 'waypoint') {
                    this.addWayPoint(newData, dispObj.data);
                    this.updateWpPath();
                }
                else
                    this.addObjectByData(newData);
            },

            regeneratePropertiesTable: function(tableId, idPrefix, data) {
                var objectTable = $(tableId).find("tbody");
                objectTable.empty();

                for (var field in data) {
                    var tr = $("<tr />");
                    tr.append($("<td />").text(field + ':'));
                    var td = $("<td />");
                    if (field != 'tex') {
                        var value = null;
                        var isArray = _.isArray(data[field]);
                        if (isArray)
                            value = JSON.stringify(data[field]);
                        else
                            value = data[field];

                        td.append($("<input />")
                            .attr('type', 'text')
                            .attr('id', idPrefix + '-' + field)
                            .data('isArray', isArray)
                            .val(value));
                    }
                    else {
                        var select = $("<select />")
                            .attr('id', idPrefix + '-' + field)
                            .data('isArray', _.isArray(data[field]));
                        td.append(select);

                        this.populateTexSelect(select);
                        select.val(data[field]);
                    }
                    tr.append(td);

                    objectTable.append(tr);
                }
            },

            regenerateLevelPropertiesTable: function() {
                //exclude arrays
                var obj = this.levelData;

                var excludedKeys = _.filter(_.keys(obj), function(el) { return _.isArray(obj[el]); });
                excludedKeys.push('player');
                excludedKeys.push('draggable');
                excludedKeys.push('type');
                excludedKeys.push('x');
                excludedKeys.push('y');

                this.regeneratePropertiesTable('#level-object', 'level',
                    _.omit(this.levelData, excludedKeys));
                $(window).resize(); //update sidebar's components heights
            },

            regenerateObjectPropertiesTable: function() {
                var data = this.selectedObject && this.selectedObject.data;

                this.regeneratePropertiesTable('#selected-object', 'object',
                    _.omit(data, ['waypoints']));

                $('#object-type').prop('disabled', true);
            },

            updateObjectData: function(dispObj, newData) {
                if (!dispObj || !newData)
                    return;

                if (newData.tex != dispObj.data.tex
                    || newData.w != dispObj.data.w
                    || newData.h != dispObj.data.h) {
                    this.replaceObject(dispObj, newData);
                }

                for (var field in newData) {
                    dispObj.data[field] = newData[field];
                }

                dispObj.x = dispObj.data.x;
                dispObj.y = dispObj.data.y;
                dispObj.rotation = dispObj.data.r;
            },

            replaceObject: function(dispObj, newData) {
                var data = _.merge(dispObj.data, newData);

                this.removeFromStage(dispObj);

                var doNotCenter = data.type == "background";
                var newObj = this.addToStage(data, doNotCenter);

                if (newObj.data.draggable !== false)
                    this.selectObject(newObj);
            },

            hideObjectWayPoints: function() {
                //remove old waypoints
                this.showingWpsOwner = null;
                this.stage.removeChild(this.wpPath);

                var wpsContainer = this.containers['waypoint'];
                wpsContainer && wpsContainer.removeAllChildren();
            },

            showObjectWayPoints: function(dispObj) {
                var self = this;
                this.hideObjectWayPoints();

                //show new ones
                this.showingWpsOwner = dispObj;
                if (this.showingWpsOwner == null)
                    return;

                var wps = this.showingWpsOwner.data.waypoints;
                if (wps.length) {
                    this.updateWpPath(wps);
                    _.each(this.showingWpsOwner.data.waypoints, function(wp) {
                        self.addToStage(wp);
                    });
                }
            },

            updateWpPath: function(wps) {
                if (!this.showingWpsOwner)
                    return;

                var waypoints = wps || this.showingWpsOwner.data.waypoints;

                this.mainContainer.removeChild(this.wpPath);
                if (waypoints.length) {
                    var graphics = new easeljs.Graphics();
                    graphics.setStrokeStyle(3, "round");
                    graphics.beginStroke("#00F");

                    graphics.moveTo(this.showingWpsOwner.x, this.showingWpsOwner.y);
                    graphics.lineTo(waypoints[0].x, waypoints[0].y);

                    _.each(this.showingWpsOwner.data.waypoints, function(wp) {
                        graphics.lineTo(wp.x, wp.y);
                    });
                    graphics.endStroke();

                    this.wpPath = new easeljs.Shape(graphics);
                    this.mainContainer.addChild(this.wpPath);
                }
            },

            deleteObject: function(dispObj) {
                if (!dispObj || dispObj.data.type == 'player')
                    return;

                var collection = null;
                if (dispObj.data.type != 'waypoint') {
                    var collectionName = dispObj.data.type + 's';
                    collection = this.levelData[collectionName];
                }
                else {
                    collection = this.showingWpsOwner.data.waypoints;
                }

                var id = collection.indexOf(dispObj.data);
                collection.splice(id, 1);

                this.removeFromStage(dispObj);

                this.selectObject(null);
            }
        });

    return Editor;
});
