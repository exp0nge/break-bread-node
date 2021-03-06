var express = require('express');
var router = express.Router();


function logout(req){
    req.session.user = '';
}


router.get('/', function(req, res, next) {
  res.redirect('/login');
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
            logout(req);
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
                    logout(req);
                    res.redirect('/');
                }

            }
            else{
                logout(req);
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
    logout(req);
    res.redirect('/');
})


module.exports = router;
