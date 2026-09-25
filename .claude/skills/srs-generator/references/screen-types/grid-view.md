# Screen type: Grid view

The skillset for documenting a **grid-view screen**: a list/table screen with search, filters, a paginated data table, and usually a column-settings popup. This is the screen-type-specific contract; the document-level skeleton (Business rules once, screen sections in the middle, User steps once) lives in the main SKILL.md.

---

## 1. Section structure

A document is: an opening **Business Rule** section, then a sequence of **screen sections**, then a single closing **Pre-condition / User steps** table. Each screen section is a heading plus one description table.

- **Business Rule section** (top, once): a 2-column `label | content` table capturing layout-independent domain logic — Authorization, the action rule(s), and the action impact. See `../business-rule.md`. This is the dedicated place for collected business rules; per-field rules and status definitions still ALSO appear inline in the description tables below.
- **Screen heading**: `Screen ##.N: [screen name]` (e.g. `Screen 26.1: Citizen List`), as a numbered heading (see the docx formatting notes in SKILL.md).
- **Screen capture**: embedded and centered directly under the heading, with the screen name repeated as a **bold centered caption below** the image.
- **Description table**: the 4-column field-by-field spec for that screen (see below).
- **Closing table**: a 2-column `Pre-condition` / `User steps` table after the last screen section (one per distinct entry scenario, e.g. logged-in vs guest).

Screen captures are embedded (centered, with a bold centered caption below each) directly in the document under their screen headings.

### Skeleton

```
# FR## - [Function name]

Business Rule
   [2-column label | content table]

Screen ##.1: [screen name]
**Screen ##.1: [screen name]**
   [description table]

Screen ##.2: [second screen name]
**Screen ##.2: [second screen name]**
   [description table]

[Pre-condition / User steps table(s)]
```

- `##` is the FR number (e.g. FR26). Ask for it — never invent.
- Screens are numbered `##.1`, `##.2`, … in encounter order.

## 2. The description table

A **4-column** table with a bold header row. The header row is the **only** bold text in the table — field names, section-row labels, and all Description content are regular weight (see the docx formatting notes in SKILL.md):

| **Fields** | **Format** | **Required?** | **Description** |
| :-: | :-: | :-: | :-: |

- **Fields**: the element name (regular weight), or a section-header row (see "Section-header rows").
- **Format**: the control type — one value from the vocabulary in "Control types" below.
- **Required?**: `Yes` / `No`. Display-only elements are `No`.
- **Description**: the element's bulleted behavior rules (see "Description writing conventions").

**Vertical cell merging**: when one field has sub-parts that each need their own Description block (e.g. a two-box datepicker with Start Date / End Date), keep the field as a single logical row by **vertically merging** the `Fields`, `Format`, and `Required?` cells across the sub-rows, and giving each sub-row its own `Description` cell. Never push a sub-part's label (like "End Date") into the `Fields` column of a following row — the Fields column stays merged and shows the criterion name once. In docx-js: `verticalMerge: VerticalMergeType.RESTART` on the first row's merged cells, `VerticalMergeType.CONTINUE` (with an empty paragraph) on the continuation rows.

### Content order

The rows of the description table follow this fixed top-to-bottom order:

1. **Left menu**
2. **Header** (page directory, language, notifications, admin account)
3. **[Entity] Management**: **Search box**, **Filter icon**, **Reset icon**, **Column settings icon**
4. **Filter section** (hidden by default; the filter criteria) — OR, if the filter icon opens a popup, the criteria live in a separate `Filter popup` screen section instead (see 3c)
5. **[Entity] List / Table** (total count, table-level rules, one row per column, then a page-number row)

The **Column Settings popup** is documented as its own screen section (`Screen ##.N: ...`), not as a row in the list screen's table. In the reference doc the search box, filter icon, reset icon, and column-settings icon are grouped under an `[Entity] Management` section-header; the expanded filter fields sit under a separate `Filter section` header; and the total count and table come last under an `[Entity] List` header.

