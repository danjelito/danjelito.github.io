---
title: "When the Dataset Itself Is Lying"
category: "Data Quality"
image: /images/projects/dataset-is-lying/diagnostic_panels.png
excerpt: "A 'recent movies' dataset where every film is profitable, every film is American, and no film rates below 6 out of 10. The summary looks fine. The corners tell the truth."
tools:
  - Python
  - Pandas
  - Data Quality
collection: portfolio
featured: false
---
<img
  src="{{ '/images/projects/dataset-is-lying/diagnostic_panels.png' | relative_url }}"
  alt="Four-panel diagnostic chart of a recent-movies dataset showing 100 percent profitability, ratings floored at 6.0, vote counts floored at 7,000, and 100 percent English-language US productions"
  style="width: 100%; max-width: 700px; height: auto; display: block; margin: 1em 0;"
/>

A dataset of recent movies arrives. 916 rows, 20 columns. Title, release year, genres, rating, vote count, runtime, box office, budget, director, cast. Summary statistics look reasonable: mean rating 7.6, mean box office $41M, mean budget $24M. Nothing jumps out.

Then you check the corners. Every movie is profitable. Every movie is in English. Every movie is from the United States. No movie rates below 6.0. No movie has fewer than 7,000 votes. No movie has a budget under $10M.

The dataset does not represent recent movies. It represents the subset of recent movies that survived selection by some upstream process (Wikipedia editors, voter thresholds, distribution filters), and the selection left footprints in the data. The summary hides them. The corners expose them.

## 1. The Corners

Most data quality checks focus on values: are the dates valid, are the categories clean, are the numbers in range. These checks assume the rows you have are the rows you should have. They rarely ask: which rows are missing, and what does the missingness tell me?

A dataset that looks complete can still be lying, because completeness is a property of the rows present, not the rows absent. When the absent rows are systematically different from the present ones, every summary is biased. The bias is invisible in the means and obvious in the corners.

This is survivorship bias, and it shows up in most public datasets. The data you have is the data that survived. The data that didn't survive is the data that would have changed your conclusion.

## 2. Six Signatures of Filtering

I ran six diagnostic checks on the movie dataset. The numbers below are observed, not interpreted.

1. **Profitability.** 916 of 916 movies have box office greater than budget. That's 100%. The minimum box-office-to-budget ratio is 1.27; the median is 1.30. There are no flops. In real wide-release film economics, roughly half of theatrical releases lose money. A 100% profit rate is not a property of the film industry. It's a property of the filter applied to this dataset.

2. **Budget and box office correlation.** The Pearson correlation between budget and box office is **r = 0.97**. Budget alone explains 95% of the variance in box office. In published research on film economics, the budget-box office correlation is between 0.5 and 0.7. A correlation of 0.97 means box office is essentially a deterministic function of budget in this data, plus small noise. Real markets aren't this clean.

3. **Language and country.** 916 of 916 movies are in English. 916 of 916 are from the United States. Zero foreign-language films, zero non-US productions. International cinema is absent. Even within US film, the absence of any non-English entry is a signature of selection, not of the world.

4. **Rating floor.** The minimum rating is 6.0 out of 10. The 1st percentile is 6.0. The 5th percentile is 6.1. There are no films rated below "above average." A normal distribution of film quality would have a long left tail. This one doesn't.

5. **Vote count floor.** The minimum vote count is 7,128. The 5th percentile is 50,315. Only films with established voting audiences appear. Niche releases, limited runs, and films that never attracted a voter base are absent.

6. **Budget and box office floor.** The minimum budget is $10.8M. The minimum box office is $25.3M. Micro-budget films, indie releases, and films that didn't secure wide distribution are absent.

```python
import pandas as pd
df = pd.read_csv("recent_movies_2024_2026.csv")
n = len(df)

profitable = (df["box_office_usd"] > df["budget_usd"]).mean()
ratio_min  = (df["box_office_usd"] / df["budget_usd"]).min()
r_budget   = df["budget_usd"].corr(df["box_office_usd"])
pct_eng    = (df["language"] == "English").mean()
pct_us     = (df["country"] == "United States").mean()
min_rating = df["rating_out_of_10"].min()
min_votes  = df["vote_count"].min()

print(f"Profitable:              {profitable:.1%}")
print(f"Min box/budget ratio:    {ratio_min:.2f}")
print(f"Budget vs box office r:  {r_budget:.3f}")
print(f"English:                 {pct_eng:.1%}")
print(f"US production:           {pct_us:.1%}")
print(f"Min rating:              {min_rating:.1f}")
print(f"Min vote count:          {min_votes:,}")
```

