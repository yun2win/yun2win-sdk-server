var Srv=require("../app/service/emoji");
var utils=require("../app/utils");
var config=require("../app/config");

module.exports=function(router,oauth){

    router.get("/emojis",oauth,function(req,res,next){

        var clientTime =utils.parseDate(req.get('Client-Sync-Time'));
        var limit = Math.min(1000,req.query.limit || 100);
        var offset = req.query.offset || 0 ;
        var clientId=req.oauth.bearerToken.clientId;

        if(!clientTime)
            return next("Client-Sync-Time 时间格式不对");

        Srv.getList(clientId,clientTime,limit,offset,function(error,result){
            if(error)
                return next(error);
            res.json(result);
        });

    });

    router.post("/emojis",oauth,function(req,res,next){
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

    router.get("/emojis/:emojiId",oauth,function(req,res,next){
        var uid = req.params.emojId;
        var clientTime = utils.parseDate(req.get('Client-Sync-Time'));
        var clientId=req.oauth.bearerToken.clientId;

        if(!clientTime)
            return next("Client-Sync-Time 时间格式不对");

        Srv.get(clientId,uid,clientTime,function(error,obj){
            if(error)
                return next(error);
            res.json(obj);
        });
    });

    router.put("/emojis/:emojiId",oauth,function(req,res,next){
        var uid = req.params.emojId;
        var clientId=req.oauth.bearerToken.clientId;
        Srv.parse(req,function(error,obj){
            if(error)
                return next(error);

            Srv.store(uid,clientId,obj,function(error,obj){
                if(error)
                    return next(error);

                res.json(obj);
            });
        });
    });

    router.delete("/emojis/:emojiId",oauth,function(req,res,next){
        var uid = req.params.emojId;
        var clientId=req.oauth.bearerToken.clientId;
        Srv.delete(uid,clientId,function(error,obj){
            if(error)
                return next(error);

            res.json(obj);
        });
    });


};


