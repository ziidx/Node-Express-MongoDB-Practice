// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// Should return JSON object containing date in both unix and utc format
app.get("/api/:date?", (req, res) => {
  let date_string;

  if(+req.params.date){
    date_string = new Date(+req.params.date);
  }
  
  else if(req.params.date === undefined) {
    date_string = new Date();
  }

  else{
    date_string = new Date(req.params.date);
  }


  if(date_string.getTime() === NaN || date_string.toUTCString() === "Invalid Date"){
    res.json({ error: "Invalid Date" })
  }
  else{
    res.json({"unix": date_string.getTime(), "utc": date_string.toUTCString()})
  }
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
