var thenjs=require("thenjs");
var ContactModel=require("../model/contact");
var Contact=require("./contact");

var Contacts=function(user){
    this.user=user;
    this.list=null;

    this.max=1000;
};

Contacts.prototype.getList=function(cb){


    var that=this;

    if(that.list)
        return cb(null,that.list);


    var clientId=that.user.users.client.id;
    ContactModel.getList(that.user.id,clientId,function(error,objs){
        if(that.list)
            return  cont(null,that.list);

        that.list=[];
        for(var i=0;i<objs.length;i++){
            that.list.push(new Contact(that,objs[i]));
        }
        cb(null,that.list);
    });


};

Contacts.prototype.get=function(id,cb){

    var that=this;
    if(that.list) {
        for (var i = 0; i < that.list.length; i++)
            if (that.list[i].id == id) {
                return cb(null, that.list[i]);
            }
        return cb();
    }

    ContactModel.get(id,function(error,obj){
        if(error)
            return cb(error);

        if(!obj)
            return cb();


        var contact=new Contact(that,obj);
        cb(null,contact);
    });

};
Contacts.prototype.getByUserId=function(userId,cb){

    var that=this;
    if(that.list) {
        for (var i = 0; i < that.list.length; i++)
            if (that.list[i].userId == userId) {
                return cb(null, that.list[i]);
            }
        return cb();
    }

    ContactModel.getByUserId(that.user.id,userId,function(error,obj){
        if(error)
            return cb(error);

        if(!obj)
            return cb();


        var contact=new Contact(that,obj);
        cb(null,contact);
    });

};

Contacts.prototype.addContact=function(uid,noNeedAddOther,cb){

    if(!cb &&  typeof noNeedAddOther=="function"){
        cb=noNeedAddOther;
        noNeedAddOther=false;
    }

    var that=this;

    thenjs()
        .then(function(cont){
            //如果不需要加对方，直接过
            if(noNeedAddOther)
                return cont();

            //让对方加自己
            thenjs()
                .then(function(ct){
                    that.user.users.get(uid,ct);
                })
                .then(function(ct,u){
                    u.contacts.addContact(that.user.id,true,ct);
                })
                .then(function(ct){
                    cont();
                })
                .fail(function(ct,error){
                   cont();
                });
        })
        .then(function(cont){
            that.getByUserId(uid,cont);
        })
        .then(function(cont,contact) {

            if(!contact)
                return cont();

            if (!contact.isDelete)
                return cont("联系人已存在");

            contact.isDelete = false;
            contact.store(function (error, contact) {
                cb(null, contact);
            });

        })
        .then(function(cont){
            that.user.users.get(uid,cont);
        })
        .then(function(cont,u){
            if(!u)
                return cont("用户不存在");

            ContactModel.save({
                clientId:that.user.users.client.id,
                userId: u.id,
                ownerId:that.user.id,
                name: u.name,
                email: u.email,
                avatarUrl: u.avatarUrl,
                isDelete:false
            },cont);

        })
        .then(function(cont,entity){
            var contact=new Contact(that,entity);
            if(that.list)
                that.list.push(contact);
            cb(null,contact);
        })
        .fail(function(cont,error){
            cb(error);
        });

};

module.exports=Contacts;