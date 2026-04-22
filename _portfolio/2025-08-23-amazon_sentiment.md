---
title: "NLP: Amazon Reviews Sentiment Analysis"
excerpt: "Sentiment analysis of Amazon reviews using VADER and RoBERTa models, with evaluation via regression metrics and error analysis.<br/><img src='/images/projects/roberta.png' style='max-width: 100%; height: auto; margin-top: 12px;'>"
collection: portfolio
---

<img 
  src="{{ '/images/projects/roberta.png' | relative_url }}" 
  alt="Rpberta" 
  style="width: 100%; max-width: 600px; height: auto; display: block; margin: 1em 0;" 
/>

This project focuses on sentiment analysis of Amazon reviews using two models: VADER (a rule-based model from NLTK) and RoBERTa (a transformer-based model from Hugging Face).  

We evaluate the models' performance using regression metrics such as MSE, MAE, and R², and perform error analysis to identify where the models deviate most from true scores.

[See project on GitHub](https://github.com/danjelito/sentiment-analysis-amazon-fine-food-reviews)