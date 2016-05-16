module.exports = {
  setUUID: function() {
    var node_uuid = require('node-uuid');
    return node_uuid.v4();
  }
};
