var pinyin = require("node-pinyin");
//var OpenCC = require("opencc");
//var opencc = new OpenCC('t2s.json');


module.exports=function(title){
    if(!title || title=="")
        return [];
    //title=opencc.convertSync(title);
    var pys = pinyin(title,{style:"normal"});
    for(var i=0;i<pys.length;i++){
        pys[i]=pys[i][0];
    }
    return pys;
};