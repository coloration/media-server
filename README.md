


# 视频流播放服务


### 部署使用

``` bash

$ docker-compose up -d
```


### 功能描述

基于github 开源项目 。通过 node server 转发 url参数向流媒体发送添加视频推流的请求。然后在前端播放 flv 页面

前端可以通过 `iframe` `webview` 等技术通过配置url参数即可。

e.g. `http://192.168.2.248:9300/?stream=YOUR_STREAM_NAME&url=rtsp%3A%2F%2FRTSP_USERNAME%3ARTSP_PASSWORD%40192.168.2.7%3A554%2FStreaming%2FChannels%2F2`

- stream: 应用名, 重复的应用名只会返回同一个视频流，请自己在前端管理好视频流名称
- url: 视频流原始地址 需要转码 `encodeURIComponent(origin_url)`


### 项目结构 


``` bash
- server/ # node 转发服务
  - public/ # 前端视频画面
- docker-compose.yml # 项目配置 
```


### 开发

``` bash
$ docker-compose up --build
```



### tips 


1. docker 镜像源 


- linux: `vi /etc/docker/daemon.json`
- windows: 打开桌面应用 `Settings` - `Docker Engine`
- 修改: registry-mirrors

``` json
{
  "registry-mirrors": [
    "https://hub.uuuadc.top", 
    "https://docker.anyhub.us.kg", 
    "https://dockerhub.jobcher.com", 
    "https://dockerhub.icu", 
    "https://docker.ckyl.me", 
    "https://docker.awsl9527.cn"
  ]
}

```

- 重启 docker

``` bash
$ systemctl daemon-reload
$ systemctl reload docker
```