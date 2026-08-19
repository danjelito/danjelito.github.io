# TODO — 10-Month Data Expertise Content Portfolio

Implementation plan for 10 data-expertise posts. M1 is dated Aug 18 2026 and publishes immediately. M2-M10 are dated the 15th of each month from Oct 2026 through Jun 2027 and are held back by `future: false` in `_config.yml` until their dates. A cheaper model should be able to take any single item below and produce the corresponding post with minimal extra planning.

All datasets live at `/home/anj/Downloads/dataset/`:

- `recent-movie-data/recent_movies_2024_2026.csv` — 916 rows, 20 cols. Suspicious: 100% profitable, all English/US, rating floored at 6.0, budget↔box_office r=0.97. Use only as a "dataset is lying" example.
- `steam-games-data/steam_games_wikidata.csv` — 128,348 rows, 8 cols. Sparse: only `appid`, `wikidata_name`, `igdb_id` (91%) populated. Most other fields <10%. Use for coverage / missingness analysis.
- `student-performance-date/StudentPerformanceFactors.csv` — 6,607 rows, 20 cols. Real data with data quality issues (`Exam_Score` has -65 and 101; `Attendance` has -91). Use for regression-to-the-mean and calibration posts.

Existing post conventions:

- `_portfolio/YYYY-MM-DD-slug.md` frontmatter:
  ```
  ---
  title: "..."
  category: "..."
  image: /images/projects/{slug}/{file}.png
  excerpt: "..."
  tools:
    - ...
  collection: portfolio
  featured: false
  ---
  ```
- `_posts/YYYY-MM-DD-slug.md` frontmatter:
  ```
  ---
  title: "..."
  excerpt: "..."
  image: /images/blog_posts/{file}.png
  date: YYYY-MM-DD
  permalink: /posts/YYYY/slug/
  featured: false
  tags:
    - ...
  ---
  ```
- Image embed pattern: `<img src="{{ '/images/...' | relative_url }}" alt="..." style="width: 100%; max-width: 700px; height: auto; display: block; margin: 1em 0;" />`

All charts listed below are ALREADY GENERATED and committed under `images/projects/{slug}/` and `images/blog_posts/`. The implementer does not need to regenerate them unless adding new ones.

Existing posts already cover (do not repeat): Simpson's paradox, accuracy trap on imbalanced data, A/B testing workflow in Python and R, Pareto principle, spatial mismatch in Jakarta, KNN from scratch, salary vs corruption correlation, prisoner's dilemma simulation, sentiment analysis, cost of meetings.

Portfolio positioning across 10 months: measurement → data → stats → modeling → model interpretation → BI → critical data reading → data engineering → AI.

---

## Month 1 — Aug 2026 (published now)

- **Title:** "When Worst Becomes Better: Regression to the Mean in Business Metrics"
- **Target directory:** `_portfolio`
- **Filename:** `2026-08-18-regression-to-the-mean.md`
- **Core argument:** Extreme observations tend to normalize on the next measurement. Chasing the worst-performing segment usually "works" even when the intervention did nothing.
- **Main question:** If we intervene on the bottom 10%, did our intervention work, or did those units just regress toward the mean?
- **Dataset:** `student-performance-date/StudentPerformanceFactors.csv`
- **Relevant columns:** `Previous_Scores`, `Exam_Score` (also filter on `Exam_Score` 0-100 and `Attendance` 0-100 to drop impossible rows)
- **Analysis to perform:**
  - Compute Pearson r between `Previous_Scores` and `Exam_Score` (≈0.17).
  - Standardize both variables; scatter with `y=x` (perfect prediction) and `y=r*x` (actual regression line).
  - Bin `Previous_Scores` into deciles, compute mean `Exam_Score` per decile. Show 45-point gap in prior scores collapses to ~2-point gap in exam scores.
  - Compute expected exam score for `Previous_Score=100` and `=50` using the regression formula. Expected swing across full prior range: ~2.4 points.
- **Expected visualization:**
  - `images/projects/regression-to-the-mean/scatter_regression.png` — scatter of z_prev vs z_exam with diagonal and regression line, decile means highlighted.
  - `images/projects/regression-to-the-mean/decile_collapse.png` — paired bars of decile mean previous score vs decile mean exam score.
