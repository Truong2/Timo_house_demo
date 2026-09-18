# TimeHouse UAT evidence runner

## Scope and baseline

The runner is designed for an isolated worktree created from `origin/develop`. It fixes the business date at `28/10/2026`, the accounting period at `10/2026`, and captures a 1440×1080 viewport. Every manifest stores the exact Git commit and run timestamps.

The approved milestone count is:

- Phase 1: 36 milestones (`S0` and `F01`–`F10`).
- Phase 2: 20 milestones (`F11`–`F15`).
- Phase 3: 15 milestones (`F16`–`F19`).
- Total: 71 milestones.

`F08.5.1`–`F08.5.3` is executed as a mandatory Phase-2 regression flow outside the 71-milestone counter. This resolves the source-guide mismatch where the Phase-2 guide contains 23 IDs while the approved plan fixes Phase 2 at 20 and the total at 71.

## Commands

```powershell
npm run check
npm run walkthrough:p1
npm run walkthrough:p2
npm run walkthrough:p3
npm run walkthrough:all
```

Set `TIMEHOUSE_UAT_ROOT` to force a shared versioned output directory. Without it, `walkthrough:p2`, `walkthrough:p3`, and `walkthrough:all` write to `docs/uat/develop-<short-sha>-<YYYYMMDD>/`.

## Output

The full run produces:

- `00_TimeHouse_UAT_3_Phase_Summary.docx`
- `01_TimeHouse_Phase1_UAT_Evidence.docx`
- `02_TimeHouse_Phase2_UAT_Evidence.docx`
- `03_TimeHouse_Phase3_UAT_Evidence.docx`
- `summary.json`
- `issues.md`
- `phase-1/manifest.json`, `phase-2/manifest.json`, `phase-3/manifest.json`
- Per-phase `evidence/` and `downloads/` folders.

Each milestone contains `phase`, `flow`, `milestone`, `role`, `route`, `phaseFlags`, `inputs`, `action`, `expected`, `actual`, `assertions`, `screenshots`, `downloads`, `recordIds`, `commit`, `timestamps`, `status`, and `error`.

## Acceptance policy

A phase is PASS only when all counted milestones, mandatory regressions, and cross-phase smoke tests pass. A downloaded CSV is accepted only after filename, header, minimum row count, and SHA-256 are recorded. A toast without the resulting record is not sufficient evidence.

Zalo, OCR, and bank/VietQR behavior is explicitly labeled as simulated. OI-07 remains `NEEDS BUSINESS CONFIRMATION`: the current mockup does not automatically offset receivables against the deposit, and a PASS does not make this production-ready.

