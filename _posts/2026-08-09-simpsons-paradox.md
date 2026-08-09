---
title: "When Averages Lie: Simpson's Paradox in Business Reporting"
date: 2026-08-09
permalink: /posts/2026/simpsons-paradox/
tags:
  - data analysis
  - statistics
  - BI
  - KPI
---

<img 
  src="{{ '/images/blog_posts/simpson_1.png' | relative_url }}" 
  alt="Simpson's Paradox slope chart" 
  style="width: 100%; max-width: 600px; height: auto; display: block; margin: 1em 0;" 
/>

> **Note:** The data in this post is fictional, adapted to protect business confidentiality. The concept, however, is very real and something I have encountered more than once.

I was presenting our quarterly conversion report to the leadership team. Overall conversion rate: 14.7%, about the same as last quarter. Everything looked fine.

Then someone asked to see the numbers by center.

Every single center had declined.

## The Problem

Our overall conversion rate went *up* — from 14.6% to 14.7%. But when I broke it down, every individual center's conversion rate went *down*. How is that possible?

This is Simpson's paradox: a trend that appears in several groups of data can disappear or reverse when the groups are combined. The aggregate hides what's happening in the segments.

## A Concrete Example

Here is the actual breakdown from that quarter:

| Center | Q1 Leads | Q1 Enrolled | Q1 Rate | Q2 Leads | Q2 Enrolled | Q2 Rate | Δ |
|---|---|---|---|---|---|---|---|
| Jakarta | 400 | 72 | 18.0% | 700 | 119 | 17.0% | ▼ 1pp |
| Tangerang | 350 | 49 | 14.0% | 300 | 39 | 13.0% | ▼ 1pp |
| Bekasi | 250 | 25 | 10.0% | 200 | 18 | 9.0% | ▼ 1pp |
| **Total** | **1,000** | **146** | **14.6%** | **1,200** | **176** | **14.7%** | ▲ 0.1pp |

Three centers. Three declines. One aggregate that went up.

The chart image above tells the same story visually. The blue line (Jakarta), orange line (Tangerang), and gray line (Bekasi) all slope downward from Q1 to Q2. The thick green aggregate line slopes upward. If you looked only at the aggregate, you'd conclude performance held steady. You'd be wrong.

## What Caused It

Jakarta is our highest-performing center. In Q1, it handled 40% of all leads. In Q2, that grew to 58%. More leads flowed through the best center — and even though Jakarta's own rate declined, the *composition shift* pulled the overall average up.

The math is cruel this way. When a high-performing segment grows in volume, it can mask declines everywhere else. A flat aggregate KPI is not a sign that nothing changed. It is a sign that opposing forces are canceling each other out, and you need to know what those forces are.

## Why This Keeps Happening

Mix shifts are everywhere in business:

- A company opens new branches that perform differently from existing ones.
- A marketing team shifts spend to a different channel with higher (or lower) baseline conversion.
- A product line grows in one region and shrinks in another, each with different margins.
- Seasonal hiring changes the experience mix of a sales team.

Any time the composition of your data changes, aggregate metrics become unreliable. This is not a rare edge case. It is the norm.

## How to Catch It

Three things saved me that quarter:

1. **Always segment.** Every KPI reported to leadership gets a breakdown by the most relevant dimension — region, channel, product, team. The aggregate is just the starting point.
2. **Watch for mix shifts.** If one segment's share of volume changes significantly, investigate the segment-level rates before you trust the aggregate.
3. **Automate segment-level monitoring.** Set alerts when a segment's rate deviates from its own historical range, not just when the overall number moves.

None of this requires advanced statistics. It requires discipline in how you report.

## What This Means for BI

A dashboard showing only aggregate KPIs is lying to someone, probably the person who needs the information most.

When I redesigned our conversion dashboard to show center-level trends alongside the aggregate, the conversation in leadership meetings changed. Instead of "the number is fine," it became "Bekasi needs attention" and "what's happening with our lead mix?" Better questions. Better decisions.

## Takeaway

- A stable aggregate KPI can hide declining performance in every segment. Always look underneath.
- Composition shifts, not performance changes, are often the real driver of aggregate trends.
- Segment your KPIs by default, not as a follow-up question.
- Catching Simpson's paradox doesn't require complex math. It requires categorizing the data before averaging it.
