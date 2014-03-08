define([
    'classy',
    'underscore',
    'easel',
    'jquery',
    'game/KeyCoder',
    'game/ResourceManager'
],
    function(Class, _, easeljs, $, KeyCoder, ResourceManager) {
        var Editor = Class.$extend({
            __init__: function(level, stage) {
                this.level = level;
                this.stage = stage;
                this.selectedObject = null;
                this.selectionFilter = new easeljs.ColorFilter(1, 1, 1, 1, 10, 60, 10, 100);

                var self = this;
                $('#levelSave').click(function(evt) {
                    self.onLevelSaveClick();
                });

                $('#levelLoad').click(function(evt) {
                    self.onLevelLoadClick();
                });

                $('#addObject').click(function() {
                    var type = $('#type-select').val();
                    var tex = $('#texture-select').val();

                    var data = {
                        x: self.stage.getBounds().width/2,
                        y: self.stage.getBounds().height/2,
                        r: 0,
                        type: type,
                        tex: tex
                    };

                    var collectionName = type + 's';

                    self.level.levelData[collectionName].push(data);
                    var dataRef = self.level.levelData[collectionName][self.level.levelData[collectionName].length-1];

                    self.level.addToStage(dataRef);
                });

                $('#deleteObject').click(function() {
                    if (!self.selectedObject || self.selectedObject.data.type == 'player')
                        return;

                    var collectionName = self.selectedObject.data.type + 's';
                    var collection = self.level.levelData[collectionName];

                    var id = collection.indexOf(self.selectedObject);
                    collection.splice(id, 1);
                    self.stage.removeChild(self.selectedObject);
                });

                $(window).bind("mousewheel", function(evt) {
                    if (!self.selectedObject)
                        return;

                    if (evt.originalEvent.wheelDelta >= 0){
                        self.selectedObject.rotation--;
                        self.selectedObject.data.r--;
                    } else {
                        self.selectedObject.rotation++;
                        self.selectedObject.data.r++;
                    }
                });

                var textureSelect = $('#texture-select');
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
                    self.selectObject(evt.currentTarget);

                    evt.currentTarget.x = evt.stageX;
                    evt.currentTarget.y = evt.stageY;

                    //TODO: properties, which will set .x and .data.x fields simultaneously, would be much appreciated
                    evt.currentTarget.data.x = evt.stageX;
                    evt.currentTarget.data.y = evt.stageY;

                    //self.stage.update();
                });

                container.on("click", function(evt) {
                    self.selectObject(evt.currentTarget);
                });

                container.on("dblclick",function(evt) {
                    //TODO: double selectedObject
                    console.log(evt.currentTarget.data);
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
            }
        });

    return Editor;
});