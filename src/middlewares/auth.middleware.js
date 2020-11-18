const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    if(!req.headers.authorization)throw new jwt.JsonWebTokenError("Unauthorized");

    const [type ,token] = req.headers.authorization.split(" ");

    if(type!=="JWT") throw new jwt.JsonWebTokenError("TOKEN MUST BE JWT")
    if (!token) throw new jwt.JsonWebTokenError("Unauthorized" );

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if(decoded.type !== "ACCESS"){
      throw new jwt.JsonWebTokenError("Wrong token")
    }
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json( e );
  }
};

module.exports = auth;