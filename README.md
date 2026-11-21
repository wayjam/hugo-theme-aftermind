# Aftermind

基于 Hugo v0.170.1 官方 `hugo new theme` 骨架初始化的主题。需要 Hugo >= 0.170.1，无需 Extended 版本或 Node.js。

## 本地开发

在主题根目录运行：

```sh
hugo server --disableFastRender
```

打开终端输出的本地地址。根目录的 `content/` 是官方示例内容，可用于开发预览。

生产构建：

```sh
hugo --minify
```

构建结果位于 `public/`。发布前将 `hugo.toml` 中的 `baseURL` 替换为实际站点地址。

## 在站点中使用

将本目录放到站点的 `themes/hugo-theme-aftermind/`，并在站点的 `hugo.toml` 中设置：

```toml
theme = 'hugo-theme-aftermind'
```

主题附带官方示例文章，正式使用时删除主题中的 `content/` 示例内容，使用站点自己的内容。

## 目录约定

- `archetypes/`：新内容的 front matter 模板。
- `assets/`：通过 Hugo Pipes 处理的 CSS 和 JavaScript。
- `content/`：开发预览的示例文章和图片。
- `data/`、`i18n/`：数据文件和翻译。
- `layouts/baseof.html`：基础页面结构。
- `layouts/home.html`：首页。
- `layouts/page.html`：内容详情页。
- `layouts/section.html`、`taxonomy.html`、`term.html`：栏目与分类页面。
- `layouts/_partials/`：复用模板。
- `static/`：直接复制的静态文件。

使用现行模板结构，不使用旧版 `layouts/_default/` 和 `layouts/partials/`。配置使用 `locale`，模板通过 `site.Language.Locale` 获取语言区域。

来源：[Hugo v0.170.1](https://github.com/gohugoio/hugo/releases/tag/v0.170.1) · [官方主题生成命令](https://gohugo.io/commands/hugo_new_theme/) · [模板查找规则](https://gohugo.io/templates/lookup-order/)

## 开源协议

[MIT License](LICENSE) © 2026 WayJam So
