var context=require("./context");
var Clients=require("../app/core/clients");
var thenjs=require("thenjs");

var testClientId="testClientId";
module.exports=function(cb){

    thenjs()
        .then(function(cont){
            Clients.get(testClientId,cont);
        })
        .then(function(cont,client){
            context.client=client;
            cont();
        })
        .then(function(cont){
            context.client.users.register("abc"+Math.floor(Math.random()*1000)+"@qq.com","123456","",cont);
        })
        .then(function(cont,user){
            context.user=user;
            cb();
        })
        .fail(function(cont,error){
            cb(error);
        });
};