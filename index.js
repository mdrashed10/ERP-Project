require("dotenv").config();
const express = require('express')
const app = express()
const dbConnection = require('./configuration/dbConnection.js')
const routes = require("./routes")
var cors = require('cors');

app.use(cors())
dbConnection()
app.use(express.json())
app.use(routes);

app.get('/', function (req, res) {
  res.send('Todo Application')
})

app.listen(8000)