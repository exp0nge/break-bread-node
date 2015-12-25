var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  req.db.get('restaurant').find({}, { limit: 10 })
      .error(function(err){
          console.log(err);
      })
      .success(function(doc){
          res.render('index', { 
            title: 'Choose your experience',
            customer: './customer',
            restaurant: './restaurant',
            restaurants: doc 
            });
      });
});

module.exports = router;
