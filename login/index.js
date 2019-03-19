var flash = require('connect-flash');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var session = require('express-session');
var cookieParser = require('cookie-parser');
var unique = require('array-unique');
var sinkronisasi = require('./singkronisasi');
var sinkronisasi_log = require('./singkron_log');

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017';
const dbName = 'pbkk_local';
const collection = 'users';

const MongoClientLog = require('mongodb').MongoClient;
const urlLog = 'mongodb://127.0.0.1:27017';
const dbNameLog = 'pbkk_local';
const collectionLog = 'log';

const MongoClient_online = require('mongodb').MongoClient;
const url_online = 'mongodb://192.168.191.12:27017/pbkk_online';
const db_online = 'pbkk_online';
const collection_online = 'users';
const collection_online_log = 'log';



app.set('views', __dirname + '/');
app.engine('html', require('ejs').renderFile);
app.use(cookieParser());
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));

app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
});

app.get('/', function (req, res) {
    res.render('login.ejs');
});


app.post('/login', urlencodedParser ,function (req, res) {
    response = {
        username:req.body.username,
        password:req.body.password
    };

    MongoClient_online.connect(url_online, function(err, client) {
        if(err){
            console.log(err);
            console.log('+++ OFFLINE LOGIN ++++');
            MongoClient.connect(url, function(err, db) {
                    if (err) throw err;
                    var dbo = db.db(dbName);
                    var query = { username : req.body.username, password : req.body.password };
                    dbo.collection(collection).find(query).toArray(function(err, result) {
                    if (err) throw err;
                    console.log(result);
                    if(result.length > 0){
                        db.close();
                        sendLogOff(req, "Berhasil", "Offline");
                        res.redirect('/welcome');
                    }
                    else{
                        db.close();
                        sendLogOff(req, "Gagal", "Offline");
                        res.redirect('/');
                    }
                });
            });

            
        }
        else{
            console.log('+++ ONLINE LOGIN ++++');
            MongoClient_online.connect(url_online, function(err, db) {
                if (err) throw err;
                var dbo = db.db(db_online);
                var query = { username : req.body.username, password : req.body.password };
                dbo.collection(collection_online).find(query).toArray(function(err, result) {
                  if (err) throw err;
                  if(result.length > 0){
                    // singkron_db();
                    sinkronisasi.singkron_db();
                    sinkronisasi_log.singkronlog_db();
                    console.log('Username : ' + result[0]['username']);
                    sendLog(req, "Berhasil", "Online");

                    res.redirect('/welcome');
                  }
                  else{
                    console.log('!!! LOGIN GAGAL !!!');
                    sendLog(req, "Gagal", "Online");
                    res.redirect('/');
                  }
                  const db = client.db(dbName);
                  client.close();
                });
            });
        }
    });
});

app.get('/welcome', function (req, res) {    
    console.log('OK');
    res.render('welcome.ejs');
});


var server = app.listen(8000, function () {
   console.log("login -> 8000")
})


function sendLog(req, log, method){
    MongoClient_online.connect(url_online, function(err, db) {
        if (err) throw err;
        var dbo = db.db(db_online);
        var query = { log : log, username : req.body.username, state:method};
        dbo.collection(collection_online_log).insertOne(query, function(err, res){
            if(err) throw err;
            db.close();
        });
    });    
}


function sendLogOff(req, log, method){
    MongoClientLog.connect(urlLog, function(err, db) {
        if (err) throw err;
        var dbo = db.db(dbNameLog);
        var query = { log : log, username : req.body.username, state:method};
        dbo.collection(collectionLog).insertOne(query, function(err, res){
            if(err) throw err;
            db.close();
        });
    });                    
}
