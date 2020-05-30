const {Router} = require('express');
const {check} = require('express-validator');
const User = require('../models/User');
const Partner = require('../models/Partner');
const router = Router();
const auth = require('../middleware/auth.middleware');
const ControlUser = require('../models/ControlUser');

router.post(
  '/add',
  [
    check('email', 'Некоректный email').isEmail()
  ],
  async (req, res) => {
    try {
      const {_id, name, email, phone, role, description, address} = req.body;
      const user = await User.findOne({email});
      if (!user) {
        return res.status(400).json({message: 'Партнера с таким email не найден'});
      }
      await user.update({role: 'partner'});
      const partner = new Partner({idUser: user._id, name, email, phone, description, address});

      await partner.save();
      res.json(partner);
    } catch (e) {
      res.status(500).json({message: 'Что-то пошло не так, попробуйте снова'});
    }
  });

router.get('/request', auth, async (req, res) => {
  try {
    const user = await User.find({role: 'company'});
    res.json(user);
  } catch (e) {
    res.status(500).json({message: 'Ошибка'});
  }
});

router.get('/request/:id', auth, async (req, res) => {
  try {
    const user = await User.findOne({_id: req.params.id});
    res.json(user);
  } catch (e) {
    res.status(500).json({message: 'Такой заявки нет'});
  }
});

router.get('/list/all', auth, async (req, res) => {
  try {
    const partners = await Partner.find({});
    res.json(partners);
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так, попробуйте снова'});
  }
});
router.get('/list', async (req, res) => {
  try {
    const partners = await Partner.find({needApprove: false});
    res.json(partners);
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так, попробуйте снова'});
  }
});

router.get('/list/user/:id', auth, async (req, res) => {
  try {
    let companyArr = [];
    const users = await User.findOne({_id: req.params.id});
    if (users.companies.length) {
      await Promise.all(users.companies.map(async company => {
        let partner = await Partner.find({_id: company});
        companyArr.push(partner[0]);
      }));
    }
    res.json(companyArr);

  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так, попробуйте снова'});
  }
});

router.get('/change/cards', auth, async (req, res) => {
  try {
    const partners = await Partner.find({needApprove: true});
    res.json(partners);
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так, попробуйте снова'});
  }
});


router.post('/save/:id', auth, async (req, res) => {
  try {
    const partner = await Partner.findOne({_id: req.params.id});
    const cardLayout = JSON.stringify(req.body);
    await partner.update({cardLayout: cardLayout, needApprove: true});
    res.json(partner);
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так, попробуйте снова'});
  }
});

router.post('/approve/:id', auth, async (req, res) => {
  try {
    const partner = await Partner.findOne({_id: req.params.id});
    await partner.update({needApprove: false, approved: true});
    res.json(partner);
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так, попробуйте снова'});
  }
});

router.post('/decline/:id', auth, async (req, res) => {
  try {
    let user = req.body;
    if (user.role !== 'admin') return new TypeError('FORBIDDEN');
    const partner = await Partner.findOne({_id: req.params.id});
    await partner.update({approved: false});
    res.json(partner);
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так, попробуйте снова'});
  }
});
router.post('/add-to-list/:id', auth, async (req, res) => {
  try {
    const user = await User.findOne({_id: req.body._id});
    if (user.companies.length) {
      let newUserArr = [...user.companies]
      newUserArr.push(req.params.id);
      await user.updateOne({companies: newUserArr});
    } else {
      await user.updateOne({companies: [req.params.id]});
    }
    res.json(user);

    let partner = await Partner.findOne({_id: req.params.id});
    if (partner.users) await partner.updateOne({users: partner.users + 1});
    else {
      await partner.updateOne({users: 1});
      await partner.save();
    }
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так, попробуйте снова'});
  }
});


router.delete('/delete/:id', auth, async (req, res) => {
  try {
    const partner = await Partner.findOne({_id: req.params.id});
    let idUser = partner.idUser;
    await Partner.deleteOne({_id: req.params.id});
    const user = await User.deleteOne({_id: idUser});
    res.json(user);
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так, попробуйте снова'});
  }
});

router.delete('/delete/from-user-list/:id/:userId', auth, async (req, res) => {
  try {
    const user = await User.findOne({_id: req.params.userId});
    let newCompanyList = user.companies.filter(item => {
      return item !== req.params.id
    });
    await user.updateOne({companies: newCompanyList});

    res.json(newCompanyList);
    const partner = await Partner.findOne({_id: req.params.id});
    await partner.updateOne({users: partner.users - 1});

  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так, попробуйте снова'});
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    let partner = await Partner.findOne({_id: req.params.id});
    if (!partner) partner = await Partner.findOne({idUser: req.params.id});
    res.json(partner);
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так, попробуйте снова'});
  }
});


module.exports = router;