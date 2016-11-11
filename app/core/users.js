var Cache=require("./cache");
var UserModel=require("../model/user");
var User=require("./user");
var utils=require("../utils");
var thenjs=require("thenjs");

var Users=function(client){
    this.client=client;
    this.cache=new Cache();
};

Users.prototype.get=function(id,cb){

    var that=this;
    this.cache.get(id,function(err,user){
        if(err)
            return cb(err);
        if(user)
            return cb(null,user);

        UserModel.get(id,function(error,user){
            if(error)
                return cb(error);
            if(!user || user.clientId!=that.client.id)
                return cb("用户不存在");

            that.cache.get(id,function(err,uobj) {
                if(!uobj){
                    var u=new User(that,user);
                    that.cache.set(id,u,function(error){
                        if(error)
                            return cb(error);
                        cb(null,u);
                    });
                }
                else{
                    cb(null,uobj);
                }
            });

        })

    });

};
Users.prototype.register=function(email,password,avatarUrl,cb){
    var that=this;
    thenjs()
        .then(function(cont){
            UserModel.getByEmail(that.client.id,email,cont);
        })
        .then(function(cont,user){

            if(user && user.type!='validate'){
                cont("此邮箱已经注册！");
                return;
            }

            cont(null,user);
        })
        //生成新Key,更新用户表
        .then(function(cont,user){
            var key=utils.guid();
            utils.md5(password,function(error,mdpassword){
                var name=null;
                if(!name && email.indexOf("@")>0)
                    name=email.substr(0,email.indexOf("@"));
                user={
                    clientId:that.client.id,
                    email:email,
                    name:name,
                    password: mdpassword,
                    role:"user",
                    avatarUrl:avatarUrl,
                    status:"active"
                };
                UserModel.save(user,function(err,obj){
                    if(err || !obj)
                        return cont(err);
                    cont(null,new User(that,obj));
                });
            });
        })
        .then(function(cont,user){
            that.cache.set(user.id,user,cont);
        })
        .then(function(cont,user){
            cb(null,user);
        })
        .fail(function(cont,error){
            cb(error);
        });
};
Users.prototype.delete=function(id,cb){
    var that=this;
    thenjs()
        .then(function(cont){
            that.get(id,cont);
        })
        .then(function(cont,u){
            if(!u)
                return cb();
            u.isDelete=false;
            u.store(cont);
        })
        .then(function(){
            cb();
        })
        .fail(function(cont,error){
            cb(error);
        });
};
Users.prototype.search=function(email,cb){
    var that=this;
    UserModel.getByEmail(this.client.id,email,function(err,obj){
        if(err || !obj)
            return cb(err);
        cb(null,new User(that,obj));
    });
};
module.exports=Users;