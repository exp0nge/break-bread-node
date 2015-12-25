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
    var type = req.query.type;
    var users = req.db.get(type);
    users.findOne({
        username: req.body.username,
        password: req.body.password
        }, function(err, doc){
        if (err){
            req.session.user = '';
            res.render('login', {
               message: 'Invalid login details'
            })
        }
        else{
            if (doc){
                req.session.user = doc;
                if (type == 'customer'){
                    if (req.query.next){
                        res.redirect(req.query.next);
                    }
                    else {
                        res.redirect('/customer');
                    }
                }
                else if (type == 'owner'){
                    res.redirect('/restaurant');
                }
                else {
                    res.redirect('/');
                }
                
            }
            else{
                req.session.user = '';
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

router.get('/logout', function(req, res){
    req.session.user = '';
    res.redirect('/');
})


module.exports = router;
