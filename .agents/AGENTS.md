# Resume Maker — Agent Rules

## Skills Location

All project-specific skills live in `skills/` at the project root.
New skills should be placed under `skills/<skill-name>/SKILL.md`.
The `skills.json` in `.agents/` registers these paths with the agent discovery system.

<!-- BEGIN:ponytail-rules -->
# Ponytail — Lazy Senior Dev Mode

You are a lazy senior developer. Lazy means efficient, not careless. The best code is the code never written.

Before writing any code, stop at the first rung that holds:

1. Does this need to be built at all? (YAGNI)
2. Does it already exist in this codebase? Reuse the helper, util, or pattern that's already here, don't re-write it.
3. Does the standard library already do this? Use it.
4. Does a native platform feature cover it? Use it.
5. Does an already-installed dependency solve it? Use it.
6. Can this be one line? Make it one line.
7. Only then: write the minimum code that works.

The ladder runs after you understand the problem, not instead of it: read the task and the code it touches, trace the real flow end to end, then climb.

Bug fix = root cause, not symptom: a report names a symptom. Grep every caller of the function you touch and fix the shared function once — one guard there is a smaller diff than one per caller, and patching only the path the ticket names leaves a sibling caller still broken.

Rules:

- No abstractions that weren't explicitly requested.
- No new dependency if it can be avoided.
- No boilerplate nobody asked for.
- Deletion over addition. Boring over clever. Fewest files possible.
- Shortest working diff wins, but only once you understand the problem. The smallest change in the wrong place isn't lazy, it's a second bug.
- Complex request? Ship the lazy version and question it in the same response.
<!-- END:ponytail-rules -->

<!-- BEGIN:testing-rules -->
# Testing and Verification Rules

- **No automatic testing/verification/building**: Do not run tests, builds, or verification checks after every change unless explicitly asked to do so. Only test or verify when requested.
- **Scope limitation**: If you identify a potential issue outside the requested scope, inform the user first instead of fixing it automatically.
- **Architectural approval**: Before making major architectural changes, ask for confirmation.
- **Consistency**: Maintain the existing project structure and coding style unless changes are requested.
<!-- END:testing-rules -->

<!-- BEGIN:design-quality-rules -->
# Design and Code Quality Standards

## UI/UX Quality Standards

* Ensure every UI element looks polished, professional, and production-ready for end users.
* Avoid any appearance that feels like a quick prototype, unfinished implementation, or AI-generated/vibe-coded interface.
* Pay close attention to:
  * Spacing and alignment (consistent margins, paddings, and alignment grids).
  * Typography hierarchy (proper weights, sizes, margins, and letter-spacing).
  * Consistent component styling (reusing existing UI styles and component structures).
  * Visual balance (harmonious layout distribution and symmetry).
  * Proper interaction states (explicit style changes for hover, focus, loading, disabled, and active states).
  * Responsive behavior (layouts that adapt gracefully to different viewport sizes).
  * Overall user experience quality.

Before completing any UI-related task:
* Review the implementation from an end-user perspective.
* Refine visual details where required.
* Ensure the final result feels like a real commercial product.

## Code Quality Standards

* Do not focus only on making the frontend visually appealing. Write clean, maintainable, and production-ready code.
* Follow best practices for:
  * Component architecture
  * Code organization
  * Reusable components
  * Performance optimization
  * State management
  * Error handling
  * Scalability
  * Accessibility
  * Type safety

Avoid:
* Temporary solutions
* Hardcoded values where dynamic logic is required
* Duplicate code
* Unnecessary complexity
* Quick fixes that create future maintenance issues

Every implementation should be ready for a real production environment, not just a visual demonstration.
<!-- END:design-quality-rules -->

<!-- BEGIN:project-architecture -->
# Project Architecture

## Stack
- **Framework**: Next.js 16.2 (Turbopack, App Router)
- **Language**: TypeScript + React 19
- **Styling**: CSS Modules + Tailwind v4 (via PostCSS)
- **Drag & Drop**: `@dnd-kit/core` + `@dnd-kit/sortable`
- **Icons**: `lucide-react`
- **Dev server**: `npm run dev` → `http://localhost:3000`

## Key File Locations

| Area | File |
|---|---|
| App entry | `src/app/page.tsx` |
| Global CSS vars + reset | `src/app/globals.css` |
| Main layout shell | `src/views/DashboardPage/DashboardPage.tsx` |
| Resume state + context | `src/context/ResumeContext.tsx` |
| Linktree builder (editor) | `src/components/Linktree/LinktreeBuilder.tsx` |
| Linktree builder styles | `src/components/Linktree/LinktreeBuilder.module.css` |
| Linktree public visitor page | `src/app/u/[slug]/page.tsx` |
| Linktree visitor page styles | `src/app/u/[slug]/page.module.css` |
| Sidebar nav | `src/components/Sidebar/Sidebar.tsx` |

## Data Persistence
- Primary storage: **IndexedDB** (via `dbGet` / `dbSet` helpers in `ResumeContext.tsx`)
- Fallback: `localStorage`
- Keys: `RESUME_LIST_KEY`, `COVER_LETTER_LIST_KEY`, `LINKTREE_LIST_KEY`
- Hydration gate: `hydrated` state; children render immediately, saves are gated on `hydrated === true`

## Linktree Widget Rendering Pattern
Both the builder preview (`LinktreeBuilder.tsx`) and the public visitor page (`src/app/u/[slug]/page.tsx`) render blocks independently with near-identical inline styles. **Always fix both files** when changing block visual behaviour.

