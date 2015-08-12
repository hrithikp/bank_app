var uuid = require('uuid')
var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var models = require('../models')
var User = models.User
var Account = models.Account
var Transaction = models.Transaction
var sequelize = models.sequelize
/* GET users listing. */

router.post('/create', user_create)
function user_create(req, res, next) {
  var data = req.body
  var send = {
    'code': -1,
    'data': []
  }
  for (key in data) {
    var value = data[key]
    if (value.length < 1) {
      send['code'] = 0
      send['data'].push({'key': key, 'msg':'Invalid Value'})
    }
  }
  if (data['password'] != data['passconf']) {
    send['code'] = 0
    send['data'].push({'key': 'passconf', 'msg': 'Must match password'})
  }

  if (send['code'] !== 0) {
    var query = {where: {'username': data['username']}}
    var shasum = crypto.createHash('sha1');
    shasum.update(data['password']);
    data['password'] = shasum.digest('hex')
    User.findOne(query).then(onUserFind)
  } else {
    res.send(send)
  }
  function onUserFind(user) {
    if (user == null) {
      sequelize.transaction(createUser).then(onUserCreate)
    } else {
      send['code'] = 0
      send['data'].push({'key': 'username', 'msg': 'Already taken'})
      res.send(send)
    }
  }
  function createUser(t) {
    return User.create(data, {transaction: t}).then(createAccount.bind(null, t))
  }
  function createAccount(t, user) {
    return Account.create({
      'uuid': uuid.v4(),
      'type': 'Checking', 
      'balance': 0.00
    }, {transaction: t}).then(function (chk) {
      return Account.create({
        'uuid': uuid.v4(),
        'type': 'Savings', 
        'balance': 0.00
      }, {transaction: t}).then(function (svg) {
        return user.addAccounts([chk, svg], {transaction: t})
      })
    })
  }
  function onUserCreate(result) {
    var query = {where: {username: data['username']}, include: [Account]}
    User.find(query).then(function (user) {
      send['code'] = 1
      send['data'].push({'user': user.get({plain: true})})
      req.session.user = user.get({plain: true})
      req.session.save()
      res.send(send)
    });
  }
}
router.post('/login', user_login)
function user_login(req, res, next) {
  var data = req.body
  var send = {
    'code': -1,
    'data': []
  }
  for (key in data) {
    var value = data[key]
    if (value.length < 1) {
      send['code'] = 0
      send['data'].push({'key': key, 'msg':'Invalid Value'})
    }
  }
  if (send['code'] !== 0) {
    var shasum = crypto.createHash('sha1');
    shasum.update(data['password']);
    data['password'] = shasum.digest('hex')
    var query = {
      where: {
        'username': data['username'], 
        'password': data['password']
      },
      include: [Account]
    }
    User.findOne(query).then(onUserFind)
  } else {
    res.send(send)
  }
  function onUserFind(user) {
    if (user == null) {
      send['code'] = 0
      send['data'].push({'key': 'Login', 'msg': 'Username and Password do not match'})
    } else {
      req.session.user = user.get({plain: true})
      send['code'] = 1
      send['data'].push({'user': req.session.user})
      req.session.save()
    }
    res.send(send)
  }
}
router.get('/logout', user_logout);
router.post('/logout', user_logout)
function user_logout(req, res, next) {
  var data = req.body
  var send = {
    'code': -1,
    'data': []
  }
  req.session.destroy(function () {
    send['code'] = 1
    send['data'].push({'msg': 'Session cleared'})
    res.send(send)
  })
}
router.get('/accounts', function (req, res, next) {
  var send = {
    'code': -1,
    'data': []
  }
  var user = req.session.user
  var accuuids = []
  for (acc in user['Accounts']) {
    var account = user['Accounts'][acc]
    accuuids.push(account['uuid'])
  }
  console.log(user, accuuids)
  // for (acc in user.Accounts) {
  var query = {
    where: {
      'UserId': user.id
    },
    include: [Transaction]
  }
  Account.findAll(query).then(function (result) {
    send['code'] = 1
    for (var i = 0; i < result.length; i++) {
      send['data'].push(result[i].get({plain: true}))
    }
    res.send(send)
  })
})
module.exports = router;
