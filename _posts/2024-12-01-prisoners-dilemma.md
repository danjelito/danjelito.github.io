---
title: 'Prisoner’s Dilemma: Why Being “Good” Wins in Game Theory'
date: 2024-12-01
permalink: /posts/2024/prisoners-dilemma/
tags:
  - game theory
  - strategy
  - machine learning
---

<img src="{{ '/images/blog_posts/game_theory.jpg' | relative_url }}" alt="Game theory" style="max-width: 600px; height: auto; display: block; margin: 1em 0;" />

In the mathematical field of *game theory*, there’s a game known as the **Prisoner’s Dilemma**. The game unfolds as follows:

Two participants face each other. Each can choose to *cooperate* or *defect*, with outcomes:  
- Both cooperate: **3 points each**  
- One defects, the other cooperates: **Defector gets 5 points**, cooperator gets 0  
- Both defect: **1 point each**  

The game consists of *multiple rounds*, with points tallied for each participant. The one with the most points **wins**.

At first glance, it seems you must defect and hope your opponent cooperates to win—essentially *betraying them*. But does success in this game truly require "evil" behavior?

I recently ran a simulation to test various strategies for this game, categorizing them into two types:  
- **Good Strategies** *(do not defect first)*  
- **Evil Strategies** *(defect first)*  

### Strategy List

| Strategy Name             | Type  | Description |
|--------------------------|-------|-------------|
| Unconditional Cooperator | Good  | Always cooperates |
| Tit for Tat              | Good  | Starts by cooperating, then mirrors the opponent |
| Generous Tit for Tat     | Good  | Like Tit for Tat, but forgives occasional defections |
| Tit for Two Tats         | Good  | Cooperates unless defected against twice in a row |
| Two Tits for Tat         | Good  | Defects twice after being defected against, then cooperates |
| Grim Trigger             | Good  | Cooperates until the opponent defects once, then defects permanently |
| Probability Cooperator   | Good  | Cooperates with high probability, defects occasionally |
| Unconditional Defector   | Evil  | Always defects |
| Suspicious Tit for Tat   | Evil  | Defects initially, then mimics the opponent |
| Pavlov                   | Evil  | Switches strategies based on the last round’s outcome |
| Alternator               | Evil  | Alternates between cooperating and defecting |


You can see the ranking table in the image below.

The simulation results reveal a clear trend: **good strategies outperform evil ones**.  
Analyzing the winning strategies, we found that the key factors for success in this game are:

1. *Being nice* – don’t try to take advantage of others  
2. *Being forgiving* – be willing to forgive others if they wrong you  
3. *Not being a pushover* – sometimes retaliate if wronged  
4. *Being clear in your intentions* – avoid being too unpredictable  

While good strategies don’t always win in every matchup (e.g., *Tit for Tat* loses to *Unconditional Defector*), they generally **score better overall**. Notably, the top three strategies are all *good*, while the most "evil" strategy, *Unconditional Defector*, ranks the lowest.

This result is almost poetic. Even **mathematics teaches a life lesson**:  
> *To be successful, one should be kind, forgiving, assertive, and transparent.*  

This lesson extends beyond the game, highlighting the value of these traits in real life.

Check out the simulation code on my [GitHub](https://github.com/danjelito/prisoners-dilemma).
- Inspired by Veritasium's video: [What Game Theory Reveals About Conflict and War](https://www.youtube.com/watch?v=mScpHTIi-kM)
- [Stanford’s strategy table](https://plato.stanford.edu/entries/prisoner-dilemma/strategy-table.html)
