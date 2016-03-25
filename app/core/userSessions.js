var thenjs=require("thenjs");
var UserSessionModel=require("../model/userSession");
var config=require("../config");

var UserSessions=function(user){
    this.user=user;
    this.list=null;
};


UserSessions.prototype.get=function(id,clientTime,cb){

    var that=this;
    UserSessionModel.getUserSession(this.user.id,this.user.users.client.id,clientTime,id,function(error,obj){
        if(obj)
            that.clear(obj);
        cb(error,obj);
    });
};

UserSessions.prototype.getList=function(clientTime,filter_term,limit,offset,cb){
    var that=this;
    UserSessionModel.getUserSessionList(this.user.id,this.user.users.client.id,clientTime,filter_term,limit,offset,function(error,obj){
        if(obj && obj.entries)
            for(var i=0;i<obj.entries.length;i++)
                that.clear(obj.entries[i]);
        cb(error,obj);
    });
};

UserSessions.prototype.parse=function(req,cb){
    var attrs=["userId","name","role","status"];


    var obj={};
    for(var i=0;i<attrs.length;i++){
        var key=attrs[i];
        if(!req.body[key])
            return cb({code:400,error:"Parameter error", message:key+"参数不存在！"});

        obj[key]=req.body[key];
    }
    cb(null,obj);
};

UserSessions.prototype.store=function(id,obj,cb){
    var ownerId=this.user.id;
    var clientId=this.user.users.client.id;
    var that=this;
    UserSessionModel.get(id,function(error,cobj){
        if(cobj && cobj.clientId!=clientId)
            return cb("只能操作本应用的数据");

        if(id && !cobj)
            return cb("群组不存在！");

        obj.id=id;
        obj.clientId=clientId;
        obj.sessionId=ownerId;
        obj.isDelete=cobj?cobj.isDelete:false;
        UserSessionModel.save(obj,function(error,tobj){
            if(error)
                return cb(error);

            if(tobj.dataValues)
                obj=tobj.dataValues;

            that.clear(obj);
            cb(null,obj);
        });
    });
};

UserSessions.prototype.delete=function(id,clientId,cb){
    UserSessionModel.get(id,function(error,obj){
        if(!obj)
            return cb("群组不存在");
        if(obj && obj.clientId!=clientId)
            return cb("只能操作本应用的数据");

        obj.isDelete=true;

        UserSessionModel.save(obj,function(error,obj){
            if(error)
                return cb(error);

            cb();
        });
    });
};

UserSessions.prototype.clear=function(obj){
    if(!obj)
        return;
    delete obj.clientId;
    delete obj.sessionId;
};

module.exports=UserSessions;