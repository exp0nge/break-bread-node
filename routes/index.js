var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.username){
      var username= req.session.username;
  }
  res.render('index', { 
      title: 'Choose your experience',
      customer: './customer',
      restaurant: './restaurant',
      username: username });
});

module.exports = router;
