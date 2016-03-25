var thenjs=require("thenjs");
var Srv=require("../app/service/session");
var utils=require("../app/utils");
var clients=require("../app/core/clients");

module.exports=function(router,oauth){

    router.get("/sessions",oauth,function(req,res,next){
        var clientTime =utils.parseDate(req.get('Client-Sync-Time'));
        var filter_term = req.query.filter_term || "";
        var limit = Math.min(1000,req.query.limit || 100);
        var offset = req.query.offset || 0 ;
        var clientId=req.oauth.bearerToken.clientId;

        if(!clientTime)
            return next("Client-Sync-Time 时间格式不对");

        Srv.getList(clientId,clientTime,filter_term,limit,offset,function(error,result){
            if(error)
                return next(error);
            res.json(result);
        });

    });

    router.get("/sessions/p2p/:aUserId/:bUserId",oauth,function(req,res,next){
        var clientTime =utils.parseDate(req.get('Client-Sync-Time'));
        var aUserId = req.params.aUserId;
        var bUserId = req.params.bUserId;
        var clientId=req.oauth.bearerToken.clientId;

        var tobj=this;
        thenjs()
            .then(function(cont){
                clients.get(clientId,cont);
            })
            .then(function(cont,client){
                client.sessions.getP2PSession(aUserId,bUserId,cont);
            })
            .then(function(cont,session){
                res.json({
                    "id": session.id,
                    "name": session.name,
                    "secureType": session.secureType,
                    "type": session.type,
                    "description": session.description,
                    "createdAt": session.createdAt,
                    "updatedAt": session.updatedAt,
                    "avatarUrl": session.avatarUrl
                })
            })
            .fail(function(cont,error){
               next(error);
            })

    });
    router.get("/sessions/single/:userId",oauth,function(req,res,next){
        var clientTime =utils.parseDate(req.get('Client-Sync-Time'));
        var userId = req.params.userId;
        var clientId=req.oauth.bearerToken.clientId;

        var tobj=this;
        thenjs()
            .then(function(cont){
                clients.get(clientId,cont);
            })
            .then(function(cont,client){
                client.sessions.getSingleSession(userId,cont);
            })
            .then(function(cont,session){
                res.json({
                    "id": session.id,
                    "name": session.name,
                    "secureType": session.secureType,
                    "type": session.type,
                    "description": session.description,
                    "createdAt": session.createdAt,
                    "updatedAt": session.updatedAt,
                    "avatarUrl": session.avatarUrl
                })
            })
            .fail(function(cont,error){
               next(error);
            })

    });

    router.post("/sessions",oauth,function(req,res,next){
        var clientId=req.oauth.bearerToken.clientId;

        Srv.parse(req,function(error,obj){
            if(error)
                return next(error);

            Srv.store(null,clientId,obj,function(error,obj){
                if(error)
                    return next(error);

                res.json(obj);
            });
        });

    });

    router.get("/sessions/:sessionId",oauth,function(req,res,next){
        var id = req.params.sessionId;
        var clientTime = utils.parseDate(req.get('Client-Sync-Time'));
        var clientId=req.oauth.bearerToken.clientId;

        if(!clientTime)
            return next("Client-Sync-Time 时间格式不对");

        thenjs()
            .then(function(cont){
                clients.get(clientId,cont);
            })
            .then(function(cont,client){
                client.sessions.get(id,cont);
            })
            .then(function(cont,session){
                res.json(session.toJson())
            })
            .fail(function(cont,error){
                next(error);
            });



//        Srv.get(clientId,id,clientTime,function(error,obj){
//            if(error)
//                return next(error);
//            res.json(obj);
//        });

    });

    router.put("/sessions/:sessionId",oauth,function(req,res,next){
        var id = req.params.sessionId;
        var clientId=req.oauth.bearerToken.clientId;
        var userId=req.oauth.bearerToken.userId;
        var tobj={};
        thenjs()
            .then(function(cont){
                clients.get(clientId,cont);
            })
            .then(function(cont,client){
                client.sessions.get(id,cont);
            })
            .then(function(cont,session){
                if(!session)
                    return cont("会话不存在！");

                //判断权限
                session.checkRight(userId,"Session_Edit",function(error){
                    if(error)
                        return cont(error);
                    tobj.session=session;
                    Srv.parse(req,{},cont);
                });
            })
            .then(function(cont,obj){
                for(var index in obj)
                    tobj.session[index]=obj[index];
                tobj.session.store(cont);
            })
            .then(function(cont){
                res.json(tobj.session.toJson());
            })
            .fail(function(cont,error){
                next(error);
            });
    });

    router.delete("/sessions/:sessionId",oauth,function(req,res,next){

        //TODO:转到core
        var id = req.params.sessionId;
        var clientId=req.oauth.bearerToken.clientId;

        var userId=req.oauth.bearerToken.userId;
        var tobj={};
        thenjs()
            .then(function(cont){
                clients.get(clientId,cont);
            })
            .then(function(cont,client){
                client.sessions.get(id,cont);
            })
            .then(function(cont,session){
                if(!session)
                    return cont("会话不存在！");

                //判断权限
                session.checkRight(userId,"Session_Delete",function(error){
                    if(error)
                        return cont(error);
                    session.delete(cont);
                });
            })
            .then(function(cont){
                res.json({});
            })
            .fail(function(cont,error){
                next(error);
            });


//        Srv.delete(id,clientId,function(error,obj){
//            if(error)
//                return next(error);
//
//            res.json(obj);
//        });
    });


};


