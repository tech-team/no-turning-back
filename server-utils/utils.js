var utils = {
    is_invalid: function(obj) {
        return obj == null || typeof obj == 'undefined';
    },
    default_callbacks: function(callbacks, extra) {
        callbacks.success = callbacks.success || function(data) {};
        callbacks.error = callbacks.error || function(data) {};
        if (extra) {
            for (var i = 0; i < extra.length; ++i) {
                callbacks[extra[i]] = callbacks[extra[i]] || function(data) {};
            }
        }
        return callbacks;
    }
};

module.exports = utils;