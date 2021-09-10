const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const userEntry = require('./models/users') 
require('dotenv').config()


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

/**
* APIS
*
*
*
*/

/** 
* Gets all users stored in db
*/
app.get('/api/users', async (req, res) => {
  console.log(`get all users called`);
  try{
    const users = await userEntry.find({}).select('-logs -__v');
    res.json(users);
  }
  catch(err){
    console.log(err);
    res.json(err);
  }
})

/**
* Clears all users stored in db
*/
app.get('/clear', async (req, res) => {
  try{
    const deleted = await userEntry.deleteMany({});
    res.json('All users successfully deleted from DB');
  }
  catch(err){
    console.log(err);
    res.json(err);
  }
})

/**
* If user exists, return user and id else upsert and return added user
*/
app.post('/api/users', async (req, res) => {
  try{
    const user = await userEntry.findOneAndUpdate({username: req.body.username}, { $setOnInsert: {username: req.body.username}}, {new: true, upsert: true});
    res.json({
      username: user.username,
      _id: user.id
    });
  }
  catch(err){
    console.log(err);
    res.json(err);
  }
})

/**
* Logs an exercise to corresponding user id, description and duration are required
*/
app.post('/api/users/:_id/exercises', async(req, res) => {
  const exercise = {
    date: req.body.date == '' || !req.body.date ? new Date() : new Date(req.body.date), //Use current date if no date is given
    description: req.body.description == '' ? null: req.body.description,
    duration : parseInt(req.body.duration)
  };
  
  /**
   * returns user with exercise fields added
    error if no matching id is found, runValidators will fail if no input for description or duration
   */
  try{
    const user = await userEntry.findByIdAndUpdate(req.params._id, 
    {$push: {log: exercise}}, {new: true, runValidators: true});

    res.json({
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(), //date property of returned object must be string
      _id: user.id
    });
  }

  catch(err){
    if(err.message.split(':').length > 1){ //This error occurs if no description or duration is put in
      res.send(err.message.split(':')[4].split(',')[0]);
    }
    else{
      res.send(err.message); //For any other error or if given id has no match
    }
  }
})

/**
* GET exercise logs and number of exercises for matching user
*/
app.get('/api/users/:_id/logs', async (req, res) => {
  try{
    const user = await userEntry.findById(req.params._id);
    const responseObj = {
      username: user.username,
      _id: user.id
    }

    const startDate = new Date(req.query.from) == "Invalid Date" ? Number.MIN_SAFE_INTEGER : new Date(req.query.from).getTime();
    const endDate = new Date(req.query.to) == "Invalid Date" ? Number.MAX_SAFE_INTEGER: new Date(req.query.to).getTime();
    const limit = parseInt(req.query.limit);

    //All exercise logs within given date range sorted chronologically. Map function is
    //called because date property needs to be a string
    let filteredLog = user.log.filter(exercise => {
      return startDate <= exercise.date.getTime() && exercise.date.getTime() <= endDate;
    }).sort((ex1, ex2) => {
      return ex1.date - ex2.date
    }).map(exercise => {
      return {
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString()
      }
    })

    //"from" and "to" fields only added if from and to query params are valid dates
    if(startDate != Number.MIN_SAFE_INTEGER){
      responseObj.from = new Date(startDate).toDateString();
    }

    if(endDate != Number.MAX_SAFE_INTEGER){
      responseObj.to = new Date(endDate).toDateString();
    }

    if(limit) {
      filteredLog = filteredLog.slice(0, limit);
    }
    
    responseObj.count = filteredLog.length;
    responseObj.log = filteredLog;

    res.json(responseObj);
  }

  catch(err){
    res.send(err.message);
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
