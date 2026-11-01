const { rateLimit } = require("express-rate-limit");



const registrationlimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 30,
  skipSuccessfulRequests: true,
  message: { error: "bro check your info please, and try later" },
});


const loginlimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: { error: "bro check your info please,you are trying to login others account" },
});




module.exports = { registrationlimiter, loginlimiter };