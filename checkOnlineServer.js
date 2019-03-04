
var mongodb = require('mongodb');
var client;
var collections = { };

new mongodb.Db("pbkk_server_online").open((function (err, c) {
  if (!err) {
    client = c;
    client.on('close', function() {
      client = null; // clear client
      collections = { }; // clear old collections
      // connection closed
    });
  } else {
    // error connecting
  }
}));

// get collection
exports.get = function(name, callback) {
  if (client) {
    if (!collections[name]) {
      collections[name] = new mongodb.Collection(client, name);
    }
    callback(null, collections[name]);
  } else {
    // can perform reconnecting and then get collection and call callback
    callback(new Error('not connected'));
  }
}
