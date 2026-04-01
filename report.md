# App Coding Comparison Report
**CS 846: LLMs for Software Engineering (Winter 2026)**

- **Student Name:** Sofiia Tkach
- **Student ID:** 21237441
- **Date Submitted:** April 1, 2026
- **AI Tools Used in This Report:** GitHub Copilot (GPT 4.1, GPT 5.1), Claude Sonnet

---

## 1. App Description

The app is a microblogging web application (similar flow to Twitter). Users can register and log in, create short text posts (up to 280 characters), view a global feed of all posts sorted by newest first, like and unlike posts, reply to posts (one level deep) and view user profiles. There is no follower system, no private messaging and no reposting. 

The app was built twice: first as a quick vibe-coded prototype (Week 2) and then rebuilt from scratch using structured AI prompting based on course guidelines.

---

## 2. Guidelines Applied and Not Applied

### 2.1 Guidelines Applied

| Guideline | Source (Week / Paper / Blog) | Where / How You Applied It | Observed Effect |
|-----------|------------------------------|----------------------------|-----------------|
| Design a structured context prompt | Week 4 / Ronanki et al. | Every prompt started with a role ("you are a senior engineer"), the tech stack and what the output should look like | Copilot stopped suggesting random solutions - I saw it was investigationg the problem deeply |
| Use Modal Verbs (shall/should/may) | Week 4 / Bradner RFC 2119 | Used it in all prompts where I had more than one function needed to implement | It was a good way to tell what was actually required and where to start what is less important |
| Treat LLM output as draft | Week 4 / Arora et al. | Reviewed every file Copilot generated before moving to the next prompt | Caught some bugs early instead of finding it in more files at once |
| Ban vague words unless quantified | Week 4 / ChatGPT-derived | Wrote "280 characters max" instead of "short posts", "return 401" instead of "handle auth" | Copilot actually used the limits instead of random |
| Separate problem space from solution space | Week 4 | First two prompts were given to LLM to understand context better before implementing | It helped to better understand the context and implement functionality faster with less edits  |
| Break large code into logical sections | Week 5 / Sun et al. | Each prompt covered one thing only: auth then posts then feed then tests | Each generated file was cleaner and easier to review than when I tried to do everything at once |
| Develop a global repo plan from seed file | Week 5 / Bairi et al. | I asked to create folder structure both for front and back before implementation to be more consistent. | Copilot followed the same structure throughout and no random new folders appeared |
| Specify required external libraries | Week 6 / Midolo et al. | Named NextAuth, Winston, bcryptjs explicitly in every relevant prompt | No surprise library choices - Copilot used exactly what I said |
| Specify input type and output format | Week 6 / Midolo et al. | Every API prompt included the TypeScript interface for the request and response | The API was returning the right shape in most cases, less type errors from mismatched fields |
| Work in short iterative cycles | Week 6 / Orosz & Osmani | Split work into: schema → API → UI → tests, one prompt at a time | When something broke it was obvious which step caused it |
| Specify testing goal and scope | Week 9 / Augusto et al. | In test prompts I tried to describe accurately what to test, what framework to use and what NOT to test | Tests did not try to test unrelated things and in general it mostly tested what I expected |
| Generate-validate-repair loop | Week 9 / Yuan et al. | After generating tests: ran them, pasted failures back into the prompt, asked to fix | Stopped wasting time on tests that looked right but silently failed |
| Request boundary and negative cases explicitly | Week 9 / Yang et al. | Listed specific cases in the prompt: empty string, exactly 280 chars, duplicate like | Tests caught real bugs in validation, not just the happy path |
| Structured Copilot instruction file | Week 10 / GitHub Blog | Created `.github/copilot-instructions.md` with rules for security, logging, pagination, tech stack | Did not have to repeat the same rules in every single prompt |
| Restrict to standard logging library | Week 12 / Rodriguez et al. | I asked to "use only Winston from lib/logger.ts, no console.log anywhere" | No console.log in the codebase and all logs go through the same place |
### 2.2 Guidelines Not Applied (and Why)

