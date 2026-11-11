const taskModel = require("../models/taskModel.js");

const formatTask = (task) => ({
  id: task._id,
  title: task.title,
  description: task.description,
  assignedTo: task.assignedTo,
  createdBy: task.createdBy,
  priority: task.priority,
  status: task.status,
  startDate: task.startDate,
  dueDate: task.dueDate,
  completedAt: task.completedAt,
  attachments: task.attachments,
  isDeleted: task.isDeleted,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

const createTaskController = async (req, res) => {
  try {
    const {
      title,
      description,
      assignedTo,
      priority,
      status,
      startDate,
      dueDate,
      attachments,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Please enter a task title",
      });
    }
    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message: "Please assign this task to a user",
      });
    }
    if (!dueDate) {
      return res.status(400).json({
        success: false,
        message: "Please enter a task due date",
      });
    }

    const task = await taskModel.create({
      title,
      description,
      assignedTo,
      createdBy: req.user.id,
      priority,
      status,
      startDate,
      dueDate,
      attachments,
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: formatTask(task),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllTasksController = async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1);
    if (!Number.isInteger(page) || page < 1) {
      return res.status(400).json({
        success: false,
        message: "Page must be a positive integer",
      });
    }

    const limit = 5;
    const skip = (page - 1) * limit;
    const taskFilter = { isDeleted: false };

    const [tasks, length] = await Promise.all([
      taskModel.find(taskFilter).sort({ _id: -1 }).skip(skip).limit(limit),
      taskModel.countDocuments(taskFilter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Tasks get successfully",
      data: {
        tasks: tasks.map(formatTask),
        length,
        page,
        limit,
        totalPages: Math.ceil(length / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSingleTaskController = async (req, res) => {
  const taskId = req.params.id;
  try {
    const task = await taskModel.findOne({
      _id: taskId,
      isDeleted: false,
    });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
        taskId,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Task get successfully",
      data: formatTask(task),
    });
  } catch (error) {
    return res.status(409).json({
      success: false,
      message: error.message,
      taskId,
    });
  }
};

const getMyTasksController = async (req, res) => {
  try {
    const loggedinUserId = req.user.id;
    const tasks = await taskModel.find({
      assignedTo: loggedinUserId,
      isDeleted: false,
    });
    return res.status(200).json({
      success: true,
      message: "Your tasks get successfully",
      data: {
        tasks: tasks.map(formatTask),
        length: tasks.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateTaskController = async (req, res) => {
  const taskId = req.params.id;
  try {
    const {
      title,
      description,
      assignedTo,
      priority,
      status,
      startDate,
      dueDate,
      attachments,
    } = req.body;

    const task = await taskModel.findOne({
      _id: taskId,
      isDeleted: false,
    });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
        taskId,
      });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (priority !== undefined) task.priority = priority;
    if (startDate !== undefined) task.startDate = startDate;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (attachments !== undefined) task.attachments = attachments;

    if (status !== undefined) {
      task.status = status;
      task.completedAt = status === "completed" ? new Date() : null;
    }

    await task.save();

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: formatTask(task),
    });
  } catch (error) {
    return res.status(409).json({
      success: false,
      message: error.message,
      taskId,
    });
  }
};

const deleteTaskController = async (req, res) => {
  const taskId = req.params.id;
  try {
    const task = await taskModel.findOneAndUpdate(
      {
        _id: taskId,
        isDeleted: false,
      },
      {
        isDeleted: true,
      },
      { new: true },
    );
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
        taskId,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: formatTask(task),
    });
  } catch (error) {
    return res.status(409).json({
      success: false,
      message: error.message,
      taskId,
    });
  }
};

const searchTaskController = async (req, res) => {
  const search = String(req.query.search || "").trim();
  try {
    const page = Number(req.query.page ?? 1);
    if (!Number.isInteger(page) || page < 1) {
      return res.status(400).json({
        success: false,
        message: "Page must be a positive integer",
      });
    }

    const limit = 5;
    const skip = (page - 1) * limit;
    const taskFilter = {
      isDeleted: false,
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
    };

    const [tasks, length] = await Promise.all([
      taskModel.find(taskFilter).sort({ _id: -1 }).skip(skip).limit(limit),
      taskModel.countDocuments(taskFilter),
    ]);
    if (!length) {
      throw new Error("No task found");
    }

    return res.status(200).json({
      success: true,
      message: "Tasks search successfully",
      data: {
        tasks: tasks.map(formatTask),
        length,
        page,
        limit,
        totalPages: Math.ceil(length / limit),
      },
    });
  } catch (error) {
    return res.status(409).json({
      success: false,
      message: error.message,
      search,
    });
  }
};

module.exports = {
  createTaskController,
  getAllTasksController,
  getSingleTaskController,
  getMyTasksController,
  updateTaskController,
  deleteTaskController,
  searchTaskController,
};
