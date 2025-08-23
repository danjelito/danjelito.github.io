---
title: "CompVis: Exercise Rep Tracker"
excerpt: "A computer vision-based system that tracks bicep curl repetitions by analyzing joint angles in real time.<br/><img src='/images/projects/exercise-tracker.png' style='max-width: 100%; height: auto; margin-top: 12px;'>"
collection: portfolio
---

<img 
  src="{{ '/images/projects/exercise-tracker.png' | relative_url }}" 
  alt="Exercise tracker" 
  style="width: 100%; max-width: 600px; height: auto; display: block; margin: 1em 0;" 
/>

This system allows us to count the repetitions of bicep curls by first detecting joints, calculating the angles between joints, and then inferring the exercise phase based on changes in the angles.

[See project on GitHub](https://github.com/danjelito/exercise-tracker)