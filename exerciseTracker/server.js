const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const route = require('./routes/route');


//Basic Configuration
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors())
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//Current URL parser and server discovery/monitoring engine for mongoose is deprecated
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() =>{
  console.log('Connected to DB');
}, (err) => {
  console.log(err);
});

app.use('/', route);

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