## 3. Why the Filter Leaves Footprints

The dataset was almost certainly assembled by pulling films that meet a popularity threshold on a crowdsourced platform. Films below a certain vote count are excluded. Films without a Wikipedia page are excluded. Films without reported box office figures are excluded. Each filter removes a slice of the population, and the surviving slice isn't representative.

The signatures of these filters are in the corners:

- A floor on vote count removes low-audience films.
- A floor on box office removes films without wide distribution.
- A floor on rating removes films that voters rated poorly.
- A restriction to English-language US productions removes international cinema.
- A 100% profit rate removes every film that lost money.

Each of these is a missing-population problem, not a missing-value problem. The rows are clean. The dataset is biased.

<img
  src="{{ '/images/projects/dataset-is-lying/budget_boxoffice.png' | relative_url }}"
  alt="Log-log scatter of budget versus box office with a tight linear fit"
  style="width: 100%; max-width: 700px; height: auto; display: block; margin: 1em 0;"
/>

## 4. A General Corner-Check

The naive reading of this dataset is: "in recent movies, budget strongly predicts box office (r = 0.97), films are reliably profitable, and audiences rate films positively." All three statements are true of the dataset and false of the population.

The correct reading is: "in the subset of recent movies that attracted enough votes, secured wide US distribution, and were reported on the source platform, budget strongly predicts box office, films are reliably profitable, and audiences rate films positively." That's a statement about a filtered sample, not about movies.

The difference matters because the decision changes. If you're deciding whether to fund a film, the dataset tells you films almost always make money. The population tells you about half of them don't. If you're deciding whether to invest in a budget-strategy that assumes box office is determined by budget, the dataset tells you r = 0.97. The population tells you r is more like 0.5, and the rest is execution, marketing, release timing, and luck.

The corner-checks generalize to any dataset:

1. Check the minimum and maximum of every numeric field. A floor or ceiling that doesn't match the population is a filter signature.
2. Check the count of categorical levels. If a category that should be common is missing or rare, the population is filtered.
3. Check the correlation between variables that should be noisy. A correlation that's too high to be real means the data was generated or filtered by a function of those variables.
4. Check the rate of a known outcome. If 100% of cases have a positive outcome that's known to be 50% in the population, the dataset is selected on that outcome.
5. Check the corners of joint distributions. A scatterplot with a clean diagonal and no outliers is suspicious. Real data has outliers.

Means and medians hide all of this. Corners expose it.

## 5. What This Changes in Practice

- Before trusting summary statistics, check the corners. The minimum, the maximum, the missing categories, and the too-clean correlations are where filtering leaves footprints.
- A "complete" dataset can still be biased. Completeness is a property of rows present; bias is a property of rows absent.
- Any conclusion drawn from a filtered dataset is a conclusion about the filter, not about the population. State the filter explicitly before stating the conclusion.
- The same dataset can be honest about its sample and useful for some questions, while misleading for others. The 916-movie dataset is fine for studying what predicts rating among high-vote US releases. It's wrong for studying film profitability in general.

The habit I'd push on is: whenever a dataset looks too clean, ask "what would the corners look like if the real world produced this?" Because the real world is messy, and clean datasets usually got that way by deleting the messy parts.

## Limitations

- We can infer the filtering from the signatures, but we can't prove it without the unfiltered population. The argument here is that the signatures (100% profitable, r = 0.97, all English, all US, floors on rating and vote count) aren't plausible properties of the film industry and are plausible properties of a filter.
- Some entries in the dataset reference films that hadn't been released at the time of export, with box office figures that look synthetic. This is consistent with the dataset being assembled from a mix of reported and projected figures. Flag this honestly when using the data.
- A diagnostic check on the corners catches silent filtering but doesn't catch noisy corruption. Both matter; they require different checks.