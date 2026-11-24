+++
title = '代码高亮与多语言片段'
date = 2026-10-12T19:05:00+08:00
draft = false
tags = ['指南', '技术', '代码']
summary = '演示 Hugo Chroma 基于 CSS 类的多语言代码语法高亮、亮暗主题无缝切换以及代码块一键复制交互。'
+++

Aftermind 使用 Chroma 的 CSS 类模式（`noClasses = false`），所有语法着色均映射到主题的亮/暗双套 CSS 变量中。代码块右上角自动附带一键复制按钮。

## Go

```go
package archive

import (
	"fmt"
	"time"
)

type Entry struct {
	ID        string
	Title     string
	CreatedAt time.Time
}

func (e Entry) SilenceDays(now time.Time) int {
	if now.Before(e.CreatedAt) {
		return 0
	}
	return int(now.Sub(e.CreatedAt).Hours() / 24)
}

func FormatLabel(e Entry) string {
	return fmt.Sprintf("%s · %s", e.ID, e.Title)
}
```

## TypeScript

```ts
interface SearchItem {
  archiveId: string;
  title: string;
  summary: string;
  tags: string[];
  url: string;
}

export function filterEntries(items: SearchItem[], query: string): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return items.filter((item) =>
    [item.archiveId, item.title, item.summary, ...item.tags]
      .join(' ')
      .toLowerCase()
      .includes(q),
  );
}
```

## CSS

```css
:root {
  --bg: #edece7;
  --fg: #1d1c19;
  --accent: #9a452d;
}

[data-theme="dark"] {
  --bg: #151412;
  --fg: #e5e2d9;
  --accent: #d4795d;
}
```

## Shell

```sh
# 启动示例站点并开启模板性能统计
./run_example.sh

# 生产构建静态归档
hugo --source exampleSite \
  --theme hugo-theme-aftermind \
  --themesDir ../.. \
  --minify \
  --cleanDestinationDir
```
