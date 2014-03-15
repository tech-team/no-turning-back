define([
    'classy',
    'underscore',
    'easel',
    'jquery',
    'game/KeyCoder',
    'game/ResourceManager',
    'game/DefaultObjects'
],
    function(Class, _, easeljs, $, KeyCoder, ResourceManager, DefaultObjects) {
        var Editor = Class.$extend({
            __init__: function(level, stage) {
                this.level = level;
                this.stage = stage;
                this.selectedObject = null;
                this.selectionFilter = new easeljs.ColorFilter(1, 1, 1, 1, 10, 60, 10, 100);

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
                    if (!self.selectedObject || self.selectedObject.data.type == 'player')
                        return false;

                    var collectionName = self.selectedObject.data.type + 's';
                    var collection = self.level.levelData[collectionName];

                    var id = collection.indexOf(self.selectedObject);
                    collection.splice(id, 1);
                    self.stage.removeChild(self.selectedObject);
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

                        if (field[0] == 'object')
                            data[field[1]] = parseInt($input.val()) || $input.val();
                    });

                    self.updateObjectData(self.selectedObject, data);
                    self.regenerateObjectPropertiesTable();
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

                this.populateTexSelect();
            },

            populateTexSelect: function(select) {
                var textureSelect = select || $('.texture-select');

                _.each(ResourceManager.texList, function(tex) {
                    textureSelect.append($("<option />").val(tex).text(tex));
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

                    evt.currentTarget.x = evt.stageX;
                    evt.currentTarget.y = evt.stageY;

                    //TODO: properties, which will set .x and .data.x fields simultaneously, would be much appreciated
                    evt.currentTarget.data.x = evt.stageX;
                    evt.currentTarget.data.y = evt.stageY;

                    self.regenerateObjectPropertiesTable();
                    //self.stage.update();
                });

                container.on("mousedown", function(evt) {
                    self.selectObject(evt.currentTarget);
                });

                container.on("dblclick",function(evt) {
                    self.duplicateObject(self.selectedObject);
                });
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

                if (somethingPressed)
                    this.regenerateObjectPropertiesTable();
            },

            onLevelSaveClick: function() {
                alert(JSON.stringify(this.level.data));
            },

            onLevelLoadClick: function() {
                alert("Not implemented");
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
                if (this.selectedObject)
                    this.applyFilters(this.selectedObject, [this.selectionFilter]);

                this.regenerateObjectPropertiesTable();
            },

            addObjectByData: function(data, id) {
                var collectionName = data.type + 's';

                this.level.levelData[collectionName].push(data);
                var dataRef = this.level.levelData[collectionName][this.level.levelData[collectionName].length-1];

                var dispObj = this.level.addToStage(dataRef, false, id);
                this.selectObject(dispObj);

                return dispObj;
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
                this.addObjectByData(data);
            },

            duplicateObject: function(dispObj) {
                var newData = _.clone(dispObj.data);
                this.addObjectByData(newData);
            },

            regenerateObjectPropertiesTable: function() {
                var objectTable = $("#selected-object").find("tbody");
                objectTable.empty();

                if (!this.selectedObject)
                    return;

                for (var field in this.selectedObject.data) {
                    var tr = $("<tr />");
                    tr.append($("<td />").text(field + ':'));
                    var td = $("<td />");
                    if (field != 'tex') {
                        td.append($("<input />")
                            .attr('type', 'text')
                            .attr('id', 'object-' + field)
                            .val(this.selectedObject.data[field]));
                    }
                    else {
                        var select = $("<select />")
                            .attr('id', 'object-' + field)
                        td.append(select);

                        this.populateTexSelect(select);
                        select.val(this.selectedObject.data[field]);
                    }
                    tr.append(td);

                    objectTable.append(tr);
                }

                $('#object-type').prop('disabled', true);
            },

            updateObjectData: function(dispObj, newData) {
                if (!dispObj || !newData)
                    return;

                if (newData.tex != dispObj.data.tex
                    || newData.w != dispObj.data.w
                    || newData.h != dispObj.data.h) {
                    this.replaceObject(dispObj, newData);
                    alert(newData.tex + " : " + dispObj.data.tex);
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
                this.selectObject(dispObj);
            }
        });

    return Editor;
});