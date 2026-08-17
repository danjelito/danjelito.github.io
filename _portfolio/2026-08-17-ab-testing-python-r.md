---
title: "An A/B Test From Raw Data to a Decision: The Same Analysis in Python and R"
category: "Statistics"
image: /images/projects/ab-testing-two-languages/ab-testing-two-languages.jpeg
excerpt: "A full A/B test run through both languages, from raw data to business decision."
tools:
  - Python
  - R
  - Statistics
collection: portfolio
featured: false
---
<img
  src="{{ '/images/projects/ab-testing-two-languages/ab-testing-two-languages.jpeg' | relative_url }}"
  alt="A/B testing in Python and R: control versus treatment split with a confidence interval chart"
  style="width: 100%; max-width: 700px; height: auto; display: block; margin: 1em 0;"
/>

## The Experiment

A company wants to know whether a redesigned checkout flow lifts conversion. We simulate the experiment: 20,000 users are randomly assigned to a control group (old flow) or a treatment group (new flow). Each row is one user with a binary outcome: `converted = 1` if they bought, `0` otherwise.

The data is generated with known true probabilities (10% conversion for control, 12% for treatment), so we can later compare what we *estimate* against what we *know*. This is a clean randomized experiment: no confounders, no time effects, no targeting. Real experiments are messier, and I will come back to that at the end.

```
user_id,group,converted
1,control,0
2,treatment,0
3,treatment,0
4,control,0
```

## 1. Inspect the Data

Before any statistics, check the basics: row count, columns, a few rows, summary stats.

**Python (pandas):**

```python
import pandas as pd
df = pd.read_csv("output/dataset.csv")
print(df.shape)                    # (20000, 3)
print(df.head())
print(df.describe(include="all"))
```

**R (base + dplyr):**

```r
library(dplyr)
df <- read.csv("output/dataset.csv")
nrow(df)          # 20000
names(df)
head(df)
summary(df)
```

The output tells us `converted` is a clean 0/1 variable with mean `0.111`, a sensible place to start for a conversion experiment.

## 2. Group Sizes

**Python:**

```python
df["group"].value_counts()
```

**R:**

```r
table(df$group)
```

```
treatment   10065
control      9935
```

The split is not exactly 10,000/10,000. This is expected: random assignment does not guarantee perfect balance, just no *systematic* imbalance. 

## 3. Contingency Table

**Python:**

```python
pd.crosstab(df["group"], df["converted"])
```

**R:**

```r
table(df$group, df$converted)
```

```
converted       0     1
control      8960   975
treatment    8814  1251
```

975 of 9,935 control users converted; 1,251 of 10,065 treatment users did. 

## 4. Conversion Rate

**Python:**

```python
df.groupby("group").agg(
    n_observations=("converted", "count"),
    n_conversions=("converted", "sum"),
    conversion_rate=("converted", "mean"),
)
```

**R:**

```r
df %>%
  group_by(group) %>%
  summarise(
    n_observations = n(),
    n_conversions = sum(converted),
    conversion_rate = mean(converted)
  )
```

```
group      n_observations  n_conversions  conversion_rate
control              9935            975             9.81%
treatment           10065           1251            12.43%
```

The `mean` of a 0/1 column is a proportion. That is the one-line trick that makes `converted.mean()` and `mean(converted)` identical in intent.

## 5. Absolute Lift

**Python and R, identical logic:**

```python
absolute_lift = treatment_rate - control_rate   # 0.0262
```

```r
absolute_lift <- treatment_rate - control_rate   # 0.0262
```

```
Absolute lift (treatment - control): 2.62 pp
```

Note the unit: **percentage points**, not percent. Control moved from 9.81% to 12.43%, a 2.62 *percentage-point* increase. Get this unit wrong and every downstream comparison is off.

## 6. Relative Lift

```python
relative_lift = absolute_lift / control_rate   # 0.2665
```

```r
relative_lift <- absolute_lift / control_rate   # 0.2665
```

```
Relative lift: 26.65%
```

Same number, same code, in both languages. The lift is 26.65% relative to baseline. That is a large relative jump.

## 7. Formulate the Hypothesis

We want to know whether the two groups' true conversion rates differ. Formalize:

- H₀ (null): p_treatment = p_control. The redesign does nothing.
- H₁ (alternative, two-sided): p_treatment ≠ p_control. 

