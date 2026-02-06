/**
 * @name 移动云盘自定义源
 * @description 移动云直链 musicUrl
 * @version 0.1
 * @author Q
 * @homepage https://github.com/Q-1515
 */

const { EVENT_NAMES, request, on, send, env } = globalThis.lx;

const API_BASE = 'http://192.168.1.1:8000';

// 封装 POST JSON 请求，增加状态码检查
const httpJson = (url, data) => new Promise((resolve, reject) => {
  const body = env === 'mobile' ? data : JSON.stringify(data)
  request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body,
  }, (err, resp) => {
    if (err) return reject(err);

    // 检查 HTTP 状态码
    if (resp.statusCode < 200 || resp.statusCode >= 300) {
      return reject(new Error(`HTTP ${resp.statusCode}: ${resp.statusMessage || '请求失败'}`));
    }
    // console.log(JSON.stringify(resp, null, 2));
    const body = resp.body;
    console.log(`body:${body}`);
    resolve(body);
  });
});

on(EVENT_NAMES.request, ({ source, action, info }) => {
  if (action !== 'musicUrl') {
    return Promise.reject(new Error(`不支持的操作: ${action}`));
  }

  const musicInfo = info.musicInfo;
  const quality = info.type; // '128k' / '320k' / 'flac' 等

  // 调试信息（开发时保留，正式可注释）
  // console.log(`[musicUrl] source=${source}, quality=${quality}, songId=${musicInfo.songmid || musicInfo.id}`);

  return httpJson(`${API_BASE}/musicUrl`, {
    source,
    songId: musicInfo.songmid || musicInfo.id || musicInfo.mid || '', // 多兼容几种 ID 字段
    quality,
    name: musicInfo.name || '',
    artist: musicInfo.singer || '',
    album: musicInfo.albumName || '',
  })
    .then(body => {
      const url = body?.url;
      if (!url || typeof url !== 'string' || !/^https?:\/\//.test(url)) {
        throw new Error('后端未返回有效 URL');
      }
      // console.log(`成功获取 URL: ${url}`);
      return url;
    })
    .catch(err => {
      console.error(`[musicUrl] 失败: ${err.message}`);
      throw err; // 抛出让 LX 显示“链接失效”或类似提示
    });
});

// 初始化时注册源信息
send(EVENT_NAMES.inited, {
  openDevTools: false, // 调试时开启，正式建议 false
  sources: {
    kw: {
      name: '酷我音乐',
      type: 'music',
      actions: ['musicUrl'],
      qualitys: ['128k', '320k', 'flac', 'flac24bit'],
    },
    kg: {
      name: '酷狗',
      type: 'music',
      actions: ['musicUrl'],
      qualitys: ['128k', '320k', 'flac', 'flac24bit'],
    },
    wy: {
      name: '网易云',
      type: 'music',
      actions: ['musicUrl'],
      qualitys: ['128k', '320k', 'flac', 'flac24bit'],
    },
    tx: {
      name: '腾讯音乐',
      type: 'music',
      actions: ['musicUrl'],
      qualitys: ['128k', '320k', 'flac', 'flac24bit'],
    },
    mg: {
      name: '咪咕',
      type: 'music',
      actions: ['musicUrl'],
      qualitys: ['128k', '320k', 'flac', 'flac24bit'],
    },
    
    // 如果以后支持更多源，可以在这里添加 mg / wy 等
  },
});