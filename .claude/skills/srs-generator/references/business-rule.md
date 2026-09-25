# Business Rule section

The opening section of an FR/SRS document, headed `# Business Rule` (or `Business Rule` as the first numbered section). It is a **2-column table**: a left **label** column and a right **content** column. It sits before all screen sections.

## Purpose

The Business Rule section captures the layout-independent domain logic of the function: who may perform it, the rules that govern the action, and what happens to system state on success. It complements (does not replace) the inline field-level rules in the description tables — status definitions and per-field behavior still appear inline in the relevant screen's description table as well.

## Structure

A 2-column table with no header row and **exactly three rows**:

| [Label] | [Content: a short value, or a bulleted list of rules] |

- **Left column**: the rule category name, bold, centered.
- **Right column**: either a short inline value (e.g. `Citizen account`) or a bulleted list of rules with nested sub-bullets, using the same Description conventions as the description tables (action arrows `->`, inline definitions, cross-references to other FRs, error codes, ID-format specs).

## The three rows

The Business Rule table always has these three rows, in this order:

1. **Authorization** — who is allowed to perform the function. Usually a short value (e.g. `Citizen account`, `Admin account`).
2. **[Action] Rule** — the core domain rules governing the function, as one consolidated bulleted list. Name it for the function's main verb: `Submission Rule` for a submit flow, `View Rule` for a view/list screen, `Creation Rule` for a create flow, etc.

   **The first two lines of this cell are fixed:**
   - **Line 1**: a short overview of what the function does.
   - **Line 2**: `This action can only be done when [Conditions]##` — with `##` **coloured red** (the analyst fills in the conditions). Always include this line, directly below the function-overview line.

   After those two lines, fold ALL the how-it-works logic into this same row (for a grid view: what is displayed, status definitions and derivations, search/filter/sort semantics, and column-configuration rules) — do not split it into multiple rule rows. Define any mode/branch terms inline (e.g. "Online verification: ...").
3. **[Action] Impact** — the state changes on successful completion. Name it `Submission Impact`, `Creation Impact`, etc. Cover IDs generated (with exact format specs), records created/stored, and status transitions (each status with the condition that produces it); split by branch when the impact differs per mode (e.g. ONLINE FLOW vs OFFLINE FLOW). For a **read-only (view) function**, state that viewing does not change system state and that search/filter/sort/column actions affect only the current display.

Do not add extra rows beyond these three; consolidate all rule content into the single Rule row.

## Content conventions

- **ID / code formats**: spell out the exact construction, e.g. `Verification ID = VR - [8-char CRC32 of Device UDID] - [8-char CRC32 of created timestamp]`, and include an example if the input gives one.
- **Branch / mode logic**: state the condition then the outcome, e.g. "If method = ONLINE, it requires login and internet connection to complete the flow (ONLINE FLOW)".
- **Status transitions**: list each resulting status with the condition that produces it.
- **Storage / persistence**: when the function depends on local/remote storage, list exactly what is stored and any per-account separation rules.
- **Cross-references**: cite other FRs and Common Rules inline; preserve links from the input, don't fabricate.
- **Error codes**: carry the input's codes through (E1, E13, E23, …); don't invent.

## Example shape (abridged, from a Submit-for-verification FR)

| Authorization | Citizen account |
| Submission Rule | - Users submit a verification request for review. *(line 1: function overview)*<br>- This action can only be done when **[Conditions]##** *(line 2, `##` in red)*<br>- Users can submit regardless of login status.<br>  - If not logged in, only OFFLINE requests.<br>  - If logged in, both ONLINE and OFFLINE.<br>- Each request has a verification method:<br>  - Online verification: proceeds online using internet connection.<br>  - Offline verification: proceeds offline using an offline QR code.<br>- ... (storage requirements, multi-account separation, etc.) |
| Submission Impact | - ONLINE FLOW (method = ONLINE), on successful submission:<br>  - Generate Verification ID = VR - [8-char CRC32 of Device UDID] - [8-char CRC32 of created timestamp].<br>  - VC shared to Verifier via internet; verification stored in the database.<br>  - Call assessment: status = Submitted / Passed / Failed per conditions.<br>- OFFLINE FLOW (method = OFFLINE), on successful submission:<br>  - Generate Verification ID (same format).<br>  - Generate a QR code for offline sharing; verification stored locally.<br>  - Verification status is "Submitted" permanently. |
