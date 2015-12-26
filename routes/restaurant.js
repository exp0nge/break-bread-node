var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
    if (!req.session.user){
        res.redirect('/users/login?type=owner&next=/restaurant');
    }
    req.db.get('owner').findById(req.session.user._id)
        .success(function(doc){
            if (doc === null || doc.length === 0){
                res.redirect('/users/login?type=owner&next=/restaurant')
                return;
            }
            req.db.get('restaurant').find({ _id: { $in: doc.restaurant }})
                .success(function(rests){
                    req.session.owner = rests;
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


function getRestaurantOrders(req, restaurantId, res, jadeFile, sortBy){
    req.db.get('restaurant').findById(restaurantId)
        .success(function(restaurant){
            req.db.get('transaction').find({restaurant: restaurantId})
                .success(function(transactions){
                    res.render(jadeFile, {
                        title: restaurant.name + ' Feed',
                        restaurantInfo: restaurant,
                        host: req.headers.host,
                        orders: transactions,
                        sortBy: sortBy,
                        user: req.session.user
                    });
                })
                .error(function(err){console.log(err);});
        })
        .error(function(err){console.log(err)});
}

router.get('/:restaurantId/feed', function(req, res, next){
    if (!req.session.owner){
        res.redirect('/users/login?type=owner&next=/restaurant/' + req.params.restaurantId + '/feed')
        return;
    }
    // Check if owner of restaurant
    var restaurantId = req.params.restaurantId;
    var kick = true;
    req.session.owner.forEach(function(restaurant){
        if (restaurant._id === restaurantId){
            kick = false;
        }
    });
    if (kick){
        res.status(401).send('Unauthorized feed access');
        return;
    }
    getRestaurantOrders(req, restaurantId, res, 'order-feed', req.query.sort || 'pending');
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


function changeOrderState(orderId, state, db, res){
    db.get('transaction').updateById(orderId, { $set: {"approved": state} })
        .success(function(doc){ res.json({'doc': doc}); })
        .error(function(err){ console.log(err);})
}

router.post('/order/approve', function(req, res, next){
    console.log(req.ObjectID(req.body.orderId));
    changeOrderState(req.ObjectID(req.body.orderId), 'approved', req.db, res);
});

router.post('/order/reject', function(req, res, next){
    changeOrderState(req.ObjectID(req.body.orderId), 'rejected', req.db, res);
});

router.post('/order/pend', function(req, res, next){
    changeOrderState(req.ObjectID(req.body.orderId), 'pending', req.db, res);
});


module.exports = router;
