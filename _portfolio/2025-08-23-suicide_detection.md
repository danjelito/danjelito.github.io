---
title: "NLP: Suicide Ideation Detection Using Tweets"
excerpt: "A model to identify potential suicide ideation in tweets using sentiment analysis and a pre-trained DistilBERT model. Includes interpretation with SHAP.<br/><img src='/images/projects/suicide-tweet.png' style='max-width: 100%; height: auto; margin-top: 12px;'>"
collection: portfolio
---

<img 
  src="{{ '/images/projects/suicide-tweet.png' | relative_url }}" 
  alt="Suicide tweet" 
  style="width: 100%; max-width: 600px; height: auto; display: block; margin: 1em 0;" 
/>

I develop a model to identify potential suicide ideation in tweets using sentiment analysis.  

By using a pre-trained DistilBERT model, I preprocess and clean text data, fine-tune the model, and evaluate its performance using metrics like accuracy and F1 score.  

Additionally, I use SHAP to interpret the model's predictions, shedding light on which parts of the tweets influence the classification of harmful content. 

[See project on GitHub](https://github.com/danjelito/suicidal-tendency-from-tweet)