## 3. Control types

Values for the **Format** column:

- `Text` - static/display text
- `Textbox` - free text input (searchbox, fields)
- `Dropdown` - single/multi select
- `Datepicker` - date selection
- `Checkbox` - boolean toggle
- `Icon` - clickable icon (filter, reset, notification)
- `Icon + Text` - icon paired with a label (admin account)
- `Menu Item` - left-nav entry
- `Button` - action button (Apply, Save)
- `Row` - a single record's worth of columns (only for the legacy single-Row table style; the default is one row per column)

## 4. Description writing conventions

Descriptions are **bulleted lists of behavior rules**. Conventions:

- **One sentence per bullet.** Never write a multi-sentence run-on line. Split each sentence into its own bullet, and nest conditional branches as sub-bullets under the trigger. Reorganise the layout only — keep the original wording. For example, instead of "Click on -> check if there are any changes made to input. If there are not, go back to the previous screen. If there are, display a confirmation popup", write:
  ```
  Click on -> check if there are any changes made to input
    - If there are not -> go back to the previous screen
    - If there are -> display a confirmation popup
  ```

- **Option-specific actions go inline with the option.** When each option of a dropdown / radio group / checkbox leads the system to behave differently, describe that behaviour **in the same bullet as the option**. Do NOT list the options first and then repeat them in separate "Select X -> …" bullets below. Each option bullet follows this fixed shape:

  `[Option name]: [Meaning]. Select this option -> [Action when clicking]`

  The `[Meaning]` part is the option's description/sub-text as shown in the capture; omit it if the option has none. For example:
  ```
  Options:
    - Linear: User receive the same amount of point for each successful purchase. Select this option -> Display the per-tier Rule Breakdown table (Screen ##)
    - Progressive: User receives a different amount of point based on the transaction volume. Select this option -> Display the volume-based Rule Breakdown table (Screen ##)
  ```
  When every option produces the *same* behaviour (e.g. a plain filter dropdown), keep the single generic action line instead (`Select an option -> Search for all records with [criteria] = selected option`) rather than repeating it per option.

- **Action arrow ->** connects a trigger to its result:
  `Click on -> Display screen ##.1`
  `Select an option -> Search for all records matching the selected status`
  `Hover on the tooltip icon -> Display tooltip: "..."`
- **Default state** stated first when relevant: `Default: No filter applied`, `Default = Unchecked`, `Default selection: Francais`.
- **Cross-references** to other FRs inline: `(refer to FR31 - View VC Issuance Application List)`. Preserve links from the input; don't fabricate.
- **Common Rules** referenced as `Display follows Common Rule 7`.
- **Error codes** referenced by code: `display error message E8`. Carry the input's codes through; don't invent.
- **Constraints** as their own bullets: max length, allowed characters, trimming, single vs multi select.
- **Search semantics** noted explicitly: `(Relative search)` vs `(Absolute search)`.

**Example - the search action bullet:**
```
Enter keyword and press Enter or wait for 3 seconds -> Search for all records
which satisfy at least one of the following search criteria:
- ID = the keyword (Absolute search)
- Name contains the keyword (Relative search)
- Email contains the keyword (Relative search)
```
(ID-related fields use absolute search; all other fields use relative search. See the Search box block for the full row.)

## 5. Section-header rows

Filled rows spanning all 4 columns of the description table group the element rows into logical blocks. The row is a single cell with `columnSpan: 4` and a section-fill background; the **fill colour alone** marks it as a section row, so the label is written in regular weight, not bold. The block label sits at the start, and the row may additionally carry a block-level rule that applies to the whole block (e.g. the list common-rules), or just the label.

