# Aftermind

> 系统继续按时归档。工作被接管之后，人把没人读的文字留在这里。

面向个人博客、随笔与技术札记的 Hugo 主题。围绕「停用交接档案里的人类余响」设计，以等宽系统记录与衬线人类正文的双声道并置呈现内容，无需 Hugo Extended 版或 Node.js 运行时。

## 特性

- **方案 A 非对称首页**：左侧为内联 SVG 绘制的停用工位正交平面线描（`home-plate.html`，自动响应亮暗主题），右侧并置余影字标、系统状态行、断线与首篇文章入口。
- **三轨文章页**：桌面端（`≥ 1200 px`）为左轨粘性系统档案牌（编号、日期、篇幅、标签、横向走纸进度线）+ 中轨受控行宽衬线正文 + 右轨带引线旁注；窄屏自动收束为单栏内联。
- **时间稀疏归档**：归档页按年分组，构建期自动计算相邻文章间隔天数，映射为真实留白高度，并在 `≥ 30` 天静默处绘制垂直端点刻度线。
- **双材质亮暗模式**：亮色「褪色交接纸」与暗色「熄灯档案室」两套独立色板，支持无框 3 态切换（`自动 / 亮 / 暗`，含键盘方向键与防闪色内联脚本）。
- **零外部依赖图标与 Favicon**：内联打包 Tabler Icons Outline SVG（`layouts/_partials/icon.html`），并附自适应亮暗模式的交接簿 SVG favicon 与 `.ico` 回退。
- **原生 CSS 动效与无障碍**：支持原生跨页视图过渡（`@view-transition`）、滚动驱动进度线（`animation-timeline: scroll(root)`）、`prefers-reduced-motion` 完整降级与多语言 `i18n`（简体中文、英文、日文、德语）。

## 环境要求

- **Hugo `>= 0.146.0`**（标准版即可，无需 Extended 版或 Node.js）。

## 本地开发

在主题根目录运行：

```sh
hugo server --disableFastRender
```

生产构建：

```sh
hugo --minify --cleanDestinationDir
```

构建结果位于 `public/`。发布前将 `hugo.toml` 中的 `baseURL` 替换为实际站点地址。

## 在站点中使用

将本目录放到站点的 `themes/hugo-theme-aftermind/`，并在站点 `hugo.toml` 中配置：

```toml
theme = 'hugo-theme-aftermind'
defaultContentLanguage = 'zh-cn' # 支持 'zh-cn' / 'en' / 'ja' / 'de'
hasCJKLanguage = true
title = 'Aftermind'

[params]
  description = '智能之后 · 写给没有“人”看的东西'
  homeImageAlt = '停用工位平面图：移除显示器的桌台、摊开的交接簿与退后的空椅。'
  mainSections = ['posts']

[menus]
  [[menus.main]]
    name = '首页'
    pageRef = '/'
    weight = 10
  [[menus.main]]
    name = '归档'
    pageRef = '/posts'
    weight = 20
  [[menus.main]]
    name = '标签'
    pageRef = '/tags'
    weight = 30

[markup.highlight]
  noClasses = false
  codeFences = true
  guessSyntax = true
```

主题根目录的 `content/` 为预览示例内容，正式建站时在站点目录编写自己的内容即可。

## 分享预览

主题输出 canonical、Open Graph 和 Twitter Card 元数据。文章的 `cover` 优先用作分享图。可在站点配置中设置通用图片及替代文字：

```toml
[params]
  socialImage = 'images/share.jpg'
  socialImageAlt = 'Aftermind 档案封面'
```

`socialImage` 可以指向 `assets/` 或 `static/` 下的站点相对路径，也可以填写完整的 HTTPS 地址。

## 站内搜索

主题默认提供搜索入口。Hugo 在构建时生成当前语言的文章索引，可搜索标题、摘要、标签和归档编号。可在文章 Front Matter 中设置 `searchHidden = true` 或 `search = false`，将该文章从两种索引中排除。

```toml
[params.search]
  provider = 'json' # 'pagefind' 为正文检索，'none' 为关闭搜索
```

使用 Pagefind 时，搜索还会匹配正文并显示命中片段。在 Hugo **构建完成后**生成索引，并将生成的 `pagefind/` 随站点一起发布：

