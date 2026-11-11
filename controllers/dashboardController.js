const mongoose = require("mongoose");
const userModel = require("../models/usermodel");

function formatUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    profilePicture: user.profilePicture,
    address: user.address,
    phone: user.phone,
    gender: user.gender,
    dob: user.dob,
    role: user.role,
    status: user.status,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}


const getAllUserController = async (req, res) => {
  try {
    const loggedinUserId = req.user.id;
    const loggedinUser = await userModel.findById(loggedinUserId);
    const users = await userModel.find({
      _id: { $ne: loggedinUserId },
    });
    res.status(200).json({
      success: true,
      message: "Users get successfully",
      data: {
        users: users.map(formatUser),
        length: users.length,
      },
      loggedinuser: loggedinUser,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSingleUserController = async (req, res) => {
  const userId = req.params.id
  try {
    const user = await userModel.findOne({
      _id: userId
    })
    res.status(200).json({
        success: true,
        message: "User get successfully",
        data: user,
    })
  } catch (error) {
      res.status(409).json({
        success: false,
        message: error.message,
        userId: userId
      })
  }
}

const approvedUserController = async (req, res) => {
  const userId = req.params.id
  try {
    const user = await userModel.findOne({
      _id: userId
    })
    user.status = true
    await user.save()
    res.status(200).json({
        success: true,
        message: "User approved successfully",
        data: user,
    })
  } catch (error) {
      res.status(409).json({
        success: false,
        message: error.message,
        userId: userId
      })
  }
}

const deactiveUserController = async (req, res) => {
  const userId = req.params.id
  try {
    const user = await userModel.findOne({
      _id: userId
    })
    user.status = false
    await user.save()
    res.status(200).json({
        success: true,
        message: "User deactivated successfully",
        data: user,
    })
  } catch (error) {
      res.status(409).json({
        success: false,
        message: error.message,
        userId: userId
      })
  }
}

const deleteUserController = async (req, res) => {
  const userId = req.params.id
  try {
    const user = await userModel.findOneAndDelete({
      _id: userId
    })
    res.status(200).json({
        success: true,
        message: "User deleted successfully",
        data: user,
    })
  } catch (error) {
      res.status(409).json({
        success: false,
        message: error.message,
        userId: userId
      })
  }
}

const searchUserController = async (req, res) => {
   const search = String(req.query.search || "").trim()
  try {
   
    const page = Number(req.query.page ?? 1)
    if (!Number.isInteger(page) || page < 1) {
      return res.status(400).json({
        success: false,
        message: "Page must be a positive integer",
      })
    }

    const limit = 5
    const skip = (page - 1) * limit
    const loggedinUserId = req.user.id
    const userFilter = {
      _id: { $ne: loggedinUserId },
      $or: [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ]
    }
    const [users, length] = await Promise.all([
      userModel.find(userFilter).sort({ _id: 1 }).skip(skip).limit(limit),
      userModel.countDocuments(userFilter),
    ])
    if (!length) {
      throw new Error("No user found")
    }
    res.status(200).json({
        success: true,
        message: "Users search successfully",
        data: {
          users: users.map(formatUser),
          length,
          page,
          limit,
          totalPages: Math.ceil(length / limit),
        },
    })
  } catch (error) {
      res.status(409).json({
        success: false,
        message: error.message,
        search: search
      })
  }
}

module.exports = {
  getAllUserController, getSingleUserController, approvedUserController, deactiveUserController, deleteUserController, searchUserController
};