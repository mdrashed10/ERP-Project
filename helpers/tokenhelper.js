const crypto = require("crypto");
const jwt = require("jsonwebtoken");




const generateSecureToken = () => crypto.randomBytes(32).toString("hex");

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const generateJWT = (user) => {
    const payload = {
        id: user._id,
        username: user.username,
        email: user.email,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || "10m",
  });
};

const generateRefreshJWT = (user) => {
    const payload = {
        id: user._id, };
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
  });
}

const verifyAccessJWT = (token) =>
   jwt.verify(token, process.env.JWT_SECRET);

const verifyRefreshJWT = (token) => 
     jwt.verify(token, process.env.JWT_REFRESH_SECRET);

module.exports = { generateSecureToken , hashToken, generateJWT , generateRefreshJWT, verifyAccessJWT, verifyRefreshJWT};