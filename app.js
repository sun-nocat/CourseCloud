const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const session = require('koa-session-minimal')

const cors = require('koa2-cors')
const koaBody = require('koa-body')
const index = require('./routes/index')


// error handler
onerror(app)

// middlewares
// 配置跨域
app.use(cors({
  credentials: true
}))

app.use(koaBody({
  multipart: true,
  formidable: {
      maxFileSize: 200*1024*1024    // 设置上传文件大小最大限制，默认2M
  }
}));
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))


app.use(session({
  key:'session_id',
  cookie: {
    path: '/',
    httpOnly: false,
  }
}))
app.use(json()) 
app.use(logger())
app.use(require('koa-static')(__dirname + './routes/upload/'))
app.use(views(__dirname + '/views', {
  extension: 'pug'
}))



// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())

// error-handlingmy
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
