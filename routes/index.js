const express = require('express');
const router = express.Router();
const session = require('express-session');
const bodyparser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const crypto = require('crypto');

router.use(session({
    key: 'ppap',
    secret: 'bimil',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 3600 * 8000
    }
}));

var db = require('../model/db');
const { use } = require('browser-sync');
const { setMaxListeners } = require('events');
const { isBuffer } = require('util');
require('../model/itemmodel');
require('../model/usermodel');
require('../model/imagemodel');
var ItemModel = db.model('Item');
var UserModel = db.model('User');
var ImageModel = db.model('Image');

var storageImg = multer.diskStorage({
    destination: function(req, file, cb){
        const reg = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
        const path = `public/upload-images/${req.session.username}/${req.body.title.replace(reg, "")}/`;
        fs.mkdir(path, {recursive: true}, function(err){
            if(err)
                console.err('err' + err);
            else
                cb(null, path);
        });
    },
    filename: function(req, file, cb){
        cb(null, file.originalname);
    }
});

var storageImgPFP = multer.diskStorage({
    destination: function(req, file, cb){
        const path = `public/upload-images/${req.body.username}/`;
        fs.mkdir(path, {recursive: true}, function(err){
            if(err)
                console.err('err' + err);
            else
                cb(null, path);
        });
    },
    filename: function(req, file, cb){
        cb(null, 'pfp');
    }
});

var upload = multer({
    storage: storageImg
});

var uploadpfp = multer({
    storage: storageImgPFP
});

router.use(bodyparser.urlencoded({extended: false}));

router.get('/', function (req, res, next){
    var usr = req.session.username;
    var data = {is_logined: req.session.is_logined, username: usr, item: ""};

    /*
    ItemModel.update({}, 
        {$set: {like_users: {usr: false}}},
        {multi: true},
        function(err, doc){
            if(err){
                console.error('err', err);
                
            }
            console.log(doc);
            // if(doc) res.send(true);
            // else    res.send(false);
    });
    */
    
    var im = ItemModel.find({});
    im.sort({'regdate': -1});
    im.exec(function (err, doc){
        if(err){
            console.error('err', err);
            
        }

        if(doc != null){
            data['item'] = doc;
        }

        res.render('index', data);
    });
});

router.get('/like/:id/:fav', function(req, res, next){
    var Oid = require('mongodb').ObjectId;
    var item_obj_id = new Oid(req.params.id);
    var is_fav = req.params.fav;
    var usr = req.session.username;

    var y_fav = {
        $inc: {like_count: -1},
        $pull: {like_users: usr}
    }
    var n_fav = {
        $inc: {like_count: 1},
        $addToSet: {like_users: usr}
    }
    var fav_opt = (is_fav=="true")?y_fav:n_fav;

    ItemModel.update(
        {_id: item_obj_id}, 
        fav_opt,
        function(err, doc){
            if(err){
                console.error('err', err);
                
            }
            if(doc) res.send(true);
            else    res.send(false);
            console.log(doc);
    });
})

router.get('/read/:id', function(req, res, next){
    var Oid = require('mongodb').ObjectId;
    var item_obj_id = new Oid(req.params.id);

    ItemModel.update(
        {_id: item_obj_id}, 
        {$inc: {hit: 1}},
        function(err, doc){
            if(err){
                console.error('err', err);
                
            }
    });

    ItemModel.findOne({_id: item_obj_id}, function(err, doc){
        if(err){
            console.error('err', err);
            
        } 
        res.json(doc);
    })
});

router.get('/buy/:id', function(req, res, next){
    var Oid = require('mongodb').ObjectId;
    var item_obj_id = new Oid(req.params.id);

    var usr = req.session.username;
    var hp = req.session.phone;

    var reqItem = {
        buyer: {'name': usr, 'phone': hp}
    }

    ItemModel.update(
        {_id: item_obj_id}, 
        {$set: reqItem}, 
        {upsert: true},
        function(err, doc){
        if(err) console.error('err', err);
        if(doc) {
            console.log(doc);
            res.send(true);
        }
        else    res.send(false);
    });
});

router.post('/buy', function(req, res, next){
    // console.log(req.body);

    var confirm = JSON.parse(req.body.confirm);
    var query_req = {_id: req.body.oid};
    var query_update = {};
    console.log(confirm);

    if(confirm){
        query_update['status'] = false;
    } else {
        query_update['buyer'] = {};
    }

    ItemModel.update(
        query_req, 
        {$set: query_update}, 
        // {upsert: true},
        function(err, doc){
        if(err){
            console.error('err', err);
            
        }
        if(doc) {
            console.log(doc);
            res.send(true);
        }
        else    res.send(false);
    });
});

router.get('/delete/:id', function(req, res, next){
    var Oid = require('mongodb').ObjectId;
    var item_obj_id = new Oid(req.params.id);

    ItemModel.remove({_id: item_obj_id}, function(err, doc){
        if(err){
            console.error('err', err);
            
        }
        if(doc) res.send(true);
        else    res.send(false);
    });
});

router.post('/write', upload.any(), function (req, res, next) {

    var Item = new ItemModel({
        title: req.body.title,
        content: req.body.content,
        username: req.session.username,
        phone: req.session.phone,
        status: req.body.status,
        price: req.body.price,
        tag: JSON.parse(req.body.tag),
        image: req.files,
        buyer: null
    });
    
    Item.save(function (err, doc) {
        if(err) {
            console.error('err', err);
            
        }
        if(doc) res.send(true);
        else    res.send(false);
        
    });
    
});

router.post('/update', upload.any(), function(req, res, next){
    var reqItem = {
        title: req.body.title,
        content: req.body.content,
        status: req.body.status,
        price: req.body.price,
        tag: JSON.parse(req.body.tag),
        image: req.files
    };

    ItemModel.update(
        {_id: req.body._id}, 
        {$set: reqItem}, 
        // {upsert: true},
        function(err, doc){
        if(err){
            console.error('err', err);
            
        }
        if(doc) {
            console.log(doc);
            res.send(true);
        }
        else    res.send(false);
    });
});

router.post('/register', uploadpfp.single('pfp'), function (req, res, next) {
    var hash_pw = crypto.createHash("sha512").update(req.body.password).digest("hex");
    var usr = req.body.username.toLowerCase();

    console.log("body: %j", req.body);
    console.log(req.file);

    // DB model create & save.
    var User = new UserModel({
        username: usr,
        password: hash_pw,
        phone: req.body.phone,
        location: req.body.location,
        pfp: req.file
    });
     
    UserModel.findOne({username: req.body.username}, function(err, doc){
        if(err){
            console.error('err', err);
        }

        if(!doc) {
            User.save(function (err, res) {
                if(err) {
                    console.error('err', err);
                    
                }
            });
            res.send(true)
        } else {
            res.send(false);
        }
    });
        
});

router.post('/login', function(req, res, next) {
    var hash_pw = crypto.createHash("sha512").update(req.body.login_password).digest("hex");
    var usr = req.body.login_username.toLowerCase();

    UserModel.findOne({username: usr, password: hash_pw}, function(err, doc){
        if(err){
            console.error('err', err);
        }

        if(doc) {
            req.session.is_logined = true;
            req.session.username = usr;
            req.session.phone = doc.phone;
            req.session.save(function(){
                res.send(true);
            });
        } else {
            res.send(false);
        }
    });
});

router.get('/logout', function(req, res, next){
    req.session.destroy();
    res.clearCookie("ppap");

    res.redirect('/');
});

module.exports = router;