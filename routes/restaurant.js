var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
    if (!req.session.user){
        res.redirect('/');
    }
    req.db.get('owner').findById(req.session.user._id)
        .success(function(doc){
            req.db.get('restaurant').find({ _id: { $in: doc.restaurant }})
                .success(function(rests){
                    res.render('restaurant-index', 
                    {
                        title: 'Restaurant Dashboard',
                        user: req.session.user,
                        restaurants: rests,
                        home: '/restaurant'
                    });
                })
                .error(function(err){
                    console.log(err);
                });
        })
        .error(function(err){
            console.log(err);
        })
});

router.post('/add/restaurant', function(req, res, next){
    var restaurant = {
        "name": req.body.name,
        "address": req.body.address,
        "city": req.body.city,
        "zip": req.body.zip,
        "items": []
    }
    req.db.get('restaurant').insert(restaurant);
    req.db.get('owner').update(
        { 
            _id: req.session.user._id 
        },
        { 
            $push: { restaurant: restaurant._id } 
        })
        .success(function(doc){
            res.redirect('/restaurant');
        })
        .error(function(err){
            console.log(err);
        });
    
});

router.post('/:restaurantId/add/food', function(req, res, next){
    var food = {
        "name": req.body.name,
        "price": req.body.price,
        "ingredients": req.body.ingredients
    }
    req.db.get('restaurant').update(
        {
            _id: req.params.restaurantId
        },
        { 
            $push: { items: food } 
        })
        .success(function(doc){
            res.redirect('/restaurant');
        })
        .error(function(err){
            console.log(err);
        });
});


module.exports = router;
