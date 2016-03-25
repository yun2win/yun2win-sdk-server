var Client=require("./client");

var Clients=function(){

    this.list=[];

};

Clients.prototype.get=function(clientId,cb){

    if(!clientId)
        return cb("无此客户端");

    for(var i=0;i<this.list.length;i++){
       if(this.list[i].id==clientId)
            return cb(null,this.list[i]);
    }

    var obj=new Client(clientId);
    this.list.push(obj);
    cb(null,obj);

};


var Clients=new Clients();
module.exports=Clients;