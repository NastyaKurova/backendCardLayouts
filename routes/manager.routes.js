const {Router} = require('express');
const bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const ControlUser = require('../models/ControlUser');
const User = require('../models/User');
const router = Router();
const config = require('config');
const auth = require('../middleware/auth.middleware');

router.post(
  '/register/:id',
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
      const {name, email, phone, role, password} = req.body;

      const condidate = await User.findOne({email});
      if (condidate) {
        return res.status(400).json({message: 'Такой пользователь уже существует'})
      }
      const passHash = await bcrypt.hash(password, 12);

      const user = new User({name, email, phone, role, password: passHash});
      await user.save();
      const control = new ControlUser({idUser: user._id, name, email, phone, role});
      await control.save();
      res.status(201).json({message: 'Пользователь создан'})
    } catch (e) {
      res.status(500).json({message: 'Что-то пошло не так, попробуйте снова'});
    }
  });

router.get('/list/all', auth, async (req, res) => {
  try {
    // let control = await ControlUser.findOne({idUser: req.params.id});
    // if (control.role !== 'admin') return new TypeError('FORBIDDEN');
    const manager = await ControlUser.find({role: 'manager'});
    res.json(manager);
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так, попробуйте снова'});
  }
});

router.delete('/delete/:id', auth, async (req, res) => {
  try {
    const manager = await ControlUser.findOne({_id: req.params.id});
    console.log(manager, 'manager');
    let idUser = manager.idUser;
    await ControlUser.deleteOne({_id: req.params.id});
    const user = await User.deleteOne({_id: idUser});
    res.json(user);
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так, попробуйте снова'});
  }
});

module.exports = router;