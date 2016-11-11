var Session=require("./session");
var Cache=require("./cache");
var SessionModel=require("../model/session");
var thenjs=require("thenjs");

var Sessions=function(client){
    this.client=client;
    this.cache=new Cache();
    this.locks={};
};

Sessions.prototype.get=function(id,cb){

    var that=this;
    var tobj={};
    thenjs()
        .then(function(cont){
            that.cache.get(id,cont);
        })
        .then(function(cont,session){
            if(session)
                return cb(null,session);
            cont();
        })
        .then(function(cont,session){
            tobj.session=session;
            if(that.locks[id]){
                setTimeout(function(){
                    that.get(id,cb);
                },1000);
            }
            else{
                that.locks[id]=true;
                cont();
            }
        })
        .then(function(cont){
            SessionModel.get(id,cont);
        })
        .then(function(cont,g){
            delete that.locks[id];
            if(!g) {

                return cont("群组不存在");
            }

            //console.log("get db session("+id+")"+ g.id);
            that.cache.get(id,function(error,obj){
                if(!obj){
                    var u = new Session(that,g);
                    tobj.newSession = u;
                    that.cache.set(id,u,cont);
                }
                else{
                    tobj.newSession = obj;
                }
                cont();
            });

        })
        .then(function(cont){
            cb(null,tobj.newSession);
        })
        .fail(function(cont,error){
            cb(error);
        });

};

Sessions.prototype.getP2PSession=function(aUid,bUid,cb){
    var mark=this._parseMark(aUid,bUid);


    var that=this;
    var tobj={};
    thenjs()
        .then(function(cont){
            that.cache.get(mark,cont);
        })
        .then(function(cont,sessionId){
            that.cache.get(sessionId,cont);
        })
        .then(function(cont,session){
            if(session)
                return cb(null,session);
            cont();
        })
        //数据库找寻此群
        .then(function(cont){
            SessionModel.getByMark(that.client.id,mark,cont);
        })
        //如果不存在，新建之
        .then(function(cont,g){
            if(g)
                return cont(null,new Session(that, g));

            if(that.locks[mark]){
                setTimeout(function(){
                    that.getP2PSession(aUid,bUid,cb);
                },1000);
                return;
            }

            that.locks[mark]=true;
            //新建
            thenjs()
                .then(function(cont){
                    var entity={
                        clientId:that.client.id,
                        mark:mark,
                        type:"p2p",
                        description:"",
                        name:"",
                        avatarUrl:"",
                        messageUpdatedAt:new Date(1900,1,1),
                        isDelete:false
                    };
                    SessionModel.save(entity,cont)
                })
                .then(function(cont,entity){
                    cont(null,new Session(that,entity));
                })
                .then(function(cont,session){
                    tobj.session=session;
                    session.addMember([aUid,bUid],cont);
                })
                .then(function(cont){
                    tobj.session.systemMessage_memberAdd(null,null,cont);
                })
                .then(function(){
                    delete that.locks[mark];
                    cont(null,tobj.session);
                })
                .fail(function(ct,error){
                    delete that.locks[mark];
                    cont(error);
                });
        })
        .then(function(cont,u){
            tobj.newSession = u;
            that.cache.get(u.id,function(error,uobj){

                if(!uobj){
                    that.cache.set(u.id, u, cont);
                }
                else{
                    tobj.newSession = uobj;
                    cont();
                }

            });

        })
        .then(function(cont){
            that.cache.set(mark,tobj.newSession.id,cont);
        })
        .then(function(cont){
            cb(null,tobj.newSession);
        })
        .fail(function(cont,error){
            cb(error);
        });

};

Sessions.prototype.getSingleSession=function(uid,cb){
    var mark=uid;

    var that=this;
    var tobj={};
    thenjs()
        .then(function(cont){
            that.cache.get(mark,cont);
        })
        .then(function(cont,sessionId){
            that.cache.get(sessionId,cont);
        })
        .then(function(cont,session){
            if(session)
                return cb(null,session);
            cont();
        })
        //数据库找寻此群
        .then(function(cont){
            SessionModel.getByMark(that.client.id,mark,cont);
        })
        //如果不存在，新建之
        .then(function(cont,g){
            if(g)
                return cont(null,new Session(that, g));

            //新建
            thenjs()
                .then(function(cont){
                    var entity={
                        clientId:that.client.id,
                        mark:mark,
                        type:"single",
                        description:"",
                        name:"",
                        avatarUrl:"",
                        messageUpdatedAt:new Date(1900,1,1),
                        isDelete:false
                    };
                    SessionModel.save(entity,cont)
                })
                .then(function(cont,entity){
                    cont(null,new Session(that,entity));
                })
                .then(function(cont,session){
                    tobj.session=session;
                    session.addMember([uid],cont);
                })
                .then(function(){
                    cont(null,tobj.session);
                })
                .fail(function(ct,error){
                    cont(error);
                });
        })
        .then(function(cont,u){
            tobj.newSession = u;
            that.cache.set(u.id, u, cont);
        })
        .then(function(cont){
            that.cache.set(mark,tobj.newSession.id,cont);
        })
        .then(function(cont){
            cb(null,tobj.newSession);
        })
        .fail(function(cont,error){
            cb(error);
        });
};

Sessions.prototype._parseMark=function(aUid,bUid){
    aUid=aUid||"";
    bUid=bUid||"";
    return aUid>bUid?bUid+","+aUid:aUid+","+bUid;
};

module.exports=Sessions;