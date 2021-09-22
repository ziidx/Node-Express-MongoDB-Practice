require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const validator = require('validator');
const mongoose = require('mongoose');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({extended: false})); 

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {console.log('connected to DB!')}, (err) => {console.log(err)});

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

/**
 * Define mongoDB schema and model
 */
const urlSchema = new mongoose.Schema({
  full_url: {type: String, required: true},
  short_url: Number
})

const urlEntry = mongoose.model('urlEntry', urlSchema);

/** APIs
 * 
 * 
 * 
 * 
 * 
 * 
 */

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

//Return all stored urls and their corresponding shorturls currently in DB
app.get('/sites', async (req ,res) => {
  const sites = await urlEntry.find({});

  try{
    res.json(sites);
  }
  catch(err){
    res.json(err);
  }
});

//Delete all documents
app.get('/clear', async (req, res) => {
  const cleared = await urlEntry.deleteMany({});
  try{
    res.send('DB Cleared');
  }
  catch(err){
    res.send(err);
    console.log(err);
  }
})

//Return JSON object containing original url and a corresponding shorturl if valid url is supplied
app.post('/api/shorturl', function (req, res) {
  if (validator.isURL(req.body.url, {require_protocol: true, protocols: ['http', 'https']})) {

    urlEntry.find().sort({short_url: -1}).limit(1)
    .then(entries => {
      let largest = entries[0] ? entries[0].short_url : 0;
      new urlEntry({full_url: req.body.url,short_url: largest + 1})
      .save()
      .then(() => {
          res.json({
            original_url: req.body.url,
            short_url: largest + 1
          })
      })
      .catch(err => {
        console.log(err)
      })
    })
    .catch(err => {
      console.log(err)
    })
  }

  else {
    res.json({error: "invalid url"})
  }
});

//Redirect to the corresponding website mapped to the input shorturl
app.get('/api/shorturl/:short', async (req, res) => {
  if(Number.isInteger(+req.params.short)){
    try{
      const match = await urlEntry.findOne({short_url: req.params.short})
      if(match){
        res.redirect(match.full_url);
      }
      else{
        res.json({error: "No short URL found for the given input"})
      }
    }
    catch(err){
      console.log(err);
    }
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