```sh
hugo --minify
npx --yes pagefind@1.6.0 --site public --root-selector 'html[data-aftermind-pagefind]'
```

可以用 Pagefind 命令行二进制替代 `npx`。中文正文检索请使用 Pagefind Extended 版，`npx` 默认使用该版本。未生成 Pagefind 索引时，搜索页会提示，并继续支持标题、摘要、标签和编号查询。普通 `hugo server` 可直接预览 JSON 模式，全文搜索需预览生成后的静态站点。

## 图片、公式与图表

文章封面和正文中未加链接的图片可用键盘或鼠标打开大图。已链接到其他地址的图片保留作者指定的跳转。

在文章 Front Matter 中独立启用公式和图表：

```toml
math = true
diagrams = true
```

- **公式**：行内使用 `\(a_b + c_d\)`，块级使用 `\[ ... \]` 或 `$$ ... $$`。
- **图表**：使用标为 `mermaid` 的 Markdown 代码围栏。渲染失败会保留源码。

启用后，页面分别从 jsDelivr 加载固定版本的 KaTeX 和 Mermaid。将 Aftermind 安装为主题时，请在**站点**的 `hugo.toml` 中加入以下 Goldmark 配置，让 Hugo 保留行内与块级 TeX 定界符：

```toml
[markup.goldmark.extensions.passthrough]
  enable = true
  [markup.goldmark.extensions.passthrough.delimiters]
    block = [['\[', '\]'], ['$$', '$$']]
    inline = [['\(', '\)']]
```

## 短代码与文章字段

### 旁注留痕 `note`

宽屏自动浮于正文右轨并与正文编号双向联动，窄屏点击编号展开，无 JS 时直接内联显示：

```markdown
走廊尽头的广播照旧响了两遍。{{</* note */>}}后来查了排程表，那段录音从去年十月起就没人改过。{{</* /note */>}}
```

### 涂改留痕 `redact`

保留删除线原文并在旁侧给出更正：

```markdown
确认今天确实{{</* redact "做完了点什么" "在这里待过几个小时" */>}}。
```

### 可选 Front Matter 字段

- `archiveId`：自定义归档编号（如 `"#014"`）；不填时按发布顺序自动生成 `#001`、`#002`…
- `cover` / `coverAlt` / `coverCaption`：Page Bundle 内的文章封面图片路径、替代文本与图注。
- `toc = false`：为单篇关闭目录。默认在有至少两个目录条目时显示，宽屏置于左侧档案栏，窄屏置于正文前并默认折叠。
- `comments = false`：站点启用评论后，为单篇关闭评论。

## 第三方评论

评论默认关闭。要接入评论系统，在站点配置中启用评论，并在**站点**的 `layouts/_partials/comments/provider.html` 放入服务商提供的嵌入代码：

```toml
[params.comments]
  enabled = true
```

主题在 `mainSections` 中的文章底部调用该 partial，参数为当前文章，可通过 `{{ .Permalink }}` 取得文章地址，也可通过 `{{ site.Params.comments }}` 读取服务专用配置。移除 partial 或关闭开关即可停用。供应商的站点标识、页面映射和亮暗模式同步均可在该 partial 中配置。

## 目录约定

- `archetypes/`：新内容的 front matter 模板。
- `assets/css/`、`assets/js/`：通过 Hugo Pipes 处理的样式与轻量交互脚本。
- `assets/icons/`：随主题打包的 Tabler Outline SVG 图标（由 `layouts/_partials/icon.html` 输出）。
- `content/`：开发预览示例文章。
- `i18n/`：多语言界面文案（`zh-cn.toml`、`en.toml`、`ja.toml`、`de.toml`）。
- `layouts/`：现行 Hugo 模板结构（`baseof.html`、`home.html`、`page.html`、`section.html`、`taxonomy.html`、`term.html`、`404.html`、`_partials/`、`_shortcodes/`）。
- `static/`：自托管字标字体与自适应亮暗 SVG/ICO favicon。

详细设计规范见 [design.md](design.md)。

## 开源协议

[MIT License](LICENSE) © 2026 WayJam So
