# 🎵 Kuwo Music Proxy Worker

一个基于 **Cloudflare Workers** 的轻量级酷我音乐音频代理工具，支持防盗链自动处理、跨域播放、断点续传。
内置前端测试页面，可直接在浏览器访问 Worker 测试播放。

---

## 🚀 功能特性

- 🎧 **仅代理酷我音乐音频**
- 🧩 **自动添加 Referer 与 User-Agent 防盗链头**
- 🌐 **支持跨域 (`Access-Control-Allow-Origin: *`)**
- 🔁 **支持 Range 断点续传**
- 💡 **内置前端测试页面（HTML + JS）**
- ⚡ **可直接部署到 Cloudflare Workers**

---

## 🗂 项目结构

```
kuwo-proxy/
├── _worker.js   # Cloudflare Worker 主逻辑
└── README.md    # 项目说明文档
```

---

## 💻 部署方式

### 方法一：使用 Cloudflare Dashboard

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers 和 Pages → 创建 Worker**
3. 将 `_worker.js` 中的全部代码复制粘贴进去
4. 保存并部署

访问示例：
```
https://kuwo-proxy.<your-subdomain>.workers.dev/
```

### 方法二：使用 Wrangler CLI

```bash
npm install -g wrangler
mkdir kuwo-proxy && cd kuwo-proxy
# 创建 _worker.js 与 README.md
wrangler deploy
```

部署完成后你会得到一个类似的地址：
```
https://kuwo-proxy.<你的子域>.workers.dev/
```

---

## 🧪 使用说明

### 前端页面测试

访问你的 Worker 地址，输入酷我音频 URL：
```
http://er.sycdn.kuwo.cn/a1e4007ed27f94581029825c36d40e31/68f2ec9d/resource/30106/trackmedia/M800000SOnCR1nyjIV.mp3?from=bodian
```

点击“播放音频”即可跨域播放。

### 直接使用接口

```
curl "https://kuwo-proxy.<你的子域>.workers.dev/?target=http://er.sycdn.kuwo.cn/a1e4007ed27f94581029825c36d40e31/68f2ec9d/resource/30106/trackmedia/M800000SOnCR1nyjIV.mp3?from=bodian"
```

---

## ⚙️ 配置说明

| 功能 | 说明 |
|------|------|
| 🔐 域名验证 | 仅允许 `*.kuwo.cn` 请求被代理 |
| 🧠 自动请求头 | 自动附带 Referer 与 User-Agent |
| 🧾 跨域支持 | `Access-Control-Allow-Origin: *` |
| ⏱ 缓存控制 | 默认 1 小时 (`max-age=3600`) |
| 🔁 Range 支持 | 支持音频断点续传 |

---


---

## 🪪 License

MIT License