We test a *two-sided* hypothesis unless we have a strong prior that the change can only help. Two-sided is the safe default; a change that *hurts* conversion is just as important to detect as one that helps.

## 8. The Test: Python's z-test vs R's χ² Test

Here the languages diverge in an instructive way.

**Python (statsmodels):**

```python
from statsmodels.stats.proportion import proportions_ztest

n_conversions = contingency_table[1].to_numpy()   # [975, 1251]
n_observations = contingency_table.sum(axis=1).to_numpy()  # [9935, 10065]

z_stat, p_value = proportions_ztest(count=n_conversions, nobs=n_observations)
```

**R (base):**

```r
n_conversions  <- contingency_table[, "1"]
n_observations <- rowSums(contingency_table)

test_result <- prop.test(x = n_conversions, n = n_observations)
```

```
Python: z-statistic = -5.8802,  p = 4.10e-09
R:     X-squared   = 34.313,   p = 4.69e-09
```


## 9. Interpret the P-value

- p ≈ 4 × 10⁻⁹ in Python, ≈ 4.7 × 10⁻⁹ in R.
- Under the null, assuming the redesign does nothing, the probability of observing a difference this large or larger purely by chance is about 1 in 244 million.
- If p < 0.05, reject H₀.

Two points worth keeping straight:

1. The p-value is **not** the probability that the null is true. It is the probability of the data *given* the null. A tiny p-value says the data would be extraordinarily unlikely if there were no effect; it does not assign a probability to "no effect exists."
2. Extremely small p-values are rounded to zero by default in many printouts (Python printed `0.000000`). Report them in scientific notation (`4.10e-09`) or as *"p < 0.001"*, not as "zero."

## 10. Confidence Interval

A p-value tells you the effect is probably real. A confidence interval tells you *how big* it probably is. The two languages use different methods here.

**Python (Wald / normal approximation):**

```python
from statsmodels.stats.proportion import confint_proportions_2indep

conf_int = confint_proportions_2indep(
    count1=n_conversions[0], nobs1=n_observations[0],
    count2=n_conversions[1], nobs2=n_observations[1],
    method="wald",
)
```

**R (from `prop.test`, Newcombe's hybrid method):**

```r
confidence_interval <- -rev(test_result$conf.int)
```

```
Python (Wald):      95% CI [1.74%, 3.49%]
R (Newcombe):       95% CI [1.73%, 3.50%]
```

## 11. Visualize the Interval

A picture earns its place here: it makes the *"does the CI contain zero?"* logic visible in one glance.

The R script ends with a ggplot: a point at the observed lift (2.62 pp), an error bar spanning the 95% CI, and a dashed reference line at 0, the "no effect" line.

```r
ggplot(plot_data, aes(x = 1, y = absolute_lift)) +
  geom_hline(yintercept = 0, linetype = "dashed") +
  geom_errorbar(aes(ymin = lower_ci, ymax = upper_ci), width = 0.05) +
  geom_point(size = 3) +
  scale_y_continuous(labels = scales::percent) +
  labs(title = "Treatment Effect",
       subtitle = "Conversion rate difference with 95% CI",
       y = "Treatment - Control")
```

The visual verdict: the entire interval sits well above zero, far from the dashed line. Test and visualization tell the same story.

## 12. Statistical Significance vs Practical Significance

This is the step most write-ups skip, and the one that matters most.

**Statistically significant:** the observed difference is very unlikely to be chance. The test says: yes, with p ≈ 4e-09.

**Practically significant:** the observed difference is big enough to be worth acting on. The test says nothing about this.

Consider what the data actually says:

- True effect in the simulation: +2.00 pp (from 10% to 12%), a 20% relative lift.

The disciplined way to evaluate the business case: use the **lower bound of the CI** as the planning assumption, not the point estimate. If the redesign pays for itself at +1.7 pp, ship it. If it only pays off at +3.5 pp, the evidence is not yet there, even though p is 0.000000004.

## 13. The Final Business Interpretation

- The redesign lifts conversion from 9.8% to 12.4%.
- The effect is almost certainly real (p ≈ 4e-09, CI far from 0).
- The plausible effect size is +1.7 to +3.5 pp. Plan with the lower bound.
- Whether to ship depends on things the experiment never measured: the cost of the redesign, the margin per conversion, and whether the measured lift survives a full rollout (novelty effects and segment differences are the usual suspects).

