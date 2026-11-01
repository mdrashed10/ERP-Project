const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Schema } = mongoose;

const usermodel = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    password: {
      type: String,
      trim: true,
      required: true,
      select: false,
    },
    profilePicture: {
      type: String,
    },
    address: {
      type: String,
    },
    phone: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male"
    },
    dob: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user","admin"],
      default: "user"
    },
    status:{
      type: Boolean,
      default: function(){
        return this.role === "admin" ? true : false
      },
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationTokenExpires: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetTokenExpires: {
      type: Date,
      select: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true },
);

usermodel.pre("save", async function (next){
  if(!this.isModified("password")){
    return next()
  }
  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
})

usermodel.methods.comparePassword = async function (enteredPassword){
  return await bcrypt.compare(enteredPassword, this.password)
}

const userModel = mongoose.model("users", usermodel)

module.exports = userModel