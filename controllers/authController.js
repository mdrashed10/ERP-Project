const userModel = require("../models/usermodel");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../helpers/emilahelp");

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const VERIFICATION_EXPIRE_MS = 48 * 60 * 60 * 1000;
const PASSWORD_RESET_EXPIRE_MS = 60 * 60 * 1000;

const {
  generateSecureToken,
  hashToken,
  generateJWT,
  generateRefreshJWT,
  verifyRefreshJWT,
} = require("../helpers/tokenhelper");

const publicUser = (user) => ({
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
});

const setAuthTokens = async (user) => {
  const accessToken = generateJWT(user);
  const refreshToken = generateRefreshJWT(user);
  await userModel.findByIdAndUpdate(user._id, {
    refreshToken: hashToken(refreshToken),
  });
  return { accessToken, refreshToken };
};

const registrationController = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      profilePicture,
      address,
      phone,
      gender,
      dob,
      role,
    } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Please enter a username",
      });
    }
    if (username.length > 16) {
      return res.status(400).json({
        success: false,
        message: "Username max length is 16",
      });
    }
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter an email",
      });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email",
      });
    }
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please enter a password",
      });
    }
    if (!gender) {
      return res.status(400).json({
        success: false,
        message: "Please select your gender",
      });
    }

    const plainVerificationToken = generateSecureToken();

    const user = await userModel.create({
      username,
      email,
      password,
      profilePicture,
      address,
      phone,
      gender,
      dob,
      role,
      emailVerificationToken: hashToken(plainVerificationToken),
      emailVerificationTokenExpires: new Date(
        Date.now() + VERIFICATION_EXPIRE_MS,
      ),
    });

    try {
      await sendVerificationEmail(
        user.email,
        user.username,
        plainVerificationToken,
      );
    } catch (mailError) {
      await userModel.findByIdAndDelete(user._id);
      console.error("Verification email failed:", mailError);
      return res.status(500).json({
        success: false,
        message: "Registration failed: could not send verification email",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email.",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter an email",
      });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email",
      });
    }
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please enter a password",
      });
    }

    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    const tokens = await setAuthTokens(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        ...publicUser(user),
        ...tokens,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

const verifyEmailController = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    const hashedToken = hashToken(token);
    const user = await userModel
      .findOne({
        emailVerificationToken: hashedToken,
        emailVerificationTokenExpires: { $gt: Date.now() },
      })
      .select("+emailVerificationToken +emailVerificationTokenExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Email verification failed",
    });
  }
};

const resendVerificationController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter an email",
      });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email",
      });
    }

    const user = await userModel
      .findOne({ email })
      .select("+emailVerificationToken +emailVerificationTokenExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No account found with this email",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    const plainVerificationToken = generateSecureToken();
    user.emailVerificationToken = hashToken(plainVerificationToken);
    user.emailVerificationTokenExpires = new Date(
      Date.now() + VERIFICATION_EXPIRE_MS,
    );
    await user.save({ validateBeforeSave: false });

    try {
      await sendVerificationEmail(
        user.email,
        user.username,
        plainVerificationToken,
      );
    } catch (mailError) {
      console.error("Verification email failed:", mailError);
      return res.status(500).json({
        success: false,
        message: "Could not send verification email",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Verification email sent",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Could not resend verification email",
    });
  }
};

const refreshTokenController = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    let decoded;
    try {
      decoded = verifyRefreshJWT(refreshToken);
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const user = await userModel.findById(decoded.id).select("+refreshToken");
    if (!user || !user.refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    if (user.refreshToken !== hashToken(refreshToken)) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const tokens = await setAuthTokens(user);

    return res.status(200).json({
      success: true,
      message: "Token refreshed",
      data: tokens,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Could not refresh token",
    });
  }
};

const logoutController = async (req, res) => {
  try {
    if (req.user) {
      await userModel.findByIdAndUpdate(req.user._id, {
        $unset: { refreshToken: 1 },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter an email",
      });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email",
      });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No account found with this email",
      });
    }

    const plainResetToken = generateSecureToken();
    user.passwordResetToken = hashToken(plainResetToken);
    user.passwordResetTokenExpires = new Date(
      Date.now() + PASSWORD_RESET_EXPIRE_MS,
    );
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetEmail(user.email, user.username, plainResetToken);
    } catch (mailError) {
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpires = undefined;
      await user.save({ validateBeforeSave: false });
      console.error("Password reset email failed:", mailError);
      return res.status(500).json({
        success: false,
        message: "Could not send password reset email",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Forgot password failed",
    });
  }
};

const resetPasswordController = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please enter a password",
      });
    }

    const hashedToken = hashToken(token);
    const user = await userModel
      .findOne({
        passwordResetToken: hashedToken,
        passwordResetTokenExpires: { $gt: Date.now() },
      })
      .select("+passwordResetToken +passwordResetTokenExpires +password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.refreshToken = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Password reset failed",
    });
  }
};

const getMeController = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: publicUser(req.user),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Could not fetch user",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, profilePicture, address, phone, gender, dob } = req.body;
    const user = req.user;

    if (username !== undefined) {
      if (!username) {
        return res.status(400).json({
          success: false,
          message: "Please enter a username",
        });
      }
      if (username.length > 16) {
        return res.status(400).json({
          success: false,
          message: "Username max length is 16",
        });
      }
      user.username = username;
    }

    if (profilePicture !== undefined) {
      user.profilePicture = profilePicture;
    }
    if (address !== undefined) {
      user.address = address;
    }
    if (phone !== undefined) {
      user.phone = phone;
    }
    if (gender !== undefined) {
      if (!["male", "female"].includes(gender)) {
        return res.status(400).json({
          success: false,
          message: "Please select a valid gender",
        });
      }
      user.gender = gender;
    }
    if (dob !== undefined) {
      user.dob = dob;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: publicUser(user),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Profile update failed",
    });
  }
};

module.exports = {
  registrationController,
  loginController,
  verifyEmailController,
  resendVerificationController,
  refreshTokenController,
  logoutController,
  forgotPasswordController,
  resetPasswordController,
  getMeController,
  updateProfile,
};
