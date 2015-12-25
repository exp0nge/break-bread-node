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
    if (req.session.user.cart == undefined || Object.keys(req.session.user.cart).length){
      req.session.user.cart = {};
      req.session.user.cart.length = 0;
      res.render('cart', {
          title: 'Cart',
          cart: req.session.user.cart,
          user: req.session.user
      });
    }
    else {
        var cartKeys = Object.keys(req.session.user.cart);
        console.log(cartKeys);
        req.db.get('restaurant').find({ _id: { $in: cartKeys }})
            .success(function(doc){
                console.log(doc);
                req.session.user.cart.length = cartKeys.length;
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

});

module.exports = router;