- `renderSocialIcon()` is defined separately in each file (not shared) — keep both in sync.
- Widget block types: `title`, `group`, `link`, `social`, `text`, `image`, `video`, `contact`
- Block sizing uses a `size` field (e.g. `1x1`, `2x1`, `2x2`, `4x1`) mapped via `getSizeSpans()`
- Grid: 4-column CSS grid, `grid-auto-rows: 100px`, gap `12px`

## Known Fixes Applied
- **Widget label overflow (2026-07-29)**: Long unbroken text in `link` and `social` block labels overflowed outside the widget card. Fixed by applying `-webkit-line-clamp: 2` with `display: -webkit-box` and `overflow: hidden` to the label `<span>` elements in both `LinktreeBuilder.tsx` and `u/[slug]/page.tsx`. Also added `flexShrink: 0` to social platform icons to prevent them from shrinking when labels wrap. Updated `.widgetTitle` CSS class in both module CSS files from `white-space: nowrap` (single-line) to the 2-line clamp pattern.
- **Flexible 2D widget resize (2026-07-29)**: `BlockSize` type widened from a 6-value union to `` `${number}x${number}` `` template literal. All three `getSizeSpans()` if/else lookup tables (builder + visitor page) replaced with a 2-line `split('x').map(Number)` parser. The `resolveLayoutOverlaps` duplicated size-decode chains replaced with the same inline parse. The `handleMouseUp` 10-branch `finalSize` map replaced with `` `${cols}x${rows}` `` template literal. Result: users can freely resize widgets to any col×row combination (1×1 up to 4×4) using the existing drag handle; both axes snap to grid independently.
- **Profile & Grid Section Spacing (2026-07-29)**: Increased `gap` in `.bentoSplitLayout` from `24px` to `60px` in `LinktreeBuilder.module.css` to give proper breathing space between profile card and widget grid.
- **Thumbnail Profile Picture Sync (2026-07-29)**: Dashboard page cards (`LinktreeDashboard.tsx`) previously only rendered the first letter of `displayName` (`{page.displayName.charAt(0)}`), ignoring `page.avatarUrl`. Updated `.dashCardAvatar` to render `<img src={page.avatarUrl} />` when present with `objectFit: cover` and `overflow: hidden`. Updating profile picture in editor now instantly reflects on the dashboard card.
- **Live Link Copy Toast Notification (2026-07-29)**: Added a floating pill toast notification confirming `"Live Link copied to clipboard!"` when clicking the circular copy link button on dashboard cards (`LinktreeDashboard.tsx`). Styled with slide-in animation (`@keyframes toastIn`), slate background (`#0f172a`), emerald check icon, and automatic 3-second dismissal. (Removed from builder footer button per user request).
- **View Live Button Styling (2026-07-29)**: Replaced plain link with a sleek ghost button (`.viewLiveBtn`) in `LinktreeDashboard.tsx` & `LinktreeManager.module.css`. Features transparent default state (no background/border boundaries), primary color typography, clean `ArrowUpRight` (↗) diagonal arrow icon (`strokeWidth: 2.5`), soft hover tint, and smooth diagonal translation (`translate(2px, -2px)`) on hover.
- **Clean Empty Grid Persistence (2026-07-29)**: Previously, `LinktreeBuilder.tsx` ran an `useEffect` whenever `blocks.length === 0` that re-populated 4 starter widgets. Moved starter block initialization to `handleCreatePage` in `LinktreeManager.tsx` on initial page creation, and removed the auto-populating `useEffect` from `LinktreeBuilder.tsx`. Deleting all widgets now leaves the grid completely empty and clean as expected.
- **Robust Clipboard Copy Fallback (2026-07-29)**: `navigator.clipboard.writeText` threw unhandled promise rejections or type errors in non-HTTPS, un-focused document, or restricted browser contexts. Created `src/utils/clipboard.ts` with a dual-stage mechanism (`navigator.clipboard` primary + hidden `document.execCommand('copy')` fallback). Wrapped all copy handlers (`LinktreeBuilder.tsx`, `LinktreeDashboard.tsx`, `u/[slug]/page.tsx`) and `ConfettiButton` in error-safe try/catch blocks so copy action never fails or throws runtime error overlays.
- **Check Icon Import Fix (2026-07-29)**: Added missing `Check` icon to `lucide-react` import list in `LinktreeBuilder.tsx`, fixing `Runtime ReferenceError: Check is not defined` when triggering the toast notification.
- **Segmented Tab Navigation (2026-07-30)**: Converted the vertical accordion collapsible panels in the editor workspace sidebar (`LinktreeBuilder.tsx`) into a modern, single-view tabbed segment navigation layout. Tabs: Profile, Theme, and Widgets. Uses smooth `@keyframes tabFadeIn` transition animations and deleted all legacy accordion CSS styles.
- **Premium Figma-Like Color Picker (2026-07-30)**: Designed and implemented a high-fidelity custom `ColorPicker` component featuring HSV saturation/value canvas dragging, Hue rainbow slider, checkerboard Opacity/Alpha slider, native EyeDropper API utility trigger, Hex/Opacity inputs, and custom saved colors palette persistent storage inside `localStorage`. Installed directly in the Theme styling panel, replacing standard HTML color input.
- **Theme Presets Upgrade & Gradient Builder (2026-07-30)**: Separated background preset selections into distinct Solid Colors and Gradients sections. Added dynamic custom presets backed by `localStorage` persistence with hover delete controls. Implemented a popup Modal containing preset name fields, `<ColorPicker>` reuse (for custom solids), and an advanced Gradient Builder (type toggles, angle slider, dynamic color stops positions/insert/removal, and linear/radial live preview tracks).
<!-- END:project-architecture -->
