define([
    'classy',
    'lodash',
    'easel'
],
    function(Class, _, easeljs) {
        var StageManager = Class.$extend({
            __classvars__: {

            },

            __init__: function(stage, resourceManager) {
                this.stage = stage;
                this.resourceManager = resourceManager;
            },

            load: function() {
                this.containers = []; //wall, chest, waypoint and so on
                this.mainContainer = null; //for camera

                //reset stage
                this.stage.removeAllChildren();
                this.stage.update();

                //create main container for camera feature
                this.mainContainer = new createjs.Container();
                this.stage.addChild(this.mainContainer);
            },

            //kinda interface, maybe they should be null instead of functions, it doesn't really mater though
            update: function(event) {},
            keyFunc: function(event) {},
            resize: function() {},

            createContainer: function(name, toStage) {
                var container = new createjs.Container();
                this.containers[name] = container;

                if (toStage)
                    this.stage.addChild(container);
                else
                    this.mainContainer.addChild(container);
            },

            //objData requires to have {type, tex, x, y}
            addToStage: function(objData, doNotCenter, id) {
                if (objData instanceof createjs.DisplayObject)
                    objData.type = objData.data.type;

                if (!_.isUndefined(id))
                    throw "addToStage: Do you really need id?";

                if (_.isUndefined(objData.type)) {
                    console.log(objData);
                    throw "addToStage: objData.type should be specified!";
                }

                var spriteSheet =
                    this.resourceManager.getTiledSpriteSheet(objData.tex, objData.w, objData.h);

                var sprite = new easeljs.Sprite(spriteSheet);

                if (_.isUndefined(this.containers[objData.type]))
                    this.createContainer(objData.type);

                var addTo = this.containers[objData.type];

                var dispObj = null;
                if (id)
                    dispObj = addTo.addChildAt(sprite, id);
                else
                    dispObj = addTo.addChild(sprite);

                dispObj.x = objData.x || objData.width/2 || 0;
                dispObj.y = objData.y || objData.height/2 || 0;
                dispObj.rotation = objData.r || objData.rotation || 0;
                if (!doNotCenter) {
                    dispObj.regX = dispObj.getBounds().width / 2;
                    dispObj.regY = dispObj.getBounds().height / 2;
                }
                dispObj.data = objData;

                return dispObj;
            },

            //(x, y, type, ...)
            //ex: this.addPoint({x: 100, y: 200, type: "i'm a point"});
            addPoint: function(objData) {
                if (_.isUndefined(objData.type))
                    throw "addPoint: type is undefined";

                var point = new createjs.Shape();
                point.x = objData.x;
                point.y = objData.y;
                point.data = objData;

                if (_.isUndefined(this.containers[objData.type]))
                    this.createContainer(objData.type);

                return this.containers[objData.type].addChild(point);
            },

            removeFromStage: function(dispObj) {
                var container = this.containers[dispObj.data.type];
                container.removeChild(dispObj);
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
                var collection = this.levelData[collectionName];

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

        return StageManager;
    });