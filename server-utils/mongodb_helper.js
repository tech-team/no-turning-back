var utils = require('./utils.js');

var mongodb_helper = {
    connect: function(connection_info) {
        /*
         * connection_info - connection info structure
         *  -> host; default = 127.0.0.1
         *  -> port; default = 27017
         *  -> user;
         *  -> password;
         *  -> db;
         *  -> collections;
         *
         *  Returns: mongodb instance or null if required parameters not valid
         */

        if (utils.is_invalid(connection_info)
            || utils.is_invalid(connection_info.user)
            || utils.is_invalid(connection_info.password)
            || utils.is_invalid(connection_info.db)
            || utils.is_invalid(connection_info.collections)) {

            return null;
        }

        connection_info.host = connection_info.host || '127.0.0.1';
        connection_info.port = connection_info.port || 27017;

        var dbUrl = connection_info.user + ':'
                        + connection_info.password + '@'
                        + connection_info.host + ':'
                        + connection_info.port + '/'
                        + connection_info.db;

        return require("mongojs").connect(dbUrl, connection_info.collections);
    }
};

module.exports = mongodb_helper;