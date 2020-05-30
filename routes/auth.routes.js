const {Router} = require('express');
const bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = Router();
const config = require('config');
const auth = require('../middleware/auth.middleware');


router.post(
  '/register',
  [
    check('email', 'Некоректный email').isEmail(),
    check('password', 'Минимальная длина пароль 6 символов').isLength({min: 6}),
  ],
  async (req, res) => {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({
          errors: erros.array(),
          message: 'Некорректные данные при регистрации'
        })
      }
      const {name, email, role, password} = req.body;

      const condidate = await User.findOne({email});
      if (condidate) {
        return res.status(400).json({message: 'Такой пользователь уже существует'})
      }
      const passHash = await bcrypt.hash(password, 12);
      const user = new User({name, email, role, password: passHash});
      await user.save();
      res.status(201).json({message: 'Пользователь создан'})

    } catch (e) {
      res.status(500).json({message: 'Что-то пошло не так, попробуйте снова'});
    }
  });
router.post(
  '/login',
  [
    check('email', 'Некоректный email').isEmail(),
    check('password', 'Минимальная длина пароль 6 символов').isLength({min: 6}),
  ],
  async (req, res) => {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({
          errors: erros.array(),
          message: 'Некорректные данные при входе в систему'
        })
      }
      const {email, password} = req.body;
      const user = await User.findOne({email});
      if (!user) {
        return res.status(400).json({message: 'Такой пользователь не найден'});
      }
      if (user.role === 'company') return res.status(400).json({message: 'Дождитесь связи с администратором'});

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({message: 'Неверный пароль'});

      const token = jwt.sign({userId: user.id, role: user.role}, config.get('jwtSecret'), {expiresIn: '24h'});
      res.json({token, userId: user.id, email})

    } catch (e) {
      res.status(500).json({message: 'Что-то пошло не так, попробуйте снова'});
    }
  });

router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findOne({_id: req.user.userId});
    res.json(user);
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так, попробуйте снова'});
  }
});


module.exports = router;