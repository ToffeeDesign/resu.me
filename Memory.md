# Memory.md — Resume Maker

## Project Snapshot
- AI-powered Resume and Cover Letter Builder.
- Tech Stack: Next.js (v16.2), React (v19.2), TypeScript, Vanilla CSS Modules, Lucide React icons.
- Single-page application router starting directly on `DashboardPage`.

## Architecture & Conventions
- **State Management**: Global React context in `src/context/ResumeContext.tsx` handles local state and localStorage persistence for both Resumes and Cover Letters.
- **Styling Approach**: Vanilla CSS Modules (e.g. `DashboardPage.module.css`, `CoverLetterEditor.module.css`). Global style tokens in HSL.
- **Button Conventions**: Main actions (e.g. "Download PDF") use primary gradient background. Secondary actions (e.g. "Save") use outlined/ghost styling (`.saveBtnSecondary`) with inline loading spinner feedback.
- **Preview Parity**: All cover letter previews (editor live preview and dashboard thumbnail previews) must render using the shared `CoverLetterPreviewContent` component to prevent dual-implementation layout and styling drift.

## Current State (what actually works right now)
- **Dashboard**: Lists all Resumes and Cover Letters with real-time, scaled down (0.27x transform) live-rendered previews in thumbnails.
- **Cover Letter Editor**:
  - Full-width Subject field, rich text formatting toolbar for Letter Body.
  - Template styles (Minimal, Modern, Creative) customizable with font family and primary colors (fully persisted).
  - Signature section with Draw Signature (HTML5 canvas) and PNG Upload (with infinite zoom 0.05x-5.0x and boundary box positioner).
  - Muted secondary "Save" button with active spinner state.
- **Resume Editor**: Full resume builder fields, ATS matching, design layout adjustments.

## Known Issues / Blockers
- None currently reported. Dev compilation and typecheck are fully passing.

## Recent Changes
- 2026-07-16: Created shared `CoverLetterPreviewContent.tsx` component to enforce identical visual rendering between the editor live preview and the dashboard list card thumbnails.
- 2026-07-16: Persisted `primaryColor` and `fontFamily` in `CoverLetterData` so styling selections are reflected in card thumbnails.
- 2026-07-16: Redesigned Cover Letter "Save" button to secondary outline style with active loading spinners, and removed the redundant text status indicator beside the Cover Letter name.

## Next Steps
- Implement additional templates or customized fields as requested by the user.
- Add further verification or export optimizations.
