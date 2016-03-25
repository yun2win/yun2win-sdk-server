var thenjs=require("thenjs");
var Message=require("../model/message");
var utils=require("../utils");

var service={};

service.get=function(ownerId,clientId,id,clientTime,cb){
    Message.getMessage(ownerId,clientId,clientTime,id,function(error,obj){
        if(obj)
            service.clear(obj);
        cb(error,obj);
    });
};

service.getList=function(ownerId,clientId,clientTime,filter_term,limit,offset,cb){
    Message.getMessageList(ownerId,clientId,clientTime,filter_term,limit,offset,function(error,obj){
        if(obj && obj.entries)
            for(var i=0;i<obj.entries.length;i++)
                service.clear(obj.entries[i]);
        cb(error,obj);
    });
};


service.getLastList=function(ownerId,clientId,clientTime,limit,offset,cb){
    Message.getLastMessageList(ownerId,clientId,clientTime,limit,offset,function(error,objs){
            for(var i=0;i<objs.length;i++)
                service.clear(objs[i]);
        cb(error,objs);
    });
};

service.parse=function(req,cb){
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

service.store=function(ownerId,id,clientId,obj,cb){
    Message.get(id,function(error,cobj){
        if(cobj && cobj.clientId!=clientId)
            return cb("只能操作本应用的数据");

        if(id && !cobj)
            return cb("群组不存在！");

        obj.id=id;
        obj.clientId=clientId;
        obj.ownerId=ownerId;
        obj.isDelete=cobj?cobj.isDelete:false;
        Message.save(obj,function(error,tobj){
            if(error)
                return cb(error);

            obj=tobj.dataValues ||tobj;
            service.clear(obj);
            cb(null,obj);
        });
    });
};

service.delete=function(id,clientId,cb){
    Message.get(id,function(error,obj){
        if(!obj)
            return cb("群组不存在");
        if(obj && obj.clientId!=clientId)
            return cb("只能操作本应用的数据");

        obj.isDelete=true;

        Message.save(obj,function(error,obj){
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
