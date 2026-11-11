
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: 3,
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    assignedTo: {
      type: String,
      ref: "User",
      required: [true, "Please assign this task to a user"],
    },

    createdBy: {
      type: String,
      ref: "User",
      required: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "in-progress",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    dueDate: {
      type: Date,
      required: [true, "Task due date is required"],
    },

    completedAt: {
      type: Date,
      default: null,
    },

    attachments: [
      {
        fileName: {
          type: String,
          trim: true,
        },
        fileUrl: {
          type: String,
          trim: true,
        },
      },
    ],

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);


const taskModel = mongoose.model("Task", taskSchema);

module.exports = taskModel;
