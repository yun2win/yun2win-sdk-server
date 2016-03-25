var thenjs=require("thenjs");
var Attachment=require("../model/attachment");
var utils=require("../utils");

var service={};

service.getByMd5=function(md5,cb){
    Attachment.getByMd5(md5,cb);
};

service.createPath=function(){
    var d=new Date();
    return "/atts/"+ (1900+d.getYear())+"-"+(d.getMonth()+1)+"/";
};

service.get=function(clientId,id,clientTime,cb){
    Attachment.getAttachment(clientId,clientTime,id,function(error,obj){
        if(obj)
            service.clear(obj);
        cb(error,obj);
    });
};

service.store=function(clientId,fileName,path,size,md5,cb){
    var obj={};
    obj.clientId=clientId;
    obj.fileName=fileName;
    obj.isDelete=false;
    obj.path=path;
    obj.size=size;
    obj.md5=md5;
    Attachment.save(obj,function(error,obj){
        if(error)
            return cb(error);
        service.clear(obj);
        cb(null,obj);
    });
};

service.delete=function(id,clientId,cb){
    Attachment.get(id,function(error,obj){
        if(!obj)
            return cb("附件不存在");
        if(obj && obj.clientId!=clientId)
            return cb("只能操作本应用的数据");

        obj.isDelete=true;

        Attachment.save(obj,function(error,obj){
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
