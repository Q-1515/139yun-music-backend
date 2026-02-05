const OPENLIST_BASE_URL = process.env.OPENLIST_BASE_URL || 'http://192.168.2.2:5244'
const OPENLIST_TOKEN = process.env.OPENLIST_TOKEN || ''
const OPENLIST_SEARCH_PATH = process.env.OPENLIST_SEARCH_PATH || '/api/fs/search'
const OPENLIST_RAW_PATH = process.env.OPENLIST_RAW_PATH || '/api/fs/get'
const OPENLIST_PARENT = process.env.OPENLIST_PARENT || '/'

const buildUrl = (path) => new URL(path, OPENLIST_BASE_URL).toString()

const openlistRequest = async (path, body) => {
  const url = buildUrl(path)
  const headers = {
    'content-type': 'application/json',
  }
  if (OPENLIST_TOKEN) headers.authorization = `${OPENLIST_TOKEN}`
  console.log(`[openlist] request POST ${path}`)
  console.log(`[openlist] auth ${OPENLIST_TOKEN ? '识别到token' : '未识别token'}`)
  console.log(`[openlist] body ${JSON.stringify(body || {})}`)

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body || {}),
  })

  if (!res.ok) {
    const text = await res.text()
    console.log(`[openlist] error ${res.status} ${text}`)
    throw new Error(`OpenList ${res.status}: ${text}`)
  }
  return res.json()
}

export const searchByKeyword = (keywords, options = {}) =>
  openlistRequest(OPENLIST_SEARCH_PATH, {
    // 搜索起始目录
    parent: options.parent || OPENLIST_PARENT,
    // 搜索关键词
    keywords: keywords || '',
    // 搜索范围，OpenList 约定参数，0 为默认范围
    scope: options.scope ?? 0,
    // 页码，从 1 开始
    page: options.page ?? 1,
    // 每页数量
    per_page: options.perPage ?? 2,
  })

export const getRawByPath = (path, options = {}) =>
  openlistRequest(OPENLIST_RAW_PATH, {
    path,
    password: options.password || '',
  })
