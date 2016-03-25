var thenjs=require("thenjs");
var Session=require("../model/session");
var utils=require("../utils");

var service={};

service.get=function(clientId,id,clientTime,cb){
    Session.getSession(clientId,clientTime,id,function(error,obj){
        if(obj)
            service.clear(obj);
        cb(error,obj);
    });
};

service.getList=function(clientId,clientTime,filter_term,limit,offset,cb){
    Session.getSessionList(clientId,clientTime,filter_term,limit,offset,function(error,obj){
        if(obj && obj.entries)
            for(var i=0;i<obj.entries.length;i++)
                service.clear(obj.entries[i]);
        cb(error,obj);
    });
};

service.parse=function(req,rs,cb){
    if(!cb &&rs){
        cb=rs;
        rs={type:1,name:1,avatarUrl:1};
    }
    var attrs=["type","name","description","secureType","avatarUrl","nameChanged"];

    var obj={};
    for(var i=0;i<attrs.length;i++){
        var key=attrs[i];
        if(!req.body[key] && rs[key])
            return cb({code:400,error:"Parameter error", message:key+"参数不存在！"});

        if(req.body[key])
            obj[key]=req.body[key];
    }
    cb(null,obj);
};

service.store=function(id,clientId,obj,cb){
    Session.get(id,function(error,cobj){
        if(cobj && cobj.clientId!=clientId)
            return cb("只能操作本应用的数据");

        if(id && !cobj)
            return cb("群组不存在！");

        obj.id=id;
        obj.clientId=clientId;
        obj.isDelete=cobj?cobj.isDelete:false;
        Session.save(obj,function(error,tobj){
            if(error)
                return cb(error);

            obj=tobj.dataValues ||tobj;
            service.clear(obj);
            cb(null,obj);
        });
    });
};

service.delete=function(id,clientId,cb){
    Session.get(id,function(error,obj){
        if(!obj)
            return cb("群组不存在");
        if(obj && obj.clientId!=clientId)
            return cb("只能操作本应用的数据");

        obj.isDelete=true;
        Session.save(obj,function(error,obj){
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
};

module.exports=service;
