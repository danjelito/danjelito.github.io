---
title: "A Model With 95% Accuracy Can Still Be Useless"
category: "Machine Learning"
image: /images/projects/accuracy-trap/confusion-matrices.png
excerpt: "95% accuracy sounds impressive. Not when 95% of your data belongs to the same class."
tools:
  - Machine Learning
  - Python
collection: portfolio
featured: false
---
When training a machine learning model, you should NOT only rely on accuracy to measure its performance. This is why.

## The Problem

Accuracy is simple: the number of correct predictions divided by the total number of predictions.

```text
accuracy = correct predictions / all predictions
```

The problem is hidden in that formula. When one class dominates the data, the majority class alone carries accuracy to a high number. The model only needs to predict the majority class for everything. It does not need to be smart, and it does not need to detect anything.

This is the classic class imbalance trap. It shows up everywhere in practice: fraud detection, disease screening, hate speech detection, equipment failure prediction. In all of these the event you care about is rare, and accuracy measures almost nothing you actually care about.

## A Simple Example

Take a fraud detection problem. A bank has 10,000 transactions. Only 500 of them are fraudulent. The other 9,500 are normal.

Now consider two models.

**Model A does nothing.** It predicts "normal" for every single transaction. Let us count its results:

|  | Actually normal | Actually fraud |
|---|---|---|
| Predicted normal | 9,500 | 500 |
| Predicted fraud | 0 | 0 |

Model A gets 9,500 out of 10,000 right. That is 95% accuracy. Every single fraud is missed, and it still scores 95%.

**Model B actually tries.** It flags suspicious transactions, but it is not perfect. It catches 400 of the 500 frauds. It also wrongly flags 300 normal transactions.

|  | Actually normal | Actually fraud |
|---|---|---|
| Predicted normal | 9,200 | 100 |
| Predicted fraud | 300 | 400 |

Model B only gets 9,600 out of 10,000 right. That is 96% accuracy, barely better than Model A.

<img
  src="{{ '/images/projects/accuracy-trap/confusion-matrices.png' | relative_url }}"
  alt="Confusion matrices for Model A and Model B"
  style="width: 100%; max-width: 700px; height: auto; display: block; margin: 1em 0;"
/>

Judged only by accuracy, the two models are nearly tied. The difference between 95% and 96% is noise, and it says nothing about whether either model actually works.

## What the Data Tells Us

Accuracy hides what actually matters. Let us look at how well each model finds fraud.

**Recall** asks: of all the fraud that actually happened, how much did the model catch?

- Model A: 0 out of 500 frauds caught. Recall = 0%.
- Model B: 400 out of 500 frauds caught. Recall = 80%.

**Precision** asks: of everything the model flagged as fraud, how much was real fraud?

- Model A: no flags at all. Precision is undefined, but in practice it is meaningless.
- Model B: 400 real frauds out of 700 flags. Precision = 57%.

**F1 score** combines both into one number:

- Model A: F1 = 0.
- Model B: F1 = 0.67.

| Model | Accuracy | Recall | Precision | F1 |
|---|---|---|---|---|
| A (does nothing) | 95% | 0% | n/a | 0 |
| B (actually tries) | 96% | 80% | 57% | 0.67 |

Measured against the actual goal, the two models are far apart. Model A is worthless, and Model B is doing real work.

This is the core of the trap: **accuracy is a denominator game.** When the majority class is 95% of the data, a model can hit 95% without ever doing its job. The score is not evidence of skill. It is evidence that the data is unbalanced.

## What This Means in Practice

I have seen this exact trap in NLP work. Models that detect harmful content rarely deal with balanced data. Hate speech is the minority of tweets. Suicide ideation is the minority of posts. In projects like those, reporting accuracy alone tells stakeholders almost nothing. The useful numbers are recall and precision, because the question is whether the model caught the harmful tweets and how often it flagged harmless ones.

The same reasoning applies to thresholds. A model outputs a probability, and you decide where to cut it. A fraud model with a low threshold catches more fraud and also flags more normal transactions. A high threshold does the opposite. There is no universally correct threshold. There is only a threshold that matches what the false positives and false negatives cost. Tuning the threshold on a confusion matrix is the practical version of this whole discussion.

Before trusting a number, ask what it actually measures. A high accuracy on an imbalanced problem is often the first sign that the model is not learning anything at all.

## Takeaway

- Accuracy is meaningless when the majority class dominates the data. A model can hit 95% by predicting the same class for everything.
- Look at the confusion matrix, then at precision, recall, and F1. They describe what the model actually finds.
- The right metric depends on what the mistakes cost. Accuracy silently assumes both classes and both error types matter equally.
- Report the metric that matches the decision, not the metric that looks good.
