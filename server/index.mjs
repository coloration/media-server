import express from 'express'
import bodyParser from 'body-parser'
import fs from 'fs'
import { mediaApi } from './api/index.mjs'
const app = express()
const port = Number(process.env.SERVER_PORT)
const mediaServicePort = Number(process.env.MEDIA_SERVICE_PORT)

let mediaSecret = ''
function getMediaSecret() {
  if (!mediaSecret) {
    const mediaConf = fs.readFileSync(process.env.MEDIA_SERVICE_CONFIG_URI, { encoding: 'utf-8' })
    mediaSecret = mediaConf.match(/(?<=secret=)[a-zA-Z\d]+/g)?.[0] ?? ''
  }
  return mediaSecret
}

// 初始化 ejs 模版引擎, 指定模版目录
app.set('view engine', 'ejs')
app.set('views', './public')

// 初始化静态文件目录
app.use(express.static('public'))
app.use(bodyParser.json())

// 处理业务逻辑
app.get('/', function (req, res) {
  const { stream, url } = req.query
  console.log(stream, url)
  // res.sendFile(__dirname + '/index.html')
  

  // https://github.com/ZLMediaKit/ZLMediaKit/wiki/MediaServer%E6%94%AF%E6%8C%81%E7%9A%84HTTP-API#12indexapiaddstreamproxy
  mediaApi.get('/addStreamProxy', {
    params: {
      secret: getMediaSecret(),
      // e.g. http://localhost:8080/${app}/${stream}.live.flv
      vhost: '__defaultVhost__',  
      // 根据业务模型设计复杂度，这里只通过 stream 进行区别
      app: 'live',
      stream: stream,
      url: url,
    }
  })
  // 无论是否添加成功，均向前端返回画面 /public/index.mjs
  .finally(() => {
    
    res.render('index', {
      pageTitle: 'video',
      videoPort: mediaServicePort,
      videoStream: stream
    })
  })
})


// 下方为测试代码 
//
//
//

app.get('/config', (req, res) => {

  res.send({
    port: port,
    mediaServiceUrl: process.env.MEDIA_SERVICE_RESTFUL_API_URL,
    mediaSecret: getMediaSecret()
  })
})

app.get('/medias', (req, res) => {
  mediaApi.get('/getMediaList', { params: { secret: getMediaSecret() } })
    .then(mediaRes => {
      res.send(mediaRes.data)
    })
    .catch(e => {
      res.status(500).send(e)
    })
})


app.delete('/stream-proxy', (req, res) => {
  const { key } = req.query
  if (!key) {
    res.status(400).send('key is required.')
    return
  }

  mediaApi.get('/delStreamProxy', {
    params: {
      secret: getMediaSecret(),
      key
    }
  })
    .then(mediaRes => {
      res.send(mediaRes.data)
    })
    .catch(e => {
      res.status(500).send(e)
    })
})

app.get('/stream-proxy', (req, res) => {
  const { stream } = req.query
  if (!stream || !url) {
    res.status(400).send('stream is required.')
    return
  }
})

app.patch('/stream-proxy', (req, res) => {
  console.log(req.body)
  const { stream, url } = req.body
  if (!stream || !url) {
    res.status(400).send('stream | url is required.')
    return
  }

  mediaApi.get('/addStreamProxy', {
    params: {
      secret: getMediaSecret(),
      vhost: '__defaultVhost__',  // http://localhost:8080/${app}/${stream}.live.flv
      app: 'live',
      stream: stream,
      url: url,
    }
  })
    .then(mediaRes => {
      res.send(mediaRes.data)
    })
    .catch(e => {
      res.status(500).send(e)
    })
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})