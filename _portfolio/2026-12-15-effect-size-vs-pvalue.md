---
title: "With Enough Data, Everything Becomes Significant"
category: "Statistics"
image: /images/projects/effect-size-vs-pvalue/pvalue_vs_n.png
excerpt: "A p-value of 0.0001 does not mean the effect is large. It means the sample is big."
tools:
  - Python
  - Simulation
  - Statistics
collection: portfolio
featured: false
---
<img
  src="{{ '/images/projects/effect-size-vs-pvalue/pvalue_vs_n.png' | relative_url }}"
  alt="Log-log chart of p-value versus sample size showing the p-value collapsing below 0.05 and continuing toward zero as sample size grows"
  style="width: 100%; max-width: 700px; height: auto; display: block; margin: 1em 0;"
/>

An A/B test on 200,000 users comes back with a 0.1 percentage-point conversion lift and p < 0.001. The team declares a win and ships.

Here's the thing. The 0.1 percentage-point lift is real. It's also trivially small. With 200,000 users, almost any difference becomes statistically significant. The p-value isn't telling you the effect is large. It's telling you the sample is big enough that you can tell the difference from zero. Those are two completely different statements.

And this is the trap. As n grows, the p-value collapses toward zero for any fixed non-zero effect, no matter how small. Without an effect size and a CI next to the p-value, you don't actually know what you tested.

## 1. What the p-value Actually Answers

The p-value answers one specific question: *if the true effect were zero, how unlikely is the data we saw?* It does not answer: *how big is the effect?*

The two get conflated because "statistically significant" sounds like "important." It isn't. Statistical significance is a statement about evidence. Effect size is a statement about magnitude. One says "we can tell it from zero." The other says "does it matter?"

With enough data, you can tell almost anything from zero. That's the entire problem in one sentence.

## 2. A Simulation with d=0.02

The cleanest way to see this is a simulation. Two groups with a tiny true difference. Group 1 from N(0, 1), Group 2 from N(0.02, 1). The true effect, in Cohen's d, is 0.02. By convention, d = 0.2 is "small," 0.5 is "medium," 0.8 is "large." Our effect is ten times smaller than "small."

Run a two-sample t-test at increasing sample sizes and watch the p-value.

```python
import numpy as np
from scipy import stats

np.random.seed(7)
true_d = 0.02
ns = np.logspace(np.log10(50), np.log10(200_000), 30).astype(int)

for n in ns:
    g1 = np.random.normal(0, 1, n)
    g2 = np.random.normal(true_d, 1, n)
    t, p = stats.ttest_ind(g1, g2)
    d_hat = (g2.mean() - g1.mean()) / np.sqrt((g1.var(ddof=1) + g2.var(ddof=1)) / 2)
    se    = np.sqrt(2 / n)
    print(f"n={n:>6}  p={p:.2e}  d_hat={d_hat:+.4f}  95% CI=[{d_hat-1.96*se:+.4f}, {d_hat+1.96*se:+.4f}]")
```

What happens:

- At n = 50 per group, p ≈ 0.6. Not significant.
- At n ≈ 20,000 per group, p drops below 0.05. Significant.
- At n = 200,000 per group, p ≈ 10⁻⁵⁰. Absurdly significant.

The effect never changed. The true effect was d = 0.02 the whole time, and the estimate stays around 0.02 at every n. What changed was the CI width. At n = 50, the 95% CI is roughly d ∈ [-0.38, +0.42]. At n = 200,000, it's roughly d ∈ [+0.018, +0.022]. The CI shrank, the p-value collapsed, and the effect stayed exactly where it was.

<img
  src="{{ '/images/projects/effect-size-vs-pvalue/effect_vs_n.png' | relative_url }}"
  alt="Effect size estimate with 95 percent confidence interval versus sample size, showing the estimate stable at 0.02 while the CI shrinks"
  style="width: 100%; max-width: 700px; height: auto; display: block; margin: 1em 0;"
/>

## 3. How Big a Sample for Significance

The approximate sample size per group for 80% power at α = 0.05 two-sided, for various true Cohen's d:

| True effect d | n per group | Conventional label |
|---|---|---|
| 0.80 | 26 | large |
| 0.50 | 64 | medium |
| 0.20 | 391 | small |
| 0.10 | 1,567 | smaller |
| 0.05 | 6,271 | tiny |
| 0.02 | 39,199 | trivial |
| 0.01 | 156,799 | basically zero |

Any effect, however small, becomes significant if you're willing to throw enough samples at it. A modern web product with millions of users hits significance on differences that wouldn't change any decision.

## 4. Evidence vs Magnitude

Statistical significance is a property of the test given the sample. Practical significance is a property of the effect given the business. They share the word "significance" and almost nothing else.

The p-value tells you: *I am confident the effect is not exactly zero.*
The effect size with CI tells you: *the effect is about this big, give or take this much.*

For a decision, you need the second. A 0.1 percentage-point lift on a 10% conversion rate, with a 95% CI of [+0.08, +0.12] pp, is statistically significant at any reasonable n. It's also a 1% relative lift. If the change costs more than 1% of converted revenue, shipping it loses money. The p-value doesn't tell you that. The effect size does.

## 5. What This Changes in Practice

- Always report the effect size and its CI alongside the p-value. A p-value alone is a partial statement. It tells you the effect is non-zero, not whether it matters.
- Pre-register the minimum effect you care about. Before the test, write down: "we will ship only if the lift is at least X percentage points." Then the test answers the question you actually have.
- When n is in the hundreds of thousands, p < 0.001 is the default state for any non-zero difference. It's not a finding. It's arithmetic.
- When the CI is narrow around a tiny effect, the right reaction is "we have a precise estimate of something that does not matter," not "we have a significant result."

Honestly, I think the biggest fix here is boring: just decide, before you run the test, what effect you'd actually act on. Most teams never do this. They run the test, see p < 0.05, and ship, without ever asking whether the effect is big enough to pay for itself.

## Limitations

- The simulation assumes normal distributions and a simple two-sample setup. Real experiments have heterogeneity, novelty effects, and segment differences that this doesn't capture.
- "Practical significance" is business-specific. No statistical test can decide it for you; it depends on cost, margin, and strategy.
- The numbers above are for 80% power. With weaker power, the n needed to detect a given effect is larger, and the trap of large-sample significance shows up even more sharply.

## Sources

- Cohen, J. (1988). *Statistical Power Analysis for the Behavioral Sciences* (2nd ed.). Lawrence Erlbaum Associates. The standard reference for the d = 0.2 / 0.5 / 0.8 convention.
- Sullivan, G. M., & Feinn, R. (2012). *Using Effect Size — or Why the P Value Is Not Enough.* Journal of Graduate Medical Education, 4(3), 279-282.