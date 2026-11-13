# Writing rules for the AI blog pipeline

Two MIT-licensed projects shape how generated posts are written and checked. Their licenses sit next to this file.

- **stop-slop** by Hardik Pandya (https://github.com/hardikpandya/stop-slop), MIT. `stop-slop/*.md` are copied
  unchanged: the phrase and structure lists that the style lint (`../../style.mjs`) is built from, and the
  before/after examples. The five-dimension score (directness, rhythm, trust, authenticity, density, each out
  of 10) is its scoring method.
- **humanizer** by blader / Siqi Chen (https://github.com/blader/humanizer), MIT. `core.md` is our own short checklist
  distilled from its pattern catalogue (staging instead of stating, rhythm by rule, inflation, formatting by
  rule, chat leftovers), not a copy.

The "LLM Council" method (five advisors, anonymous peer review, chairman) comes from
https://github.com/aiwithremy/claude-skills-llm-council, which has no license, so none of its text is copied:
`../../council.mjs` is an independent implementation of the published method.
