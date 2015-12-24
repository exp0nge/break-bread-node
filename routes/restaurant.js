var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
    req.db.get('owner').findById(req.session.user._id)
        .success(function(doc){
            res.render('restaurant-index', {
            title: 'Restaurant Dashboard',
            user: req.session.user,
            restaurants: doc.restaurant
            });
        })
        .error(function(err){
            console.log(err);
        })
});

router.get('/add/restaurant', function(req, res, next){
    res.render('add-restaurant')
});

router.post('/add/restaurant', function(req, res, next){
    var restaurant = {
        "name": req.body.name,
        "address": req.body.address,
        "city": req.body.city,
        "zip": req.body.zip,
        "items": []
    }
    console.log(restaurant);
    req.db.get('restaurant').insert(restaurant);
    req.db.get('owner').update({ 
        _id: req.session.user._id },
        { $push: { restaurant: restaurant } })
        .success(function(doc){
            res.redirect('/restaurant');
        })
        .error(function(err){
            console.log(err);
        });
    
});

router.get('/:restaurantId/add/food', function(req, res, next){
    res.render('add-food', {name: req.params.restaurantId})
});

router.post('/:restaurantId/add/food', function(req, res, next){
    
});


module.exports = router;
