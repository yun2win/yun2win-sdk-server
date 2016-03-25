//var osprey = require('osprey');
//var router = osprey.Router();
var express = require('express');
var router = express.Router();
var join = require('path').join;




var init=function(app,oauth){

    app.all('*',function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length,Content-MD5, Authorization, Accept, X-Requested-With, Client-Sync-Time');
        res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

        if (req.method == 'OPTIONS') {
            res.send(200);
        }
        else {
            next();
        }
    });



    require("./user")(router,oauth);
    require("./contact")(router,oauth);
    require("./session")(router,oauth);
    require("./sessionMember")(router,oauth);
    require("./userConversation")(router,oauth);
    require("./userSession")(router,oauth);
    require("./message")(router,oauth);
    require("./attachment")(router,oauth);
    app.use('/v1', router);
};



module.exports={
    init:init
};