var nodemailer = require("nodemailer");
var config=require("../config");
var fs=require("fs");
var path=require("path");

var transport = nodemailer.createTransport("SMTP", config.mail);


var _rootPath=path.join(__dirname,"../../mailTemplates");
var Service={
    send:function(to,subject,html,cb){
        transport.sendMail({
            from : config.mail.from,
            to : to,
            subject: subject,
            generateTextFromHTML : true,
            html : html
        }, function(error, response){
            if(error){
                console.log(error);
                cb(error);
            }else{
                console.log("Message sent: " + response.message);
                cb();
            }
            //transport.close();
        });
    },
    sendTemplate:function(to,subject,templateName,parms,cb){
        fs.readFile(_rootPath+"/"+templateName+".txt","utf8",function(error,txt){

            if(error){
                cb(error);
                return;
            }

            for(var key in parms){
                txt=txt.replace(new RegExp("{"+key+"}",'ig'),parms[key]);
            }
            Service.send(to,subject,txt,cb);
        });
    }
};

module.exports = Service;