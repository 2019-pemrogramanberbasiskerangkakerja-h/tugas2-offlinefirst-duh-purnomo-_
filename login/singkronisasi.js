
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'pbkk_local';
const collection = 'users';

const MongoClient_online = require('mongodb').MongoClient;
const url_online = 'mongodb://192.168.191.12:27017/pbkk_online';
const db_online = 'pbkk_online';
const collection_online = 'users';


exports.singkron_db = function(){
    var data_arr = [];
    get_offline(function(result_off) {
        get_online(function(result_on) {
            data_arr = result_off.concat(result_on);
            data_arr = cek_data(data_arr,'_id');
            if(data_arr.length > 0){
                MongoClient.connect(url, function(err, db) {
                    if (err) throw err;
                    var dbo = db.db(dbName);
                    dbo.collection(collection).dropIndexes();
                    dbo.collection(collection).deleteMany(function(err, obj) {
                        if (err) throw err;
                    });
                    dbo.collection(collection).insertMany(data_arr, function(err, res) {
                        if (err) throw err;
                    });
                    db.close();
                });

                MongoClient_online.connect(url_online, function(err, db) {
                    if (err) throw err;
                    var dbo = db.db(db_online);
                    dbo.collection(collection_online).dropIndexes();
                    dbo.collection(collection_online).deleteMany(function(err, obj) {
                        if (err) throw err;
                    });
                    dbo.collection(collection_online).insertMany(data_arr, function(err, res) {
                    if (err) throw err;
                    });
                    db.close();
                });
            }
        });
    });
}

function get_offline(callback){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);
        dbo.collection(collection).find({}).toArray(function(err, result) {
        if (err) throw err;
        db.close();
        return callback(result);
        });
    });
}

function get_online(callback){
    MongoClient_online.connect(url_online, function(err, db) {
        if (err) throw err;
        var dbo = db.db(db_online);
        dbo.collection(collection_online).find({}).toArray(function(err, result) {
        if (err) throw err;
        db.close();
        return callback(result);
        });
    });
}

function cek_data( arr, index ) {
    var obj = {};
    for ( var i = 0, len = arr.length; i < len; i++ ){
      if(!obj[arr[i][index]]){} obj[arr[i][index]] = arr[i];
    }
    var newArr = [];
    for ( var key in obj ) newArr.push(obj[key]);
    return newArr;
}
