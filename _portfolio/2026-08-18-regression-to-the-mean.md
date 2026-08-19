---
title: "When Worst Becomes Better: Regression to the Mean in Business Metrics"
category: "Statistics"
image: /images/projects/regression-to-the-mean/scatter_regression.png
excerpt: "The bottom 10% almost always looks better next month. That does not mean your intervention worked."
tools:
  - Python
  - Statistics
collection: portfolio
featured: false
---
<img
  src="{{ '/images/projects/regression-to-the-mean/scatter_regression.png' | relative_url }}"
  alt="Scatter of standardized previous score versus standardized exam score with the regression line much shallower than the diagonal"
  style="width: 100%; max-width: 700px; height: auto; display: block; margin: 1em 0;"
/>

I've seen this play out a hundred times.

A sales manager pulls the bottom 10% of reps aside for coaching. Next month, most of them improve. The manager writes a success story. The coaching probably did nothing.

A support team flags the worst 5% of ticket resolution times, reviews the process, and the times drop. Another win. Also probably nothing.

A school runs extra sessions for the lowest-scoring students. Next exam, those students score higher. The program gets adopted. Still probably nothing.

All three are regression to the mean. And it's strong enough to produce the entire "improvement" by itself. Here's why.

## 1. What Regression to the Mean Actually Is

Regression to the mean is a boring-sounding statistical fact with a huge practical bite: extreme observations tend to be less extreme the next time you measure them.

The student who scored the lowest in the class is likely to score closer to the average next time. The rep who had the worst month is likely to have a more typical month next. This isn't magic. It's what happens whenever the correlation between two measurements is less than 1, which in real data it almost always is.

The mechanism is simple. An extreme value is usually extreme for two reasons: a real underlying trait, and luck. The luck part doesn't repeat. So the next measurement drifts back toward the trait.

And here's the trap. We pick the worst, we "do something," the worst gets better, and we conclude the something worked. We read regression as improvement.

## 2. What the Student Data Shows

I had a student-performance dataset locally that illustrates this perfectly. Two test scores per student: a `Previous_Scores` value and a later `Exam_Score`. Both on a 0-100 scale. About 6,600 students after dropping rows with impossible values.

The correlation between the two scores is **r = 0.17**. That means the prior score explains about 3% of the variance in the next score. The other 97% is everything else: sleep, attendance, motivation, luck, the specific questions on the exam, how the student felt that day.

Now look at what that weak correlation does to extremes.

Students in the bottom decile of previous scores averaged **52.7** on the prior test. On the next test, they averaged **66.2**. That's a 13.5-point jump. Anyone running an intervention on these students would claim credit.

Students in the top decile of previous scores averaged **97.7** on the prior test. On the next test, they averaged **68.3**. That's a 29-point drop. Nobody would claim they broke these students. But by the logic of the first story, they did.

The overall mean on the next exam was **67.2**. Both extremes moved toward it. The bottom got better. The top got worse. Neither had to.

Three things worth taking from this:

1. The bottom decile's 13.5-point gain is not a gain. It's what you should expect from a group selected for being extreme on a noisy measurement. The same regression, in reverse, hit the top decile.
2. The signal is real but small. Prior score does predict next score, weakly. The top decile still beats the bottom decile on average (68.3 vs 66.2, a 2-point gap). The question is whether you can close that 2-point gap, not whether you can produce a 13-point jump.
3. The more extreme your selection, the larger the apparent effect. Pick the bottom 1% and the "improvement" looks even more impressive, because the worse the selected group looks, the more regression there is to do.

## 3. The Math Behind It

The expected value of the next score, given a prior score, is:

```
E[exam | previous] = mean_exam + r * (sd_exam / sd_previous) * (previous - mean_previous)
```

With r = 0.17, sd_exam ≈ 3.9, sd_previous ≈ 14.4:

```
E[exam | previous] = 67.2 + 0.17 * (3.9 / 14.4) * (previous - 75)
                  = 67.2 + 0.047 * (previous - 75)
```

The slope is 0.047. For every 1 point of prior score, the next score moves by less than 0.05 points.

So a student who scored 100 previously is expected to score 67.2 + 0.047 × 25 = **68.4** on the next exam. Not 100. A student who scored 50 previously is expected to score 67.2 + 0.047 × (-25) = **66.0**. Not 50.

The full 50-point range of previous scores collapses to a 2.4-point range of expected exam scores. That's regression to the mean, computed directly from the data.

<img
  src="{{ '/images/projects/regression-to-the-mean/decile_collapse.png' | relative_url }}"
  alt="Paired bars showing the 45-point gap in mean previous scores across deciles collapsing to a 2-point gap in mean exam scores"
  style="width: 100%; max-width: 700px; height: auto; display: block; margin: 1em 0;"
/>

## 4. Why Your Intervention "Works"

Here's the part that makes this genuinely dangerous in business.

Regression to the mean does not mean interventions don't work. It means you cannot evaluate them by looking only at the selected group. And that's exactly what most programs do.

The fix is a control group. Take the bottom 10%, randomly split them, coach one half, leave the other half alone, compare next-month scores. If coaching adds anything beyond regression, you'll see it in the difference between the two groups. If you can't run a control, track the gap between the selected group and a non-selected comparison group over time. Both regress at the same rate? Your intervention is doing nothing. The selected group regresses faster, or past the mean? Now you have signal.

What you should never do is compare the selected group to itself before and after and call the difference an effect. That's not an evaluation. That's arithmetic.

## 5. What This Changes in Practice

- Any program that selects on a low extreme and reports improvement is suspect until you see a control. Coaching programs, remedial courses, performance improvement plans, retention campaigns aimed at high-risk customers, wellness programs aimed at the sickest employees. All of them.
- The more extreme the selection criterion, the larger the regression effect, and the more impressive the false win.
- The noisier the measurement, the stronger the regression. A single test, a single month, a single survey. That's where it bites hardest.
- Randomized control is the only clean fix. Without it, you're measuring the math, not the intervention.

The frustrating thing is that regression to the mean punishes the people doing real work. The genuinely good coaching program gets diluted by the same math that makes the do-nothing program look great. The only way to tell them apart is a control group. Nobody wants to hear that, because control groups are slow and boring. But the alternative is confidently measuring nothing.

## Sources

- Galton, F. (1886). *Regression towards mediocrity in hereditary stature.* The Journal of the Anthropological Institute of Great Britain and Ireland, 15, 246-263.
- Kahneman, D. (2011). *Thinking, Fast and Slow.* Farrar, Straus and Giroux. The chapter on the Israeli flight instructors is the clearest example I know: instructors who punished bad landings saw improvement, instructors who praised good landings saw deterioration, and the instructors concluded that punishment works and praise doesn't. The real mechanism was regression. It's the same story as this post, told with pilots instead of students.