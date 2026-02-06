# 139yun-music-backend
[![GitHub stars](https://img.shields.io/github/stars/Q-1515/139yun-music-backend?style=social)](https://github.com/Q-1515/139yun-music-backend/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Q-1515/139yun-music-backend?style=social)](https://github.com/Q-1515/139yun-music-backend/forks)
## 项目简介
基于 OpenList 的音乐直链后端服务，供 LX Music 自定义源脚本调用，返回可播放的 URL。
## 部署步骤

### 1、部署openlist-mysql版本或者PostgreSQL版本

### 2、openlist添加存储，开启索引(记得排除不相关目录)

### 3、部署本项目后端服务
准备环境变量
复制 `backend/.env.example` 为 `.env` 并填写：

```
OPENLIST_BASE_URL=http://192.168.2.2:5244
OPENLIST_TOKEN=your-token
OPENLIST_PARENT=/ydyp/music
```

Docker Compose 部署(也可以自己构建镜像)

```bat
services:
  139yun-music-backend:
    image: q1515/139yun-music-backend:latest
    container_name: 139yun-music-backend
    network_mode: bridge
    restart: unless-stopped
    ports:
      - "8000:8000"
    env_file:
      - .env
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "5"
```
### 4、下载落雪music并添加自定义源
> **lx-custom.js** 修改 `const API_BASE = 'http://192.168.1.1:8000';` 最后导入完事！

## 常见问题
制作不易给个star

1) 启动后返回 401  
    检查 `OPENLIST_TOKEN` 是否正确，并确认是在启动服务前设置。
2) 播放不了歌曲  
    检查 `OPENLIST_PARENT` 目录是否正确，搜索词是通过`歌名 艺术家`检索<br>
    可以通过 **OpenList **手动搜索以及日志排查问题。
3) 如何获取云盘资源（为什么这么麻烦呢，好的音源不会一直存在，云盘永存）<br>
    `利用其他源接口下载，上传到云盘再切换到云盘自定义源`
