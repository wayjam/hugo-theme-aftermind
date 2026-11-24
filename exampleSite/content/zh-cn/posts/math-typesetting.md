+++
title = '数学公式排版指南（KaTeX）'
date = 2026-11-20T15:40:00+08:00
draft = false
tags = ['指南', '数学', 'KaTeX']
summary = '演示如何在 Aftermind 中通过 Front Matter 按篇开启 KaTeX，支持行内公式、块级公式、对齐方程组与矩阵排版。'
math = true
+++

Aftermind 默认关闭数学公式脚本以保持普通随笔零开销。在需要公式的文章 Front Matter 中添加 `math = true` 即可按需加载 KaTeX。

## 启用方式

在站点 `hugo.toml` 中保留 Goldmark 的 `passthrough` 扩展配置：

```toml
[markup.goldmark.extensions.passthrough]
  enable = true
  [markup.goldmark.extensions.passthrough.delimiters]
    block = [['\[', '\]'], ['$$', '$$']]
    inline = [['\(', '\)']]
```

随后在单篇文章的 Front Matter 中加入：

```toml
math = true
```

## 行内公式

当二次方程 \(ax^2 + bx + c = 0\) 满足 \(a \ne 0\) 时，其判别式为 \(\Delta = b^2 - 4ac\)，欧拉恒等式则写为 \(e^{i\pi} + 1 = 0\)。

## 块级公式

使用 `$$ ... $$` 或 `\[ ... \]` 书写独立成行的块级公式：

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

高斯积分：

\[
\int_{-\infty}^{+\infty} e^{-x^2}\,dx = \sqrt{\pi}
\]

## 对齐方程组与信息散度

支持 `aligned` 环境对多行推导进行等号对齐：

$$
\begin{aligned}
D_{\mathrm{KL}}(P \parallel Q) &= \sum_{x \in \mathcal{X}} P(x) \log \frac{P(x)}{Q(x)} \\
D_{\mathrm{JS}}(P \parallel Q) &= \frac{1}{2} D_{\mathrm{KL}}\!\left(P \parallel M\right) + \frac{1}{2} D_{\mathrm{KL}}\!\left(Q \parallel M\right), \quad M = \frac{1}{2}(P + Q)
\end{aligned}
$$

## 矩阵与分段函数

转移矩阵示例：

$$
T = \begin{pmatrix}
1 - \alpha & \alpha & 0 \\
0 & 1 - \beta & \beta \\
\gamma & 0 & 1 - \gamma
\end{pmatrix}
$$

分段衰减函数：

$$
f(t) = \begin{cases}
1, & t \le 0 \\
e^{-\lambda t}, & 0 < t < T_0 \\
0, & t \ge T_0
\end{cases}
$$

当网络离线或远程 KaTeX 脚本不可达时，原始 TeX 源码仍会清晰保留在文档流中。
