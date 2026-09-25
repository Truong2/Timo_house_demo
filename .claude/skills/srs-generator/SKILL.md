---
name: srs-generator
description: "Generate an Ekotek-format SRS/FR specification document for a UI screen from a screen capture plus a field/rule description. Use whenever the user wants to write, draft, or produce an SRS, FR, functional spec, or screen specification - for a list/table/grid screen, detail screen, form screen, popup, bottom sheet, or any admin/management page - on a website or a mobile app, especially when they provide a screen capture or wireframe (in the prompt or in Google Drive) and want a Word .docx, Google Doc, or markdown. Trigger even if they just say 'spec out this screen' or 'write the FR for this' without naming the format. The skill detects the platform (web vs mobile) from the shape of the capture, then asks the screen type, since each combination uses a different skillset; the grid-view (list/table), detail-page (single-record view), popup (modal/dialog), and input-form (create/edit screen) skillsets are implemented, each with a mobile delta layer."
license: Proprietary
---

# SRS Generator

Produce an Ekotek-style functional requirement (FR/SRS) document for a UI screen. This skill routes on two axes — **platform** (web or mobile) and **screen type** — and applies the shared document skeleton below.

## Step 0: Detect the platform (required, before anything else)

The screen-type references in `references/screen-types/` were written for **website** screens. A mobile screen is documented with the same table contract but a different shell, vocabulary, and component set.

**Detect the platform from the shape of each screen capture — don't ask first.** The web/mobile split is legible from the capture:

- **Landscape / wide** (aspect ratio ≥ 1.2), with a left menu rail and a breadcrumb header → **website**.
- **Portrait / narrow** (aspect ratio ≤ 0.75), with a device status bar, a notch, and a bottom tab bar → **mobile**.
- Anything in between, or a cropped component → **ask**.

If **any** capture is mobile, read `references/platform-mobile.md` and apply it as a delta layer on top of the screen-type reference. A single FR may contain both platforms; classify each capture independently and size each capture by its own platform when embedding.

State your conclusion when you ask the screen-type question, so the user can correct it.

## Step 1: Ask the screen type (required, before writing)

Different screen types are documented differently, so before writing anything, ask the user what type of screen this is. Present the available types and note which are implemented:

> "What type of screen is this? I have the **grid view** (list/table), **detail page** (single-record view), **popup** (modal/dialog), and **input form** (create/edit screen) skillsets. Other types (e.g. dashboard-only layouts) reuse the closest of these."

- If **grid view** (list/table with search, filters, a data table) → read `references/screen-types/grid-view.md` and follow it.
- If **detail page** (the full information of a single record, usually reached from a list row) → read `references/screen-types/detail.md` and follow it.
- If **popup** (a modal/dialog layered over a parent screen — confirmation, form, or info popup) → read `references/screen-types/popup.md` and follow it.
- If **input form** (a full-screen Create or Edit form, possibly divided into steps) → read `references/screen-types/input-form.md` and follow it. Its input-field components come from `popup.md`, so read that too.
- If another type → tell the user that screen type's skillset isn't available yet, and offer to proceed with the closest implemented type if appropriate, or to stop.

**If the platform is mobile**, read `references/platform-mobile.md` *in addition* to the screen-type reference, and apply its deltas. The mapping:

| Screen type | Mobile reading order |
| :-- | :-- |
| Grid view (→ **list screen**) | `platform-mobile.md` §4–5, then **`mobile-list.md`** (standalone — do *not* read `grid-view.md` as the contract) |
| Detail page | `detail.md`, then `platform-mobile.md` §6b |
| Popup (→ **bottom sheet / dialog**) | `popup.md`, then `platform-mobile.md` §6c |
| Input form | `input-form.md` + `popup.md`, then `platform-mobile.md` §6d |

For detail, popup, and input form, the mobile file never replaces the screen-type file — it overrides the shell blocks (§5), the vocabulary (§3), and the specific rules named in its deltas; everything else is inherited unchanged. The **list screen is the exception**: it diverged enough to earn a standalone contract in `screen-types/mobile-list.md`, which still draws its shell blocks and Format vocabulary from `platform-mobile.md`.

Do not guess the type from the capture alone; confirm with the user, since the type determines the entire description approach. The **platform**, by contrast, *is* determined from the capture (Step 0) — you state it rather than ask it, unless the shape is ambiguous.

## Shared document skeleton (all screen types)

