module.exports={
  db:{
     host:"localhost",
     database:"yun2win",
     username:"root",
     password:"sa",
     dialect:"mysql"
  },
  client:{
     appKey:"oYO9MiBu9hzvWWhM",
     appSerect:"GJXcRsmWl3RjRE63F4xbV2Lr",
     tokenPeriod:24*30 //token有限时间，单位小时
  },
  session:{
    userConvrKeepAlive:1 //活跃用户会话的时间，单位小时
  },
  mail:{
      host: "smtp.qq.com",
      secureConnection: true, // use SSL
      port: 465, // port for secure SMTP
      from:"lyy-support@liyueyun.com",
      auth: {
          user: "l",
          pass: ""
      }
  },
  systemName:"yun2win",
  testing:false
};