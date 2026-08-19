---
title: "Your Model's Probabilities Are Not Probabilities"
category: "Machine Learning"
image: /images/projects/calibration/calibration_curve.png
excerpt: "Three models with AUC near 0.99 produce three different probability scales. The decision threshold you pick depends on which one you trained."
tools:
  - Python
  - scikit-learn
  - Machine Learning
collection: portfolio
featured: false
---
<img
  src="{{ '/images/projects/calibration/calibration_curve.png' | relative_url }}"
  alt="Two-panel chart: a reliability diagram for logistic regression, gradient boosting, and random forest, and a histogram of their predicted probabilities"
  style="width: 100%; max-width: 700px; height: auto; display: block; margin: 1em 0;"
/>

A churn model says a customer has a 30% probability of leaving. An intervention costs $5 per customer and saves $50 per saved customer. The team targets everyone with a predicted probability above 20%. The math looks clean: at $5 cost and $50 saved, the break-even saved-rate is 10%, so anyone above 20% looks like a clear win.

The math is correct only if the 30% is actually 30%. And usually, it isn't.

Most models output a number between 0 and 1 that looks like a probability. For some models, that number is well calibrated: when the model says 30%, the true rate is about 30%. For others, the number 30% is just a score, and the true rate at that score might be 5%, or 60%, or anything in between. If you make decisions based on the value rather than the rank, that gap matters a lot.

## 1. Three Models, Same AUC

Two properties of a classifier get conflated:

- **Discrimination**: does the model rank the cases correctly? Does a customer the model says is high-risk actually churn more often than one it says is low-risk?
- **Calibration**: when the model says 30%, is the true rate 30%?

AUC measures discrimination. A reliability diagram measures calibration. They're independent. A model can have an AUC of 0.99 and still be miscalibrated, and many are.

I trained three models on the student-performance dataset to predict whether a student scores 70 or above on the exam. The target is roughly balanced (25% positive). The features are hours studied, attendance, prior scores, and a set of ordinal and categorical variables. Same training data, same test set, same features. The only difference is the model.

```python
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.calibration import calibration_curve
from sklearn.metrics import roc_auc_score, brier_score_loss

models = {
    "Logistic":  LogisticRegression(max_iter=2000).fit(X_tr, y_tr),
    "GBM":       GradientBoostingClassifier(n_estimators=200, max_depth=3,
                                            random_state=42).fit(X_tr, y_tr),
    "RF (overfit)": RandomForestClassifier(n_estimators=300, max_depth=None,
                                           min_samples_leaf=1,
                                           random_state=42).fit(X_tr, y_tr),
}
for name, m in models.items():
    p = m.predict_proba(X_te)[:, 1]
    print(f"{name:<14}  AUC={roc_auc_score(y_te, p):.3f}  Brier={brier_score_loss(y_te, p):.4f}")

# Calibration curve for one of them
frac_pos, mean_pred = calibration_curve(y_te, p, n_bins=10, strategy="quantile")
```

Results on the held-out test set:

| Model | AUC | Brier score | Mean predicted |
|---|---|---|---|
| Logistic regression | 0.990 | 0.023 | 0.245 |
| Gradient boosting | 0.984 | 0.041 | 0.242 |
| Random forest (overfit) | 0.972 | 0.067 | 0.244 |

All three discriminate well. The base rate is 0.248, so all three are well calibrated on average. The average hides the problem.

## 2. The Reliability Diagram

The reliability diagram bins predictions into deciles and plots the mean predicted probability against the observed frequency in each bin. A perfectly calibrated model sits on the diagonal.

Look at what happens in the middle of the probability range:

| Model | Mean predicted | Observed frequency | Gap |
|---|---|---|---|
| Logistic | 0.15 | 0.13 | +2 pp |
| GBM | 0.15 | 0.06 | +9 pp |
| Random forest | 0.15 | 0.03 | +12 pp |

When the GBM says "15% chance of passing," the true rate is 6%. When the random forest says "15%," the true rate is 3%. The models aren't lying about ranking, students they rate at 15% do worse than students they rate at 60%. But the value 15% is not a probability. It's a score that happens to be on a 0-1 scale.

The random forest is even worse at the high end. When it predicts 0.59, the observed pass rate is 0.84. When it predicts 0.82, the observed pass rate is 1.00. Under-confident at the top, overconfident in the middle.

## 3. Why Trees Miscalibrate

Tree-based models (random forests, gradient boosting without calibration) produce probabilities by counting class frequencies in leaves. With deep trees and small leaves, every leaf has either very few training examples or a homogeneous class. Predicted probabilities cluster near 0 and 1, and the intermediate values are unstable. Logistic regression, in contrast, is calibrated by construction: it optimizes the log-likelihood of a Bernoulli outcome, which is the same objective as good probability estimates.

Niculescu-Mizil and Caruana (2005) tested several models across many datasets: logistic regression is well calibrated out of the box; tree models are not; boosting sits in between. The fix is calibration: Platt scaling (fit a logistic regression on the predicted scores) or isotonic regression (fit a non-parametric monotone map). Both shrink the miscalibration, at the cost of a held-out calibration set.

## 4. Decisions Depend on the Value, Not the Rank

The decision matters more than the model. Two decision rules:

1. **Rank-based**: "Target the top 20% of customers by predicted churn risk." This depends only on discrimination. AUC is the right metric. Calibration is irrelevant because the threshold is a percentile, not a probability.
2. **Value-based**: "Target customers whose predicted churn probability is above 20%." This depends on calibration. The model's 20% must mean 20%, or the rule is wrong.

Most real decisions are value-based, even when they look rank-based. The top-20% rule becomes value-based the moment someone asks "what's the expected ROI of targeting this segment?", because the ROI calculation needs a probability, not a rank.

In the student example: "flag students with predicted P(pass) < 0.30 for tutoring."

- Logistic flags 72.2% of students.
- GBM flags 72.7%.
- Random forest flags 69.3%.

Different models, different students flagged, because the threshold 0.30 sits in a different part of each model's distribution. Without calibration, the same threshold produces different operational decisions depending on which model you happened to train.

## 5. What This Changes in Practice

- Always plot a reliability diagram before trusting model probabilities. AUC alone isn't enough. A high-AUC model with poor calibration produces confident-sounding nonsense.
- Tree models need calibration. Random forests and uncalibrated gradient boosting produce scores, not probabilities. Use Platt scaling or isotonic regression, with a held-out calibration set.
- Decisions that depend on the probability value require calibration. Decisions that depend only on the rank do not. Know which one you're making.
- When comparing models, compare Brier scores, not just AUC. Brier measures both discrimination and calibration together. AUC measures only discrimination.

The thing that trips people up is that a miscalibrated model still looks great on AUC. You can run a whole product on it and never notice, until the day someone does a cost-benefit calculation with the model's "probabilities" and the numbers come out wrong.

## Limitations

- The student dataset has a strong attendance signal, which is why all three models reach AUC near 0.99. On noisier problems the gap between models shrinks, but the calibration issue remains.
- The reliability diagram here uses a single test set. A proper calibration check should use a separate calibration set and a held-out evaluation set.
- Calibration is necessary but not sufficient. A model can be well calibrated and still have poor discrimination. The two need to be evaluated together.

## Sources

- Niculescu-Mizil, A., & Caruana, R. (2005). *Predicting good probabilities with supervised learning.* ICML '05: Proceedings of the 22nd International Conference on Machine Learning, 625-632.
- scikit-learn: `sklearn.calibration.calibration_curve` and `sklearn.calibration.CalibratedClassifierCV`.