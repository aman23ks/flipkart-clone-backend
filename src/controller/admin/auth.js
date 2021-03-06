const User = require("../../models/user");
const jwt = require("jsonwebtoken"); //will create a token based on a private key, only the server will know the key and will help in authentication.

exports.signup = (req, res) => {
  User.findOne({ email: req.body.email }).exec((error, user) => {
    if (user)
      return res.status(400).json({
        message: "admin already registered", //the messages written everywhen will be shown on postman as a server side message.
      });
  });

  const { firstName, lastName, email, password } = req.body;
  const _user = new User({
    firstName,
    lastName,
    email,
    password,
    username: Math.random().toString(),
    role: "admin",
  });

  _user.save((error, data) => {
    //all the data entered by user firstName,lastName,email,password,username,timestamps,role etc. all will be saved in a variable data. user:data called below visualizes the api in postman.
    if (error) {
      return res.status(400).json({
        message: "Something went wrong",
      });
    }
    if (data) {
      return res.status(201).json({
        //user: data, //after running on postman you'll see all the data entered by the user
        message: "Admin created Successfully..!",
      });
    }
  });
};

exports.signin = (req, res) => {
  User.findOne({ email: req.body.email }).exec((error, user) => {
    if (error) return res.status(400).json({ error });
    if (user) {
      if (user.authenticate(req.body.password) && user.role === "admin") {
        //the authenticate function is in the models/users for comparing the password the user put in vs the stored password.
        const token = jwt.sign(
          { _id: user._id, role: user.role },
          process.env.JWT_SECRET,
          {
            expiresIn: "1h",
          }
        );
        const { _id, firstName, lastName, email, role, fullName } = user;
        res.status(200).json({
          token,
          user: {
            _id,
            firstName,
            lastName,
            email,
            role,
            fullName,
          },
        });
      } else {
        return res.status(400).json({
          message: "Invalid Password",
        });
      }
    } else {
      return res.status(400).json({
        message: "something went wrong",
      });
    }
  });
};