- **Code requirements:** Small Python snippet showing the regression-to-the-mean formula `E[y|x] = mean_y + r * (sd_y / sd_x) * (x - mean_x)` and the decile aggregation in pandas. Keep it under 15 lines.
- **Important evidence / sources:**
  - Galton, F. (1886), "Regression towards mediocrity in hereditary stature." — original source of the term. Cite via Wikipedia if needed: https://en.wikipedia.org/wiki/Regression_toward_the_mean
  - Kahneman, D. (2011), *Thinking, Fast and Slow*, chapter on the Israeli flight instructors — classic anecdote of punishment followed by improvement that was actually regression. Cite the book.
- **Key conclusions the analysis should establish:**
  - r ≈ 0.17 means prior score explains ~3% of variance in next score.
  - Top decile of prior scores is only +0.27 SD on the next exam; bottom decile is -0.26 SD.
  - The 45-point gap in priors collapses to a 2-point gap in exam scores.
  - Any "intervention" on the bottom decile would appear to lift scores by ~2 points on average — purely from regression.
- **Important limitations:** This is observational data, single time step. We don't know if students received any intervention. The data does not prove that interventions don't work; it proves that you cannot evaluate them by looking only at before/after of the selected group.
- **Writing angle:** Open with a sales / support / coaching scenario — the worst performer one month is almost guaranteed to look better next month. Then the empirical student example. Then the business implication: always use a control group.
- **Files / assets to create:** The post file. Charts already exist.

---

## Month 2 — Oct 2026

- **Title:** "Your KPI Moved. Did the Business?"
- **Target directory:** `_posts`
- **Filename:** `2026-10-15-kpi-moved.md`
- **Core argument:** A KPI can move because its definition, denominator, or scope changed — not because the underlying business changed.
- **Main question:** When a metric trends up, what fraction of the move is real vs measurement?
- **Dataset:** none
- **Analysis to perform:** None — conceptual. Use the chart `kpi-drift.png` showing a flat underlying business and a +18% KPI jump triggered by a denominator change at month 12.
- **Expected visualization:** `images/blog_posts/kpi-drift.png` (already generated).
- **Code requirements:** None. Optionally a 4-line pseudo-SQL showing how a "active user" definition change silently inflates a count.
- **Important evidence / sources:**
  - Reference the general principle: metric definition changes are a known but under-discussed source of drift. No specific citation required.
  - The example is clearly framed as hypothetical — do not claim it happened.
- **Key conclusions:**
  - A KPI time series with a step change often reflects a definition change, not a performance change.
  - Common silent drivers: denominator change, filter change, source system change, deduplication logic change, scope (which entities are included) change.
  - Every metric should carry a versioned definition; every dashboard should mark the date the definition changed.
  - When a KPI jumps, the first question is "did the definition change?" not "what did we do right?"
- **Important limitations:** Conceptual post; the chart is illustrative.
- **Writing angle:** Open with a concrete scenario — a conversion rate jumps 18% one month, leadership celebrates, but the team quietly changed the denominator. Then list the categories of silent KPI drift. End with the discipline of versioning metric definitions.
- **Files / assets to create:** The post file. Chart already exists.

---

## Month 3 — Nov 2026

- **Title:** "Coverage: The Data Quality Metric Harder Than Accuracy"
- **Target directory:** `_portfolio`
- **Filename:** `2026-11-15-coverage-data-quality.md`
- **Core argument:** Most data quality work focuses on whether populated values are correct. The harder question is what fraction of the records should have a value but don't. Coverage reveals selection, not just typos.
- **Main question:** When someone says "we have 128k games in the catalog," how much of that catalog actually has the metadata you need?
- **Dataset:** `steam-games-data/steam_games_wikidata.csv`
- **Relevant columns:** `appid`, `wikidata_name`, `esrb_rating`, `hltb_id`, `igdb_id`, `metacritic_id`, `opencritic_id`, `game_engine`
- **Analysis to perform:**
  - Per-column non-null % (computed already): `wikidata_name` 100%, `igdb_id` 91%, `opencritic_id` 10%, `game_engine` 8% (but 5,539 of those are raw Wikidata Q-IDs, not labeled engines → real labeled engine coverage ≈ 4%), `esrb_rating` 5% (and 4 rows are garbage URLs), `hltb_id` ~0% (1 row), `metacritic_id` 0%.
  - Distribution of "how many metadata fields per game" — 8.9% of games have zero metadata fields, only 4.3% have ≥3, 0 games have all 6.
  - Cross-field co-occurrence: only 4,199 games have both ESRB and opencritic; only 1,305 have both ESRB and a labeled engine.
  - Identify structural missingness: `opencritic_id` missing means OpenCritic hasn't reviewed the game, not that the data is broken. `esrb_rating` missing means the game hasn't been rated, which is the norm for indie / non-US titles. Missingness itself is information.
