var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (!req.session.user) {
    req.session.user = {}
  }
  res.render('index', { auth_user: req.session.user});
});

module.exports = router;
