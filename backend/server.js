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

// 去除文件后缀
const stripExt = (name) => name.replace(/\.[^/.]+$/, '')

const pickBestPath = (searchResp, songName, artist) => {
  // 提取搜索结果列表
  const items = getSearchItems(searchResp)
  if (!items.length) return null

  // 目标文件名格式：歌名 - 艺术家
  const target = `${songName} - ${artist}`.trim()
  if (!target) return null

  // 只保留音频文件
  const candidates = items.filter((item) => item?.type === 3 && item?.is_dir === false)
  // 只有一个音频文件，直接返回
  if (candidates.length === 1) {
    return getItemPath(candidates[0])
  }

  // 对候选进行打分：完全等于 > 以目标开头
  const scored = candidates
    .map((item) => {
      const baseName = stripExt(item?.name || '').trim()
      let score = -1
      if (baseName === target) score = 2
      else if (baseName.startsWith(target)) score = 1
      return { item, score, size: item?.size || 0 }
    })
    .filter((x) => x.score >= 0)

  if (!scored.length) return null
  // 分数优先，其次文件大小优先
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return b.size - a.size
  })

  return getItemPath(scored[0].item)
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
    const path = pickBestPath(searchResp, name, artist)
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
