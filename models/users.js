const mongoose = require('mongoose');

//Each user needs a username, number of exercises logged, and full log of each exercise/session

const userEntrySchema = new mongoose.Schema({
    username: {type: String, required: true},
    count: {type: Number, default: 0},
    logs: [{
        _id: false,
        date: {type: String, required: true},
        description: {type: String, required: true},
        duration: {type: Number, required: true},
    }]
})

module.exports = mongoose.model("userEntry", userEntrySchema);