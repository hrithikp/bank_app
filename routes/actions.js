var _ = require('lodash')
var express = require('express');
var router = express.Router();
var models = require('../models')
var User = models.User
var Account = models.Account
var Transaction = models.Transaction
var sequelize = models.sequelize

var Actions = {
  'deposit': function (a, b) {
    try {
      a = parseFloat(a)
      b = parseFloat(b)
      return a + b
    } catch (e){
      return 0
    }
  },
  'withdraw': function (a, b) {
    try {
      a = parseFloat(a)
      b = parseFloat(b)
      return a - b
    } catch (e){
      return 0
    }
  }
}
function perform(type, acc, data, done, error) {
  console.log('Performing %s on %s for %f', type, acc.uuid, data['amount'])
  function start(t) {
    return Account.update({
      balance: Actions[type](acc.balance, data['amount']),
    }, {
      where: {
        uuid: acc.uuid
      }
    }, {
      transaction: t
    }).then(function(account) {
      return Transaction.create({
        'type': data['type'],
        'desc': data['desc'],
        'amount': data['amount']
      }, {
        transaction: t
      })
    }).then(function (transaction) {
      if (transaction) {
        return acc.addTransaction(transaction, {transaction: t})
      } else {
        throw new Error('Error with creating a transaction for ' + type)
      }
    })
  }
  var p = sequelize.transaction(start)
  if (typeof done == 'function') {
    p.then(done)
  }
  if (typeof error == 'function') {
    p.error(error)
  } 
  return p
}

router.post('/:type', function (request, response, next) {
  var data = request.body
  var type = request.params.type
  var send = {'code': -1, 'data': []}
  function onDone(r) {
    console.log(r)
    send['code'] = 1
    send['data'] = [{'key': data['type'], 'msg': 'Completed!'}]
    response.send(send)
  }
  function onError(e) {
    console.error(e)
    send['code'] = 0
    send['data'] = [{'key': data['type'], 'msg': JSON.stringify(e)}]
    response.send(send)
  }
  var src = null
  var dst = Account.findOne({
    where: {
      uuid: data['account_uuid']
    }
  })
  if (type == 'transfer') {
    src = Account.findOne({
      where: {
        uuid: data['src_account_uuid']
      }
    }).then(function (src_acc){
      if (src_acc) {
        return perform('withdraw', src_acc,{
          'type': data['type'],
          'desc': data['desc'],
          'amount': data['amount']
        })
      } else {
        throw new Error('Cannot find account ' + data['src_account_uuid'])
      }
    }).then(function (r) {
      dst.then(function (dst_acc) {
        if(dst_acc) {
          perform('deposit', dst_acc, data, onDone, onError)
        }
      })
    }).error(function (e) {
      onError(e)
    })
  } else {
    dst.then(function (dst_acc) {
      if(dst_acc) {
        perform(type, dst_acc, data, onDone, onError)
      }
    })
  }
})
module.exports = router;
