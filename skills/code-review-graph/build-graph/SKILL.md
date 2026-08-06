---
name: build-graph
description: Build or update the code review knowledge graph. Run this first to initialize, or let hooks keep it updated automatically.
argument-hint: "[full]"
---

# Build Graph

Build or incrementally update the persistent code knowledge graph for this repository.

## Steps

1. **Check graph status** by calling the `list_graph_stats_tool` MCP tool.
   - If the graph has never been built (last_updated is null), proceed with a full build.
   - If the graph exists, proceed with an incremental update.

2. **Build the graph** by calling the `build_or_update_graph_tool` MCP tool:
   - For first-time setup: `build_or_update_graph_tool(full_rebuild=True)`
   - For updates: `build_or_update_graph_tool()` (incremental by default)

3. **Verify** by calling `list_graph_stats_tool` again to confirm the updated node/edge counts and `last_updated` timestamp.
