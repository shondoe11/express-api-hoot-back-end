const jwt = require("jsonwebtoken");

const saveUser = (req, user) => req.user = user;

const getUser = (req) => req.user;

function verifyToken(req, res, next) {
  try {
    //? Bearer XXX.YYY.ZZZ
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //? A.B = C
    //* saveUser(req, user)
    req.user = decoded.payload;

    next();
  } catch (err) {
    res.status(401).json({ err: "Invalid token." });
  }
}

module.exports = verifyToken;
