var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
    if (!req.session.user){
        res.redirect('/users/login?type=owner&next=/restaurant');
    }
    req.db.get('owner').findById(req.session.user._id)
        .success(function(doc){
            req.db.get('restaurant').find({ _id: { $in: doc.restaurant }})
                .success(function(rests){
                    res.render('restaurant-index',
                    {
                        title: 'Restaurant Dashboard',
                        user: req.session.user,
                        restaurants: rests
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

router.get('/:restaurantId/feed', function(req, res, next){
    var restaurantId = req.params.restaurantId;
    var sortBy = req.query.sort || 'pending';
    req.db.get('restaurant').findById(restaurantId)
        .success(function(restaurant){
            req.db.get('transaction').find({restaurant: restaurantId})
                .success(function(transactions){
                    res.render('order-feed', {
                        title: restaurant.name + ' Feed',
                        restaurantInfo: restaurant,
                        host: req.headers.host,
                        orders: transactions,
                        sortBy: sortBy
                    });
                })
                .error(function(err){console.log(err);});
        })
        .error(function(err){console.log(err)});
});

router.get('/render/jade/food/item', function(req, res, next){
    req.db.get('transaction').findById(req.query.tid)
        .success(function(order){
            res.render('feed-item-mixin-ajax', {
                order: order
            }, function(err, html){
                console.log(html);
                console.log(err);
                res.json({'html': html})
            });
        })
        .error(function(err){console.log(err);});
});


module.exports = router;
