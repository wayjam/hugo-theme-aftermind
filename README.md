# Aftermind

> The system still archives on schedule. After the work was taken over, people left unread words here.

A minimalist, postmodern archival Hugo theme for personal blogs, essays, and technical notes. Built around the idea of *human echoes inside a decommissioned handover archive*, Aftermind juxtaposes tabular monospace system records with serif human prose — requiring neither Hugo Extended nor Node.js.

English | [简体中文](README.zh-cn.md)

## Features

- **Configurable Homepage Plate**: Pairs theme-aware archival SVG illustrations (*Uncollected Telemetry Feed* in light mode, *Alcove Light Still On* in dark mode) with an afterimage wordmark and the latest record. Supports custom images/SVGs (`10:7`) or text-only layout (`showPlate = false`).
- **Three-Track Article Layout**: On desktop (`≥ 1200 px`), a sticky left system rail (archive ID, date, length, tags, TOC, scroll-driven paper ruler), a controlled-measure (`66ch`) serif column, and a right rail for margin notes with hairline leaders; collapses cleanly on narrower screens.
- **Time-Sparse Archives**: Groups entries by year and computes calendar days between consecutive posts at build time, turning silence into proportional vertical spacing and marking gaps `≥ 30` days with vertical tick lines.
- **Dual-Surface Light & Dark Modes**: Faded handover paper (`#E9E6DD`) and slate darkroom (`#24232B`) share a static paper-grain texture, controlled by a three-state segmented switch (`Auto / Light / Dark`) with keyboard navigation, anti-flash inline init, and optical light-switch transition.
- **Zero-Dependency Icons & Adaptive Favicon**: Inline Tabler Icons Outline SVGs (`layouts/_partials/icon.html`) plus a theme-adaptive handover ledger SVG favicon with `.ico` fallback.
- **Built-in Client Search**: Ships with zero-build JSON metadata search (`provider = 'json'`), optional full-text Pagefind integration (`provider = 'pagefind'`), or `'none'`.
- **Native CSS Motion, Multilingual & i18n**: Supports `@view-transition`, scroll-driven progress rules, full `prefers-reduced-motion` support, automatic footer language links & `hreflang` tags on multilingual sites, and 6 built-in locales (`en`, `zh-cn`, `zh-tw`, `zh-hant`, `ja`, `de`).

## Requirements

- **Hugo `>= 0.146.0`** (standard edition is sufficient; Hugo Extended and Node.js are not required).

## Quick Preview (`exampleSite`)

Run the bundled example site from the theme root:

```sh
./run_example.sh
```

Or manually:

```sh
hugo server --source exampleSite --theme hugo-theme-aftermind --themesDir ../.. --disableFastRender
```

Production build:

```sh
hugo --source exampleSite --theme hugo-theme-aftermind --themesDir ../.. --minify --cleanDestinationDir
```

Output goes to `exampleSite/public/`. The example site is configured as a bilingual (`en` + `zh-cn`) showcase; see [exampleSite/hugo.toml](exampleSite/hugo.toml) for a complete reference configuration.

## Installation & Configuration

Place this repository at `themes/hugo-theme-aftermind/` (or add it as a Git submodule / Hugo Module), then configure your site `hugo.toml`:

```toml
theme = 'hugo-theme-aftermind'
defaultContentLanguage = 'en' # Supports 'en' / 'zh-cn' / 'zh-tw' / 'zh-hant' / 'ja' / 'de'
hasCJKLanguage = false
title = 'Aftermind'

[pagination]
  pagerSize = 20

[params]
  description = 'Aftermind · Notes written for nobody in particular'
  mainSections = ['posts']

[params.home]
  subtitle = 'Aftermind · Notes written for nobody in particular'

[params.footer]
  text = '© 2026 Aftermind · Text and time only'
  github = 'https://github.com/wayjam/hugo-theme-aftermind'
  showThemeCredit = true

[menus]
  [[menus.main]]
    name = 'Home'
    pageRef = '/'
    weight = 10
  [[menus.main]]
    name = 'Archives'
    pageRef = '/posts'
    weight = 20
  [[menus.main]]
    name = 'Tags'
    pageRef = '/tags'
    weight = 30

[markup.highlight]
  noClasses = false
  codeFences = true
  guessSyntax = true
```

Menu items can reference any SVG icon name from `assets/icons/` via `params.icon` (without `.svg`), and theme-default menus also support `params.i18n` for automatic locale matching.

## Homepage Plate

By default, the homepage displays the built-in theme-aware SVG plate (`10:7`). Set `showPlate = false` to hide it and show the wordmark beside the latest entry on `≥ 768px` screens.

