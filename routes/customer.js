var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
    res.render('customer-index', {
            title: 'Customer Dashboard',
            user: req.session.user,
            nextUrl: '/customer'
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
                nextUrl: '/customer/search?q=' + req.query.q
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
                nextUrl: '/customer/' + req.params.restaurantId + '/view'
            })
        })
        .error(function(err){
            console.log(err);
        });
});

module.exports = router;
