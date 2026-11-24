+++
title = 'Typography & Margin Notes in English'
date = 2026-11-12T17:30:00+08:00
draft = false
tags = ['Guide', 'Typography', 'English']
summary = 'Demonstrating English serif prose measure, Barlow Condensed archival headings, balanced display wrapping, redaction traces, and margin notes.'
+++

Aftermind sets Latin body text in self-hosted IBM Plex Serif (falling back to Georgia and platform serifs) within a controlled `66ch` measure, contrasting human paragraphs against tabular monospace system metadata.

## Dual-Voice Hierarchy

In English mode (`defaultContentLanguage = 'en'`, `hasCJKLanguage = false`), word counts, reading estimates, silence ticks, and pluralized archival counters adapt automatically via `i18n/en.toml`.

> The machine records timestamps with zero drift; the writer keeps the hesitations that happened between them.{{< note >}}In desktop viewports (`≥ 1200px`), this margin note floats in the right rail with a hairline leader pointing back to the text.{{< /note >}}

### Redaction & Self-Correction

Published manuals erase every false start. Personal logs keep the strike-through: we stayed late to {{< redact "ship the final handoff" "finish a page nobody requested" >}}.

### Structured Metadata Table

| Surface | Human Channel | System Channel |
| --- | --- | --- |
| Home | Lead essay & summary | `ARCHIVE RUNNING · AUDIENCE: 0` |
| Article | Serif body & margin notes | Sticky index plate & scroll ruler |
| Archive | Calendar silence gaps | `tabular-nums` year & index ID |

## Minimal Script Footprint

```ts
export interface ArchiveNote {
  id: string;
  recordedAt: string;
  audience: 0;
}

export function formatSilence(days: number): string {
  return days === 1 ? "1 day of silence" : `${days} days of silence`;
}
```

Even in a predominantly Chinese example archive, English entries sit naturally in the same ledger—verifying mixed-script wrapping, hyphenation, and search indexing.
