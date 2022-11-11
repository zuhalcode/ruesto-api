const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// import validation
const { registerValidation } = require("../config/validation");

exports.register = async (req, res) => {
  const { error } = registerValidation(req.body);

  if (error)
    return res.status(400).json({
      status: res.statusCode,
      message: error.details[0].message,
    });

  // if email exist
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist)
    return res.status(400).json({
      status: res.statusCode,
      message: "Email already used",
    });

  // hash password
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashPassword,
  });

  try {
    const saveUser = await user.save();
    return res.status(200).json({
      status: res.statusCode,
      message: "User registration success",
    });
  } catch (e) {
    res.status(400).json({
      status: res.statusCode,
      message: "User register failed",
    });
  }
};

exports.login = async (req, res) => {
  // if email exist
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res.status(400).json({
      status: res.statusCode,
      message: "Email doesn't exist, check your email again :)",
    });

  // check password
  const validPassword = await bcrypt.compare(req.body.password, user.password);

  if (!validPassword)
    return res.status(400).json({
      status: res.statusCode,
      message: "Wrong password, check your password again :)",
    });

  // Make jwt token
  const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, { expiresIn: "1d" });
  res.header("auth-token", token).json({
    token,
  });
};

exports.logout = async (req, res) => {
  // if (req.headers && req.headers["auth-token"]) res.json("ok");
  res.json("logout function");
};
