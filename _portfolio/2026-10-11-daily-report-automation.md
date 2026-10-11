---
title: "Automating a Daily Report Exposed the Numbers We Never Really Defined"
category: "Business Intelligence"
image: /images/projects/daily-report-automation/data-sources.png
excerpt: "The real work in report automation is not the code. It is forcing every metric definition into the open."
tools:
  - Python
  - Google Sheets API
  - Playwright
  - Automation
collection: portfolio
featured: false
---

We automated a daily marketing report that someone used to update manually every morning.

The goal was simple: collect data from different sources, calculate the metrics, and write everything into Google Sheets.

But the most interesting finding had nothing to do with the code. We discovered that several metrics we had been reporting for months did not have a single, clearly defined calculation.

## The reporting process

Every morning, the report adds an 18-row block to a monthly Google Sheets tab. It covers traffic, leads, SQL, appointments, shows, enrollments, cost per show, and cost per enrollment.

The data comes from five places: GA4, a CRM, another tracker sheet, an ads platform, and a daily summary email. In total, that means retrieving 13 metrics before writing anything to the report.

We built a Python script to retrieve all 13 metrics and update the sheet. It also saves a screenshot of each metric's source, so we can trace any number back to where it came from without having to reproduce the entire process.

<img
  src="{{ '/images/projects/daily-report-automation/data-sources.png' | relative_url }}"
  alt="The AI agent driving the user's live Chromium browser session to read data from the source systems"
  style="width: 100%; max-width: 700px; height: auto; display: block; margin: 1em 0;"
/>

Some sources provide clean APIs. Others are only accessible through a logged-in browser session. For those, the script connects to the user's running Chromium session through CDP and interacts with the actual interface.

This approach avoids setting up new OAuth connections or requesting additional admin access. The screenshots also provide an audit trail for the numbers we collect.

<img
  src="{{ '/images/projects/daily-report-automation/playbook.png' | relative_url }}"
  alt="Playbook document listing the architecture decisions and their rationale"
  style="width: 100%; max-width: 700px; height: auto; display: block; margin: 1em 0;"
/>

Before writing the code, we documented the architecture and the reasoning behind each decision in a living playbook. It covers which sources use a service account, which require browser automation, and which metrics can be calculated directly in the sheet without fetching additional data.

The playbook also gives us a place to document changes. If a rule changes, we update the documentation first.

## Automation forces us to define our metrics

Manual reporting makes it easy to overlook ambiguity. When something does not quite add up, the person preparing the report can make a judgment call and move on.

A script cannot make those decisions unless we explicitly tell it what to do.

Once we started automating the report, several inconsistencies became difficult to ignore.

Here are three examples from the first week.

**1. A hardcoded adjustment with no clear explanation**

The SQL row in the sheet used this formula:

`=gross_lead - sum(3,1,1)`

Nobody could explain why we were subtracting 5.

After investigating, we found the actual business rule: SQL = gross leads minus unqualified leads minus leads not sent to the CRM.

We replaced the unexplained adjustment with the explicit calculation.

The issue was not the formula itself. It was that the logic behind a business metric had never been properly documented.

**2. The same metric returned different numbers throughout the day**

October month-to-date gross leads showed 1,055, then 1,043, then 1,028, and finally 1,027, all on the same day.

The CRM continues to update records after submission, so the number can change even when we are looking at the same reporting period.

This means "yesterday's leads" is not necessarily a fixed number. The result depends on when the data is retrieved.

Our manual report showed 1,041. A live check returned 1,040, while the script returned 1,027.

Without a defined reporting cutoff, there is no reliable way to determine which number should be used for comparison.

**3. Historical ad spend can change**

We also found that ad spend for a given date could change by several thousand rupiah after the initial entry.

The ads platform revises its reported figures, so retrieving the same date later can produce a different result.

This matters when comparing a historical report against the current source. A difference does not automatically mean someone entered the wrong number.

None of these behaviors had been documented before. The automation brought them to light within a week.

## Verification matters more than the code

We did not want to assume the script was correct just because it ran successfully.

We first ran it against a test tab and compared every cell with the manual report. The initial comparison found 173 differences.

After fixing two actual bugs, 20 differences remained. These could all be traced to three genuine gaps in our metric definitions, including the unexplained SQL adjustment.

<img
  src="{{ '/images/projects/daily-report-automation/report-scaffold.png' | relative_url }}"
  alt="report.py source showing the double-run guard that refuses to write a date that already exists"
  style="width: 100%; max-width: 700px; height: auto; display: block; margin: 1em 0;"
/>

We also added several safeguards based on a simple question: what happens when something goes wrong?

- If any data reader fails, the script stops before writing anything to the sheet. This prevents a partially completed report.
- If the report for a date already exists, the script refuses to run again for that date.
- The CRM count retrieved by the script is compared against the count shown in the interface. A mismatch triggers a warning.
- Every metric has a source screenshot labeled with the date, metric, value, and URL.

These safeguards are not particularly complicated. But they make the process easier to verify and reduce the risk of silently publishing incorrect numbers.

## The important distinction

The script follows its own documented calculation rules, and we can verify the source data using screenshots. Yet it still differs from the manual report by 14 leads.

That difference is the finding, not necessarily a bug.

Before automation, two people could report different numbers and both believe their figures were correct. There was no clear way to identify where the difference came from.

Now we can see the discrepancy, measure it, and investigate the reason.

That is a meaningful improvement even before considering the time saved by automation.

## What this means in practice

- **Define metrics before automating them.** If the calculation depends on undocumented assumptions, the script will simply make those assumptions harder to change.
- **Treat manual reporting as a process that needs to be standardized.** If people are repeatedly copying numbers from different systems, there may be undocumented judgment calls happening every day.
- **Keep an audit trail.** When someone questions a number, being able to show its source is much more useful than asking them to trust the report.
- **Expect discrepancies during the first run.** Each difference needs to be investigated. It could be a coding bug, a difference in timing, or an undefined business rule.
- **Document when the data was retrieved.** If the source system can revise historical data, the reporting timestamp is part of the context needed to interpret the number.

## Takeaway

The biggest challenge in report automation is often not writing the code. It is making sure everyone agrees on what the numbers actually mean.

A metric that changes depending on when you retrieve it needs more than a calculation formula. It also needs a clear reporting cutoff and a documented source.

And the first automated run is valuable for more than the hours it saves. It gives us a concrete way to identify inconsistencies that manual reporting has allowed us to overlook.
