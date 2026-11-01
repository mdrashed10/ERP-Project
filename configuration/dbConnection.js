const mongoose = require('mongoose');

function dbConnection(){
    mongoose.connect('mongodb+srv://ERP-admin:DAWZgl8SqHuRMjNT@cluster0.xxdfgx8.mongodb.net/erp')
  .then(() => console.log('Database connected')).catch((error) => {
    console.log("Database Connection Faild", error)
  });
}

module.exports = dbConnection