import express from 'express'
import bodyParser from 'body-parser'
import fs from 'fs'
import { mediaApi } from './api/index.mjs'
const app = express()
const port = 3000
const mediaSevicePort = Number(process.env.MEDIA_SERVICE_PORT)

let mediaSecret = ''
function getMediaSecret() {
  if (!mediaSecret) {
    const mediaConf = fs.readFileSync('/opt/media/conf/config.ini', { encoding: 'utf-8' })
    mediaSecret = mediaConf.match(/(?<=secret=)[a-zA-Z\d]+/g)?.[0] ?? ''
  }
  return mediaSecret
}


app.set('view engine', 'ejs')
app.set('views', './public')

app.use(express.static('public'))
app.use(bodyParser.json())

app.get('/', function (req, res) {
  const { stream, url } = req.query
  console.log(stream, url)
  // res.sendFile(__dirname + '/index.html')

  mediaApi.get('/addStreamProxy', {
    params: {
      secret: getMediaSecret(),
      vhost: '__defaultVhost__',  // http://localhost:8080/${app}/${stream}.live.flv
      app: 'live',
      stream: stream,
      url: url,
    }
  })
  .finally(() => {
    res.render('index', {
      url: `http://localhost:${mediaSevicePort}/${'live'}/${stream}.live.flv`,
      pageTitle: 'video'
    })
  })
})

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