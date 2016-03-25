var crypto = require('crypto');
var nanoId=require("nano-id");

var utils={};

utils.guid=function(num) {
    return nanoId(num||16);
};

utils.random=function(max){
    return Math.floor(Math.random()*max);
};

utils.each=function(array,action){
    if(!action)
        return;
    for(var i=0;i<array.length;i++){
        var obj=array[i];
        action(obj,i);
    }
};

utils.md5=function(content,cb){
    var md5 = crypto.createHash('md5');
    md5.update(content);
    var d = md5.digest('hex');
    cb(null,d);
};

utils.parseDate=function(str){
    if(!str)
        return new Date('1900/1/1');
    try {
        if(str.indexOf("/")>0 || str.indexOf("-")>0)
            return new Date(str);

        var ts=typeof str=="number"?str:parseInt(str);
        ts=Math.floor(ts/1000)*1000;
        return new Date(ts);
    }catch(e){
        return null;
    }
};

module.exports=utils;