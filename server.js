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
  try{
    const usersInDb = await userEntry.find({}).select('-count -logs -__v');
    res.json(usersInDb);
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

  const exercise = {date: req.body.date == "" ? new Date().toDateString() : new Date(req.body.date + ' 00:00:00').toDateString(), //Use current date if no date is given
    description: req.body.description == '' ? null : req.body.description,
    duration : req.body.duration == '' ? null : parseInt(req.body.duration)
  };
  
  
  try{ //returns user with exercise fields added
    //error if no matching id is found, runValidators will fail if no input for description or duration
    const user = await userEntry.findByIdAndUpdate(req.params['_id'], {$inc: {count: 1}, $push: {logs: exercise}}, {new: true, runValidators: true});
    res.json({
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date,
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
  let startDate = new Date(req.query.from + ' 00:00:00').toDateString();
  let endDate = new Date(req.query.to + ' 00:00:00').toDateString();
  let limit = req.query.limit;

  try{
    const user = await userEntry.findById(req.params['_id'])
    const responseObj = {
      username: user.username,
      _id: user.id,
    }

    if(startDate != 'Invalid Date'){
      responseObj.from = startDate;
      user.logs = user.logs.filter(exercise => {
        return exercise.date >= startDate;
      })
    }

    if(endDate != 'Invalid Date'){
      responseObj.to = endDate;
      user.logs = user.logs.filter(exercise => {
        return exercise.date <= endDate;
      })
    }

    if(limit){
      user.logs = user.logs.slice(0,limit);
    }
    
    responseObj.count = user.logs.length;
    responseObj.log = user.logs;
    res.json(responseObj);
  }

  catch(err){
    res.send(err.message);
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
