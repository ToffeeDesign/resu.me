---
name: review-pr
description: Review a PR or branch diff using the knowledge graph for full structural context. Outputs a structured review with blast-radius analysis.
argument-hint: "[PR number or branch name]"
---

# Review PR

Perform a comprehensive code review of a pull request or branch diff using the knowledge graph.

**Token optimization:** Before starting, call `get_docs_section_tool(section_name="review-pr")` for the optimized workflow. Never include full files unless explicitly asked.

## Steps

1. **Identify the changes** for the PR:
   - If a PR number or branch is provided, use `git diff main...<branch>` to get changed files
   - Otherwise auto-detect from the current branch vs main/master

2. **Update the graph** by calling `build_or_update_graph_tool(base="main")` to ensure the graph reflects the current state.

3. **Get the full review context** by calling `get_review_context_tool(base="main")`:
   - This uses `main` (or the specified base branch) as the diff base
   - Returns all changed files across all commits in the PR

4. **Analyze impact** by calling `get_impact_radius_tool(base="main")`:
   - Review the blast radius across the entire PR
   - Flag any functions with many callers or missing test coverage

5. **Report findings** in a structured format:
   - Summary of changes and overall risk level
   - High-risk functions with rationale
   - Test coverage gaps
   - Suggested follow-up actions
