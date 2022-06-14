/**
 * Created by Kuvshinov on 2016-11-13.
 */

var mongoose = require('mongoose');
// var uri = 'mongodb://121.160.103.125/attendance';
var uri = 'mongodb://localhost/market';
var options = {
    "server": {
        "poolSize": 100
    }
};
mongoose.Promise = global.Promise;
var db = mongoose.createConnection(uri, options);

db.on('error', function(err){
    console.log('[mongoose] 연결 실패: ', err);
});

db.once('open', function callback(){
    console.info("[mongoose] 연결 성공");
});

module.exports = db;