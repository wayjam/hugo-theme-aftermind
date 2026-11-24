# Aftermind

> 系统继续按时归档。工作被接管之后，人把没人读的文字留在这里。

面向个人博客、随笔与技术札记的 Hugo 主题。围绕「停用交接档案里的人类余响」设计，以等宽系统记录与衬线人类正文的双声道并置呈现内容，无需 Hugo Extended 版或 Node.js 运行时。

## 特性

- **可配置首页图面**。默认并排展示档案室 SVG、余影字标和首篇记录。支持自定义图片或 SVG，也可关闭图面。
- **三轨文章页**：桌面端（`≥ 1200 px`）为左轨粘性系统档案牌（编号、日期、篇幅、标签、横向走纸进度线）+ 中轨受控行宽衬线正文 + 右轨带引线旁注；窄屏自动收束为单栏内联。
- **时间稀疏归档**：归档页按年分组，构建期自动计算相邻文章间隔天数，映射为真实留白高度，并在 `≥ 30` 天静默处绘制垂直端点刻度线。
- **双材质亮暗模式**：亮色交接纸与暗色档案室共用静态纸纹贴图，支持三段式外观切换（`自动 / 亮 / 暗`，含键盘方向键与防闪色内联脚本）。
- **零外部依赖图标与 Favicon**：内联打包 Tabler Icons Outline SVG（`layouts/_partials/icon.html`），并附自适应亮暗模式的交接簿 SVG favicon 与 `.ico` 回退。
- **原生 CSS 动效与无障碍**：支持原生跨页视图过渡（`@view-transition`）、滚动驱动进度线（`animation-timeline: scroll(root)`）、`prefers-reduced-motion` 完整降级与多语言 `i18n`（简体中文、繁体中文、英文、日文、德语）。

## 环境要求

- **Hugo `>= 0.146.0`**（标准版即可，无需 Extended 版或 Node.js）。

## 本地开发与示例预览

在主题根目录运行示例站点（`exampleSite/`）：

```sh
./run_example.sh
```

或手动执行：

```sh
hugo server --source exampleSite --theme hugo-theme-aftermind --themesDir ../.. --disableFastRender
```

生产构建示例站点：

```sh
hugo --source exampleSite --theme hugo-theme-aftermind --themesDir ../.. --minify --cleanDestinationDir
```

构建结果位于 `exampleSite/public/`。完整示例配置见 [exampleSite/hugo.toml](exampleSite/hugo.toml)。

示例站的归档每页显示 5 篇文章，打开 `/posts/` 即可体验翻页。示例文章涵盖 Markdown、KaTeX、Mermaid、富文本和代码高亮。

## 在站点中使用

将本目录放到站点的 `themes/hugo-theme-aftermind/`，并在站点 `hugo.toml` 中配置：

```toml
theme = 'hugo-theme-aftermind'
defaultContentLanguage = 'zh-cn' # 支持 'zh-cn' / 'zh-tw' (或 'zh-hant') / 'en' / 'ja' / 'de'
hasCJKLanguage = true
title = 'Aftermind'

[pagination]
  pagerSize = 20 # 归档与标签页每页条数

[params]
  description = '智能之后 · 写给没有“人”看的东西'
  mainSections = ['posts']

[params.home]
  subtitle = '智能之后 · 写给没有“人”看的东西' # 首页副标题（默认回退到 description，设为空字符串可隐藏）

[params.footer]
  text = '© 2026 Aftermind · 仅保留文字与时间' # 省略时使用多语言默认文案，留空可隐藏
  github = 'https://github.com/wayjam/hugo-theme-aftermind' # 可选：页脚 GitHub 链接
  showThemeCredit = true                           # 是否显示 Hugo · Aftermind 署名

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

完整的示例站点与演示文章见 `exampleSite/` 目录。

菜单项可通过 `params.icon` 引用 `assets/icons/` 中的 SVG 文件名，无需填写 `.svg` 后缀。

## 首页图面

默认随外观切换两幅内置 SVG 版画：亮色为「无人认领的走纸」，暗色为「阵列中的孤窗」。设置 `showPlate = false` 会隐藏图面。此时 `768px` 及以上视口左侧是站名字标，右侧是首篇文章，手机端按阅读顺序上下排列。

```toml
[params.home]
  showPlate = true
  image = 'images/archive.svg'
  imageAlt = '描述图中的主要内容'
  caption = '档案图注' # 可选
```

`image` 留空时使用内置图。自定义图片可放在站点的 `assets/images/` 或 `static/images/` 下，配置填 `images/文件名`，也可以使用完整的 HTTPS 图片地址。支持浏览器可显示的 WebP、JPEG、PNG、SVG 等格式。

推荐图面比例为 **10∶7**，位图可导出为 **1440 × 1008 px**，SVG 可使用 `viewBox="0 0 720 504"`。其他比例会在画框内等比缩放，较短的一边会留白。自定义 SVG 作为独立图片加载，配色由 SVG 文件自身控制。信息性图片请填写 `imageAlt`，纯装饰图片可设为空字符串。已有的 `params.homeImageAlt` 也可继续用作替代文本。

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
- `toc = false` 可关闭单篇文章的目录。目录至少有两个条目时默认显示。宽屏置于左侧档案栏，窄屏在正文前折叠，右侧箭头随展开状态转向。
- `comments = false`：站点启用评论后，为单篇关闭评论。

支持灯箱的封面和独立配图右下角会显示放大镜，点击图片即可查看大图。

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
- `content/search/`：主题内置的搜索页内容适配器（`_content.gotmpl`），建站时自动挂载，无需手动创建搜索页。
- `exampleSite/`：完整的示例站点配置、独立页面与演示文章（运行 `./run_example.sh` 即可预览）。
- `i18n/`：多语言界面文案（`zh-cn.toml`、`zh-tw.toml`、`zh-hant.toml`、`en.toml`、`ja.toml`、`de.toml`）。
- `layouts/`：现行 Hugo 模板结构（`baseof.html`、`home.html`、`page.html`、`section.html`、`taxonomy.html`、`term.html`、`404.html`、`_partials/`、`_shortcodes/`）。
- `static/`：自托管字标字体与自适应亮暗 SVG/ICO favicon。

详细设计规范见 [design.md](design.md)。

## 开源协议

[MIT License](LICENSE) © 2026 WayJam So