- **Expected visualization:**
  - `images/projects/coverage-data-quality/field_completeness.png` — horizontal bar of completeness % per field, color-coded.
  - `images/projects/coverage-data-quality/fields_per_game.png` — bar chart of # fields per game distribution.
- **Code requirements:** Small pandas snippet for the per-column completeness and the "fields per game" count. Show the cleaning step for `game_engine` Q-IDs and `esrb_rating` garbage URLs — that's the real point: raw "non-null" lies.
- **Important evidence / sources:**
  - No external citation needed. The dataset is its own evidence.
  - Optional: cite any standard data quality framework (e.g., DAMA DMBOK) for the definition of "completeness" vs "accuracy" vs "validity". Avoid invented citations.
- **Key conclusions:**
  - "128k games" is misleading: only ~117k have an IGDB id, only ~13k have an OpenCritic id, only ~5k have a labeled engine, only ~6.5k have an ESRB rating.
  - Non-null counts overcount coverage when fields contain placeholder or unlabeled values (Q-IDs, garbage URLs).
  - Missingness is structural: it tells you which games have been reviewed, rated, or documented — not which rows are broken.
  - Any analysis using these fields is an analysis of the subset that has the field, not of the catalog.
- **Important limitations:**
  - The dataset is a one-time snapshot; we don't know when each field was populated.
  - Coverage doesn't tell us whether populated values are correct.
  - We can't tell from this data alone whether missing ESRB means "unrated" or "rating not yet linked to Wikidata".
- **Writing angle:** Open with the trap — someone says "we have 128k records, this is a great dataset," then you check and 95% of fields are empty. Walk through the audit, the cleaning step (Q-IDs, garbage), the structural-missingness insight. End with the operational rule: report coverage alongside every count.
- **Files / assets to create:** The post file. Charts already exist.

---

## Month 4 — Dec 2026

- **Title:** "With Enough Data, Everything Becomes Significant"
- **Target directory:** `_portfolio`
- **Filename:** `2026-12-15-effect-size-vs-pvalue.md`
- **Core argument:** The p-value collapses toward zero as sample size grows, even when the true effect is trivially small. Statistical significance is not the same as practical significance.
- **Main question:** If your A/B test on 200,000 users returns p < 0.001 with a 0.1% lift, should you ship?
- **Dataset:** none — pure simulation
- **Analysis to perform:**
  - Simulate two groups with a tiny true Cohen's d = 0.02.
  - For n per group from 50 to 200,000 (log-spaced), draw samples, run a two-sample t-test, record p-value and Cohen's d estimate with 95% CI (SE ≈ √(2/n)).
  - Find the n at which p first drops below 0.05 (≈ 20k per group for d=0.02 with this seed).
  - Compute the n per group required for 80% power at α=0.05 for d ∈ {0.8, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01}: ≈ 24, 62, 391, 1,567, 6,271, 39,199, 156,799.
- **Expected visualization:**
  - `images/projects/effect-size-vs-pvalue/pvalue_vs_n.png` — p-value (log scale) vs n (log scale) with the 0.05 threshold.
  - `images/projects/effect-size-vs-pvalue/effect_vs_n.png` — Cohen's d estimate with 95% CI vs n, plus the true d=0.02 reference line.
