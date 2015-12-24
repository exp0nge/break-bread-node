var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
    res.render('customer-index', {
        title: 'Customer Dashboard',
        user: req.session.user
        });
});

module.exports = router;
