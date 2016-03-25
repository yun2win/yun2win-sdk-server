var Srv=require("../app/service/userConversation");
var utils=require("../app/utils");
var clients=require("../app/core/clients");
var thenjs=require("thenjs");

module.exports=function(router,oauth){

    router.get("/users/:userId/userConversations",oauth,function(req,res,next){

        var userId = req.params.userId;
        var clientTime =utils.parseDate(req.get('Client-Sync-Time'));
        var filter_term = req.query.filter_term || "";
        var limit = Math.min(1000,req.query.limit || 100);
        var offset = req.query.offset || 0 ;
        var clientId = req.oauth.bearerToken.clientId;

        if(!clientTime)
            return next("Client-Sync-Time 时间格式不对");

        thenjs()
            .then(function(cont){
                clients.get(clientId,cont);
            })
            .then(function(cont,client){
                client.users.get(userId,cont);
            })
            .then(function(cont,user){
                user.userConversations.getList(clientTime,cont);
            })
            .then(function(cont,list){
                var result={total_count:list.length,entries:[]};
                for(var i=offset;i<list.length && i<offset+limit;i++){
                    var obj=list[i].toJson();
                    result.entries.push(obj);
                }
                res.json(result);
            })
            .fail(function(cont,error){
                next({code:400,message:error});
            });

    });

    router.post("/users/:userId/userConversations",oauth,function(req,res,next){
        var userId = req.params.userId;
        var clientId=req.oauth.bearerToken.clientId;

        thenjs()
            .then(function(cont){
                clients.get(clientId,cont);
            })
            .then(function(cont,client){
                client.users.get(userId,cont);
            })
            .then(function(cont,user){
                Srv.parse(req,function(error,obj) {

                    if(error)
                        return cont(error);

                    user.userConversations.addUserConversation(obj.type,obj.targetId,obj.name,obj.avatarUrl,obj.top,cont);
                });
            })
            .then(function(cont,uc){
                res.json(uc.toJson());
            })
            .fail(function(cont,error){
                next({code:400,message:error});
            });
    });

    router.get("/users/:userId/userConversations/:userConversationId",oauth,function(req,res,next){
        var userId = req.params.userId;
        var id = req.params.userConversationId;
        var clientTime = utils.parseDate(req.get('Client-Sync-Time'));
        var clientId=req.oauth.bearerToken.clientId;

        if(!clientTime)
            return next("Client-Sync-Time 时间格式不对");

        Srv.get(userId,clientId,id,clientTime,function(error,obj){
            if(error)
                return next(error);
            res.json(obj);
        });

    });

    router.put("/users/:userId/userConversations/:userConversationId",oauth,function(req,res,next){

        var userId = req.params.userId;
        var id = req.params.userConversationId;

        var clientId=req.oauth.bearerToken.clientId;

        thenjs()
            .then(function(cont){
                clients.get(clientId,cont);
            })
            .then(function(cont,client){
                client.users.get(userId,cont);
            })
            .then(function(cont,user){
                Srv.parse(req,function(error,obj){
                    if(error)
                        return next(error);

                    Srv.store(userId,id,clientId,obj,function(error,t){
                        if(error)
                            return next(error);

                        obj.id=id;
                        user.userConversations.updateCache(obj,function(err,uc){

                            user.userConversations.get(id,cont);
                        });

                    });
                });
            })
            .then(function(cont,uc){

                var obj=uc?uc.toJson():null;

                res.json(obj);
                //res.json(uc.toJson());
            })
            .fail(function(cont,error){
                next({code:400,message:error});
            });

    });

    router.delete("/users/:userId/userConversations/:userConversationId",oauth,function(req,res,next){
        var userId = req.params.userId;
        var id = req.params.userConversationId;
        var clientId=req.oauth.bearerToken.clientId;

        thenjs()
            .then(function(cont){
                clients.get(clientId,cont);
            })
            .then(function(cont,client){
                client.users.get(userId,cont);
            })
            .then(function(cont,user){
                user.userConversations.get(id,cont);
                //.addUserConversation(obj.type,obj.targetId,obj.name,obj.avatarUrl,obj.top,cont);
            })

            .then(function(cont,uc){
                if(uc)
                    return uc.delete(cont);
                cont();
            })
            .then(function(){
                res.json({});
            })
            .fail(function(cont,error){
                next({code:400,message:error});
            });

//        Srv.delete(id,clientId,function(error,obj){
//            if(error)
//                return next(error);
//
//            res.json(obj);
//        });
    });


};


