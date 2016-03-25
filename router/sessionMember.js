var Srv=require("../app/service/sessionMember");
var utils=require("../app/utils");
var thenjs=require("thenjs");
var clients=require("../app/core/clients");

module.exports=function(router,oauth){

    router.get("/sessions/:sessionId/members",oauth,function(req,res,next){

        var sessionId = req.params.sessionId;
        var clientId=req.oauth.bearerToken.clientId;


        var clientTime =utils.parseDate(req.get('Client-Sync-Time'));
        var limit = Math.min(1000,req.query.limit || 100);
        var offset = req.query.offset || 0 ;

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



                session.filterMembers(clientTime,limit,offset,cont);
            })
            .then(function(cont,obj){
                var objs=[];
                for(var i=0;i<obj.entries.length;i++){
                    objs.push(obj.entries[i].toJson());
                }
                res.json({total_count:obj.total_count,entries:objs});
            })
            .fail(function(cont,error){
                next(error);
            });

    });

    router.post("/sessions/:sessionId/members",oauth,function(req,res,next){
        var sessionId = req.params.sessionId;
        var clientId=req.oauth.bearerToken.clientId;
        var userId=req.oauth.bearerToken.userId;
        var tobj={};

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

                session.checkRight(userId,"Member_Add",function(error){
                    if(error)
                        return cont(error);
                    tobj.session=session;
                    parseParms(req,cont,{"userId":1});
                });

            })
            .then(function(cont,obj){
                tobj.session.setMember(obj,cont);
            })
            .then(function(cont,member){
                res.json(member.toJson());
            })
            .fail(function(cont,error){
                next(error);
            });

    });

    router.get("/sessions/:sessionId/members/:memberId",oauth,function(req,res,next){
        var sessionId = req.params.sessionId;
        var id = req.params.memberId;
        var clientTime = utils.parseDate(req.get('Client-Sync-Time'));
        var clientId=req.oauth.bearerToken.clientId;

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
                session.getMember(id,cont);
            })
            .then(function(cont,member){
                if(!member || member.updatedAt<clientTime)
                    return cont("未找到有更新数据");
                res.json(member.toJson());
            })
            .fail(function(cont,error){
                next(error);
            });

    });

    router.put("/sessions/:sessionId/members/:memberId",oauth,function(req,res,next){

        var sessionId = req.params.sessionId;
        var id = req.params.memberId;
        var userId=req.oauth.bearerToken.userId;
        var clientId=req.oauth.bearerToken.clientId;

        var tobj={};
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

                session.checkRight(userId,"Member_Edit",function(error){
                    if(error)
                        return cont(error);
                    tobj.session=session;
                    parseParms(req,cont,{name:1,"role":1,"avatarUrl":1,"status":1});
                });

            })
            .then(function(cont,obj){
                obj.id=id;
                tobj.session.setMember(obj,cont);
            })
            .then(function(cont,member){
                res.json(member.toJson());
            })
            .fail(function(cont,error){
                next(error);
            });
    });

    router.delete("/sessions/:sessionId/members/:memberId",oauth,function(req,res,next){
        var sessionId = req.params.sessionId;
        var id = req.params.memberId;
        var clientId=req.oauth.bearerToken.clientId;
        var userId=req.oauth.bearerToken.userId;

        var tobj={};
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
                session.getMember(id,cont);
            })
            .then(function(cont,member){
                if(!member)
                    return cb();

                var right="Member_Delete";
                if(member.userId==userId)
                    right="Member_Delete_Self";
                tobj.session.checkRight(userId,right,function(error){
                    if(error)
                        return cont(error);

                    member.delete(cont);
                });
            })
            .then(function(){
                res.json();
            })
            .fail(function(cont,error){
                next(error);
            });
    });

    var parseParms=function(req,cb,rs){
        var parms=[];
        var attrs=["userId","name","role","avatarUrl","status"];
        var rs=rs||{};
        var obj={};
        for(var i=0;i<attrs.length;i++){
            var key=attrs[i];
            if(!req.body[key] &&rs[key])
                return cb({code:400,error:"Parameter error", message:key+"参数不存在！"});
            if(req.body[key])
                obj[key]=req.body[key];
        }
        cb(null,obj);
    }

};


