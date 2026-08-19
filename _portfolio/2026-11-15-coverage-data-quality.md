---
title: "Coverage: The Data Quality Metric Harder Than Accuracy"
category: "Data Engineering"
image: /images/projects/coverage-data-quality/field_completeness.png
excerpt: "A catalog of 128,348 Steam games sounds rich. It is mostly empty for the fields you actually need."
tools:
  - Python
  - Pandas
  - Data Quality
collection: portfolio
featured: false
---
<img
  src="{{ '/images/projects/coverage-data-quality/field_completeness.png' | relative_url }}"
  alt="Horizontal bar chart of per-field completeness for a 128,348-row Steam games catalog, with most fields below 10 percent"
  style="width: 100%; max-width: 700px; height: auto; display: block; margin: 1em 0;"
/>

A dataset arrives with 128,348 rows. That sounds like a lot of data. The first thing most people check is whether the values look correct. The second thing, which far fewer people check, is whether the values are even there.

This one is a Wikidata export of Steam games. Each row is a game. The columns are `appid`, `wikidata_name`, `esrb_rating`, `hltb_id`, `igdb_id`, `metacritic_id`, `opencritic_id`, and `game_engine`. A quick `count(*)` returns 128,348. Plenty of data.

But the right question isn't "how many rows?". It's "for the field I care about, how many rows actually have it populated?"

## 1. The Catalog

Data quality work tends to obsess over accuracy. Are the values correct? Are the dates valid? Are the categories clean? Fair questions, but they only apply to rows that have a value in the first place. If 95% of rows are null, an accuracy check on the other 5% tells you almost nothing about the dataset.

Coverage asks the question that comes first: what fraction of the records have this field at all? It's harder than accuracy because it reveals selection, not just typos. A field missing for 95% of rows isn't broken data. It's data that tells you which 5% of rows survived a filter you didn't apply.

## 2. What's Actually Populated

Per-field completeness on the Steam catalog:

| Field | Non-null % |
|---|---|
| `wikidata_name` | 100.0% |
| `igdb_id` | 91.0% |
| `opencritic_id` | 10.3% |
| `game_engine` (raw) | 8.2% |
| `esrb_rating` (raw) | 5.1% |
| `hltb_id` | 0.0% |
| `metacritic_id` | 0.0% |

The two fields at 100% are identifiers. The fields that carry actual information are nearly empty.

And even the raw non-null count overstates those numbers. Two cleaning steps are necessary before the completeness figure is honest:

1. `game_engine` has 5,539 entries that are raw Wikidata Q-IDs (strings like `Q63966`) instead of human-readable engine names. Those rows are non-null but not usable. After cleaning, real labeled-engine coverage is closer to 4.0%.
2. `esrb_rating` has 4 entries that are garbage URLs (a Wikidata export artifact) instead of rating labels. Same issue: non-null but not valid.

```python
# Treat raw Wikidata Q-IDs as missing, since they are not labeled engine names
engine_clean = df["game_engine"].copy()
engine_clean[engine_clean.str.startswith("Q", na=False)] = pd.NA

# Treat anything outside the known ESRB label set as missing
valid_esrb = {"Teen", "Everyone", "Mature 17+", "Everyone 10+",
              "Kids to Adults", "Rating Pending", "Adults Only 18+", "Early Childhood"}
esrb_clean = df["esrb_rating"].copy()
esrb_clean[~esrb_clean.isin(valid_esrb)] = pd.NA

# Now the completeness numbers are honest
coverage = pd.DataFrame({
    "raw":     df[meta_cols].notna().mean() * 100,
    "cleaned": [esrb_clean.notna().mean()*100, df["hltb_id"].notna().mean()*100,
                df["igdb_id"].notna().mean()*100, df["metacritic_id"].notna().mean()*100,
                df["opencritic_id"].notna().mean()*100, engine_clean.notna().mean()*100],
})
```

After cleaning, here's the honest picture:

- ~117,000 games (91%) have an IGDB id
- ~13,000 games (10%) have an OpenCritic id
- ~6,500 games (5%) have an ESRB rating
- ~5,000 games (4%) have a labeled game engine
- 1 game has a HowLongToBeat id
- 0 games have a Metacritic id

Any analysis using `esrb_rating` is an analysis of those 5% of games, not of the 128,348. The other 95% are missing not because of bad data engineering, but because most Steam games are simply never rated by the ESRB.

<img
  src="{{ '/images/projects/coverage-data-quality/fields_per_game.png' | relative_url }}"
  alt="Bar chart of how many metadata fields each game has, with 8.9 percent of games having zero fields and only 4.3 percent having three or more"
  style="width: 100%; max-width: 700px; height: auto; display: block; margin: 1em 0;"
/>

A second view makes the sparseness concrete. Count how many of the six metadata fields each game has:

- 8.9% of games have zero metadata fields
- 76.8% have only one (typically just `igdb_id`)
- 4.3% have three or more
- 0 games have all six

The "128,348-game catalog" is, for most analytical questions, a much smaller dataset hiding inside a large one.

## 3. The Missingness Is Information

The naive reading of these numbers is "the catalog has data quality problems." The more accurate reading is "the catalog has coverage patterns, and the patterns are information."

`opencritic_id` missing doesn't mean the pipeline broke. It means OpenCritic hasn't reviewed that game. `esrb_rating` missing means the game hasn't been rated by the ESRB, which is the norm for indie and non-US titles. `game_engine` missing means nobody has linked the game to its engine on Wikidata.

The missingness is structural, not random. It reflects which games get attention from reviewers, raters, and Wikidata editors. Build an analysis on `esrb_rating` and you're not analyzing "Steam games". You're analyzing "Steam games that have been ESRB-rated", a sample of about 5% skewed toward mainstream US releases.

Coverage tells you the population. Accuracy tells you the values. The population question comes first, and it gets asked last.

## 4. What This Changes in Practice

- Report coverage alongside every count. "We have 128,348 games" is misleading. "We have 128,348 games; of those, 6,512 have an ESRB rating" is honest.
- Non-null is not the same as usable. Placeholder values, raw IDs, and garbage strings all count as non-null. Clean before you measure coverage, or you'll overstate it.
- Missingness is information. Which rows have the field tells you which rows survived selection. The pattern is a finding, not just a problem to fix.
- Any analysis on a sparse field is an analysis of the subset that has the field. State the subset explicitly. The conclusion does not generalize to the rows that were never going to have the field.

The habit that saves you here is just asking "non-null out of what?" before trusting any count. It's one question. It would have caught this entire problem in the first ten seconds.

## Limitations

- The dataset is a one-time snapshot. We don't know when each field was populated, so we can't separate "field will never exist" from "field not yet linked."
- Coverage doesn't tell us whether populated values are correct. A field can be 100% populated and 100% wrong.
- We can't tell, from the data alone, whether a missing ESRB rating means "unrated" or "rating not yet linked to Wikidata." Both show up as null.