| Guideline | Source (Week / Paper / Blog) | Reason Not Applied |
|-----------|------------------------------|--------------------|
| Capitalize role identifiers (INTERVIEWER / INTERVIEWEE) | Week 4 / Shen et al., Sclar et al. | This is meant for when you give the LLM a conversation transcript to analyze. I never did that - I just wrote prompts directly, so there was nothing to capitalize. |
| Automated Dependency Management (Dependabot) | Week 10 / Datadog blog | This needs admin access to a GitHub repo and a real deployment pipeline. My app is just a local course project, so setting this up would not actually help with anything. |
| Be Extra Cautious about Binary Executables | Week 10 / Szymanski et al. | My project is just TypeScript files and a JSON file for the database. There are no binaries anywhere, so this guideline simply had nothing to apply to. |

---
**Section 3. Evaluation Criteria:**

| # | Criterion | Description | Why It Matters |
|---|-----------|-------------|----------------|
| 1 | Compilation errors during development | How many times the app failed to compile or threw runtime errors that blocked running the app. Roughly counted. | Fewer errors means the prompts were clearer and Copilot produced more correct code from the start. |
| 2 | Total development time | Roughly how long it took to go from zero to a fully working app with all features. | Shows how much the structured approach actually speeds things up in practice. |
| 3 | How often generated code worked on first try | Rough estimate of how many times Copilot's output could be used without changes vs needed fixes. | Reflects how well the prompts communicated what was needed. Better prompts = less fixing. |
| 4 | Code structure | Whether the project has a clear folder structure with separation between api, components, lib and types. | Good code structure is important makes it easier to find files add features and understand the codebase. |
| 5 | Code readability and consistency | Whether functions are easy to understand, API routes follow the same pattern and the code style is consistent across files. | Inconsistent code is hard to review and maintain. It is important to achieve code of good quality |

---

**Section 4. Comparison:**

| Criterion | Week 2 App | Week 13 App | Justification |
|-----------|-----------|------------|---------------|
| Compilation errors | ~19 errors | ~10 errors | Week 2 had many type errors and missing imports from the start. Week 13 had fewer - mostly the Next.js 15 params Promise bug and Tailwind PostCSS conflict which were quick to trace. |
| Total development time | ~2,5 hours | ~3,5 hours | Week 2 was faster to start but broke often. Week 13 took longer upfront because of structured prompts and reviews but had almost no big surprises at the end. |
| Code worked on first try | ~30% of the time | ~65% of the time | In Week 2 most generated code needed manual fixes. In Week 13 with detailed prompts including types, constraints and edge cases Copilot got it right much more often. |
| Code structure |Good structure, most files separated but some files were too long and it was possible to peparate them more | Clear separation: app/api, components, lib, types folders with one responsibility per file. There aren't so many files with lots of lines of code. | In week 13 prompts I explicitly required a file structure upfront which Copilot then followed. |
| Code readability and consistency | I would say variable names were inconsistent, no clear patterns, some files were not obvious what is inside | All API routes follow the same structure, components have typed props, naming is consistent | I asked him to follow the same code style and also giving Copilot the same role and constraints in every prompt made the output much more uniform.|


## 5. What Worked

Overall I think the Week 13 app turned out significantly better than Week 2 and most of that came down to how I approached prompts.

Structured prompts helped the most. When I gave Copilot a clear role, the exact input and output types and specific constraints, the output was much closer to what I needed compared to Week 2 where I was writing one-liners and hoping for the best.

Breaking work into small steps also made a big difference. When I tried to generate the whole feed page in one prompt it was messy. When I split it into schema then API then UI, - each part was clean and easy to check.

The Copilot instruction file was also useful. Instead of repeating rules like "no console.log" and "validate inputs before any DB call" in every single prompt, I wrote them once in .github/copilot-instructions.md and Copilot followed them throughout the project.

Reviewing every file before moving to the next prompt also saved me time. In Week 2 I was using code without reading it and then spending a lot of time debugging. And now also because of better prompts I had less errors to fix and more often generated code worked on first try. In general I am satisfied with app that I created now using GPT-4.1 model. 

---

## 6. What Did Not Work

Even with all prompts I learned, some things still did not work as expected.

First of all I will mention that optimizing for worst-case input size caused more problems than it solved. When I told Copilot to assume 100,000 users and posts it generated overly complex solutions with extra abstractions that were not needed for a small course project. This actually caused more compilation errors and made the code harder to debug than if I had just kept it simple.

Even with exact tool and workflow commands in the prompt, Copilot sometimes used wrong import paths or syntax that did not match the actual Next.js 16 version I was running. I had to manually fix those after each generation which was annoying.

