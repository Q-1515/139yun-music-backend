import express from 'express'
import { searchByKeyword, getRawByPath } from './openlist.js'

const app = express()
app.use(express.json())

const getSearchItems = (searchResp) => {
  // OpenList 搜索结果列表在 data.content
  const data = searchResp?.data ?? searchResp
  const list = data?.content || []
  return Array.isArray(list) ? list : []
}

const getItemPath = (item) => {
  if (!item) return null
  if (item.parent && item.name) return `${item.parent.replace(/\/$/, '')}/${item.name}`
  return null
}
const pickRawUrl = (rawResp) => {
  const data = rawResp?.data ?? rawResp
  return data?.raw_url || null
}

const pickBestPath = (searchResp) => {
  // 从搜索结果中取第一个音频(type=3)文件
  const items = getSearchItems(searchResp)
  console.log(`[items]: ${items}`)
  if (!items.length) return null
  for (const item of items) {
    if (item?.type === 3 && item?.is_dir === false) return getItemPath(item)
  }
  return null
}

/**
 * 接口: POST /musicUrl
 * 请求参数:
 *   - source: 音乐源标识
 *   - songId: 歌曲 ID
 *   - quality: 音质(可选)
 *   - name: 歌名(可选)
 *   - artist: 艺术家(可选)
 *   - album: 专辑(可选)
 * 响应:
 *   - { url: string }
 */
app.post('/musicUrl', async (req, res) => {
  try {
    const body = req.body || {}
    const name = body.name || ''
    const artist = body.artist || ''
    const keyword = `${name}${artist ? ` ${artist}` : ''}`.trim()
    if (!name || !artist) {
      return res.status(400).json({ error: '歌名和艺术家必须同时提供' })
    }
    const searchResp = await searchByKeyword(keyword, { perPage: 30 })

    // 返回歌曲路径
    const path = pickBestPath(searchResp)
    console.log(`[musicUrl] path: ${path}`)
    if (!path) return res.status(404).json({ error: '未找到匹配文件' })

    //获取直链
    const rawResp = await getRawByPath(path)
    const url = pickRawUrl(rawResp)
    if (!url) return res.status(502).json({ error: '获取直链失败' })
    console.log(`[musicUrl] url: ${url}`)
    return res.json({ url })
  } catch (err) {
    return res.status(500).json({ error: `服务器错误: ${String(err?.message || err)}` })
  }
})

const host = '0.0.0.0'
const port = 8000

app.listen(port, host, () => {
  console.log(`Listening on http://${host}:${port}`)
})
