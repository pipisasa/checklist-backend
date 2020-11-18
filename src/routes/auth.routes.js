const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const { models } = require("../utils");
// const User = require("../models/User");

const router = Router();
// /api/auth/register
router.post(
  "/register",
  [
    check("email").notEmpty().withMessage("email is required").isEmail().withMessage("Некорректный email"),
    check("password", "Минимальная длина Пароля 6 символов").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Некорректные данные при регистрации",
        });
      }
      const { email, password, admin_secret, role } = req.body;

      const candidate = await models.users.findOne({where:{ email }});

      if (candidate) {
        return res
          .status(400)
          .json({ message: "Такой пользователь уже существует" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      await models.users.create({
        email,
        password: hashedPassword,
        role: admin_secret!=null && admin_secret===process.env.CREATOR_SECRET ? role : "USER",
      });
      res.status(201).json({ message: "Пользователь создан" });
    } catch (e) {
      res
        .status(500)
        .json({ message: "Что-то пошло не так, попробуйте еще..." });
    }
  }
);

// /api/auth/login
router.post(
  "/login",
  [
    check("email", "Введите корректный email").normalizeEmail().isEmail(),
    check("password", "Введите Пароль").exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Некорректные данные при входе в систему",
        });
      }

      const { email, password } = req.body;
      const user = await models.users.findOne({where: { email } });

      if (!user) {
        return res.status(400).json({ message: "Пользователь не неайден" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Неверный пароль, попробуйте снова" });
      }

      const access = jwt.sign({ userId: user.id, role: user.role, type: "ACCESS" }, process.env.JWT_SECRET , {
        // expiresIn: "m",
      });
      const refresh = jwt.sign({ userId: user.id, role: user.role, type: "REFRESH" }, process.env.REFRESH_SECRET)

      res.json({ token:{ access, refresh }, role: user.role });
    } catch (e) {
      console.log(e);
      res
        .status(500)
        .json({ message: "Что-то пошло не так, попробуйте еще..." });
    }
  }
);

router.post("/refresh", async (req, res)=>{
  try {
    const decode = jwt.verify(req.body.refresh, process.env.REFRESH_SECRET);
    if(decode.type !== "REFRESH")throw {code: 400, message: "bad request"}
    const access = jwt.sign({ ...decode, type: "ACCESS" }, process.env.JWT_SECRET , {
      expiresIn: "20m",
    });
    // TODO create useful refresh token
    const refresh = jwt.sign({ ...decode, type: "REFRESH" }, process.env.REFRESH_SECRET)

    res.status(200).json({
      token: {access, refresh, role: decode.role}
    })
  } catch (e) {
    res.status(e.code).json(e)
  }
})

module.exports = router;