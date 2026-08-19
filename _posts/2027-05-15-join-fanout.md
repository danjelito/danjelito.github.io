---
title: "The JOIN That Inflated Your Average by 28 Percent"
excerpt: "AVG(revenue) returns different numbers depending on whether you JOIN before or after the aggregate. The difference is biased."
image: /images/blog_posts/join-fanout-bias.png
date: 2027-05-15
permalink: /posts/2027/join-fanout/
featured: false
tags:
  - SQL
  - Data Engineering
  - Analytics Engineering
---

<img
  src="{{ '/images/blog_posts/join-fanout-bias.png' | relative_url }}"
  alt="Two-bar chart comparing the true per-customer average revenue with the average revenue computed over a joined table, showing a 28.5 percent inflation"
  style="width: 100%; max-width: 700px; height: auto; display: block; margin: 1em 0;"
/>

Two analysts pull revenue from the same warehouse. Same `customers` table. Same `orders` table. Same week. Different numbers. The first reports average revenue per customer at $50.54. The second reports it at $64.95. Both queries run without error. Both return a single number. The second number is 28.5% higher.

Nobody changed the data. Nobody filtered anything. The difference is structural: the second analyst computed AVG over a joined table, and the join fanned out. The same metric, computed two valid ways, produces two different numbers. The larger number is wrong, and SQL doesn't warn you.

## 1. Two Analysts, Two Numbers

A one-to-many JOIN changes the unit of analysis. Before the join, each row is a customer. After the join, each row is a customer-order pair. A customer with 5 orders appears 5 times. A customer with 1 order appears once.

Aggregates computed on the joined table are weighted by the number of child rows. `AVG(revenue)` over the joined table isn't the average revenue per customer. It's the average revenue per order, weighted by the customer's revenue on every order row. When high-revenue customers place more orders, the joined average is inflated. When low-revenue customers place more orders, it's deflated. Either way, it's not what you wanted.

## 2. The Wrong Form, The Right Form

I simulated 2,000 customers. Each has a revenue drawn from a gamma distribution with mean $50. Each places a number of orders drawn from a Poisson whose mean rises with revenue: high-revenue customers place more orders, which is realistic.

```python
import numpy as np
np.random.seed(11)
n = 2000
revenue    = np.random.gamma(2.0, 25.0, n)            # mean ~$50, skewed
n_orders   = np.random.poisson(1 + revenue / 30.0)    # richer customers order more

true_avg   = revenue.mean()
joined_avg = np.repeat(revenue, n_orders).mean()
# true_avg   = $50.54
# joined_avg = $64.95   (+28.5%)
```

No revenue value changed. We just repeated each customer's revenue on each of their order rows. The average over the joined rows is 28.5% higher than the average over the customers.

The inflation isn't a bug in the database. It's the correct answer to a different question. "What's the average revenue per order row?" is a real question, and $64.95 is the correct answer to it. "What's the average revenue per customer?" is a different question, and $50.54 is the correct answer to that one. Mixing them up is the bug.

The wrong form:

```sql
SELECT AVG(c.revenue) AS avg_revenue
FROM   customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id;
```

This computes `SUM(c.revenue * n_orders(c)) / SUM(n_orders(c))`. Each customer's revenue is weighted by how many orders they have. The result is biased toward high-order customers.

The right form, aggregating before joining:

```sql
SELECT AVG(c.revenue) AS avg_revenue
FROM   customers c;
```

Or, if you need fields from the orders table for filtering:

```sql
WITH qualifying_customers AS (
  SELECT DISTINCT c.customer_id, c.revenue
  FROM   customers c
  JOIN   orders o ON o.customer_id = c.customer_id
  WHERE  o.order_date >= '2027-01-01'
)
SELECT AVG(revenue) AS avg_revenue
FROM   qualifying_customers;
```

Or, if you must join and then aggregate, use `SUM` over `COUNT(DISTINCT)` and know what you're measuring:

```sql
SELECT SUM(c.revenue) / COUNT(DISTINCT c.customer_id) AS avg_revenue_per_customer
FROM   customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id;
```

`COUNT(DISTINCT)` in the denominator undoes the fan-out, but only for sums. For `AVG`, the row weighting has already happened inside the function. There's no SQL hint that turns `AVG` over a fanned-out table back into a per-parent average. You have to write the right query in the first place.

## 3. Why AVG Inflates

`AVG(x)` is `SUM(x) / COUNT(*)`. The `COUNT(*)` counts rows in the joined table, not rows in the parent table. When the join multiplies rows, the count inflates. The sum inflates too, by the same factor on average if the join is random, but in real data the join is never random: high-revenue customers place more orders, so they get more rows, so the sum inflates more than the count, so the average inflates.

The same trap hits any aggregate over a joined table: `AVG`, `SUM` used as a rate, `COUNT(*)` used as a denominator. `MIN`, `MAX`, and `COUNT(DISTINCT parent_id)` are immune. So is `SUM` when what you want is the total, but only if the parent value should be counted once per child, which is rarely what you want.

## 4. Aggregate Before You Join

The question "what's the average revenue per customer?" is a question about the parent table. The question "what's the average revenue per order?" is a question about the child table. The join is the wrong place to answer either.

A clean rule: aggregate before you join, not after. Compute per-customer metrics on the customers table, per-order metrics on the orders table, and join the results. The join then has nothing to fan out, because both sides are already at the parent grain.

When you can't avoid joining first (usually because the filter requires fields from both tables), use `COUNT(DISTINCT)` in the denominator and write the numerator as a `SUM` of a per-parent aggregate, not as `AVG` of a column.

## 5. What This Changes in Practice

- `AVG` over a one-to-many join is a per-row average, not a per-parent average. The two differ whenever child counts correlate with the metric.
- The bias is silent. SQL doesn't warn you. The query returns a number, the number is wrong, and the wrongness depends on the shape of the data, not the syntax.
- Aggregate before joining. If you must join first, use `SUM(...) / COUNT(DISTINCT parent_id)`, and understand what that denominator means.
- Test new aggregate queries against a known small subset. Pick ten customers, compute the metric by hand, and compare. If the SQL gives a different number, you have a grain problem.
- Add a row-count assertion to your pipeline. If `SELECT COUNT(*) FROM customers` is 2,000 but `SELECT COUNT(*) FROM customers LEFT JOIN orders` is 9,873, any aggregate over the joined table is at the wrong grain for a per-customer question.

This is probably the most common silent bug in analytics SQL. And the annoying part is that it never errors. Two analysts, same warehouse, one wrong number nobody can explain. The fix is boring: know the grain of your question and write the query at that grain.

## Limitations

- The 28.5% inflation figure is specific to this simulation. The real bias depends on how strongly child counts correlate with the parent metric. The direction (inflation when high-metric parents have more children) is general; the magnitude isn't.
- This post covers one-to-many joins. Many-to-many joins are worse: they can both inflate and duplicate, sometimes in ways that cancel and hide the bias.
- Aggregate-before-join is a clean default, but it can be expensive on large tables. In production pipelines, materializing per-parent aggregates in a separate model is cheaper than re-running the join every time.