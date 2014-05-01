define([],
    function() {
        return function() {
            Array.prototype.move = function (old_index, new_index) {
                while (old_index < 0) {
                    old_index += this.length;
                }
                while (new_index < 0) {
                    new_index += this.length;
                }
                if (new_index >= this.length) {
                    var k = new_index - this.length;
                    while ((k--) + 1) {
                        this.push(undefined);
                    }
                }
                this.splice(new_index, 0, this.splice(old_index, 1)[0]);
                return this; // for testing purposes
            };

            Array.prototype.remove = function (item) {
                var i;
                while((i = this.indexOf(item)) !== -1) {
                    this.splice(i, 1);
                }
            };

            Array.prototype.removeAt = function (id) {
                this.splice(id, 1);
            };
        };
    }
);