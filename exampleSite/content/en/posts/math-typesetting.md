+++
title = 'Math Typesetting Guide (KaTeX)'
date = 2026-11-20T15:40:00+08:00
draft = false
tags = ['Guide', 'Math', 'KaTeX']
summary = 'Demonstrates opt-in per-article KaTeX rendering in Aftermind for inline equations, display blocks, aligned derivations, and matrices.'
math = true
+++

Aftermind disables math scripts by default so ordinary essays incur zero external overhead. Add `math = true` to an article's front matter to load KaTeX on demand.

## Configuration

Enable Goldmark's `passthrough` delimiters in your site `hugo.toml`:

```toml
[markup.goldmark.extensions.passthrough]
  enable = true
  [markup.goldmark.extensions.passthrough.delimiters]
    block = [['\[', '\]'], ['$$', '$$']]
    inline = [['\(', '\)']]
```

Then opt in per post:

```toml
math = true
```

## Inline Equations

When a quadratic equation \(ax^2 + bx + c = 0\) has \(a \ne 0\), its discriminant is \(\Delta = b^2 - 4ac\), and Euler's identity reads \(e^{i\pi} + 1 = 0\).

## Display Blocks

Use `$$ ... $$` or `\[ ... \]` for centered block equations:

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

Gaussian integral:

\[
\int_{-\infty}^{+\infty} e^{-x^2}\,dx = \sqrt{\pi}
\]

## Aligned Equations & Divergence

Use the `aligned` environment for multi-line derivations:

$$
\begin{aligned}
D_{\mathrm{KL}}(P \parallel Q) &= \sum_{x \in \mathcal{X}} P(x) \log \frac{P(x)}{Q(x)} \\
D_{\mathrm{JS}}(P \parallel Q) &= \frac{1}{2} D_{\mathrm{KL}}\!\left(P \parallel M\right) + \frac{1}{2} D_{\mathrm{KL}}\!\left(Q \parallel M\right), \quad M = \frac{1}{2}(P + Q)
\end{aligned}
$$

## Matrices & Piecewise Functions

Transition matrix example:

$$
T = \begin{pmatrix}
1 - \alpha & \alpha & 0 \\
0 & 1 - \beta & \beta \\
\gamma & 0 & 1 - \gamma
\end{pmatrix}
$$

Piecewise decay function:

$$
f(t) = \begin{cases}
1, & t \le 0 \\
e^{-\lambda t}, & 0 < t < T_0 \\
0, & t \ge T_0
\end{cases}
$$

When offline or when remote scripts are blocked, raw TeX remains readable directly in the page flow.
