var thenjs=require("thenjs");
var User=require("../model/user");
var utils=require("../utils");
//var mails=require("../plugins/mail");
var oauth=require("./oauth");
var config=require("../config");
var pinyin=require("../plugins/pinyin");

var service={};
//
//service.register=function(url,email,cb){
//    //查看此email是否已经注册
//    thenjs()
//        .then(function(cont){
//            User.getByEmail(email,cont);
//        })
//        .then(function(cont,user){
//
//            if(user && user.type!='validate'){
//                cont("此邮箱已经注册！");
//                return;
//            }
//
//            cont(null,user);
//        })
//        //生成新Key,更新用户表
//        .then(function(cont,user){
//            var key=utils.guid();
//            if(!user){
//                var name=email.substr(0,email.indexOf("@"));
//                user={
//                    mail:email,
//                    name:name,
//                    password:"",
//                    date:new Date(),
//                    validateKey:key,
//                    type:"validate"
//                };
//            }
//            user.date=new Date();
//            user.validateKey=key;
//            user.type="validate";
//
//            User.save(user,cont);
//        })
//        //发送邮件
//        .then(function(cont,user){
//            mails.sendTemplate(
//                email,
//                "欢迎选择理约云，请验证您的邮箱",
//                "MailValidate",
//                {Url:url+"?key="+user.validateKey},
//                cont
//            );
//        })
//        .then(function(cont){
//            cb();
//        })
//        .fail(function(cont,error){
//            cb(error.message || error);
//        });
//
//};
//service.register_step2=function(key,password,cb){
//
//    thenjs()
//        .then(function(cont){
//            User.getByKey(key,cont);
//        })
//        //链接保存
//        .then(function(cont,user){
//            if(!user){
//                cont("链接已过期!")
//                return;
//            }
//            var d=user.date.setDate(user.date.getDate()+3);
//            if(d<new Date()){
//                cont("链接已过期!")
//                return;
//            }
//
//            cont(null,user);
//        })
//        //设置密码
//        .then(function(cont,user){
//            utils.md5(password,function(eror,psw){
//                user.password=psw;
//                cont(null,user);
//            });
//        })
//        //保存
//        .then(function(cont,user){
//            user.type="normal";
//            user.validateKey="";
//            User.save(user,cont);
//        })
//        .then(function(cont){
//            cb();
//        })
//        .fail(function(cont,error){
//            cb(error.message || error);
//        });
//
//};
//service.validate=function(email,password,cb){
//    thenjs()
//        .then(function(cont){
//            User.getByEmail(email,cont);
//        })
//        //链接保存
//        .then(function(cont,user){
//            if(!user){
//                cont("用户不存在!")
//                return;
//            }
//            cont(null,user);
//        })
//        //设置密码
//        .then(function(cont,user){
//            utils.md5(password,function(eror,psw){
//                if(user.password!=psw){
//                    cont("用户和密码不匹配!")
//                    return;
//                }
//                cont(null,user);
//            });
//        })
//        .then(function(cont,user){
//            cb(null,user);
//        })
//        .fail(function(cont,error){
//            cb(error.message || error);
//        });
//};
//service.resSetPassword=function(url,email,cb){
//    //查看此email是否已经注册
//    thenjs()
//        .then(function(cont){
//            User.getByEmail(email,cont);
//        })
//        .then(function(cont,user){
//
//            if(!user){
//                cont("此邮箱未注册！");
//                return;
//            }
//
//            cont(null,user);
//        })
//        //生成新Key,更新用户表
//        .then(function(cont,user){
//            var key=utils.guid();
//            user.date=new Date();
//            user.validateKey=key;
//            user.type="resetPassword";
//            User.save(user,function(error){
//                if(error){
//                    cont(error);
//                    return;
//                }
//                cont(null,user);
//            });
//
//        })
//        //发送邮件
//        .then(function(cont,user){
//            //console.log(user);
//            mails.sendTemplate(
//                email,
//                "请重置您的理约云密码",
//                "MailGetPassword",
//                {Url:url+"?key="+user.validateKey},
//                cont
//            );
//        })
//        .then(function(cont){
//            cb();
//        })
//        .fail(function(cont,error){
//            cb(error.message || error);
//        });
//
//};
//service.resSetPassword_step2=function(key,password,cb){
//
//    thenjs()
//        .then(function(cont){
//            User.getByKey(key,cont);
//        })
//        //链接保存
//        .then(function(cont,user){
//            if(!user){
//                cont("链接已过期!")
//                return;
//            }
//            var d=user.date.setDate(user.date.getDate()+3);
//            if(d<new Date()){
//                cont("链接已过期!")
//                return;
//            }
//
//            cont(null,user);
//        })
//        //设置密码
//        .then(function(cont,user){
//            utils.md5(password,function(eror,psw){
//                user.password=psw;
//                cont(null,user);
//            });
//        })
//        //保存
//        .then(function(cont,user){
//            user.type="normal";
//            user.validateKey="";
//            User.save(user,cont);
//        })
//        .then(function(cont){
//            cb();
//        })
//        .fail(function(cont,error){
//            cb(error.message || error);
//        });
//
//};