- **Code requirements:** A focused Python block with the simulation loop, the t-test, and the effect-size SE formula. Keep under 20 lines.
- **Important evidence / sources:**
  - Cohen, J. (1988), *Statistical Power Analysis for the Behavioral Sciences* — the standard reference for effect size conventions (d=0.2 small, 0.5 medium, 0.8 large).
  - Optionally: Lin, M., Lucas, H. C., & Shmueli, G. (2013), "Too Big to Fail: Large Samples and the p-Value Problem," *Information Systems Research*. Cite only if verified.
- **Key conclusions:**
  - p-value is a function of both effect size and sample size; with n=200,000, even d=0.02 (a 2% of an SD difference) is "highly significant."
  - Effect size with CI summarizes what the data actually says; the p-value alone does not.
  - The right pre-analysis question is "what is the smallest effect that would matter to the business?" not "what n will give us significance?"
  - For a 0.1 percentage-point conversion lift to be worth detecting, you need a pre-registered minimum meaningful effect — otherwise you will ship noise.
- **Important limitations:**
  - The simulation assumes normal distributions and a simple two-sample setup. Real experiments have heterogeneity, novelty effects, and segments.
  - "Practical significance" is business-specific; no statistical test can answer it for you.
- **Writing angle:** Open with the scenario: a 0.1% lift on 200k users, p < 0.001, leadership wants to ship. Show why the p-value is meaningless without effect size. Walk through the simulation. End with the pre-registration discipline.
- **Files / assets to create:** The post file. Charts already exist.

---

## Month 5 — Jan 2027

- **Title:** "Your Model's Probabilities Are Not Probabilities"
- **Target directory:** `_portfolio`
- **Filename:** `2027-01-15-calibration.md`
- **Core argument:** A model can rank examples perfectly (AUC near 1) and still output probabilities that don't match observed frequencies. Decisions that depend on the probability value, not just the rank, require calibration.
- **Main question:** When your model says "this student has a 15% chance of passing," is 15% actually true?
- **Dataset:** `student-performance-date/StudentPerformanceFactors.csv`
- **Relevant columns:** All features, target = `Exam_Score >= 70`
- **Analysis to perform:**
  - Clean: drop rows with `Exam_Score` outside 0-100 or `Attendance` outside 0-100. Drop remaining NAs (n ≈ 6,353).
  - Encode categoricals: Low/Medium/High → 0/1/2 for the ordinal ones; Yes/No → 0/1 for binary; map `Peer_Influence` to -1/0/1; `School_Type` Private=1; `Gender` Male=1.
  - 70/30 stratified split on `y = (Exam_Score >= 70)`. Base rate ≈ 25%.
  - Train three models: logistic regression, gradient boosting (depth=3), random forest (no max depth, min_samples_leaf=1 — deliberately overfit).
  - All three: AUC 0.97-0.99 (great ranking).
  - Calibration curve (10 quantile bins): LR Brier 0.023, GBM Brier 0.041, RF Brier 0.067.
  - GBM bin with mean predicted 0.150 has observed 0.058 (2.6× over). RF bin with mean predicted 0.59 has observed 0.84 (under by 25 pp).
  - Decision rule "flag students with P(pass) < 0.3 for intervention": LR flags 72.2%, GBM flags 72.7%, RF flags 69.3%. Different models, different students flagged — because their probability scales differ even though ranking is similar.
- **Expected visualization:**
  - `images/projects/calibration/calibration_curve.png` — two panels: (left) reliability diagram for all three models against the diagonal, (right) histogram of predicted probabilities.
- **Code requirements:** A focused block: load, clean, encode, train logistic + RF, compute `calibration_curve` from sklearn. Keep under 25 lines.
- **Important evidence / sources:**
  - Niculescu-Mizil, A., & Caruana, R. (2005), "Predicting Good Probabilities With Supervised Learning" — classic result that logistic regression is usually well-calibrated out of the box, tree models are not.
  - Optionally cite sklearn `calibration_curve` documentation.
- **Key conclusions:**
  - AUC measures ranking, calibration measures probability reliability. They are independent.
  - Tree-based models (RF, GBM) often produce overconfident probabilities in the middle range; logistic regression is usually better calibrated by construction.
  - Decisions that depend on the probability VALUE (absolute thresholds, expected-value calculations, cost/benefit cutoffs) are silently wrong when probabilities are miscalibrated.
  - Fix with Platt scaling, isotonic regression, or just use logistic regression when calibration matters more than discrimination.