**Every SRS document has these three sections, always, in this order:**

1. **Business Rule**
2. **Screen description** — one or more screen sections (there can be multiple)
3. **User Steps**

None is ever omitted: even a single-screen FR has all three. Business Rule opens the document, the screen section(s) form the middle, and User Steps closes it. Do not emit a document that is missing any of the three, and do not reorder them.

1. **Business Rule** (once, top) — a **2-column table** (label | content). See `references/business-rule.md` for the row set and content conventions. This is the ONLY place business rules are collected as a section.
2. **Screen description** (one section per screen, at least one) — a numbered heading `Screen ##.N: [name]`, then the **screen capture** (embedded and centered) with the screen name repeated as a **bold centered caption below** it, then that screen's **Description table** (4-column `Fields | Format | Required? | Description`). A document may contain many screen sections; they occupy the middle of the document in encounter order.

**Multiple cases of the same screen.** When one screen has several **deliverable** visual cases/states (e.g. a Citizen Details page shown as New / Active / Blocked), keep them in a **single screen section with one description table** (the table covers all cases, using "Only appear when…" conditions for case-specific components). Name each case's capture separately using a **three-part number**: `Screen [FR].[N].[case]: [Screen Name] ([Case])`, e.g. `Screen 27.1.1: Citizen Details (Active)`, `Screen 27.1.2: Citizen Details (Blocked)`. Embed each case's capture with its `Screen ##.N.[case]: [name] ([case])` name as a **bold, centered caption directly below that capture** (same caption style as the single-screen case), then a single description table follows. Do NOT split cases into separate sections or separate description tables. Reference-only captures (see "Gather inputs") are never cases — they aren't embedded at all.
3. **User Steps** (once, at the end) — the closing **Pre-condition / User steps** 2-column table. A flow may have more than one such table (e.g. logged-in vs guest); include one per distinct entry scenario the input describes. The section is titled **User Steps**; the table inside it has the `Pre-condition` and `User steps` rows.

**Each user step is one screen-to-screen transition.** A step describes the action that navigates the user from one screen to the next — not a summary of what the user does *on* a screen (the description tables already cover that). With N screens, expect roughly N steps, each of the form `Step n: [action on the current screen] -> display [next screen] (Screen ##.N)`. Do not nest bulleted lists of per-screen activities inside a step.

Field-level rules and status *definitions* still appear **inline** in the relevant field's Description (e.g. each dropdown option's meaning), in addition to the top-level Business Rule section — the two coexist, as in the reference docs.

**Separate multiple sections with section-header rows (all screen types).** Whenever a screen or popup is visibly divided into more than one **section** — full-width cards or rectangles, labelled groups (e.g. "STATUS", "CREDENTIAL TYPE", "Personal Information"), or the content of separate tabs — insert an **orange section-header row** (`#FCE4D6`, spanning all 4 columns; the label is regular weight, the fill is what marks it) bearing the section's name at the start of each section, then describe that section's components beneath it. One row per visible section. The only non-orange section row is the **blue** (`#DDEBF7`) list/table common-rules block; when a section *is* a list, emit the orange section row first, then the blue rules row inside it. Full mechanics and the colour convention are in `grid-view.md` §5 "Section-header rows".

Read `references/business-rule.md` for the Business Rule section, and `references/screen-types/grid-view.md` for the grid-view description-table conventions (including §5 section-header rows), before writing.

## Workflow

### 1. Detect the platform, then confirm the screen type
Do Step 0, then Step 1 above. Load the matching screen-type reference, plus `references/platform-mobile.md` if any capture is a mobile screen.

### 2. Gather inputs
- **Screen capture**: expected in the prompt as an image. If it's in Google Drive, pull it with the Google Drive tools (`download_file_content` for images/xlsx — xlsx needs an explicit `exportMimeType`; content arrives base64-encoded inside a JSON envelope; `read_file_content` for docs).
- **Field/rule description**: from a Drive doc, a pasted description, or inferred from the capture.
- If you're missing the **FR number** or **entity name**, ask — never invent the FR number or fabricate cross-references.

**Deliverable captures vs reference-only captures.** Not every image provided is a screen to document. Distinguish:
- **Deliverable captures** — the actual screen(s)/state(s) of the function being specified. These are embedded in the document under their screen heading, with a caption.
- **Reference-only captures** — supplied purely to tell you *accepted values or behaviour* (e.g. an expanded dropdown showing its option list, a panel of annotations listing valid options, a variant view illustrating a second mode, a zoomed detail). Their content **feeds the description table** (option lists, defaults, limits, formats, modes) but they are **NOT embedded** in the document and get no screen heading, caption, or case number.

