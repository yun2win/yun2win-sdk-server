
var Sessions=require("./sessions");
var Users=require("./users");
var Records=require("./records");
var timer=require("../timer");


var Client=function(id){
    this.id=id;
    this.sessions=new Sessions(this);
    this.users=new Users(this);
    this.records=new Records(this);
};



module.exports=Client;