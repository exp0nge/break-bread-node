var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
    res.render('customer-index', {
            title: 'Customer Dashboard',
            user: req.session.user,
            nextUrl: '/customer',
            home: '/customer',
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
    req.db.get('restaurant').findById(req.params.restaurantId)
        .success(function(doc){
            var food = doc.items[req.params.food];
            if (req.session.user.cart === undefined){
                req.session.user.cart = [];
            }
            req.session.user.cart.push({
                restaurant: req.params.restaurantId,
                item: food,
                qty: req.body.qty
            });
            food = encodeURIComponent(food.name);
            res.redirect('/customer/' + req.params.restaurantId + '/view?added=' + food)
        })
        .error(function(err){
            console.log(err);
        });
});


router.get('/cart', function(req, res, next){
    res.json(req.session.user.cart);
});

module.exports = router;