Signals a capture is reference-only: it is annotated (callout boxes, notes listing options), it shows a component in isolation rather than the full screen, the user says it is "supplementary", "just so you know", "for you", or it exists to enumerate values rather than depict a state the user reaches.

When it's ambiguous, **ask** whether a capture should be documented as a screen or used only as reference. If only one deliverable capture remains, use the plain `Screen ##.N: [name]` caption (no three-part case numbering, which applies only when multiple deliverable cases are shown).

### 3. Confirm the section scaffold (toggleable)
The screen-type reference lists standard blocks in a fixed content order; each is on by default but can be toggled off. Emit only the blocks the reference has finalized. Confirm which apply to this screen; drop the rest.

### 4. Write the content
Write the **Business Rule** section first (2-column label|content table per `references/business-rule.md`: Authorization, the action rule(s), the action impact), then each screen section (heading `Screen ##.N: name` → description table) in encounter order, then the closing Pre-condition / User steps table(s). Fill the description tables exactly per the screen-type reference, writing per-field rules inline as well. Keep field names, formats, and rules consistent across the Business Rule section, the list table, the filter section, and the column-settings popup.

### 5. Produce the output
- **Markdown**: emit the structure (screen sections, then the Pre-condition / User steps table) with tables directly, or as a `.md` file.
- **Word .docx**: use the `docx` skill (read its SKILL.md first). Formatting to match the reference docs:
  - **Font (whole document)**: **Poppins**, everywhere — body text, table cells, headings, captions, and the page footer. Set `styles.default.document.run.font = "Poppins"` **and** name the font explicitly on any style that doesn't inherit it (`title`, `heading1`, the caption style, footer runs). No run in the finished file may fall back to Calibri/Aptos. If Poppins isn't installed on the render machine, still declare it — Word substitutes at open time; do not silently swap in another family.
  - **Body text size**: **11pt** (`size: 22` half-points) for all normal, non-heading text — description-table cells, Business Rule cells, Pre-condition / User steps cells, and any body paragraph. Set it once on `styles.default.document.run.size` so it is the document-wide default rather than repeated per run. (Word measures type in points, not pixels; 11pt is the intended body size.)
  - **One size per heading level.** Every heading at the same level uses the **identical** font size, colour, and weight — no per-section variation, no shrinking a long heading to fit. The three levels are fixed:
    | Level | Applies to | Size | Style |
    | :-- | :-- | :-- | :-- |
    | Title | `FR## - [name]` | ~28pt (size 56) | centered, non-bold, dark grey (#202020) |
    | Section heading | `Business Rule`, every `Screen ##.N: [name]`, and `User Steps` when emitted | ~16pt (size 32) | left-aligned, non-bold, dark grey (#202020) |
    | Caption | the screen name below each capture | ~11pt (size 22) | bold, centered |
    Define **one** paragraph style per level and reuse it, rather than setting sizes ad hoc on each heading — that is what keeps the levels uniform.
  - **Section / screen headings**: a single **decimal numbered list** (1. 2. 3. …) covering Business Rule, every screen section in order, and the closing User Steps section, all sharing one numbering reference so they auto-number and one style so they render at the same size.
  - **Screen capture**: embedded and **centered** (`ImageRun`), placed directly under its screen heading. Width by platform: **web ~560px**; **mobile ~300px** (tall/narrow captures overflow the page at web width). **One capture per line** — when a screen section has multiple deliverable cases, stack them **vertically, one per line**, each centered with its own caption below it; never place two captures on the same line. See `references/platform-mobile.md` §9. In a mixed-platform document, size each capture by its own platform; do not normalise.
  - **Caption**: the screen name repeated **bold, centered, ~11pt** on the line **directly below** its capture (not above it). Each stacked case gets its own caption line.
  - **Tables**: 4-column description tables and a 2-column Business Rule table (exactly 3 rows: Authorization, [Action] Rule, [Action] Impact), all DXA widths. `ShadingType.CLEAR` for the filled header/section rows; no literal bullets (numbering config with level-0 `•` and level-1 `◦`). Two-box datepicker: vertically merge Fields/Format/Required? cells (`VerticalMergeType.RESTART`/`CONTINUE`).
  - **Bold in the description table — header row only.** In a 4-column description table the **only** bold text is the header/title row (`Fields | Format | Required? | Description`). Everything else is regular weight: field names in the Fields column, section-header row labels, Format and Required? values, and all Description content. Section-header rows are distinguished by their **fill colour alone** (orange `#FCE4D6`, or blue `#DDEBF7` for the list/table common-rules row) — do not bold their labels. Inside a Description cell, do not bold sub-labels either (e.g. a datepicker's `Start Date` / `End Date` block headings). This does **not** change the 2-column Business Rule table, whose left label column stays bold, nor the Pre-condition / User steps table, nor capture captions.
  - **Row height & cell padding (all rows)**: give every table row a minimum height (`height: { value: 460, rule: "atLeast" }`, ~0.32″) and every cell vertical/horizontal padding (`margins: { top: 100, bottom: 100, left: 120, right: 120 }` in DXA) so rows aren't cramped. Apply this uniformly to header rows, section-header rows, field rows, datepicker rows, Business Rule rows, and the Pre-condition/User steps rows. `atLeast` lets multi-line rows grow while giving single-line rows the taller minimum.
  - **Page & margins**: portrait US Letter (12240 × 15840 DXA) with 0.5″ margins (720 DXA all sides) so the tables get ~7.5″ of usable width; give the Description column the majority of that width. Do not use landscape.
  - **Page-number footer (required, every page)**: a footer on every page carrying the current page and the total page count in the form `[Current Page]/[Total number of pages]` — e.g. `3/12`. **Left-aligned** (flush with the left page margin, not centered), Poppins, ~10pt, dark grey. Use **live Word fields**, never hard-typed numbers: the `docx` library's `PageNumber.CURRENT` and `PageNumber.TOTAL_PAGES` inside footer runs, attached to the section via `footers: { default: new Footer({ … }) }`. Keep the literal spacing of the format — **no space on either side of the slash**.
    ```js
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.LEFT,
          children: [
            new TextRun({ children: [PageNumber.CURRENT], font: "Poppins", size: 20, color: "202020" }),
            new TextRun({ text: "/", font: "Poppins", size: 20, color: "202020" }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Poppins", size: 20, color: "202020" }),
          ],
        })],
      }),
    }
    ```
    The footer belongs to the section properties, so declare it on **every** section the document defines; a document with one section needs it once.
- **Google Doc**: build the content, then create it with the Google Drive `create_file` tool (contentMimeType `text/html`, converting to a Google Doc).

Confirm the target format if the user hasn't said. Deliver files with `present_files`; return the Google Doc link for that path.

## Quality bar
- Every interactive element states its default state and its click/hover/select behavior with an action arrow (`->`).
- Cross-references to other FRs and Common Rules are preserved from the input, not invented. If a referenced FR/rule number isn't confirmed for this project, keep the descriptive name but render the reference in **red** (e.g. red `FR## - View Citizen Details`) to flag it for the user.
- **Any content requiring further input from the user is highlighted in red** (docx: run color `CC0000`). This includes unconfirmed FR numbers, tooltip/label text not legible in the capture, and open questions (e.g. whether a dev-only menu item belongs in the spec). Everything readable from the capture or input is written normally; only genuine unknowns are red.
- Error-message codes (E8, E14, E19, …) are carried through from the input's convention; if a code is unknown, red-flag it.
- Inline business rules and the field descriptions agree with each other.

## Extending the skill (for maintainers)

The skill routes on **two axes**, and they extend differently.

**Screen type** — a self-contained reference in `references/screen-types/`. To add one (e.g. `dashboard.md`, `auth.md`): create the file with that type's section structure, format vocabulary, and standard blocks; add it to the Step 1 list and to the mobile mapping table; keep the shared document skeleton above unchanged. `grid-view.md` currently owns the shared description-table contract (4 columns, control types, description conventions, section-header rows, vertical merge); the other types delta off it.

**Platform** — a delta layer in `references/`, currently `platform-mobile.md`. A platform file never restates a screen type; it overrides the shell blocks, the interaction vocabulary, and named rules, and adds platform-only components. To add one (e.g. `platform-desktop-app.md`), follow that shape: detection signals first, then what is *not* documented (OS chrome), then vocabulary overrides, shell blocks, per-screen-type deltas, platform-only components, and output overrides.

Adding a screen type means writing **one** file and **one** delta section per platform — not one file per (type × platform) pair.
