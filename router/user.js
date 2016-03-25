var Srv=require("../app/service/user");
var utils=require("../app/utils");
var config=require("../app/config");

module.exports=function(router,oauth){

    router.get("/users",oauth,function(req,res,next){

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

    router.post("/users",oauth,function(req,res,next){
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

    router.get("/users/:userId",oauth,function(req,res,next){
        var uid = req.params.userId;
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

    router.put("/users/:userId",oauth,function(req,res,next){
        var uid = req.params.userId;
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

    router.delete("/users/:userId",oauth,function(req,res,next){
        var uid = req.params.userId;
        var clientId=req.oauth.bearerToken.clientId;
        Srv.delete(uid,clientId,function(error,obj){
            if(error)
                return next(error);

            res.json(obj);
        });
    });

    router.post("/users/register",function(req,res,next){

        var clientId=config.client.appKey;

        var email=req.body.email;
        var name=req.body.name;
        var password=req.body.password;
        var avatarUrl=req.body.avatarUrl;

        if(!email)
            return next({code:400,error:"Parameter error", message:"邮箱不能为空！"});

        if(!password)
            return next({code:400,error:"Parameter error", message:"密码不能为空！"});

        if(!avatarUrl)
            avatarUrl="/images/default.jpg";


        Srv.register(clientId,email,name,password,avatarUrl,function(error,obj){
            if(error)
                return next(error);

            res.json(obj);
        });

    });

    router.post("/users/login",function(req,res,next){

        var clientId=config.client.appKey;
        var email=req.body.email;
        var password=req.body.password;

        if(!email)
            return next({code:400,error:"Parameter error", message:"邮箱不能为空！"});

        if(!password)
            return next({code:400,error:"Parameter error", message:"密码不能为空！"});

        Srv.login(clientId,email,password,function(error,obj){
            if(error)
                return next(error);

            res.json(obj);
        });

    });

};


