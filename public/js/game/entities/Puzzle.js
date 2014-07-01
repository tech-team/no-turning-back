define([
    'game/entities/GameObject'
], function(GameObject) {
    var Puzzle = GameObject.$extend({
        __init__: function(dispObj, doors) {
            this.$super(dispObj);

            this.inputCode = "";
            this.targetDoors = [];
            _.each(doors, function(door) {
                if (door.puzzleName() && door.puzzleName() == this.puzzleName() && door.isClosed()) {
                    this.targetDoors.push(door);
                }
            }.bind(this));

            this.solvedStatus = null;


            this.buttonsObjects = [];
        },

        __classvars__: {

        },

        isSolved: function() {
            return this.solvedStatus;
        },

        _buttons: function() {
            return this._rawData().buttons;
        },

        buttons: function() {
            return this.buttonsObjects;
        },

        addButton: function(buttonObject) {
            this.buttonsObjects.push(buttonObject);
        },

        puzzleName: function() {
            return this._rawData().puzzleName;
        },

        code: function() {
            return this._rawData().code;
        },

        targets: function() {
            return this.targetDoors;
        },

        updateTargets: function() {
            var self = this;
            _.each(this.targets(), function(target) {
                target.setPuzzleSolved();
            });

        },

        update: function(buttonCode) {
            if (this.solvedStatus === false)
                this.solvedStatus = null;

            this.inputCode += buttonCode;
            if (this.inputCode.length >= this.code().length) {
                if (this.code() === this.inputCode) {
                    this.solvedStatus = true;
                    this.updateTargets();
                } else {
                    this.solvedStatus = false;
                    this.inputCode = "";
                }
            }

            return this.solvedStatus;
        }
    });

    return Puzzle;
});