**General rule — one section-header row per visible section.** Whenever a screen or popup is visibly divided into **multiple sections** — full-width cards/rectangles, labelled groups (e.g. "STATUS", "CREDENTIAL TYPE", "Personal Information", "Submitted Information"), or the content of separate tabs — insert a **section-header row bearing that section's name** at the start of each section, then describe the section's components beneath it in capture order. This applies on **every** screen type and platform: grid view, detail page, popup/bottom sheet, input form, list screen, web and mobile alike. A screen with only one undivided body needs no section rows; a screen with two or more visible sections needs one row per section.

**Colour convention.**
- **Orange** (`#FCE4D6`) — the default for a **visual/content section**: a full-width card or rectangle, a labelled group within a page or popup, or a tab's content. This is the colour used to *separate sections* per the general rule above.
- **Blue** (`#DDEBF7`) — reserved for the **list/table common-rules row** (the `[Entity] List` / `[Entity] Table` block that carries no-data, no-match, sorting, pagination, and item-action rules). It reads as a different kind of row — data-behaviour rules rather than a visual divider — so it keeps its own colour.

When a section is itself a list (e.g. a tab whose body is a list of cards), it gets **both**: the orange section-header row naming the section, then the blue common-rules row for the list inside it.

Emit section rows in the capture's top-to-bottom order. For a screen type with a fixed content order (grid view), the blocks follow that order; for free-form screens (detail page, popup), they follow the order the sections appear in the capture.

## 6. Pre-condition / User steps (closing table)

After the last screen section, add a single **2-column table** (no heading needed, matching the reference doc):

| **Pre-condition** | [who is signed in / what state, e.g. "Admin is signing into the system"] |
| **User steps** | **Step 1:** … **Step 2:** … |

- **Pre-condition**: the state required to reach the flow.
- **User steps**: the happy path. Reference screens by their number, e.g. "redirected to Citizen List screen (Screen 26.1)" and "Click on View Icon → Redirect to View Citizen Details screen (Screen 27.1 - Refer to FR27)".

There is one closing table per document covering the whole flow, regardless of how many screen sections precede it.

---

# Standard blocks

Ready-made row content for each block of a grid-view description table, in the content order. Adapt entity names, menu items, and search criteria to the specific screen. Rows are `Fields | Format | Required? | Description`.

Toggle any block off if it doesn't apply to the screen. Blocks are being defined one at a time; only those below are finalized.

---

## 1. Left menu

The left navigation menu. Rules:

- The menu may have a **collapsed/expanded** state; if so, add a block-level note: "Default status: Collapsed. Click on < or > button to expand or collapse the left menu."
- Display the menu items **in the order they appear in the screen capture, top to bottom**.
- The **first item** in the menu is the **default tab** (the tab shown when the site is first accessed).
- Each menu item is **highlighted when it is the selected tab**.
- Clicking an item navigates to that item's screen (cite the target FR).
- If the capture shows **icons only** (labels hidden because the menu is collapsed), the item labels can't be read from it — ask the user for the menu labels and their target screens rather than emitting `[placeholder]` items.

Section-header row plus one row per menu item, in top-to-bottom order (`Fields | Format | Required? | Description`):

