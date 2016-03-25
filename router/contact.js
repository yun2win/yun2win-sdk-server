var Srv=require("../app/service/contact");
var utils=require("../app/utils");
var clients=require("../app/core/clients");
var thenjs=require("thenjs");

module.exports=function(router,oauth){

    router.get("/users/:userId/contacts",oauth,function(req,res,next){

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

    router.post("/users/:userId/contacts",oauth,function(req,res,next){
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

                var tuserId=req.body.userId;
                if(!tuserId)
                    return cb({code:400,error:"Parameter error", message:"userId参数不存在！"});

                user.contacts.addContact(tuserId,cont);
            })
            .then(function(cont,contact){
                res.json(contact.toJson());
            })
            .fail(function(cont,error){
                next(error);
            });

    });

    router.get("/users/:userId/contacts/:contactId",oauth,function(req,res,next){
        var userId = req.params.userId;
        var id = req.params.contactId;
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

    router.put("/users/:userId/contacts/:contactId",oauth,function(req,res,next){

        var userId = req.params.userId;
        var id = req.params.contactId;

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

    router.delete("/users/:userId/contacts/:contactId",oauth,function(req,res,next){
        var userId = req.params.userId;
        var id = req.params.contactId;
        var clientId=req.oauth.bearerToken.clientId;

        thenjs()
            .then(function(cont){
                clients.get(clientId,cont);
            })
            .then(function(cont,client){
                client.users.get(userId,cont);
            })
            .then(function(cont,user){
                user.contacts.get(id,cont);
            })
            .then(function(cont,contact){
                contact.delete(cont);
            })
            .then(function(cont){
                res.json({});
            })
            .fail(function(cont,error){
                next(error);
            });
    });


};


