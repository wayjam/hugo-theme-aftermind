#!/usr/bin/env sh
set -eu

hugo server \
  --source exampleSite \
  --theme hugo-theme-aftermind \
  --themesDir ../.. \
  --disableFastRender \
  --printI18nWarnings \
  --templateMetrics \
  --templateMetricsHints \
  "$@"