- **Important limitations:**
  - The student target has a strong attendance signal, so AUC is unusually high. Most real problems won't have AUC = 0.99.
  - Calibration assessed on a single test set; a proper calibration check would use a held-out calibration set and a recalibration set.
- **Writing angle:** Open with the trap — "the model says 15%, so it's 15%." Show three models with same AUC, different probability scales. Then the decision-rule consequence. End with the rule: always plot a reliability diagram before trusting model probabilities.
- **Files / assets to create:** The post file. Chart already exists.

---

## Month 6 — Feb 2027

- **Title:** "The Most Important Feature Is Not the Most Important Lever"
- **Target directory:** `_posts`
- **Filename:** `2027-02-15-important-feature-not-lever.md`
- **Core argument:** Feature importance measures how much a feature contributes to prediction. It says nothing about whether you can change it, or whether changing it would change the outcome.
- **Main question:** If tenure is the most important feature in your churn model, can you reduce churn by making customers older?
- **Dataset:** none — hypothetical churn model.
- **Analysis to perform:** None — conceptual. Use the chart `feature-importance-vs-lever.png` showing six features with their model importance and their actionability score side by side.
- **Expected visualization:** `images/blog_posts/feature-importance-vs-lever.png` (already generated).
- **Code requirements:** None.
- **Important evidence / sources:**
  - General principle — no specific citation needed.
  - Reference the distinction between "predictive" and "actionable" features; this is standard in operational ML literature.
- **Key conclusions:**
  - Predictive importance and causal leverage are different properties. Tenure predicts churn but is not a lever.
  - Actionable features (`contract_type`, `n_support_calls`) often score lower on importance because their effect is mediated through other variables.
  - To find levers, you need causal reasoning, experiments, or counterfactual models — not feature importance.
  - A churn model that ranks customers is operationally useful; a churn model that tells you what to change requires a different model.
- **Important limitations:**
  - The actionability scores in the chart are illustrative, not measured.
  - Real lever-identification requires domain knowledge and often experimentation.
- **Writing angle:** Open with the tenure anecdote. Show the chart. Distinguish predictive from actionable. End with the operational rule: when stakeholders ask "what should we do?" feature importance is the wrong answer.
- **Files / assets to create:** The post file. Chart already exists.

---

## Month 7 — Mar 2027

- **Title:** "A Dashboard Is a Decision Tool, Not a Data Display"
- **Target directory:** `_posts`
- **Filename:** `2027-03-15-dashboard-decision-tool.md`
- **Core argument:** A dashboard earns its place only if it changes a decision. Most dashboards stop at "here is the metric" and never reach "here is the decision the viewer owns."
- **Main question:** When a viewer looks at this dashboard, what decision do they make differently?
- **Dataset:** none
- **Analysis to perform:** None — conceptual. Use the chart `dashboard-decision-flow.png` showing the Data → Metric → Insight → Decision → Action chain.
- **Expected visualization:** `images/blog_posts/dashboard-decision-flow.png` (already generated).
- **Code requirements:** None.
- **Important evidence / sources:**
  - General BI design principle.
  - Optionally reference Few, S. (2012), *Information Dashboard Design*, 2nd ed. — standard reference on dashboard design. Cite only if verified.
- **Key conclusions:**
  - The chain Data → Metric → Insight → Decision → Action is the test. Most dashboards die at Metric.
  - A dashboard with 30 KPIs probably has zero priorities. The viewer can't act on 30 things at once.
  - For each chart, ask: who looks at it, how often, and what decision do they make after? If you can't answer all three, the chart is decoration.
  - Operational dashboards (high frequency, single decision) and analytical dashboards (low frequency, exploration) are different products. Building one of each is cheaper than building one that tries to be both.
- **Important limitations:**
  - Conceptual post; the flow diagram is illustrative.
- **Writing angle:** Open with the "30 KPIs" scenario. Walk the Data → Action chain. End with the per-chart triad: who, how often, what decision.
- **Files / assets to create:** The post file. Chart already exists.

---

## Month 8 — Apr 2027

