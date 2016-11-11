var Srv=require("../app/service/attachment");
var utils=require("../app/utils");
var Path=require("path");
//var formidable = require('formidable');
var fs=require("fs");
var Busboy=require("busboy");

module.exports=function(router,oauth){

    router.post("/attachments",oauth,function(req,res,next){//oauth,
        var clientId=req.oauth.bearerToken.clientId;
        var md5=req.get("Content-MD5");
        if(!md5)
            md5= utils.guid(16);

        Srv.getByMd5(md5,function(error,obj){

            var path="";
            var fileName="";
            var size=0;
            if(!obj){
                path=Srv.createPath();
                var busboy = new Busboy({ headers: req.headers });
                busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
                    fileName= decodeURIComponent(filename) ;
                    size=file.size;
                    var saveTo = Path.join(__dirname, ".."+path);

                    if(!fs.existsSync(saveTo))
                        fs.mkdirSync(saveTo);

                    path += md5;
                    saveTo += md5;

                    console.log(saveTo);
                    file.pipe(fs.createWriteStream(saveTo));
                });
                busboy.on('finish', function() {
                    Srv.store(clientId,fileName,path,size,md5,function(error,obj){
                        if(error)
                            return next(error);

                        res.json(obj);
                    });
                });
                req.pipe(busboy);
            }
            else{
                path=obj.path;
                fileName=obj.fileName;
                size=obj.size;

                var busboy = new Busboy({ headers: req.headers });
                busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
                    //fileName=filename;
                    //size=file.size;
                    //var saveTo = Path.join(__dirname, ".."+path);
                    //
                    //if(!fs.existsSync(saveTo))
                    //    fs.mkdirSync(saveTo);
                    //
                    //path += md5;
                    //saveTo += md5;
                    //
                    //console.log(saveTo);
                    //file.pipe(fs.createWriteStream(saveTo));
                    file.resume();
                });
                busboy.on('finish', function() {
                    Srv.store(clientId,fileName,path,size,md5,function(error,obj){
                        if(error)
                            return next(error);

                        res.json(obj).end();
                    });
                });
                req.pipe(busboy);
            }
        });


    });
    router.get("/attachments/:attachmentId",oauth,function(req,res,next){

        var id = req.params.attachmentId;
        var clientTime = utils.parseDate(req.get('Client-Sync-Time'));
        var clientId=req.oauth.bearerToken.clientId;

        if(!clientTime)
            return next("Client-Sync-Time 时间格式不对");

        Srv.get(clientId,id,clientTime,function(error,obj){
            if(error)
                return next(error);
            res.json(obj);
        });

    });
    router.delete("/attachments/:attachmentId",oauth,function(req,res,next){

        var id = req.params.attachmentId;
        var clientId=req.oauth.bearerToken.clientId;
        Srv.delete(id,clientId,function(error,obj){
            if(error)
                return next(error);

            res.json(obj);
        });
    });

    router.get("/attachments/:attachmentId/content",oauth,function(req,res,next){

        var id = req.params.attachmentId;
        var clientId=req.oauth.bearerToken.clientId;
        var clientTime=new Date(1900,1,1);
        Srv.get(clientId,id,clientTime,function(error,obj){
            if(error)
                return next(error);
            if(!obj)
                return next("文件不存在");

            try {
                var filePath = Path.join(__dirname, ".." + obj.path);
                fs.exists(filePath,function(exist){
                    if(!exist)
                        return res.json({message:"文件不存在"});
                    else
                        res.download(filePath, obj.fileName);
                });
            }
            catch(e){
                res.json({message:e});
                console.log(e);
            }
        });
    });
    router.get("/attachments/:attachmentId/content/:fileName",oauth,function(req,res,next){

        var id = req.params.attachmentId;
        var clientId=req.oauth.bearerToken.clientId;
        var clientTime=new Date(1900,1,1);
        var filename=req.params.fileName;
        Srv.get(clientId,id,clientTime,function(error,obj){
            if(error)
                return next(error);
            if(!obj)
                return next("文件不存在");

            var filePath=Path.join(__dirname,".."+obj.path);
            try {
                fs.exists(filePath,function(exist){
                    if(!exist)
                        return res.json({message:"文件不存在"});
                    else
                        res.download(filePath, filename);
                });
            }
            catch(e){
                console.log(e);
            }
        });
    });
    router.get("/attachments/:attachmentId/:md5",function(req,res,next){

        var ifModifiedSince = "If-Modified-Since".toLowerCase();
        if (req.headers[ifModifiedSince]) {
            res.writeHead(304, "Not Modified");
            res.end();
            return;
        }

        res.setHeader("Last-Modified", new Date().toUTCString());
        var expires = new Date();
        var maxAge=60*60*24*365;
        expires.setTime(expires.getTime() +  maxAge* 1000);
        res.setHeader("Expires", expires.toUTCString());
        res.setHeader("Cache-Control", "max-age=" + maxAge);

        var md5 = req.params.md5;
        md5=md5.replace(".png","");
        var id = req.params.attachmentId;
        var clientId=null;
        var clientTime=new Date(1900,1,1);
        Srv.get(clientId,id,clientTime,function(error,obj){
            if(error)
                return next(error);
            if(!obj)
                return next("文件不存在");
            if(obj.md5!=md5)
                return next("没有权限");


            try {
                var filePath = Path.join(__dirname, ".." + obj.path);
                fs.exists(filePath,function(exist){
                    if(!exist)
                        return res.json({message:"文件不存在"});
                    else
                        res.download(filePath, obj.fileName);
                });
            }
            catch(e){
                console.log(e);
            }
        });
    });

};


