module.exports={
  db:{
    host:"rdspl5y5rdhdfw8gxb2co.mysql.rds.aliyuncs.com",
    database:"y2w_example",
    username:"y2w_example",
    password:"y2w_example",
    dialect:"mysql"

//      host:"localhost",
//      database:"yun2win",
//      username:"root",
//      password:"sa",
//      dialect:"mysql"
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
          user: "lyy-support@liyueyun.com",
          pass: "lyy"
      }
  },

  testing:false
};