var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mergeArray = require('merge-array');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const port = 8000;

const mongoDB = require('mongodb').MongoClient;
const db_url = 'mongodb://127.0.0.1:27017';
const db_name = 'pbkk_online';
const db_collection = 'users';

app.get('/', function (req, res) {
  res.render('../register.ejs');
});

app.post('/register', urlencodedParser ,function (req, res) {        
  if(!req.body.username || !req.body.password){
      res.redirect('/register');
  }
  response = {
      username:req.body.username,
      password:req.body.password
  };
  mongoDB.connect(db_url, function(err, db) {
      if (err){
          console.log('tidak ada koneksi ke db online');
      }else{
          var dbo = db.db(db_name);
          var query = { username: response.username, password: response.password };
          dbo.collection(db_collection).insertOne(query, function(err, res) {
            if (err) throw err;
            db.close();
          });         
      }
  });
  res.redirect('/');
});
app.listen(port, () => console.log(`app berjalan di port ${port}!`))
