+++
title = 'Syntax Highlighting & Multilingual Snippets'
date = 2026-10-12T19:05:00+08:00
draft = false
tags = ['Guide', 'Tech', 'Code']
summary = 'Demonstrates class-based Hugo Chroma syntax highlighting across languages, seamless light/dark palette switching, and one-click code copy.'
+++

Aftermind uses Chroma's CSS class mode (`noClasses = false`), mapping all syntax tokens to the theme's light and dark CSS variables. Every code block receives an archival header and a one-click copy button.

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
# Start the example site with template performance metrics
./run_example.sh

# Build static production archive
hugo --source exampleSite \
  --theme hugo-theme-aftermind \
  --themesDir ../.. \
  --minify \
  --cleanDestinationDir
```
