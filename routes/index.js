/**
 * 整个项目的路由入口
 */
const router = require('koa-router')()
const fs = require('fs')
const path = require('path')

// 分模块处理
// 用户管理模块
const User = require('./User.js');
// 班级管理模块
const Class = require('./Class.js')
// 课程模块
const Course = require('./Course.js')
// 请假模块
const Leave = require('./Leave.js')
// 签到模块
const Sigin = require('./Sigin.js')
// 讨论区
const Chat = require('./Chat.js')

router
  .get('/', (ctx) => {
      const fileDir = path.join(__dirname,'../views/index.html')
      const file = fs.readFileSync(fileDir, 'utf-8')
      ctx.body = file
  })
  // 用户
  .post('/login', User.login) // 登录
  .get('/logout', User.logout) // 注销
  .post('/register', User.register) // 注册

  // 用戶信息管理

  .get('/getMessage', User.getMessage) //展示用户数据
  .post('/updateMessage', User.updateMessage) //更新用户信息

  // 班级模块

  .post('/createClass', Class.createClass) // 创建班级
  .get('/queryClass', Class.queryClass) //查询班级信息
  .get('/joinClass', Class.joinClass) // 加入班级
  .get('/exitClass', Class.exitClass) // 退出班级

  // 课程模块

  .post('/createCourse', Course.createCourse) // 创建课程
  .get('/queryCourse', Course.queryCourse) // 查询课程
  .get('/chooseCourse', Course.chooseCourse) // 选课
  .post('/uploadCourse', Course.uploadCourse) // 上传文件
  .get('/delCourseStudent', Course.delCourseStudent) // 删除选课的学生
  .get('/myCourse', Course.myCourse)

  // 请假模块

  .post('/submitLeave', Leave.submitLeave) // 提交请假单
  .get('/queryLeave', Leave.queryLeave) // 查询请假记录
  .post('/dealLeave', Leave.dealLeave) // 教师处理请假事件

  // 签到模块

  .post('/submitSigin', Sigin.submitSigin) // 发布签到
  .get('/querySigin', Sigin.querySigin) // 查询签到
  .get('/doSigin', Sigin.doSigin) //进行签到

  // 讨论区

  .post('/createChat', Chat.createChat) // 创建讨论题目
  .get('/queryChat', Chat.queryChat) // 查询题目
  .post('/addOneReply', Chat.addOneReply) // 增加一个回复
  .get('/queryReply', Chat.queryReply) // 查询所有的回复 queryCourseMsg

  .get('/queryCourseMsg', Course.queryCourseMsg) // 查询所有的回复 queryCourseMsg

  .get('/download', Course.download)

module.exports = router