Breaking work into small iterative steps took more time than I expected. In theory it makes sense but in practice writing 20 separate prompts for one app felt slow, especially for smaller features where one prompt would have been enough.

For tests, asking explicitly for boundary and negative cases sometimes led to Copilot generating five slightly different versions of the same test. Also in some cases, even though I described what and how to test - it skipped other smaller files that also needed testing.

Counterexample-first prompting also did not work as well as I hoped. The counterexamples Copilot came up with were often unrealistic or too obvious, so the tests written from them were not that useful in practice.

---

## 7. Reflection

This course improved my knowlegge how to approach AI tools. Before I was just re-prompting Copilot until something worked without really understanding why. Now I see that it is much more about how I communicate the problem than about the tool itself.

The biggest shift was realizing that reviewing AI output is not optional - and is a must do thing. Before I trusted Copilot (and other models) too much and merged code without really reading it. That made debugging really painful - vibe coding often left me feeling stuck because I had no idea where the bug actually was and asking Copilot to "just fix it" without context often made things worse. Structured prompts gave me back the feeling of being in control of my own codebase.

I also noticed a real difference between how different LLM models work. Outside of this course I was using Claude Sonnet for personal projects and even when I wrote weaker prompts and did not follow the guidelines strictly, I still got useful results faster than with GPT 4.1. That made me think that guidelines matter more with some models than others and that choosing the right tool for the task is also part of working with AI effectively.

Writing good prompts does take more time. But looking at the difference between Week 2 and Week 13, I think it is worth it. The code was better, the bugs were easier to catch and I spent less time going in circles.

One thing I keep thinking about is how fast these tools are evolving. What did not work in Copilot a month ago might already be fixed so the guidelines themselves need to be revisited regularly as the models improve.

I also came into this course thinking AI would eventually replace developers. After going through it I think it amplifies the people who know how to use it well. And I want to try applying these same guidelines beyond web development for things like data analysis or ML projects. A lot of what I learned here I will carry into my next projects.

---

## 8. AI Use Acknowledgement

| Tool | Where Used | How Used |
|------|-----------|----------|
| GitHub Copilot (GPT 4.1) | Week 2 app, Week 13 app | Main code generation tool for all features |
| GitHub Copilot (GPT 5.1) | Week 13 prompts | Refining and improving prompts before sending to Copilot |
| Claude Sonnet | This report | Improving and refining text written by me in this report |

## References

- [1] Ronanki, K., Berger, C., and Horkoff, J. "Investigating ChatGPT's Potential to Assist in Requirements Elicitation Processes." arXiv:2307.07381, 2023.
- [2] Bradner, S. O. "Key words for use in RFCs to Indicate Requirement Levels." RFC 2119, IETF, 1997.
- [3] Jain, N., et al. "Learning Performance-Improving Code Edits." arXiv:2302.07867, 2023.
- [4] Wang, J., et al. "Software Testing with Large Language Models: Survey, Landscape, and Vision." IEEE Transactions on Software Engineering, 2024.
- [5] Yuan, Z., et al. "Evaluating and Improving ChatGPT for Unit Test Generation." ACM on Software Engineering, 2024.
- [6] Haider, M. A., et al. "Prompting and Fine-tuning Large Language Models for Automated Code Review Comment Generation." arXiv:2411.10129, 2024.
- [7] Cihan, U., et al. "Automated Code Review in Practice." ICSE-SEIP, IEEE, 2025.
- [8] Liu, N. F., et al. "Lost in the Middle: How Language Models Use Long Contexts." Transactions of the ACL, 2024.
- [9] Orosz, G., and Osmani, A. "How AI-assisted coding will change software engineering: hard truths." Pragmatic Engineer Blog, 2025.
- [10] Zhong, R., et al. "AL-Bench: A Benchmark for Automatic Logging." arXiv:2502.03160, 2025.
- [11] Duan, S., et al. "PDLogger: Automated Logging Framework for Practical Software Development." arXiv:2507.19951, 2025.
- [12] Bairi, R., et al. "CodePlan: Repository-Level Coding using LLMs and Planning." arXiv, 2023.
- [13] Midolo, A., et al. "Guidelines to Prompt Large Language Models for Code Generation: An Empirical Characterization." arXiv, 2024.
- [14] Gopu, R., et al. "Unlocking the Full Power of Copilot Code Review: Master Your Instructions Files." GitHub Blog, 2025.