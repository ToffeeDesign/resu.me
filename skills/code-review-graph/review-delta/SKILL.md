---
name: review-delta
description: Review only changes since last commit using impact analysis. Token-efficient delta review with automatic blast-radius detection.
argument-hint: "[file or function name]"
---

# Review Delta

Perform a focused, token-efficient code review of only the changed code and its blast radius.

**Token optimization:** Before starting, call `get_docs_section_tool(section_name="review-delta")` for the optimized workflow. Use ONLY changed nodes + 2-hop neighbors in context.

## Steps

1. **Ensure the graph is current** by calling `build_or_update_graph_tool()` (incremental update).

2. **Get review context** by calling `get_review_context_tool()`. This returns:
   - Changed files (auto-detected from git diff)
   - Impacted nodes and files (blast radius)
   - Source code snippets for changed areas
   - Review guidance (test coverage gaps, wide impact warnings, inheritance concerns)

3. **Analyze the blast radius** by reviewing the `impacted_nodes` and `impacted_files` in the context. Focus on:
   - Functions whose callers changed (may need signature/behavior verification)
   - Test files in the blast radius (confirm they still pass)
   - Any wide-impact nodes flagged in the guidance

4. **Review each changed file** using only the snippets provided — do not read full files unless explicitly needed.

5. **Report findings** grouped by risk level with specific line references.
