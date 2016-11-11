var Model=require("../model/OAuthAccessToken");

var Records=function(client){
    this.client=client;
};

Records.prototype.getBy=function(begin,end,cb){
    Model.getBy(begin,end,cb);
};

module.exports=Records;