var express = require('express');
var router = express.Router();
var dbHelper = require('../db/dbHelper');

/* GET users listing. */
router.get('/user', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/addUser', function(req, res, next) {
  var sqlParamsEntity = [];
  var sql = 'insert into User values(null,?,?)';
  var params = ['ybb',10];
  sqlParamsEntity.push(_getNewSqlParamEntity(sql, params));
  dbHelper.execTrans(sqlParamsEntity, function(err,info){
  	console.log(info);
  	res.send({result:'success'});
  });
});

function _getNewSqlParamEntity(sql, params, callback) {
    if (callback) {
        return callback(null, {
            sql: sql,
            params: params
        });
    }
    return {
        sql: sql,
        params: params
    };
}
module.exports = router;
