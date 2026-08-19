---
title: "The Most Important Feature Is Not the Most Important Lever"
excerpt: "Feature importance tells you what predicts. It does not tell you what to change."
image: /images/blog_posts/feature-importance-vs-lever.png
date: 2027-02-15
permalink: /posts/2027/important-feature-not-lever/
featured: false
tags:
  - Machine Learning
  - Causal Inference
  - Decision Making
---

<img
  src="{{ '/images/blog_posts/feature-importance-vs-lever.png' | relative_url }}"
  alt="Horizontal bar chart comparing model feature importance with feature actionability for six churn model features"
  style="width: 100%; max-width: 700px; height: auto; display: block; margin: 1em 0;"
/>

A churn model ranks its features. Tenure is the most important. Monthly charges is second. Contract type is third. The product team walks away thinking: "we need to make customers stay longer."

You can't make customers stay longer by deciding that they should. Tenure is not a lever. It's a measurement of how long someone has already been a customer. The model is right that tenure predicts churn. It's wrong as a guide to action.

This is the most common confusion I see in applied ML. A team builds a model, looks at feature importance, and treats the top feature as the top lever. The two are different things, and confusing them produces strategies that can't work.

## 1. The Tenure Trap

Feature importance measures how much a feature contributes to the model's predictive accuracy. It's a property of the model and the data. It says: "if you hadn't known this feature, your predictions would be worse by this much."

A lever is a feature you can change that, when changed, changes the outcome. It's a property of the world and the decision. It says: "if you intervene on this, the outcome moves."

These are different. They overlap sometimes. They don't overlap often.

- Tenure predicts churn. It's not a lever. You can't shorten or lengthen a customer's history.
- Age predicts credit default. Not a lever.
- Country predicts conversion. Usually not a lever.
- Past purchase count predicts lifetime value. Not a lever.

The features that predict best are often the ones you can't change. They're correlated with the outcome because they're downstream of it, or because they reflect selection effects, or because they encode the same underlying trait that drives the outcome.

## 2. Predictive vs Actionable

Predictive models are built to predict, not to recommend interventions. The training objective is "minimize error on held-out data." Features that are stable, downstream, or correlated with everything get high importance because they're reliable predictors.

Features that are upstream causes often look weaker. The causal effect of a single intervention is small, mediated through other variables, and noisy. A model trained on raw correlations will underweight the upstream cause and overweight the downstream marker.

That's fine for prediction. It's bad for decisions. When a stakeholder asks "what should we do?", feature importance is the wrong answer.

## 3. The Chart

Imagine a churn model with these features and importance scores (illustrative):

| Feature | Model importance | Actionability |
|---|---|---|
| Tenure | 0.35 | ~0 (you cannot change history) |
| Monthly charges | 0.20 | Medium (you can change pricing) |
| Contract type | 0.16 | High (you can offer a different contract) |
| Number of support calls | 0.13 | High (you can fix support) |
| Age | 0.09 | ~0 |
| Payment method | 0.07 | Medium (you can nudge toward autopay) |

The chart at the top shows the same thing visually: importance on top, actionability on bottom. The most important feature has near-zero actionability. The most actionable features sit in the middle of the importance ranking.

If the team picks interventions by importance, they'll try to "increase tenure" (which is meaningless) and miss "fix support" and "switch customers to a different contract," which actually move the outcome.

## 4. How to Find Levers

Feature importance answers: *what does the model use to predict?*
Causal leverage answers: *what would change the outcome if we intervened?*

These need different methods.

- Feature importance is read off the model (permutation, SHAP, gain, coefficient magnitude).
- Causal leverage requires either an experiment, a natural experiment, or a causal model with assumptions about the data-generating process.

The two agree when the predictive feature is also a direct cause. They disagree when the predictive feature is downstream, confounded, or a proxy for something else. Most predictive features in business data are at least one of those.

So when a stakeholder asks "what should we do?", feature importance is not the answer. It's the starting point for a different question: which of these features are levers, and which are just markers? For each top feature, ask: can we change it? If we changed it, would the outcome change, or does the feature just reflect something else? If the answer to either is no, it's a marker, not a lever.

The actionable features often sit lower in the importance ranking. That doesn't mean they're weak levers. It means their effect is mediated through other variables the model also uses. To find levers, the cleanest evidence is an experiment. The next cleanest is a natural experiment or a structural model. Feature importance is neither.

And this is where I'd draw a line. Two models with different purposes: a ranking model (who will churn?) and a treatment model (what should we change?). They're different models. Building one and using it for the other is a category error.

## Limitations

- The actionability scores in the chart are illustrative, not measured. Real actionability is domain-specific and requires talking to the people who would operate the lever.
- Some features are partial levers. Monthly charges can be changed, but only within ranges and with side effects. Actionability isn't binary.
- Even when you find a lever, the effect size in production may differ from the model's prediction, because the model estimated correlation, not the effect of intervention.