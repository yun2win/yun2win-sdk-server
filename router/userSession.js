var Srv=require("../app/service/userSession");
var utils=require("../app/utils");

module.exports=function(router,oauth){

    router.get("/users/:userId/userSessions",oauth,function(req,res,next){

        var userId = req.params.userId;
        var clientTime =utils.parseDate(req.get('Client-Sync-Time'));
        var filter_term = req.query.filter_term || "";
        var limit = Math.min(1000,req.query.limit || 100);
        var offset = req.query.offset || 0 ;
        var clientId=req.oauth.bearerToken.clientId;

        if(!clientTime)
            return next("Client-Sync-Time 时间格式不对");

        Srv.getList(userId,clientId,clientTime,filter_term,limit,offset,function(error,result){
            if(error)
                return next(error);
            res.json(result);
        });

    });

    router.post("/users/:userId/userSessions",oauth,function(req,res,next){
        var userId = req.params.userId;
        var clientId=req.oauth.bearerToken.clientId;
        Srv.parse(req,function(error,obj){
            if(error)
                return next(error);

            Srv.store(userId,null,clientId,obj,function(error,obj){
                if(error)
                    return next(error);

                res.json(obj);
            });
        });

    });

    router.get("/users/:userId/userSessions/:userSessionId",oauth,function(req,res,next){
        var userId = req.params.userId;
        var id = req.params.userSessionId;
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

    router.put("/users/:userId/userSessions/:userSessionId",oauth,function(req,res,next){

        var userId = req.params.userId;
        var id = req.params.userSessionId;

        var clientId=req.oauth.bearerToken.clientId;
        Srv.parse(req,function(error,obj){
            if(error)
                return next(error);

            Srv.store(userId,id,clientId,obj,function(error,obj){
                if(error)
                    return next(error);

                res.json(obj);
            });
        });
    });

    router.delete("/users/:userId/userSessions/:userSessionId",oauth,function(req,res,next){
        var userId = req.params.userId;
        var id = req.params.userSessionId;
        var clientId=req.oauth.bearerToken.clientId;
        Srv.delete(id,clientId,function(error,obj){
            if(error)
                return next(error);

            res.json(obj);
        });
    });


};