```toml
[params.home]
  showPlate = true
  image = 'images/archive.svg' # Optional custom image/SVG (assets/images/, static/images/, or HTTPS URL)
  imageAlt = 'Description of the plate'
  caption = 'Archive plate caption' # Optional
```

Recommended aspect ratio is **10:7** (`1440 × 1008 px` for rasters or `viewBox="0 0 720 504"` for SVGs).

## Social Metadata

Aftermind outputs canonical, Open Graph, and Twitter Card tags. An article's `cover` image takes precedence; site-wide fallback defaults can be set with:

```toml
[params]
  socialImage = 'images/share.jpg'
  socialImageAlt = 'Aftermind archive cover'
```

## Search

Search is enabled by default via a build-time JSON index (`title`, `summary`, `tags`, `archiveId`). Exclude individual entries by setting `searchHidden = true` or `search = false` in front matter.

```toml
[params.search]
  provider = 'json' # 'json' | 'pagefind' | 'none'
```

When using `'pagefind'`, index the built output **after** running Hugo:

```sh
hugo --minify
npx --yes pagefind@1.6.0 --site public --root-selector 'html[data-aftermind-pagefind]'
```

## Images, Math & Diagrams

Unlinked cover and body images open in an accessible `<dialog>` lightbox. Enable math or diagrams per article in front matter:

```toml
math = true
diagrams = true
```

- **Math**: Inline `\(a_b + c_d\)`, block `\[ ... \]` or `$$ ... $$` (loads pinned KaTeX from jsDelivr when enabled).
- **Diagrams**: Fenced `mermaid` code blocks (loads pinned Mermaid from jsDelivr when enabled; falls back to source if rendering fails).

Add Goldmark passthrough delimiters to your site `hugo.toml` when using TeX math:

```toml
[markup.goldmark.extensions.passthrough]
  enable = true
  [markup.goldmark.extensions.passthrough.delimiters]
    block = [['\[', '\]'], ['$$', '$$']]
    inline = [['\(', '\)']]
```

## Shortcodes & Front Matter

- **Margin Note (`note`)**: Floats to the right rail on `≥ 1200px` screens with bidirectional hover/focus highlights; toggles inline on narrower screens and remains readable without JS:
  ```markdown
  The corridor chime still rang twice.{{</* note */>}}The schedule had not been edited since last October.{{</* /note */>}}
  ```
- **Redaction (`redact`)**: Keeps the struck-through original beside the revision:
  ```markdown
  Confirmed I {{</* redact "finished something meaningful" "sat at the desk for four hours" */>}} today.
  ```
- **Optional Front Matter**: `archiveId`, `cover`, `coverAlt`, `coverCaption`, `toc = false`, `comments = false`.

## Third-Party Comments

Comments are disabled by default. To integrate a provider, enable `params.comments.enabled = true` and place your snippet in `layouts/_partials/comments/provider.html` in your site.

## Repository Structure

- `archetypes/`: Front matter archetypes.
- `assets/css/`, `assets/js/`: Stylesheets and lightweight scripts processed by Hugo Pipes.
- `assets/icons/`: Bundled Tabler Icons Outline SVGs rendered via `layouts/_partials/icon.html`.
- `content/search/`: Content adapter (`_content.gotmpl`) that mounts `/search/` automatically.
- `exampleSite/`: Bilingual (`en` + `zh-cn`) demo site and showcase posts.
- `i18n/`: Locale files (`en.toml`, `zh-cn.toml`, `zh-tw.toml`, `zh-hant.toml`, `ja.toml`, `de.toml`).
- `layouts/`: Theme templates, partials, shortcodes, and Mermaid render hook.
- `static/`: Self-hosted `Barlow Condensed` & `IBM Plex Serif` WOFF2 fonts, `paper-grain.png`, and adaptive SVG/ICO favicons.

For the full visual specification, see [design.md](design.md).

## Third-Party Assets & Licenses
- **Fonts** (`static/fonts/`):
  - [Barlow Condensed](https://github.com/jpt/barlow) (700) — SIL Open Font License 1.1 (`OFL-1.1`).
  - [IBM Plex Serif](https://github.com/IBM/plex) (400, 400 Italic, 600) — SIL Open Font License 1.1 (`OFL-1.1`).
- **Icons** (`assets/icons/`):
  - [Tabler Icons](https://github.com/tabler/tabler-icons) — MIT License.
- **Optional On-Demand Libraries**:
  - [KaTeX](https://katex.org/) & [Mermaid](https://mermaid.js.org/) (loaded from jsDelivr only on pages with `math = true` / `diagrams = true`) — MIT License.

## License

[MIT License](LICENSE) © 2026 WayJam So
