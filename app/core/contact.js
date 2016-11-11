
var ContactModel=require("../model/contact");

var pinyin=require("../plugins/pinyin");

var Contact=function(contacts,entity){
    this.contacts=contacts;
    this.entity=entity;
    this.id=entity.id;

    for(var index in this.entity)
        this[index]=this.entity[index];
};

Contact.prototype.getSession=function(cb){
    var client=this.contacts.user.users.client;
    client.sessions.getP2PSession(this.contacts.user.id,this.userId,cb);
};

Contact.prototype.toJson=function(){
    /*
    * {
     "id": "181216415",
     "userId": "138493982",
     "name": "~&嘀嗒&=-",
     "title": "张小三",
     "pinyin":['~&','di','da','&=-'],
     "titlePinyin":['zhang','xiao','san'],
     "remark": "此人爱瘪三",
     "createdAt": "2012-05-03T21:39:11-07:00",
     "updatedAt": "2012-08-23T14:57:48-07:00",
     "avatarUrl": "https://api.yun2win.com/api/avatar/large/181216415"
     }*/
    return {
        id:this.id,
        userId:this.userId,
        name:this.name,
        title:this.title,
        email:this.email,
        createdAt:this.createdAt,
        updateAt:this.updateAt,
        avatarUrl:this.avatarUrl,
        "pinyin":pinyin(this.name),
        "titlePinyin":pinyin(this.title)
    };
}

Contact.prototype.store=function(cb){
    var that=this;
    that.updatedAt=new Date();
    for(var index in this.entity)
        this.entity[index]=this[index];

    ContactModel.save(this.entity,function(error){
        if(error)
            return cb(error);
        cb(null,that);
    });

};
Contact.prototype.delete=function(cb){

    var that=this;
    that.updatedAt=new Date();
    that.isDelete=true;


    for(var index in that.entity)
        that.entity[index]=that[index];

    ContactModel.save(that.entity,function(error){
        if(error)
            return cb(error);
        cb(null,that);
    });
};
module.exports=Contact;