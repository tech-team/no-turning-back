define([
    'classy',
    'lodash',
    'easel',
    'jquery',
    'game/KeyCoder',
    'game/ResourceManager',
    'game/LevelManager',
    'game/DefaultObjects'
],
    function(Class, _, easeljs, $, KeyCoder, ResourceManager, LevelManager, DefaultObjects) {
        var Editor = Class.$extend({
            __classvars__: {
                duplicateDelta: 30
            },

            __init__: function(level, stage) {
                this.level = level;

                this.keyCoder = new KeyCoder();
                this.stage = stage;
                this.showingWpsOwner = null;
                this.selectedObject = null;
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

                $('#addObject').click(function() {
                    var type = $('#add-type-select').val();
                    var tex = $('#add-texture-select').val();

                    self.createObject(type, tex);
                    return false;
                });

                $('#deleteObject').click(function() {
                    if (self.selectedObject)
                        self.deleteObject(self.selectedObject);
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

                this.regenerateLevelPropertiesTable();
                this.populateTexSelect();
                this.populateTypeSelect();
            },

            applyToObject: function() {
                if (!self.selectedObject)
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
                                alert("Unable to parse array for '" + prop + "' property. Changes will be rejected.");
                            }
                        }
                        else
                            data[prop] = parseInt($input.val()) || $input.val();
                    }
                });

                self.updateObjectData(self.selectedObject, data);
                self.regenerateObjectPropertiesTable();
                self.updateWpPath();
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

                this.updateObjectData(this.level.background, data);
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

            //it's not required to be container, sprite would be ok as well
            setContainerHandlers: function(container) {
                var self = this;

                if (container.data.draggable === false) {
                    container.on("click", function(evt) {
                        self.selectObject(null);
                    });

                    return;
                }

                container.on("pressmove", function(evt) {
                    //self.selectObject(evt.currentTarget);

                    if (evt.nativeEvent.button != 1) { //middle mouse button
                        evt.currentTarget.x = evt.stageX;
                        evt.currentTarget.y = evt.stageY;

                        //TODO: properties, which will set .x and .data.x fields simultaneously, would be much appreciated
                        evt.currentTarget.data.x = evt.stageX;
                        evt.currentTarget.data.y = evt.stageY;

                        self.updateWpPath();
                        self.regenerateObjectPropertiesTable();
                    }
                });

                container.on("mousedown", function(evt) {
                    self.selectObject(evt.currentTarget);
                });

                container.on("dblclick", function(evt) {
                    self.duplicateObject(self.selectedObject);
                });
            },

            loadDefaultLevel: function() {
                var player = DefaultObjects.build('player');
                var level = DefaultObjects.level;
                level.player = player;

                this.level.reload(level);
                this.regenerateLevelPropertiesTable();
            },

            keyFunc: function(event) {
                if (this.selectedObject == null)
                    return;

                if (event.keys[KeyCoder.A]) {
                    this.selectedObject.x--;
                    this.selectedObject.data.x--;
                }

                if (event.keys[KeyCoder.D]) {
                    this.selectedObject.x++;
                    this.selectedObject.data.x++;
                }

                if (event.keys[KeyCoder.W]) {
                    this.selectedObject.y--;
                    this.selectedObject.data.y--;
                }

                if (event.keys[KeyCoder.S]) {
                    this.selectedObject.y++;
                    this.selectedObject.data.y++;
                }

                if (event.keys[KeyCoder.Q]) {
                    this.selectedObject.rotation--;
                    this.selectedObject.data.r--;
                }

                if (event.keys[KeyCoder.E]) {
                    this.selectedObject.rotation++;
                    this.selectedObject.data.r++;
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

                var levelStr = JSON.stringify(this.level.data);

                var self = this;
                var actualSaveLevel = function() {
                    $.ajax({
                        type: 'POST',
                        url: 'levels',
                        data: {
                            name: self.level.data.name,
                            data: levelStr
                        },
                        success: function(data) {
                            alert("Level successfully saved!");
                        },
                        error: function(data) {
                            alert("Unable to save level");
                        }
                    });
                };

                $.ajax({
                    type: 'GET',
                    url: 'levels/exists',
                    data: {name: this.level.data.name},
                    dataType: 'json',
                    success: function(data) {
                        if (data == false)
                            actualSaveLevel();
                        else {
                            if (confirm("Level " + self.level.data.name + " already exists.\nDo you want to rewrite it?"))
                                actualSaveLevel();
                        }
                    },
                    error: function(data) {
                        alert("Unable to save level");
                    }
                });
            },

            onLevelLoadClick: function() {
                var res = prompt("Input level name, or leave it empty to load empty level");
                if (res != null) {
                    if (res == "")
                        this.loadDefaultLevel();
                    else {
                        var self = this;
                        $.ajax({
                            type: 'GET',
                            url: 'levels',
                            data: {name: res},
                            dataType: 'json',
                            success: function(data) {
                                self.level.reload(data);
                            },
                            error: function(data) {
                                alert("Unable to load level");
                            }
                        });
                    }
                }
            },

            onLevelNewClick: function() {
                var res = confirm("All unsaved data wil be lost, load new level?");
                if (res)
                    this.loadDefaultLevel();
            },

            applyFilters: function(dispObj, filters) {
                dispObj.filters = filters;

                dispObj.cache(0, 0,
                    dispObj.getBounds().width,
                    dispObj.getBounds().height);
                dispObj.updateCache();
            },

            selectObject: function(dispObj) {
                //reset filters
                if (this.selectedObject) {
                    this.applyFilters(this.selectedObject, null);
                }

                //select object
                this.selectedObject = dispObj;
                if (this.selectedObject) {
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

            addObjectByData: function(data, id) {
                this.level.data[data.type + 's'].push(data);

                var dispObj = this.level.addToStage(data, false, id);
                this.selectObject(dispObj);

                return dispObj;
            },

            addWayPoint: function(data, after) {
                //insert after clicked wp
                var wps = this.showingWpsOwner.data.waypoints;

                var index = wps.indexOf(after) + 1;
                wps.splice(index, 0, data);

                var dispObj = this.level.addToStage(data);
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
                var obj = this.level.data;

                var excludedKeys = _.filter(_.keys(obj), function(el) { return _.isArray(obj[el]); });
                excludedKeys.push('player');
                excludedKeys.push('draggable');
                excludedKeys.push('type');
                excludedKeys.push('x');
                excludedKeys.push('y');

                this.regeneratePropertiesTable('#level-object', 'level',
                    _.omit(this.level.data, excludedKeys));
                $(window).resize(); //update sidebar's components heights
            },

            regenerateObjectPropertiesTable: function() {
                if (!this.selectedObject)
                    return;

                this.regeneratePropertiesTable('#selected-object', 'object',
                    _.omit(this.selectedObject.data, ['waypoints']));

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
                dispObj.removeAllChildren();

                var spriteSheet =
                    this.level.resourceManager.getTiledSpriteSheet(newData.tex, newData.w, newData.h);

                var sprite = new easeljs.Sprite(spriteSheet);

                dispObj.addChild(sprite);

                if (this.selectedObject == dispObj) //if it was selected
                    this.selectObject(dispObj); //update it
            },

            hideObjectWayPoints: function() {
                //remove old waypoints
                this.showingWpsOwner = null;
                this.stage.removeChild(this.wpPath);
                this.level.containers['waypoint'].removeAllChildren();
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
                        self.level.addToStage(wp);
                    });
                }
            },

            updateWpPath: function(wps) {
                if (!this.showingWpsOwner)
                    return;

                var waypoints = wps || this.showingWpsOwner.data.waypoints;

                //NB: wpPath has no container
                this.stage.removeChild(this.wpPath);
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
                    this.stage.addChild(this.wpPath);
                }
            },

            deleteObject: function(dispObj) {
                if (!dispObj || dispObj.data.type == 'player')
                    return;

                var collection = null;
                if (dispObj.data.type != 'waypoint') {
                    var collectionName = dispObj.data.type + 's';
                    collection = this.level.data[collectionName];
                }
                else {
                    collection = this.showingWpsOwner.data.waypoints;
                }

                var id = collection.indexOf(dispObj.data);
                collection.splice(id, 1);

                this.level.removeFromStage(dispObj);
            },

            bringToFront: function(dispObj) {
                this.bringTo(dispObj, "front");
            },

            bringToBack: function(dispObj) {
                this.bringTo(dispObj, "back");
            },

            bringTo: function(dispObj, to) {
                //omit single objects
                if (!dispObj || dispObj.data.type == 'player')
                    return;

                var collectionName = dispObj.data.type + 's';
                var collection = this.level.data[collectionName];

                if (_.isUndefined(collection) || collection.length <= 1)
                    return;

                var id = 0;
                if (to === "front")
                    id = collection.indexOf(dispObj.data);
                collection.move(id, collection.length - 1);

                var container = this.level.containers[dispObj.data.type];

                if (to === "front") {
                    var childrenCount = container.getNumChildren();
                    container.setChildIndex(dispObj, childrenCount - 1);
                }
                else
                    container.setChildIndex(dispObj, 0);
            }
        });

    return Editor;
});