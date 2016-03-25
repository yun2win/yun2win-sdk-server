var Srv=require("../app/service/message");
var utils=require("../app/utils");
var thenjs=require("thenjs");
var clients=require("../app/core/clients");


module.exports=function(router,oauth){

    router.get("/sessions/:sessionId/messages",oauth,function(req,res,next){

        var sessionId = req.params.sessionId;
        var clientTime =utils.parseDate(req.get('Client-Sync-Time'));
        var filter_term = req.query.filter_term || "";
        var limit = Math.min(1000,req.query.limit || 100);
        var offset = req.query.offset || 0 ;
        var clientId=req.oauth.bearerToken.clientId;
        var userId=req.oauth.bearerToken.userId;

        if(!clientTime)
            return next("Client-Sync-Time 时间格式不对");

        thenjs()
            .then(function(cont){
                clients.get(clientId,cont);
            })
            .then(function(cont,client){
                client.sessions.get(sessionId,cont);
            })
            .then(function(cont,session){
                if(!session)
                    return cont("会话不存在！");

                session.syncMessage(userId,clientTime,filter_term,limit,offset,cont);
            })
            .then(function(cont,obj){
                res.json(obj);
            })
            .fail(function(cont,error){
                next(error);
            });


    });

    router.get("/sessions/:sessionId/messages/history",oauth,function(req,res,next){

        var sessionId = req.params.sessionId;
        var clientTime =utils.parseDate(req.get('Client-Sync-Time'));
        var limit = Math.min(1000,req.query.limit || 100);
        var offset = req.query.offset || 0 ;
        var clientId=req.oauth.bearerToken.clientId;

        if(!clientTime)
            return next("Client-Sync-Time 时间格式不对");
        var userId=req.oauth.bearerToken.userId;
        thenjs()
            .then(function(cont){
                clients.get(clientId,cont);
            })
            .then(function(cont,client){
                client.sessions.get(sessionId,cont);
            })
            .then(function(cont,session){
                if(!session)
                    return cont("会话不存在！");

                session.historyMessage(userId,clientTime,limit,offset,cont);
            })
            .then(function(cont,obj){
                res.json(obj);
            })
            .fail(function(cont,error){
                next(error);
            });


    });

    router.post("/sessions/:sessionId/messages",oauth,function(req,res,next){
        var sessionId = req.params.sessionId;
        var clientId=req.oauth.bearerToken.clientId;
        var tobj=this;
        thenjs()
            .then(function(cont){
                clients.get(clientId,cont);
            })
            .then(function(cont,client){
                client.sessions.get(sessionId,cont);
            })
            .then(function(cont,session){
                if(!session)
                    return cont("会话不存在！");

                tobj.session=session;
                parseParms(req,cont);

            })
            .then(function(cont,obj){
                tobj.session.addMessage(obj.sender,obj.content,obj.type,cont);
            })
            .then(function(cont,obj){
                res.json(obj.toJson());
            })
            .fail(function(cont,error){
                next(error);
            });
    });

    router.get("/sessions/:sessionId/messages/:messageId",oauth,function(req,res,next){
        var sessionId = req.params.sessionId;
        var id = req.params.messageId;
        var clientTime = utils.parseDate(req.get('Client-Sync-Time'));
        var clientId=req.oauth.bearerToken.clientId;

        if(!clientTime)
            return next("Client-Sync-Time 时间格式不对");

        Srv.get(sessionId,clientId,id,clientTime,function(error,obj){
            if(error)
                return next(error);
            res.json(obj);
        });

    });

    router.put("/sessions/:sessionId/messages/:messageId",oauth,function(req,res,next){

        var sessionId = req.params.sessionId;
        var id = req.params.messageId;

        var clientId=req.oauth.bearerToken.clientId;
        Srv.parse(req,function(error,obj){
            if(error)
                return next(error);

            Srv.store(sessionId,id,clientId,obj,function(error,obj){
                if(error)
                    return next(error);

                res.json(obj);
            });
        });
    });

    router.delete("/sessions/:sessionId/messages/:messageId",oauth,function(req,res,next){

        var id = req.params.messageId;
        var clientId=req.oauth.bearerToken.clientId;
        Srv.delete(id,clientId,function(error,obj){
            if(error)
                return next(error);

            res.json(obj);
        });
    });

    var parseParms=function(req,cb){
        var attrs=["sender","content","type"];


        var obj={};
        for(var i=0;i<attrs.length;i++){
            var key=attrs[i];
            if(!req.body[key])
                return cb({code:400,error:"Parameter error", message:key+"参数不存在！"});

            if(req.body[key])
                obj[key]=req.body[key];
        }
        cb(null,obj);
    };

};


