define(function(){
    function FnQuery(){
        this.query = [];
    }

    FnQuery.prototype = {
        add: function(fn){
            if (this._store){
                this.query.push(fn);
            } else {
                fn();
            }
        },

        store: function(){
            this._store = true;
        },

        run: function(){
            this._store = false;

            for (var i = 0, l = this.query.length; i < l; i++){
                this.query[i]();
            }

            this.query = [];
        }
    };

    return FnQuery;
});
