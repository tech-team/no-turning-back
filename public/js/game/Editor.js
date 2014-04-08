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

                $('#addObject').click(function() {
                    var type = $('#type-select').val();
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
                    if (!self.selectedObject)
                        return false;

                    var data = {};
                    var inputs = $("#selected-object").find("input, select");
                    inputs.each(function(i, input) {
                        var $input = $(input);

                        var field = input.id.split('-');

                        if (field[0] == 'object') {
                            var prop = field[1];
                            if ($input.data('isArray') == true)
                                data[prop] = $input.val().split(',');
                            else
                                data[prop] = parseInt($input.val()) || $input.val();
                        }
                    });

                    self.updateObjectData(self.selectedObject, data);
                    self.regenerateObjectPropertiesTable();
                    self.updateWpPath();
                    return false;
                });

                $('#applyToLevel').click(function() {
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

                    self.updatedata(data);
                    self.regenerateLevelPropertiesTable();
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

                this.regenerateLevelPropertiesTable();
                this.populateTexSelect();
                this.populateTypeSelect();
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
                //warning, overriding Level's data
                this.level.data = level;

                this.stage.removeAllChildren();
                this.level.addToStage(level, true, 0);
                this.level.addToStage(player);
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
                }

                $.ajax({
                    type: 'GET',
                    url: 'levels/exists',
                    data: {name: this.level.data.name},
                    dataType: 'json',
                    success: function(data) {
                        if (data == "false")
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
                                alert("Level successfully loaded!");
                            },
                            error: function(data) {
                                alert("Unable to load level");
                            }
                        });
                    }
                }
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
                }

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
                this.showObjectWayPoints(dispObj);
            },

            duplicateObject: function(dispObj) {
                if (!dispObj)
                    return;

                var newData = _.cloneDeep(dispObj.data);
                newData.x += Editor.duplicateDelta;

                //deep copy all inner arrays and objects
                //if (newData.type == 'zombie')
                //    newData.waypoints = _.clone(newData.waypoints);

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
                        td.append($("<input />")
                            .attr('type', 'text')
                            .attr('id', idPrefix + '-' + field)
                            .data('isArray', _.isArray(data[field]))
                            .val(data[field]));
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

            updatedata: function(newData) {
                if (!newData)
                    return;

                var dispObj = this.level.background;

                if (newData.tex != dispObj.data.tex
                    || newData.w != dispObj.data.w
                    || newData.h != dispObj.data.h) {
                    this.replaceObject(dispObj, newData);
                }

                for (var field in newData) {
                    dispObj.data[field] = newData[field];
                }
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
                var self = this;
                var oldWps = [];

                //find old waypoints
                _.each(this.stage.children, function(child) {
                    if (child.data && child.data.type == 'waypoint')
                        oldWps.push(child);
                });

                //delete them
                this.showingWpsOwner = null;
                this.stage.removeChild(this.wpPath);
                _.each(oldWps, function(wp) {
                    self.stage.removeChild(wp);
                });
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

                var id = collection.indexOf(dispObj);
                collection.splice(id, 1);
                this.stage.removeChild(dispObj);
            }
        });

    return Editor;
});