const express = require('express');
const cors = require('cors');
require('dotenv').config()
const multer = require('multer');
const upload = multer()
const app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

//Returns json object containing name, type, and size of the uploaded file. Only accepts a single file upload.
app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  const responseObj = {
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size
  }
  res.json(responseObj);
})


const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
