var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next){
    req.db.get('restaurant').find({}, { limit: 10 })
      .error(function(err){
          console.log(err);
      })
      .success(function(doc){
          res.render('customer-index', {
            title: 'Customer Dashboard',
            user: req.session.user,
            nextUrl: '/customer',
            home: '/customer',
            restaurants: doc
        });
      });

});

router.get('/search/', function(req, res, next){
    req.db.get('restaurant').col.aggregate([
        { $match: { $text: { $search: req.query.q } } },
        { $sort: { score: { $meta: "textScore" } } }
    ],
    function(err, doc){
        if(err){
            console.log(err);
        }
        else{
            res.render('customer-index', {
                title: 'Customer Dashboard - Results',
                user: req.session.user,
                restaurants: doc,
                q: req.query.q,
                nextUrl: '/customer/search?q=' + req.query.q,
                home: '/customer',
            });
        }
    })
});


router.get('/:restaurantId/view', function(req, res, next){
    req.db.get('restaurant').findById(req.params.restaurantId)
        .success(function(doc){
            res.render('restaurant-info', {
                restaurant: doc,
                user: req.session.user,
                nextUrl: '/customer/' + req.params.restaurantId + '/view',
                addedFood: req.query.added,
                home: '/customer',
            })
        })
        .error(function(err){
            console.log(err);
        });
});

router.post('/add/to/cart/:restaurantId/:food', function(req, res, next){
    var restaurantId = req.params.restaurantId;
    req.db.get('restaurant').findById(restaurantId)
        .success(function(doc){
            req.session.user.cartSize += 1;
            var food = doc.items[req.params.food];
            if (req.session.user.cart === undefined){
                req.session.user.cart = {};
            }
            if (req.session.user.cart[restaurantId] === undefined){
                // Restaurant not in cart, add it
                req.session.user.cart[restaurantId] = {
                    added: [],
                    info: null
                };
            }
            req.session.user.cart[restaurantId].added.push({
                item: food,
                qty: req.body.qty
            });
            food = encodeURIComponent(food.name);
            res.redirect('/customer/' + restaurantId + '/view?added=' + food);
        })
        .error(function(err){
            console.log(err);
        });
});

router.get('/cart', function(req, res, next){
    if (!req.session.user){
        res.redirect('/users/login?type=customer&next=/customer/cart');
    }
    function renderEmpty(){
        req.session.user.cart = {};
        req.session.user.cartSize = 0;
        res.render('cart', {
            title: 'Cart',
            cart: req.session.user.cart,
            user: req.session.user
        });
    }
    if (req.session.user.cart == undefined){
        renderEmpty();
    }
    else if(Object.keys(req.session.user.cart).length > 0)  {
        var cartKeys = Object.keys(req.session.user.cart);
        for (var i = 0; i < cartKeys.length; i++){
            cartKeys[i] = new req.ObjectID(cartKeys[i]);
        }
        req.db.get('restaurant').find({ _id: { $in: cartKeys }})
            .success(function(doc){
                doc.forEach(function(restaurant){
                    req.session.user.cart[restaurant._id.toString()].info = restaurant;
                });
                res.render('cart', {
                    title: 'Cart',
                    cart: req.session.user.cart,
                    user: req.session.user
                });
            })
            .error(function(err){
                console.log(err);
            });
    }
    else {
        renderEmpty();
    }

});

router.get('/cart/:restaurantId/payment', function(req, res, next){
    // Party size, date, and time in query string
    var items = req.session.user.cart[req.params.restaurantId].added;
    var totalCost = 0;
    items.forEach(function(item){
        totalCost += (parseFloat(item.item.price) * parseFloat(item.qty));
    });
    var reservation = {
        size: req.query.size,
        date: req.query.date,
        time: req.query.time,
        restaurant: req.params.restaurantId
    }
    res.render('payment', {
        title: 'Payment',
        order: items,
        totalCost: totalCost,
        reservation: reservation,
        user: req.session.user
    });
});

router.post('/cart/:restaurantId/payment/charge', function(req, res, next){
    var restID = req.params.restaurantId;
    var transaction = {
        'restaurant': restID,
        'paid': true,
        'approved': 'pending',
        'reservation': {
            'size': req.body.size,
            'date': req.body.date,
            'time': req.body.time,
            'total': req.body.totalCost
        },
        'items': req.session.user.cart[restID].added
    }
    req.db.get('transaction').insert(transaction)
        .success(function(doc){
            // Emit to Socket
            req.broadcastOrder(restID, doc._id);
            req.db.get('customer').update(
                { username: req.session.user.username },
                { $push: { transactions: doc._id }})
                .success(function(doc){
                    res.redirect('/customer/orders');
                })
                .error(function(err){
                    console.log(err);
                });
        })
        .error(function(err){ console.log(err); });

});

router.get('/orders', function(req, res, next){
    if (!req.session.user){
        res.redirect('/users/login?type=customer&next=/customer/orders');
    }
    req.db.get('customer').findById(req.session.user._id)
        .success(function(doc){
            if (doc.transactions.length > 0) {
                req.db.get('transaction').find({ _id: { $in: doc.transactions }})
                    .success(function(transDoc){
                        var restIDs = [];
                        transDoc.forEach(function(transactionItem){
                            transactionItem.restaurant = new req.ObjectID(transactionItem.restaurant);
                            restIDs.push(transactionItem.restaurant);
                        });
                        req.db.get('restaurant').find({ _id: { $in: restIDs }})
                            .success(function(restaurants){
                                var restJSON = {};
                                restaurants.forEach(function(restaurant){
                                    restJSON[restaurant._id] = restaurant;
                                });
                                transDoc.forEach(function(transaction){
                                    transaction['restaurantInfo'] = restJSON[transaction.restaurant];
                                });
                                console.log(transDoc);
                                res.render('orders', {
                                    title: 'Your Orders',
                                    user: req.session.user,
                                    orders: transDoc
                                });
                            })
                            .error(function(err){console.log(err);});

                    })
                    .error(function(err){console.log(err);});
            }
            else {
                res.render('orders', {
                    title: 'Your Orders',
                    user: req.session.user,
                    orders: []
                });
            }
        })
        .error(function(err){ console.log(err); });
});

module.exports = router;
