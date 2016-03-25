var UserModel=require("../model/user");
var UserConversations = require("./userConversations");
var Contacts=require("./contacts");


var User=function(users,entity){
    this.users=users;
    this.entity=entity;
    this.id=entity.id;
    this.userConversations=new UserConversations(this);
    this.contacts=new Contacts(this);

    for(var index in this.entity)
        this[index]=this.entity[index];
};


User.prototype.store=function(cb){
    for(var index in this.entity)
        this.entity[index]=this[index];
    var that=this;
    UserModel.save(this.entity,function(error,obj){
        if(error)
            cb(error);

        for(var index in obj)
            that[index]=obj[index];

        cb();
    });
};


module.exports=User;