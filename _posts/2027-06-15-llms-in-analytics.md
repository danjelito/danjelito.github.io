---
title: "Where LLMs Help in Analytics and Where They Silently Fail"
excerpt: "LLMs work when the output is well-defined and the input is structured. They fail when the output is a judgment call."
image: /images/blog_posts/llm-task-reliability.png
date: 2027-06-15
permalink: /posts/2027/llms-in-analytics/
featured: false
tags:
  - AI
  - LLMs
  - Analytics
---

<img
  src="{{ '/images/blog_posts/llm-task-reliability.png' | relative_url }}"
  alt="Two-dimensional quadrant chart plotting common analytics tasks by input structure and output definition, colored by LLM reliability"
  style="width: 100%; max-width: 700px; height: auto; display: block; margin: 1em 0;"
/>

An analyst asks an LLM to explain why churn went up last quarter. The LLM produces a confident, well-written explanation: customers are leaving because of pricing changes, increased competition, and a poor onboarding experience. The explanation is fluent. It's also entirely invented. The LLM has never seen the company's data, has no access to its pricing history, and has no idea what its onboarding flow looks like. It produced a plausible-sounding answer because that's what LLMs do when asked a question without grounding.

The core problem with using LLMs in an analytics workflow isn't that they're unreliable in general. They're unreliable in a specific situation: when the output is a judgment call and the input is ambiguous. They're reliable in a different situation: when the output has a well-defined form and the input is structured. Knowing which situation you're in decides whether the LLM helps or hurts.

## 1. The Invented Explanation

LLMs get conflated into a single capability. They're not a single capability. They're a family of behaviors that share an interface. Some of those behaviors are robust. Some aren't. Treating them as one thing produces two failure modes: dismissing LLMs entirely because of one bad experience, or trusting them entirely because of one good experience. Both are wrong.

The useful question is: which tasks in an analytics workflow are LLMs good at, and which are they bad at? The answer maps onto two properties of the task.

## 2. Two Properties That Decide Reliability

**Input structure.** Is the input well-structured (a schema, a known format, a typed list) or unstructured (prose, a vague question, an open-ended brief)? Structured inputs give the model less room to invent. Unstructured inputs require the model to fill in context it doesn't have.

**Output definition.** Does the output have a well-defined correct form (a SQL query, a JSON object, a regex pattern, a translation) or an ambiguous form (an explanation, a recommendation, a strategy)? Well-defined outputs can be checked. Ambiguous outputs can't, because there's no single right answer to check against.

Plot any analytics task on these two axes and the reliability falls out.

- **Structured input, well-defined output**: reliable. SQL generation from a schema, format conversion, code translation, regex authoring, structured extraction with a known schema. The model can produce a correct answer; you can verify it.
- **Unstructured input, well-defined output**: mostly reliable. Entity extraction from a document, classification with a known label set, summarization with a fixed structure. The output form constrains the model and gives you a check.
- **Structured input, ambiguous output**: use with caution. "Explain why this query returned these results" or "summarize the trend in this table." The model's answer is a starting point, not a conclusion. It will sound more confident than the evidence warrants.
- **Unstructured input, ambiguous output**: unreliable. "Why did churn go up?", "should we ship this feature?", "what's our strategy for this segment?" The model has no grounding, no access to your data, and no way to be wrong. It will produce a fluent answer regardless of whether the answer is true.

The chart at the top of this post plots eight common analytics tasks on these two axes. The pattern is consistent: reliability rises with output definition and with input structure.

## 3. A Simple Test

Before asking an LLM to do something, write down what a correct answer would look like. Not in vague terms. In specific terms.

- "Generate a SQL query that joins `customers` and `orders` on `customer_id`, filters orders to 2027, and returns `customer_id, SUM(order_amount)`. The query should run against the schema I provided." A correct answer is a query that runs and returns those columns. You can check it.
- "Summarize this research paper in 200 words, covering the hypothesis, the method, the sample size, and the main effect size." A correct answer is 200 words containing those four elements. You can check it.
- "Explain why our churn went up last quarter." A correct answer is... what? An explanation that names a cause? An explanation that names the right cause? An explanation that names the right cause and rules out alternatives? There's no check. The model can't fail. So the model can't be trusted.

The test: if you can't specify what a correct answer looks like before you ask, don't ask the LLM to produce one. It will produce something. The something will sound right. You won't be able to tell whether it's right, and neither will the model.

## 4. Where They Help

There are two ways to use an LLM in an analytics workflow, and they map onto the two reliable quadrants.

**As a code generator.** The LLM writes SQL, Python, R, regex, transformations. You review the code and run it. The output is well-defined; the input is structured (a schema, a spec, a test case). This is where LLMs save the most time. They turn a clear spec into working code faster than typing it. They're not perfect: they make join-grain mistakes, they invent columns, they write queries that run but answer the wrong question. But the mistakes are checkable by running the code.

**As a structured extractor.** The LLM takes unstructured text (a PDF, a transcript, a field note) and returns a structured object (a JSON with known fields, a classification with a known label set). The output is well-defined; the input is unstructured. This is where LLMs do work that was previously impossible at scale. They pull signal out of text that no SQL query could touch. They still make mistakes: they miss entities, they misclassify edge cases. But the mistakes are checkable by sampling.

## 5. Where They Fail

Using the LLM as a decision-maker doesn't work. "Should we ship?", "what should we do about this segment?", "is this model good enough?" are judgment calls. The LLM has no business context you didn't give it, no access to your data, and no consequences for being wrong. It will produce a confident answer that reflects the phrasing of your prompt more than the state of your business.

Code generation and structured extraction are real productivity gains, and they get better every quarter. The implicit assumption that breaks things is: because LLMs are good at one thing in the workflow, they're good at everything in the workflow. They aren't. The same model that writes excellent SQL will write a fluent and invented explanation of why your churn went up. One is a tool. The other is a liability. Knowing which is which is the skill.

## 6. What This Changes in Practice

- Map the task before reaching for the model. Is the output well-defined? Is the input structured? If both, the LLM is likely to help. If neither, the LLM is likely to produce a confident hallucination.
- For code generation, always run the output. A SQL query that looks right and a SQL query that runs right are different things. Run it against a test set, check the row count, check the join grain.
- For extraction, sample and check. Take 50 outputs, check them by hand. If the error rate is acceptable, use it. If not, improve the prompt, the schema, or the model. Don't scale an extractor you haven't sampled.
- For judgment calls, don't use the LLM as the decider. Use it as a brainstormer, a drafter, a pattern-finder. Then make the decision yourself, with the data.
- The test is specification. If you can specify what a correct answer looks like, the LLM can probably produce one. If you can't, the LLM will produce something anyway, and you won't be able to tell whether it's right.

## Limitations

- LLM capabilities move. The quadrant shifts as models improve. The structural argument, that well-defined outputs are easier than ambiguous outputs and structured inputs are easier than unstructured inputs, doesn't move. It's a property of the task, not the model.
- Reliability assumes the user can verify the output. If you can't verify, even "reliable" tasks are unsafe, because you won't catch the model's mistakes.
- The map above is for current LLMs used as standalone tools. LLMs embedded in agentic systems, with tool use and retrieval over your actual data, change the picture for some tasks in the upper-right quadrant. They don't change the picture for the lower-right: an LLM with tools is still not a decision-maker, it's a decision-support layer.