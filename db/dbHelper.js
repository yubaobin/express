var mysql = require('mysql');
var async = require("async");

module.exports = {
    execTrans: execTrans,
}

var pool = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "1992104",
    database: "expressDB",
    connectionLimit: 10,
    port: "3306",
    waitForConnections: false
});

function execTrans(sqlparamsEntities, callback) {
    pool.getConnection(function(err, connection) {
        if (err) {
            return callback(err, null);
        }
        connection.beginTransaction(function(err) {
            if (err) {
                return callback(err, null);
            }
            console.log("开始执行transaction，共执行" + sqlparamsEntities.length + "条数据");
            var funcAry = [];
            sqlparamsEntities.forEach(function(sql_param) {
                var temp = function(cb) {
                    var sql = sql_param.sql;
                    var param = sql_param.params;
                    connection.query(sql, param, function(tErr, rows, fields) {
                        if (tErr) {
                            connection.rollback(function() {
                                console.log("事务失败，" + sql_param + "，ERROR：" + tErr);
                                throw tErr;
                            });
                        } else {
                            return cb(null, 'ok');
                        }
                    })
                };
                funcAry.push(temp);
            });

            async.series(funcAry, function(err, result) {
                console.log("transaction error: " + err);
                if (err) {
                    connection.rollback(function(err) {
                        console.log("transaction error: " + err);
                        connection.release();
                        return callback(err, null);
                    });
                } else {
                    connection.commit(function(err, info) {
                        console.log("transaction info: " + JSON.stringify(info));
                        if (err) {
                            console.log("执行事务失败，" + err);
                            connection.rollback(function(err) {
                                console.log("transaction error: " + err);
                                connection.release();
                                return callback(err, null);
                            });
                        } else {
                            connection.release();
                            return callback(null, info);
                        }
                    })
                }
            })
        });
    });
}
