var flash = require('connect-flash');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var alert = require('alert-node');
var session = require('express-session');
var cookieParser = require('cookie-parser');
const loki = require('lokijs');
var offline = new loki('db.db');
var usersdb = offline.addCollection('users');

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'pbkk';
const colName = 'users';

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

app.get('/register', function (req, res) {
    asooy();
    res.render('register.ejs');
});

app.get('/', function (req, res) {
    console.log('====== ISI OFFLINE DB======');
    var result = usersdb.chain().simplesort("name").data();
    console.log(result);
    console.log('====== END ISI OFFLINE DB======');    
    res.render('login.ejs');
});

app.post('/login', urlencodedParser ,function (req, res) {
    response = {
        username:req.body.username,
        password:req.body.password
    };

    MongoClient.connect(url, function(err, db) {
        if (err){
            console.log('tidak ada koneksi ke db');
            var username = usersdb.find({username:req.body.username});
            var password = usersdb.find({password:req.body.password});
            // console.log("awiw");
            // console.log(username);
            // console.log("awiw");
            if (typeof username !== 'undefined' && username.length > 0) {
            if(username[0]['username']){
                console.log('====== AUTH USER OFFLINE======');
                console.log(username[0]['username']);
                console.log(password[0]['password']);
                console.log('====== END AUTH USER OFFLINE======');
                req.session.user = req.username;
                res.redirect('/sukseslogin');                            
            }else{
                console.log('====== DATA TIDAK ADA ======');
                res.redirect('/');
            }}
        }
        else{
            var dbo = db.db(dbName);
            var query = { username : response.username, password:response.password };
            dbo.collection(colName).find(query).toArray(function(err, result) {
            if (err) throw err;
              if (typeof result !== 'undefined' && result.length > 0) {
                req.session.user = req.session.username;
                console.log(result);
                console.log('====== AUTH USER DB ONELIN======');
                console.log(result[0]['username']);
                console.log(result[0]['password']);
                console.log('====== END AUTH USER DB ONELIN======');                              
                res.redirect('/sukseslogin');
              }
              else{
                console.log('====== DATA TIDAK ADA ======');
                res.redirect('/');
              }
              db.close();
            });
        }
    });
});
app.post('/register', urlencodedParser ,function (req, res) {        
    if(!req.body.username || !req.body.password){
        res.redirect('/register');
    }
    response = {
        username:req.body.username,
        password:req.body.password
    };
    MongoClient.connect(url, function(err, db) {
        if (err){
            console.log('tidak ada keoneksi ke db');
            //DISABLE REGISTER OFFLINE
            usersdb.insert({username:response.username,password:response.password});
            //DISABLE REGISTER OFFLINE
        }else{
            var dbo = db.db(dbName);
            var query = { username: response.username, password: response.password };
            usersdb.insert({username:response.username,password:response.password});
            dbo.collection(colName).insertOne(query, function(err, res) {
              if (err) throw err;
              db.close();
            });            
        }
    });
    res.redirect('/');
});
app.get('/sukseslogin', function (req, res) {    
    res.render('sukseslogin.ejs');
});

function asooy(){
    MongoClient.connect(url, function(err, db) {
        if (err){
            console.log('tidak ada keoneksi ke db');
        }else{
            var dbo = db.db(dbName);
            dbo.collection(colName).find({}).toArray(function(err, result) {
            if (err) throw err;
                console.log(result.length);
                //sync ke local
                for (var i=0;i<result.length;i++){
                    let username = result[i]['username'];
                    let password = result[i]['password'];
                    let offlineusername = usersdb.find({username:username});
                    // console.log(offlineusername);
                    if(offlineusername.length < 1){
                        console.log('kosong');
                        usersdb.insert({username:username,password:password});        
                    }
                }            
            db.close();                
            });

            //DISABLE REGISTER OFFLINE
            var dataoffline = usersdb.chain().simplesort('username').data();
            for(var j=0; j<dataoffline.length ; j++){
                let username = dataoffline[j]['username'];
                let password = dataoffline[j]['password'];
                var query = { username : username};
                var promise1 = new Promise(function(resolve, reject){
                    resolve(dbo.collection(colName).find(query).toArray());
                });
                promise1.then((result) => {
                    db.close();
                    if (result.length > 0) {
                        console.log('data sudah ada');
                    }
                    else{
                        console.log('data belum ada');
                        var query = { username: username, password: password };
                        dbo.collection(colName).insertOne(query, function(err, res) {
                            console.log(err);                            
                            db.close();
                        });                            
                        // atasBawah(query,dbo);
                    }
                });

            }
            
            //DISABLE REGISTER OFFLINE
        }
    });    
}

// function atasBawah(query,dbo){

// }

var server = app.listen(1234, function () {
   console.log("========== ASHIAAAAP ===========")
})