- **Title:** "When the Dataset Itself Is Lying"
- **Target directory:** `_portfolio`
- **Filename:** `2027-04-15-dataset-is-lying.md`
- **Core argument:** Before analyzing a dataset, check what's NOT in it. Silent filtering leaves signatures in the corners of the data that summary statistics will not reveal.
- **Main question:** How do you tell, from the data alone, that a "recent movies" dataset is missing every film that didn't succeed?
- **Dataset:** `recent-movie-data/recent_movies_2024_2026.csv`
- **Relevant columns:** `box_office_usd`, `budget_usd`, `rating_out_of_10`, `vote_count`, `language`, `country`
- **Analysis to perform:**
  - Compute profit rate: 916 / 916 = 100% profitable. Real wide-release profit rate is roughly 50%.
  - Min box office / budget ratio = 1.27; median = 1.30. No flops.
  - Budget vs box office corr = 0.974 — unrealistically clean. Real r ≈ 0.5-0.7.
  - All English (100%), all US (100%). No foreign-language, no international.
  - Min rating = 6.0; 1st percentile = 6.0; 5th percentile = 6.1. No below-average films.
  - Min vote count = 7,128; only films with established audiences.
  - Min budget = $10.8M; min box office = $25.3M. No micro-budget films.
- **Expected visualization:**
  - `images/projects/dataset-is-lying/diagnostic_panels.png` — 4-panel: box office vs budget scatter with break-even line; rating histogram floored at 6.0; vote count histogram floored at ~7k; bar of 100% English / 100% US / 100% > $25M box office / 100% > $10M budget.
  - `images/projects/dataset-is-lying/budget_boxoffice.png` — log-log scatter with linear fit (r=0.66 on log scale, r=0.97 on raw scale).
- **Code requirements:** Small block computing the six diagnostic checks (profit rate, min ratio, corr, language/country %, min rating, min vote count). Keep under 15 lines.
- **Important evidence / sources:**
  - No external citation needed; the dataset is its own evidence.
  - Optionally cite the general principle of survivorship bias (the WWII aircraft example). Avoid invented citations.
- **Key conclusions:**
  - Six signatures of silent filtering: 100% profitable, all one language, all one country, ratings floored above the population median, vote counts floored above the population median, no low-budget entries.
  - The dataset does not represent "recent movies." It represents "recent movies that survived selection by Wikipedia editors and voters."
  - Any conclusion drawn from this dataset (e.g., "budget predicts box office with r=0.97") is a conclusion about the selected subset, not about movies.
  - The diagnostic is general: check the corners (mins, maxes, extremes), not just the means.
- **Important limitations:**
  - We can only infer the filtering, not prove it, without the unfiltered population.
  - Some of the titles appear to reference unreleased films with synthetic numbers — flag this honestly.
  - This is a public dataset; the conclusion is "be cautious," not "this dataset is useless."
- **Writing angle:** Open with the trap — a dataset that looks plausible until you check the minimums. Walk the six signatures. End with the rule: always check the corners before checking the means.
- **Files / assets to create:** The post file. Charts already exist.

---

## Month 9 — May 2027

- **Title:** "The JOIN That Silently Inflated Your Average"
- **Target directory:** `_posts`
- **Filename:** `2027-05-15-join-fanout.md`
- **Core argument:** A one-to-many JOIN turns a per-customer average into a per-row average, silently weighting the result toward customers with more child rows. The same SQL query returns a different number depending on whether you JOIN before or after the aggregate.
- **Main question:** Why does `AVG(revenue)` change after a LEFT JOIN with `orders`, even though no revenue value changed?
- **Dataset:** none — toy simulation.
- **Analysis to perform:**
  - Simulate 2,000 customers with true revenue from `Gamma(2, 25)` (mean ~$50, skewed).
  - Simulate order counts from `Poisson(1 + revenue/30)` — high-revenue customers place more orders.
  - True per-customer AVG(revenue) ≈ $50.54.
  - Joined-table AVG(revenue) ≈ $64.95 — a +28.5% inflation, with no individual value changed.
  - Show the two SQL forms that produce different numbers from the same data.
