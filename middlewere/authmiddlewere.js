const userModel = require("../models/usermodel");
const { verifyAccessJWT } = require("../helpers/tokenhelper");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessJWT(token);
    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

const isEmailVerified = (req, res, next) => {
  if(!req.user.isEmailVerified){
    return res.status(403).json({
      success: false,
      message: "Please Verify your email first."
    })
  }
  next()
}

module.exports = { authenticate, isEmailVerified };