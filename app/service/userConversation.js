var thenjs=require("thenjs");
var UserConversation=require("../model/userConversation");
var utils=require("../utils");

var clients=require("../core/clients");

var service={};

service.get=function(ownerId,clientId,id,clientTime,cb){

    thenjs()
        .then(function(cont){
            clients.get(clientId,cont);
        })
        .then(function(cont,client){
            client.users.get(ownerId,cont);
        })
        .then(function(cont,user){
            user.userConversations.get(id,cont)
        })
        .then(function(cont,userConversation){
            if(!userConversation)
                return cont("用户会话不存在！");

            if(!userConversation.updatedAt<clientTime)
                return cont();

            cb(null,userConversation.toJson());
        })
        .fail(function(cont,error){
            cb({code:400,message:error});
        });
};

service.getList=function(ownerId,clientId,clientTime,filter_term,limit,offset,cb){

    thenjs()
        .then(function(cont){
            clients.get(clientId,cont);
        })
        .then(function(cont,client){
            client.users.get(ownerId,cont);
        })
        .then(function(cont,user){
            user.userConversations.getList(clientTime,cont);
        })
        .then(function(cont,list){
            var result={total_count:maxCount,entries:[]};
            for(var i=offset;i<list.length && i<offset+limit;i++){
                result.entries.push(list[i].toJson());
            }
            cb(null,result);
        })
        .fail(function(cont,error){
            cb({code:400,message:error});
        });

//    UserConversation.getUserConversationList(ownerId,clientId,clientTime,filter_term,limit,offset,function(error,obj){
//        if(obj && obj.entries)
//            for(var i=0;i<obj.entries.length;i++)
//                service.clear(obj.entries[i]);
//        cb(error,obj);
//    });
};

service.parse=function(req,cb){
    var attrs=["targetId","name","type","top","avatarUrl"];
    var ks={"targetId":1,"name":1,"type":1,"avatarUrl":1};

    var obj={};
    for(var i=0;i<attrs.length;i++){
        var key=attrs[i];
        if(!req.body[key] && ks[key])
            return cb({code:400,error:"Parameter error", message:key+"参数不存在！"});

        if(req.body[key])
            obj[key]=req.body[key];
    }
    cb(null,obj);
};

service.store=function(ownerId,id,clientId,obj,cb){
    //

    UserConversation.get(id,function(error,cobj){
        if(cobj && cobj.clientId!=clientId)
            return cb("只能操作本应用的数据");

        if(id && !cobj)
            return cb("用户会话不存在！");

        obj.id=id;
        obj.clientId=clientId;
        obj.ownerId=ownerId;
        obj.isDelete=cobj?cobj.isDelete:false;
        UserConversation.save(obj,function(error,tobj){
            if(error)
                return cb(error);


            obj=tobj.dataValues ||tobj;
            service.clear(obj);
            cb(null,obj);
        });
    });
};

service.delete=function(id,clientId,cb){
    UserConversation.get(id,function(error,obj){
        if(!obj)
            return cb("用户会话不存在");
        if(obj && obj.clientId!=clientId)
            return cb("只能操作本应用的数据");

        obj.isDelete=true;

        UserConversation.save(obj,function(error,obj){
            if(error)
                return cb(error);

            cb();
        });
    });
};

service.clear=function(obj){
    if(!obj)
        return;
    delete obj.clientId;
    delete obj.ownerId;
};
module.exports=service;
