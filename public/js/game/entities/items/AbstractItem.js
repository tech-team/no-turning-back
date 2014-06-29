define([
    'game/entities/GameObject'
], function(GameObject) {
    var AbstractItem = GameObject.$extend({
        __init__: function(dispObj) {
            var obj = {};
            if (!dispObj.data) {
                obj.data = dispObj;
            } else {
                obj = dispObj;
            }
            this.$super(obj);
        },

        type: function() {
            return this._rawData().type;
        },

        applyItem: function() {
            throw "applyItem is not implemented";
        }
    });

    return AbstractItem;
});