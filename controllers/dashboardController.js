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

const findUserByParamId = async (id, res) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({
      success: false,
      message: "Invalid user id",
    });
    return null;
  }

  const user = await userModel.findById(id);
  if (!user) {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
    return null;
  }

  return user;
};

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
  try {
    const user = await findUserByParamId(req.params.id, res);
    if (!user) {
      return;
    }

    return res.status(200).json({
      success: true,
      message: "User get successfully",
      data: formatUser(user),
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const approvedUserController = async (req, res) => {
  try {
    const user = await findUserByParamId(req.params.id, res);
    if (!user) {
      return;
    }

    if (user.status) {
      return res.status(400).json({
        success: false,
        message: "User is already approved",
      });
    }

    user.status = true;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "User approved successfully",
      data: formatUser(user),
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deactiveUserController = async (req, res) => {
  try {
    const user = await findUserByParamId(req.params.id, res);
    if (!user) {
      return;
    }

    if (String(user._id) === String(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate an admin",
      });
    }

    if (!user.status) {
      return res.status(400).json({
        success: false,
        message: "User is already deactivated",
      });
    }

    user.status = false;
    await user.save({ validateBeforeSave: false });
    await userModel.findByIdAndUpdate(user._id, {
      $unset: { refreshToken: 1 },
    });

    return res.status(200).json({
      success: true,
      message: "User deactivated successfully",
      data: formatUser(user),
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteUserController = async (req, res) => {
  try {
    const user = await findUserByParamId(req.params.id, res);
    if (!user) {
      return;
    }

    if (String(user._id) === String(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "You cannot delete an admin",
      });
    }

    await userModel.findByIdAndDelete(user._id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: formatUser(user),
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllUserController,
  getSingleUserController,
  approvedUserController,
  deactiveUserController,
  deleteUserController,
};