- **Expected visualization:** `images/blog_posts/join-fanout-bias.png` (already generated).
- **Code requirements:** A 6-line SQL snippet showing the wrong form (`AVG` after JOIN) and the right form (`AVG` of a per-customer aggregate, or `SUM(revenue)/COUNT(DISTINCT customer_id)`).
- **Important evidence / sources:**
  - Standard SQL / analytics engineering principle. No citation required.
  - Optionally reference the dbt tests for "rows that fan out" — avoid invented citations.
- **Key conclusions:**
  - `AVG(metric)` after a one-to-many JOIN is a per-row average, not a per-customer average.
  - When child-row counts correlate with the metric, the joined average silently inflates (or deflates).
  - Fix: aggregate before joining, or use `SUM(metric) / COUNT(DISTINCT parent_id)` and understand what that denominator means.
  - This is the most common silent bug in analytics SQL.
- **Important limitations:**
  - The +28.5% number depends on the simulation; the principle does not.
  - Real severity depends on how strongly child counts correlate with the metric.
- **Writing angle:** Open with the scenario — two analysts, same data, different numbers. Walk the simulation. Show the SQL fix. End with the rule: aggregate before joining.
- **Files / assets to create:** The post file. Chart already exists.

---

## Month 10 — Jun 2027

- **Title:** "Where LLMs Help in Analytics and Where They Silently Fail"
- **Target directory:** `_posts`
- **Filename:** `2027-06-15-llms-in-analytics.md`
- **Core argument:** LLMs are reliable when the output is well-defined and the input is structured; they silently fail when the output is a judgment call and the input is ambiguous. Map the task before reaching for the model.
- **Main question:** Which parts of an analytics workflow should you hand to an LLM, and which should you not?
- **Dataset:** none
- **Analysis to perform:** None — conceptual. Use the chart `llm-task-reliability.png` showing 8 common analytics tasks plotted on (input structure, output definition) with reliability colored high / medium / low.
- **Expected visualization:** `images/blog_posts/llm-task-reliability.png` (already generated).
- **Code requirements:** None. Optionally a one-line example of each mode (reliable: "write a SQL query that joins these two tables on user_id"; unreliable: "explain why our churn went up last quarter").
- **Important evidence / sources:**
  - No specific citation required; the framework is original synthesis.
  - Optionally reference general LLM evaluation literature (e.g., HELM) — cite only if verified.
- **Key conclusions:**
  - Reliable: SQL generation from a schema, format conversions, code translation, structured extraction with a known schema. The output has a right answer; you can check it.
  - Use with caution: summarization, entity extraction from messy text, code explanation. Useful first draft, requires human review.
  - Unreliable: interpreting why a metric moved, deciding whether to ship a feature, recommending a strategy. The output is a judgment call; the LLM has no business context you didn't give it, and will produce confident-sounding answers regardless.
  - The test: can you write down what a correct answer looks like before you ask? If yes, the LLM can probably help. If no, the LLM will produce a fluent hallucination.
- **Important limitations:**
  - LLM capabilities evolve; the quadrant moves over time. The structural argument (well-defined output is easier than ambiguous output) does not.
  - Reliability assumes the user can verify the output. If you can't verify, even "reliable" tasks are unsafe.
- **Writing angle:** Open with the scenario — "the LLM wrote me a beautiful explanation of why churn went up; none of it was grounded in my data." Walk the quadrant. End with the test: if you can't specify what a correct answer looks like, don't ask the LLM to produce one.
- **Files / assets to create:** The post file. Chart already exists.

---

## Final checklist for the implementer

For each post:

1. Frontmatter matches the convention for the target directory exactly.
2. `date` field is the 15th of the target month (YYYY-MM-DD).
3. `permalink` for `_posts` is `/posts/YYYY/slug/` where YYYY is the year of the post date.
4. `image` field points to the chart that was already generated.
5. First one or two lines create curiosity — no "data is everywhere" openings.
6. At least one of: non-obvious insight, quantitative example, useful framework, technical nuance, counterintuitive result.
7. Distinguish observed fact, calculated result, interpretation, hypothesis, opinion.
8. Include limitations when they materially affect interpretation.
9. No invented citations, statistics, business results, or personal experiences.
10. No AI tells (game changer, in today's data-driven world, unlock the power of, etc.).
11. Image embed uses the project's `<img>` pattern with `relative_url` filter.
12. Simple English, short sentences, common words.
