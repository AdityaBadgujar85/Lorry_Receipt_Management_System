const User = require("../models/UsersModel");
const jwt = require("jsonwebtoken");


// ================= TOKEN =================
const createToken = (_id, role) => {
  return jwt.sign({ _id, role }, process.env.SECRET, {
    expiresIn: "3d",
  });
};


// ================= LOGIN =================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.login(email, password);

    const token = createToken(user._id, user.role);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token,
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// ================= SIGNUP =================
const signUpUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const user = await User.signUp(username, email, password);

    const token = createToken(user._id, user.role);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token,
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


module.exports = {
  loginUser,
  signUpUser,
};