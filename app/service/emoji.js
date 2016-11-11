var thenjs=require("thenjs");
var Emoji=require("../model/emoji");
var utils=require("../utils");
var oauth=require("./oauth");
var config=require("../config");

var service={};

service.get=function(clientId,id,cb){
    Emoji.getEmoji(clientId,id,function(error,obj){
        if(obj)
            service.clear(obj);
        cb(error,obj);
    });
};

service.getList=function(clientId,clientTime,limit,offset,cb){
    Emoji.getEmojiList(clientId,clientTime,limit,offset,function(error,obj){
        if(obj && obj.entries)
            for(var i=0;i<obj.entries.length;i++)
                service.clear(obj.entries[i]);
        cb(error,obj);
    });
};

service.parse=function(req,cb){
    var attrs=["package","type","name","url","width","height"];

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

service.store=function(id,clientId,obj,cb){
    Emoji.getEmoji(clientId,id,function(error,cobj){
        if(cobj && cobj.clientId!=clientId)
            return cb("只能操作本应用的数据");

        if(id && !cobj)
            return cb("表情不存在！");

        obj.id=id;
        obj.clientId=clientId;
        obj.isDelete=cobj?cobj.isDelete:false;
        Emoji.save(obj,function(error,tobj){
            if(error)
                return cb(error);

            if(tobj.dataValues)
                obj=tobj.dataValues;
            service.clear(obj);
            cb(null,obj);
        });
    });
};

service.delete=function(id,clientId,cb){
    Emoji.getEmoji(clientId,id,function(error,obj){
        if(!obj)
            return cb("表情不存在");
        if(obj && obj.clientId!=clientId)
            return cb("只能操作本应用的数据");

        obj.isDelete=true;

        Emoji.save(obj,function(error,obj){
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