service.get=function(clientId,id,clientTime,cb){
    User.getUser(clientId,clientTime,id,function(error,obj){
        if(obj)
            service.clear(obj);
        cb(error,obj);
    });
};

service.getList=function(clientId,clientTime,filter_term,limit,offset,cb){
    User.getUserList(clientId,clientTime,filter_term,limit,offset,function(error,obj){
        if(obj && obj.entries)
            for(var i=0;i<obj.entries.length;i++)
                service.clear(obj.entries[i]);
        cb(error,obj);
    });
};

service.parse=function(req,cb){
    var attrs=["email","name","role","jobTitle","phone","address","status","avatarUrl"];


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
    User.get(id,function(error,cobj){
        if(cobj && cobj.clientId!=clientId)
            return cb("只能操作本应用的数据");

        if(id && !cobj)
            return cb("用户不存在！");

        obj.id=id;
        obj.clientId=clientId;
        obj.isDelete=cobj?cobj.isDelete:false;
        User.save(obj,function(error,tobj){
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
    User.get(id,function(error,obj){
        if(!obj)
            return cb("用户不存在");
        if(obj && obj.clientId!=clientId)
            return cb("只能操作本应用的数据");

        obj.isDelete=true;

        User.save(obj,function(error,obj){
            if(error)
                return cb(error);

            cb();
        });
    });
};

service.register=function(clientId,email,name,password,avatarUrl,cb){
    thenjs()
        .then(function(cont){
            User.getByEmail(clientId,email,cont);
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
                if(!name && email.indexOf("@")>0)
                    name=email.substr(0,email.indexOf("@"));
                user={
                    clientId:clientId,
                    email:email,
                    name:name,
                    password: mdpassword,
                    role:"user",
                    avatarUrl:avatarUrl
                };
                User.save(user,function(err,obj){
                    if(err || !obj)
                        return cont(err);
                    cont(null,obj);
                });
            });
        })
        .then(function(cont,user){
            service.clear(user)
            cb(null,user);
        })
        .fail(function(cont,error){
            cb(error);
        });
};
service.login=function(clientId,email,password,cb){
    thenjs()
        .then(function(cont){
            User.getByEmail(clientId,email,cont);
        })
        .then(function(cont,user){

            if(!user ){
                cont("用户不存在");
                return;
            }

            cont(null,user);
        })
        .then(function(cont,user){
            utils.md5(password,function(error,mdpassword){
                if(user.password!=mdpassword)
                    return cont("用户密码不匹配");
                cont(null,user);
            });
        })
        .then(function(cont,user){
            var token=utils.guid(16);
            var date=new Date();
            var hour=config.client.tokenPeriod;// 24*30;
            date.setHours(date.getHours()+hour);
            //date.setMinutes(date.getMinutes()+1);
            oauth.saveAccessToken(token,clientId,date,user.id,function(error){
                if(error)
                    return cont(error);

                var obj=user;
                service.clear(obj);
                obj.token=token;
                obj.expires=hour*3600;

                cont(null,obj);
            });
        })
        .then(function(cont,obj){
            var d=new Date();
            var t= (d.getYear()+1900)+"-"+(d.getMonth()+1)+"-"+ d.getDate();
            utils.md5(config.client.appSerect+t,function(error,key){
                obj.secret=key+"=="+t;
                obj.key=config.client.appKey;
                cb(null,obj);
            });
        })
        .fail(function(cont,error){
            cb(error);
        });
};

service.clear=function(obj){
    if(!obj)
        return;

    //加入拼音
    obj.pinyin=pinyin(obj.name);

    delete obj.clientId;
    delete obj.password;
};
module.exports=service;
