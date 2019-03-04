const express = require('express')
const app = express()
const port = 8008

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
app.get('/', function (req, res) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("pbkk_server_online");
        dbo.collection("akun").find({}).toArray(function(err, result) {
          if (err) throw err;
          console.log(result);
          db.close();
        });
      });
    res.render('cek terminal');
});  
app.listen(port, () => console.log(`Aplikasi Berjalan di port ${port}!`))
