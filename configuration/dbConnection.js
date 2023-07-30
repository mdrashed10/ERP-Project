const mongoose = require('mongoose');

function dbConnection(){
    mongoose.connect('mongodb+srv://backendsiam:siam1256@shop-pay.4qy3mwr.mongodb.net/todo-backend')
  .then(() => console.log('Database connected'));
}

module.exports = dbConnection