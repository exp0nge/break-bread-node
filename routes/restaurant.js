var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
    res.render('restaurant-index', {
        title: 'Restaurant Dashboard',
        user: req.session.user
        })
});

router.get('/add/restaurant', function(req, res, next){
    res.render('add-restaurant')
});

router.post('/add/restaurant', function(req, res, next){
    
});

router.get('/:restaurantId/add/food', function(req, res, next){
    res.render('add-food', {name: req.params.restaurantId})
});

router.post('/:restaurantId/add/food', function(req, res, next){
    
});


module.exports = router;
