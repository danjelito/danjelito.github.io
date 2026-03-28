---
title: "Why Democracy Is Mathematically Impossible"
date: 2026-03-28
permalink: /posts/2026/democracy.md/
tags:
    - politics
---

<img 
  src="{{ '/images/blog_posts/election-sim.png' | relative_url }}" 
  alt="Election simulation" 
  style="width: 100%; max-width: 600px; height: auto; display: block; margin: 1em 0;" 
/>

Yesterday I watched an excellent [Veritasium video](https://www.youtube.com/watch?v=qf7ws2DF-zk) about how democracy is mathematically impossible. It impressed me so much that I built a [simulation](https://election-sim.streamlit.app/) to explore and illustrate the idea myself. Along the way, I realized how counterintuitive voting systems can be, and how even “fair” methods can produce surprising (and sometimes troubling) outcomes.

In this post, I’ll walk through the different voting methods discussed in the video, explain how they work, and show why each of them can fail under certain conditions. You can also try the simulation yourself to see these paradoxes in action.

Here are the voting variations mentioned, along with their explanations and why they can fail:

## Election Systems

### 1. First Past the Post

- **How it works:** Each voter picks their favorite candidate. The candidate with the most votes wins.
- **Problem:** It can ignore what most people want overall.
- **Example of failure:** Imagine three candidates: Molly, Darrow, and Mamoru.
    - Molly gets 40% of votes
    - Darrow gets 35%
    - Mamoru gets 25%
    - Molly wins, even though 60% of voters actually prefer someone else over him (Darrow's + Mamoru's voters).

### 2. 50%+1 Voting

- **How it works:** A candidate must get more than 50% of votes to win. If no one does, the lowest-ranked candidates are eliminated and voting is repeated.
- **Problem:** If no one gets a majority, this process can take several rounds, which is slow and expensive. 
- **Example of failure:** Suppose 3 candidates: Molly, Darrow, and Mamoru. 
    - Round 1 votes: 
	    - Molly 40%
	    - Darrow 35%
	    - Mamoru 25% 
	    - → No majority.
	    - Mamoru is eliminated.
    - Imagine that Molly and Mamoru have very conflicting views, whereby Darrow is moderate. Therefore, Molly's voters prefer Darrow to Mamoru.
    - Round 2 votes: 
	    - Molly 40%
	    - Darrow 60% 
	    - → Darrow wins.  
	- The first round result (Molly leading) does not reflect who actually ends up winning, which can feel unfair.

### 3. Instant Runoff

- **How it works:** Voters rank candidates. If no one has a majority, the candidate with the fewest votes is eliminated, and their votes go to the next choice on those ballots. Repeat until someone gets 50%+1.
- **Problem:** It can violate _monotonicity_, meaning doing worse in the first round can sometimes help a candidate win, and vice versa.
- **Example of failure:** Three candidates: Molly, Darrow, and Mamoru. Molly and Mamoru have conflicting views, while Darrow is moderate.
	- Case 1:
	    - First round
	        - Molly 25%
	        - Darrow 30%
	        - Mamoru 45%
	        - Molly is eliminated
	    - Second round
	        - Because Molly's supporters prefer Darrow over Mamoru, all Molly supporters choose Darrow
	        - Darrow 30% + 25% = 55%
	        - Mamoru 45%
	        - Darrow wins
	- Case 2:
	    - First round
	        - Mamoru has a terrible campaign speech, and some supporters move to Molly
	        - Molly 25% + 6% = 31%
	        - Darrow 30%
	        - Mamoru 45% - 6% = 39%
	        - Darrow is eliminated
	    - Second round
	        - Because Darrow's supporters are moderate, they split in half
	        - Molly = 31% + (30% / 2) = 46%
	        - Mamoru = 39% + (30% / 2) = 54%
	        - Mamoru wins. Mamoru doing worse in the first round (compared to Case 1) makes him win.

### 4. Borda Count

- **How it works:** Voters rank candidates. Each rank gives points (e.g., 1st = 3 points, 2nd = 2 points, 3rd = 1 point). The candidate with the highest total points wins.
- **Problem:** It can be affected by irrelevant alternatives. Adding a candidate nobody expects to win can change the result.
- **Example of failure:** Imagine an election between two candidates, **A** and **B**, with 10 voters.

**Step 1: Two candidates (A and B)**

| Voter | 1st choice (1 point) | 2nd choice (0 points) |
| ----- | -------------------- | --------------------- |
| 1     | A                    | B                     |
| 2     | A                    | B                     |
| 3     | A                    | B                     |
| 4     | A                    | B                     |
| 5     | A                    | B                     |
| 6     | A                    | B                     |
| 7     | B                    | A                     |
| 8     | B                    | A                     |
| 9     | B                    | A                     |
| 10    | B                    | A                     |

**Points (1st = 1 pt, 2nd = 0 pts)**

- A: 6×1 + 4×0 = **6 pts**
- B: 4×1 + 6×0 = **4 pts**

**Winner:** A

**Step 2: Add a third candidate, C (similar to B)**

Voters now rank:

- 6 voters who like A: **A > B > C**
- 4 voters who liked B: **B > C > A**

| Voter | 1st (2 points) | 2nd (1 point) | 3rd (0 points) |
| ----- | -------------- | ------------- | -------------- |
| 1     | A              | B             | C              |
| 2     | A              | B             | C              |
| 3     | A              | B             | C              |
| 4     | A              | B             | C              |
| 5     | A              | B             | C              |
| 6     | A              | B             | C              |
| 7     | B              | C             | A              |
| 8     | B              | C             | A              |
| 9     | B              | C             | A              |
| 10    | B              | C             | A              |

**Points (1st = 2 pts, 2nd = 1 pt, 3rd = 0 pts)**

- **A:** (6×2) + (4×0) = 12 pts
- **B:** (6×1) + (4×2) = 6 + 8 = 14 pts
- **C:** (6×0) + (4×1) = 4 pts

**Result:** B wins, even though the majority still prefers A over B.

**Key Idea:** Adding a “clone” candidate (C) can shift points and change the winner—this is called the **irrelevant alternative problem** in Borda Count.

### 5. Condorcet Method

- **How it works:** A candidate wins if they beat every other candidate in one-on-one matchups.
- **Problem:** Can create a **Condorcet Paradox**: no clear winner because preferences form a cycle.
- **Example of failure:** Three food choices: Burger, Pizza, Sushi.
    - Group 1: Burger > Pizza > Sushi
    - Group 2: Pizza > Sushi > Burger
    - Group 3: Sushi > Burger > Pizza  
        Here, Burger beats Pizza, Pizza beats Sushi, Sushi beats Burger → No winner.

### 6. Approval Voting

- **How it works:** Voters mark all candidates they find acceptable. The candidate with the most marks wins.
- **Problem:** While simpler and less prone to paradoxes, it hasn’t been tested in large government elections. Also, Arrow’s theorem says no system is perfect.

## Summary 

There’s no perfect voting system; only trade-offs.

What feels fair on the surface can break in subtle ways, and different methods can produce completely different winners from the same set of preferences. That’s what makes this topic so fascinating.

Play around with the simulation and see for yourself.
