var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/login', function(req, res){
    res.render('login');
});

router.post('/login', function(req, res){
    var db = req.db;
    var users = db.get('users');
    users.findOne({
        username: req.body.username,
        password: req.body.password
        }, function(err, doc){
        if (err){
            console.log(err);
        }
        else{
            if (doc){
                res.redirect('/');
            }
            else{
                res.render('login', {error: 'Invalid login details'});
            }
        }
    });
});


router.get('/register', function(req, res){
    res.render('register');
});

router.post('/register', function(req, res){
    
});


module.exports = router;
