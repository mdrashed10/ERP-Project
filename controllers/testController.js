const express = require("express");
const router = express.Router(); 



let testController = async (req, res) => {
    res.send("testing route")
}

module.exports = testController