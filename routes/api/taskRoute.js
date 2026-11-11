const express = require("express");
const router = express.Router();
const taskController = require("../../controllers/taskController.js");
const { authenticate } = require("../../middlewere/authmiddlewere.js");


router.post("/createtask", authenticate, taskController.createTaskController);
router.get("/alltasks", authenticate, taskController.getAllTasksController);
router.get("/searchtask", authenticate, taskController.searchTaskController);
router.get("/mytasks", authenticate, taskController.getMyTasksController);
router.get("/singletask/:id", authenticate, taskController.getSingleTaskController);
router.patch("/updatetask/:id", authenticate, taskController.updateTaskController);
router.delete("/deletetask/:id", authenticate, taskController.deleteTaskController);

module.exports = router;
