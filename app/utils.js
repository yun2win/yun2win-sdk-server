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
    try {
        var md5 = crypto.createHash('md5');
        md5.update(content);
        var d = md5.digest('hex');
        cb(null, d);
    }
    catch(ex){
        cb(ex);
    }
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

utils.encodeUTF8=function(str){
    var reg=/[\ud000-\uffff]/;
    var temp = "",rs = "";
    for( var i=0 , len = str.length; i < len; i++ ){
        var key=str[i]+"";
        if(!reg.test(key)){
            rs+=key;
        }
        else {
            temp = str.charCodeAt(i).toString(16);
            rs += "\\u" + new Array(5 - temp.length).join("0") + temp;
        }
    }
    //console.log(str+":==="+rs);
    return rs;
};
utils.decodeUTF8=function(str){
    return str.replace(/(\\u)(\w{4}|\w{2})/gi, function($0,$1,$2){
        return String.fromCharCode(parseInt($2,16));
    });
};


module.exports=utils;