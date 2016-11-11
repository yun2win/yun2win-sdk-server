var thenjs=require("thenjs");
var Contact=require("../model/contact");
var utils=require("../utils");
var pinyin=require("../plugins/pinyin");

var service={};

service.get=function(ownerId,clientId,id,clientTime,cb){
    Contact.getContact(ownerId,clientId,clientTime,id,function(error,obj){
        if(obj)
            service.clear(obj);
        cb(error,obj);
    });
};

service.getList=function(ownerId,clientId,clientTime,filter_term,limit,offset,cb){
    Contact.getContactList(ownerId,clientId,clientTime,filter_term,limit,offset,function(error,obj){
        if(obj && obj.entries)
            for(var i=0;i<obj.entries.length;i++)
                service.clear(obj.entries[i]);
        cb(error,obj);
    });
};

service.parse=function(req,cb){
    var attrs=["userId","name","email","avatarUrl","remark","title"];
    var rs={userId:1,name:1}

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

service.store=function(ownerId,id,clientId,obj,cb){
    Contact.get(id,function(error,cobj){
        if(cobj && cobj.clientId!=clientId)
            return cb("只能操作本应用的数据");

        if(id && !cobj)
            return cb("联系人不存在！");

        if(cobj){
            for(var index in cobj)
                if(!obj[index])
                    obj[index]=cobj[index];
        }

        obj.id=id;
        obj.clientId=clientId;
        obj.ownerId=ownerId;
        obj.isDelete=cobj?cobj.isDelete:false;
        Contact.save(obj,function(error,tobj){
            if(error)
                return cb(error);

            if(!id)
                obj=tobj.dataValues ||tobj;


            service.clear(obj);
            cb(null,obj);
        });
    });
};

service.delete=function(id,clientId,cb){
    Contact.get(id,function(error,obj){
        if(!obj)
            return cb("联系人不存在");
        if(obj && obj.clientId!=clientId)
            return cb("只能操作本应用的数据");

        obj.isDelete=true;

        Contact.save(obj,function(error,obj){
            if(error)
                return cb(error);

            cb();
        });
    });
};

service.clear=function(obj){
    if(!obj)
        return;

    //加入拼音
    obj.pinyin=pinyin(obj.name);

    //加入拼音
    obj.titlePinyin=pinyin(obj.title);

    delete obj.email;
    delete obj.clientId;
    delete obj.ownerId;
};

module.exports=service;