| **Left Menu**<br>- Default status: Collapsed.<br>- Click on < or > button to expand or collapse the left menu | | | |
| [First menu item] | Menu Item | No | - Default tab when accessing the website<br>- Highlight the tab while being selected<br>- Click on -> Display [its screen] |
| [Menu item] | Menu Item | No | - Highlight the tab while being selected<br>- Click on -> Display [target screen] (refer to FR## - [target screen name]) |

## 1b. Header

The top header bar. Standard rows (adapt to the capture):

| **Header** | | | |
| Page directory | Text | No | - Display the page directory. Format: Management/[Level 1 Page]/[Level 2 Page] (if applicable)<br>- Unclickable |
| Language Setting | Dropdown | No | - Default selection: [language]<br>- Click on -> Display the list of selections: [list]<br>- Allow single selection only. Selecting an option automatically deselects the previous selection<br>- Select an option -> Switch all localisable texts to the selected language |
| Notification icon | Icon | No | - Click on -> Display a notification popup (refer to FR## - ... Notification)<br>- If there are unread notifications, display a red dot with the number of unread notifications on top of the icon. If there are more than 99, display 99+ |
| Admin Email | Icon + Text | No | - Display: account icon, text "System Admin", admin email<br>- Click on -> Display a dropdown with options:<br>  - Change Password: Click on -> Display Change Password popup (refer to FR##)<br>  - Logout: Click on -> Logout of the current admin account, then redirect admin to the Login screen (refer to FR##) |

## 2. Search box

The keyword searchbox in the [Entity] Management area. The description **must** cover, in this order:

1. **Placeholder text** — the greyed-out hint shown when empty (e.g. `Search by [field], [field], [field]`).
2. **Max length** — 255 characters.
3. **Supported characters** — support entering all types of characters.
4. **Space handling** — cut off the spaces before and after the keyword before performing the search.
5. **Search action** — enter a keyword and press Enter, or wait for 3 seconds -> search for all records which satisfy **at least one** of the search criteria below.
6. **Search criteria + search type** — list each field the keyword is matched against, and its search type:
   - **ID-related / identifier fields** (ID number, DID, and often phone number) use **absolute search** (exact match: field = keyword).
   - **Descriptive fields** (name, etc.) use **relative search** (contains: field contains keyword).
   - Read the actual per-field search type from the input; the reference doc, for example, treats both DID and phone number as absolute and citizen name as relative.

Row (`Fields | Format | Required? | Description`):

| Search box | Textbox | No | Placeholder: `Search by [fields]`. Max length: 255 characters. Support entering all types of characters. Cut off the space before and after the keyword before performing search. Enter keyword and press Enter or wait for 3 seconds -> Search for all records which satisfy at least one of the following search criteria:<br>- [ID field] = keyword (Absolute search)<br>- [other field] contains keyword (Relative search)<br>- [other field] contains keyword (Relative search) |

## 3. Filter section

Comes **after the Search box** in the description table. Two parts: the filter icon (if present) and the filter criteria.

### Inline filter section vs. filter popup — decide first

If a **filter icon** is visible, determine from the capture how clicking it reveals the filters:

- **Inline filter section** — clicking the icon expands/collapses a filter row **right below the icon**, within the same list screen. Document it inline as described in 3a/3b below (criteria search as the value is selected).
- **Filter popup** — clicking the icon opens a **floating popup / panel** (often with its own Apply button). In this case:
  - On the **list screen**, the filter icon row is simply: `Filter icon | Icon | No | Click on -> Open the filter popup (Screen ##.N). If filter criteria are being applied, display the number of applied criteria in a red badge on the filter icon`.
  - Document the popup as its **own screen section** (`Screen ##.N: Filter popup`) with its own description table — see "3c. Filter popup (separate screen)" below.
  - Do NOT list the filter criteria inline on the list screen; they belong in the popup's table.

Signals it's a popup: the filter panel floats over the content with a card/shadow, is offset from the icon, or has an **Apply** button. Signals it's inline: the filters appear as a flush row directly beneath the search/icon bar with no Apply button (criteria apply as selected).

### 3a. Filter icon

If the screen has a filter icon, describe it **first**, before the criteria. Wording depends on the reveal type:

- Inline: `Filter icon | Icon | No | Click on -> expand or collapse the filter section. If filter criteria are being applied, display the number of applied filter criteria in a red circle on top of the filter icon`
- Popup: `Filter icon | Icon | No | Click on -> Open the filter popup (Screen ##.N). If filter criteria are being applied, display the number of applied criteria in a red badge on the filter icon`

### 3b. Filter criteria (inline filter section only)

If a filter icon is present and the filters are **inline**, **all filter criteria are collapsed by default**. List each filter criterion as its own row. The Format and Description depend on the control type.

**Standard search-action wording** (use these exact forms for the criterion's search action):
- **Datepicker — start date**: `Click on -> Search for all records with [date name] from the specified date onwards`
- **Datepicker — end date**: `Click on -> Search for all records with [date name] from the specified date backwards`
- **Datepicker — single box selecting 2 dates**: `Click on -> Search for all records with [date name] in the specified date range`
- **Dropdown**: `Click on -> Search for all records with [criteria] = selected option`

In a **filter popup** (3c), the criterion does not search on selection; instead each criterion sets its value and the search happens on Apply. In that case keep the same wording but the actual search is triggered by the Apply button (see 3c) — the Apply row carries "Search for all records which satisfy all the specified filter criteria".

The Format and Description depend on the control type:

**Dropdown filter** (`Format: Dropdown`)

Description must include, in order:
- **Placeholder**: `Select [Object]` (e.g. "Select Status").
- **Default selection**: None.
- **Click on** -> display the list of options: `All [Object]` (e.g. "All Status") first, then the other values. **Check the actual values in the corresponding column of the grid-view screenshot** — don't invent them. Where the input provides a definition for a status/option, **include it inline** after the option (e.g. "Issued: DID has been successfully issued on the blockchain").
- Allow **single selection only**; selecting an option automatically deselects the current selection.
- **Click on** -> Search for all records with [criteria] = selected option.

| [Criterion name] | Dropdown | No | Placeholder: `Select [Object]`. Default selection: None. Click on -> Display the list of options: `All [Object]`, [value 1], [value 2], ... (values taken from the [column] column in the screenshot). Allow single selection only; selecting an option automatically deselects the current selection. Click on -> Search for all records with [criteria] = selected option |

*Searchable dropdown*: if the dropdown is searchable, add that clicking the dropdown lets the user enter keywords, and include the same searchbox details as the Search box block (max length 255, support all characters, trim leading/trailing spaces, relative/absolute matching of the typed keyword against the options).

**Datepicker filter** (`Format: Datepicker`) — check the number of boxes in the screenshot:

- **1 box** (single box selecting 2 dates): Click on -> display a datepicker. `Click on -> Search for all records with [date name] in the specified date range`.
- **2 boxes** (start date + end date): the criterion spans **two table rows** with the first three columns **vertically merged**. The `Fields` cell (criterion name, e.g. `Joined Date`), the `Format` cell (`Datepicker`), and the `Required?` cell are each merged across both rows (vertical merge: restart in row 1, continue in row 2). The **Description** column is NOT merged: row 1's Description holds the **Start Date** block, row 2's Description holds the **End Date** block. Each block:
  - Placeholder (`[X] From` / `[X] To`), Date format `YYYY/MM/DD`.
  - Click on -> display a datepicker.
  - Disable future dates.
  - Cross-disable: if an end date is selected, disable dates after it in the start picker (and vice versa).
  - Search action: Start -> `Search for all records with [date name] from the specified date onwards`; End -> `Search for all records with [date name] from the specified date backwards`.

Row layout for 2 boxes — three merged cells + two separate Description cells (do NOT put End Date in the Fields column):

| [Criterion] *(merged ↓)* | Datepicker *(merged ↓)* | No *(merged ↓)* | **Start Date**<br>- Placeholder: `[X] From`<br>- Date format: YYYY/MM/DD<br>- Click on -> Display a datepicker<br>- Disable future dates<br>- If an end date is already selected, disable all dates after it<br>- Click on -> Search for all records with [date name] from the specified date onwards |
| *(merged from above)* | *(merged)* | *(merged)* | **End Date**<br>- Placeholder: `[X] To`<br>- Date format: YYYY/MM/DD<br>- Click on -> Display a datepicker<br>- Disable future dates<br>- If a start date is already selected, disable all dates before it<br>- Click on -> Search for all records with [date name] from the specified date backwards |

When generating a `.docx`, implement this with docx-js `verticalMerge: VerticalMergeType.RESTART` on the three cells of the first row and `VerticalMergeType.CONTINUE` (with an empty paragraph child) on the three cells of the second row.

For a single-box range:

| [Criterion] (1 box) | Datepicker | No | Click on -> display a datepicker. Click on -> Search for all records with [date name] in the specified date range. Disable future dates |

**Checkbox filter** (`Format: Checkbox`)

- Display condition (first line): `Always display`.
- Default status (second line): `Default status: Unchecked`.
- Check the checkbox -> filter records having [filter object]. Uncheck -> remove this filter criterion.

| [Criterion name] | Checkbox | No | Always display. Default status: Unchecked. Check the checkbox -> filter records having [filter object]. Uncheck -> remove this filter criterion |

### 3c. Filter popup (separate screen)

If the filter icon opens a **popup** (not an inline section), document the popup as its own screen section: `Screen ##.N: Filter popup`, with its own screen capture and description table. The popup's description table has this structure:

1. **Close-behaviour row** — the FIRST row of the popup table **must** describe how to close the popup. This is a **full-width merged row spanning all 4 columns** (styled like a section-header row: section-fill background, spanning the Fields/Format/Required?/Description columns), NOT a normal 4-column row. Its content: `The popup can be closed by clicking out of it. Closing the popup redirects to the underlying screen (Screen ##.N)`. Implement it the same way as `sectionRow` (a single cell with `columnSpan: 4` and section fill). Do NOT add a separate title/"Filters" row before it.
2. **Filter criteria rows** — describe each filter criterion using the **same rules as 3b** (datepicker two-box vertical merge, dropdown with inline option definitions, checkbox defaults, etc.), using the **standard search-action wording** from 3b. In a popup the actual search fires on Apply, so the criterion rows use the same "Click on -> Search for all records with …" wording and the Apply row states that it applies all criteria.
3. **Apply button row** — the LAST row: `Apply | Button | No | Click on -> Search for all records which satisfy all the specified filter criteria`.

So a filter popup screen table reads: **merged Close-behaviour row** -> [all filter criteria] -> Apply button.

Example skeleton:

| **(merged, spanning all 4 columns)** The popup can be closed by clicking out of it. Closing the popup redirects to the underlying screen (Screen ##.N) | | | |
| [Datepicker / Dropdown / Checkbox criteria per 3b] | ... | No | ... |
| Apply | Button | No | Click on -> Search for all records which satisfy all the specified filter criteria |

## 4. Reset icon

Comes after the Filter section.

| Reset icon | Icon | No | Click on -> Reset all search, sort, and filter criteria to their default values |

## 5. Column settings icon

On the list screen (near the table). Opens the Column Settings popup, which is documented as its **own screen section** (`Screen ##.N: Column Settings popup`) with its own description table.

| Column settings icon | Icon | No | Click on -> Display the Column Settings popup (see the Column Settings popup screen section) |

## 6. Column Settings popup

A separate screen — give it its own `Screen ##.N: Column Settings popup` section with its own description table. The reference doc uses these rows:

**Close-behaviour note** (top row, spanning): `Click out to close the pop-up without saving the current setting`.

| Column setting | Text | No | Display content: "Column Setting" |
| Selected column | Text | No | Display format: `{Number of columns selected} column selected`. `{Number of columns selected}` is updated automatically when the admin selects or unselects a column |

**Column checkbox** — one row listing every column with its default state:
- List each column checkbox with `default = tick` or `default = untick`, taken from the capture.
- No and Action (when present): `default = tick, disabled - unable to untick`.
- Admin can tick to select multiple columns and cannot untick the No and Action columns.
- Column setup is saved in localStorage, remains after refresh (F5), and resets to the default only when localStorage is cleared.
- If the admin attempts to select more than the max (from the alert text, e.g. 10) -> display error message E19 under the button and prevent additional column selection.

| Column checkbox | Checkbox | No | Display the column display checkboxes:<br>- No: default = tick, disabled - unable to untick<br>- [Column]: default = tick<br>- [Column]: default = untick<br>- ... (every column, with its default)<br>- Action: default = tick, disabled - unable to untick<br>Admin can tick to select multiple columns and cannot untick the No and Action columns. Column setup is saved in localStorage, remains after refresh (F5), and resets to default only when localStorage is cleared. If the admin attempts to select more than [N] checkboxes -> Display error message E19 under the button and prevent additional column selection |

| Warning | Text | No | Display content: "NOTE: You can select up to [N] columns" |

**Apply button** — validates top-to-bottom (order matters):
- If the admin only selects No and Action (as default) -> display error message E14 under the button.
- If the admin attempts to select more than [N] checkboxes -> display error message E19 under the button.
- If all conditions above are satisfied -> close the popup and update the columns in the table.

| Apply | Button | No | Click on -> Validate in the following order (from top to bottom):<br>- If admin only selects No. and Action checkbox (as default) -> display error message E14 under the button<br>- If the admin attempts to select more than [N] checkboxes -> Display error message E19 under the button<br>- If all conditions above are satisfied -> Close the popup and update the columns in the table |

*Error codes E8 (empty/no-match), E14 (only No+Action selected), E19 (over the column limit) follow the reference doc's convention; carry the input's actual codes through if they differ.*

## 7. [Entity] List / Table

Comes after the Column settings icon, on the list screen. It consists of: the `[Entity] List` section-header, a total-count row, then the `[Entity] Table` section-header carrying the table-level rules, then **one row per column**, and finally a **page-number row**.

### Total-count row

| Total [Entity] | Text | No | Display the total number of records in the [entity] table. The value changes according to search and filter |

### Table-level rules (on the `[Entity] Table` section-header row)

Put all table-level rules in the Description of the `[Entity] Table` section-header row:
- Display the list of [object] registered in the system.
- If any record has no data, display "--".
- If there are no [object] registered in the system, display error message E8.
- If there are [object] registered but none matches the specified search and filter criteria, display error message E8.
- If there are matched results, display the list of matched results:
  - Default sorting by [first sortable column], from newest to oldest. Allow sorting by [the columns with a sort icon].
  - Default number of records per page follows pagination. If the number of records exceeds the pagination limit, divide into pages, each displaying up to the pagination limit.

| **[Entity] Table** (with the rules above in its Description) | | | |

### Per-column rows (default style)

Describe **each column in the grid as its own row**, in display order. For each column:
- **Fields** = the column header name.
- **Format** = the format of the column's **value in each row** (Number, Text, Datetime, Icon, …) — NOT "Row".
- **Required?** = No (display-only).
- **Description** covers, as applicable:
  - The **meaning** of the value in each row.
  - **Shortened display format** if the value is truncated (e.g. a wallet address / DID shown as `[6 initial characters]...[4 ending characters]`, or "following Common Rule N"); note the "--" empty-value display where relevant.
  - **Copy icon**, if present next to the value: `Click on the copy icon → Copy the full value into the clipboard`.
  - **Buttons / hyperlinks / action icons**, if present: describe the action (e.g. `Click on the View Details icon → Go to the details page of the selected [object] (refer to FR## - View [Object] Details)`).
  - **Sortable** columns: note "Sortable".
  - **Derived / cross-referenced columns**: add the definition inline and cite the source FR.

```
| No | Number | No | The ordinal number of the record in the current page |
| [Column] | [Number/Text/Datetime/…] | No | [Meaning]. [Shortened display if any]. [Copy-icon behavior if any]. [Sortable if applicable] |
| … one row per column … |
| Action | Icon | No | Click on the View (eye) icon → Go to the details page of the selected [object] (refer to FR## - View [Object] Details) |
```

### Page-number row (last row of the table block)

| Page number | Text | No | Click on a page number → Go to the corresponding page |

### Alternative: single Row style

Some older documents instead use **one** row with Format `Row` whose Description bullet-lists every column in display order (Action and copy-icon behavior described inside the bullets), with no separate page-number row. Only use this if the user or the project's reference doc specifically calls for it; the **default is the per-column style above**.
