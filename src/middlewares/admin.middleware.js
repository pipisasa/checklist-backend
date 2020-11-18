const isAdmin = (req, res, next) => {
  // console.log("USER_ROLE: ", req.user.role)
  if(['ADMIN', 'SUPER_ADMIN', 'CREATOR'].includes(req.user.role)){
    next();
  }else{
    return res.status(301).json({
      message: "Недостаточно прав"
    })
  }
}

module.exports = isAdmin;