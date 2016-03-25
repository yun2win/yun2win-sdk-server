# yun2win-sdk-server



###预先安装
- nodejs
- pm2
- mysql

更多帮助请前往：[http://console.yun2win.com/docs/](http://console.yun2win.com/docs/)

###配置

部署前请先打开app/config.js进行配置

```
module.exports={
    //数据库配置
    db:{
        host:"localhost",
        database:"{数据库名称}",
        username:"sa", //数据库帐号
        password:"{数据库密码}",
        dialect:"mysql"
    },
    //客户端配置，用于客户端连接本服务器和通知服务器的信息
    client:{
        appKey:"{appKey}",
        appSerect:"{appSerect}",
        tokenPeriod:24*30 //token有限时间，单位小时
    },
    //会话配置
    session:{
        userConvrKeepAlive:1 //活跃用户会话的时间，单位小时
    },
    //设为true,则启动时会运行基本测试用例，如果测试用例通过则表示部署成功了。
    testing:false
};
```

###端口
默认使用18080，开发者可以自行server.js进行更改


-
### 链接
官方网站 : http://www.yun2win.com/<br>
安卓 : https://github.com/yun2win-sdk/yun2win-sdk-android<br>
iOS : https://github.com/yun2win-sdk/yun2win-sdk-iOS<br>
Web : https://github.com/yun2win-sdk/yun2win-sdk-web<br>
Server : https://github.com/yun2win-sdk/yun2win-sdk-server<br>

-
### License
yun2win-sdk-server is available under the MIT license. See the [LICENSE](https://github.com/yun2win-sdk/yun2win-sdk-server/blob/master/LICENSE) file for more info.
