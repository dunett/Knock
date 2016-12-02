var async = require('async');
var pool = require('./model/dbConnection');
var schedule = require('node-schedule');

// Cron Style
// schedule.scheduleJob('*/30 * * * * *', function(){
//     refresh();
//     console.log("30초마다 실행");
// });

var rule = new schedule.RecurrenceRule();
rule.hour = 16;
// //rule.minute = 20;

schedule.scheduleJob(rule, function(){
    TKnock();
    console.log('매 5시 마다 실행 ', new Date());
});

function selection1(id, conn, td){
    const sql1 = "SELECT u.u_id FROM User u, Characters c WHERE u.c_id = c.c_id AND u_id != ? AND u.c_id = (SELECT c_id FROM User WHERE u_id = ?) AND u.u_id NOT IN (SELECT receiver FROM Destiny WHERE sender = ?) AND u.age BETWEEN (SELECT age_max FROM User WHERE u_id = ?) AND (SELECT age_min FROM User WHERE u_id = ?) order by rand() limit 1";
    conn.query(sql1, [id, id, id, id, id], (err, result) =>{
        if(err){
            return td(err);
        }
        if(result == 0){
            return td(null);
        }else{
            const u_id = result[0].u_id;
            const sql2 = "INSERT INTO Destiny SET sender = ?, receiver = ?, type = '성향이 같은'";
            conn.query(sql2, [id, u_id], (err, result) =>{
                return td(null);
            });
        }
    });
}

function selection2(id, conn, td){
    const sql1 = "SELECT u.u_id, c.type FROM User u, Characters c WHERE u.c_id = c.c_id AND u.c_id IN (SELECT id FROM Other WHERE c_id= (SELECT c_id FROM User WHERE u_id= ?) AND similar=1 order by rand()) AND u.u_id NOT IN (SELECT receiver FROM Destiny WHERE sender = ?) AND u.age BETWEEN (SELECT age_max FROM User WHERE u_id = ?) AND (SELECT age_min FROM User WHERE u_id = ?) order by rand() limit 1";
    conn.query(sql1, [id, id, id, id], (err, result) =>{
        if(err){
            return td(err);
        }
        if(result == 0){
            return td(null);
        }else{
            const u_id = result[0].u_id;
            const sql2 = "INSERT INTO Destiny SET sender = ?, receiver = ?, type = '성향이 비슷한'";
            conn.query(sql2, [id, u_id], (err, result) =>{
                return td(null);
            });
        }
    });
}

function selection3(id, conn, td){
    const sql1 = "SELECT u.u_id, c.type FROM User u, Characters c WHERE u.c_id = c.c_id AND u.c_id IN (SELECT id FROM Other WHERE c_id= (SELECT c_id FROM User WHERE u_id= ?) AND similar=0 order by rand()) AND u.u_id NOT IN (SELECT receiver FROM Destiny WHERE sender = ?) AND u.age BETWEEN (SELECT age_max FROM User WHERE u_id = ?) AND (SELECT age_min FROM User WHERE u_id = ?) order by rand() limit 1";
    conn.query(sql1, [id, id, id, id], (err, result) =>{
        if(err){
            return td(err);
        }
        if(result == 0){
            return td(null);
        }else{
            const u_id = result[0].u_id;
            const sql2 = "INSERT INTO Destiny SET sender = ?, receiver = ?, type = '성향이 다른'";
            conn.query(sql2, [id, u_id], (err, result) =>{
                return td(null);
            });
        }
    });
}

function selection(id, conn){
    async.series(
        [
            function task1(done) {
                selection1(id, conn, function(err, result){
                    if(err){
                        done(err);
                        return;
                    }else{
                        done(null);
                    }
                });
            },
            function task2(done) {
                selection2(id, conn, function(err, result){
                    if(err){
                        done(err);
                        return;
                    }else{
                        done(null);
                    }
                });
            },
            function task3(done) {
                selection3(id, conn, function(err, result){
                    if(err){
                        done(err);
                    }else{
                        done(null);
                    }
                });
            }
        ],
        function(err){
            if(err){
                conn.rollback();
            }else{
                conn.commit();
            }
        }
    );
}

function TKnock(){
    pool.getConnection(function (err, conn){
        const sql = "SELECT u_id FROM User WHERE status = 1";
        conn.query(sql, (err, results) =>{
            async.each(results, (item) =>{
                selection(item.u_id,conn);
            });
        });
    });
}