var utils = require('./utils.js');

var mongodb_helper = {
    /**
     * @param connection_info Connection Info structure
     * @param {String} [connection_info.host='127.0.0.1']
     * @param {Number} [connection_info.port=27017]
     * @param {String} connection_info.user Mongodb user
     * @param {String} connection_info.password Mongodb password
     * @param {String} connection_info.db Database to connect
     * @param {String[]} connection_info.collections Array of required collections
     * @returns {*} mongodb instance or null if required parameters not valid
     */
    connect: function(connection_info) {
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