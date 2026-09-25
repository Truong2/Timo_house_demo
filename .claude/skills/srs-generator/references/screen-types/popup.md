# Screen type: Popup

The skillset for documenting a **popup** (modal/dialog) screen: a window layered over a parent screen, opened by an action on that parent (a button, an icon, a row action). Examples: confirmation popups (Delete / Block / Approve / Reject), form popups (create/edit with input fields), and view-only info popups.

The document-level skeleton (Business Rule once, screen sections in the middle, Pre-condition/User steps once) is shared with the other screen types and lives in the main SKILL.md.

---

## 1. Section structure

A popup is documented as its **own screen section** with its own description table — never as a row or sub-section of the parent screen.

- **Screen heading**: `Screen ##.N: [Popup name]` (e.g. `Screen 27.2: Block Citizen confirmation popup`). The screen-number prefix IS used; the heading text is repeated in bold below it.
- **Screen capture**: embedded and centered under the heading, with the popup name repeated as a bold centered caption below. Multiple cases of the same popup follow the three-part numbering (`Screen ##.N.1`, `##.N.2`, …), one caption per capture, in a single section with one description table.
- **Description table**: the 4-column `Fields | Format | Required? | Description` spec.

**On the parent screen**, the action that opens the popup references it: `Click on -> Display [popup name] (Screen ##.N)`, or for a confirmation action `Click on -> Display [action name] confirmation popup (Screen ##.N)`.

The description-table mechanics (4 columns, Format vocabulary, action arrows `->`, inline definitions, cross-references, section-header rows, vertical cell merging, uniform row height/padding, red-flagging of unknowns) are identical to the other screen types; refer to `grid-view.md` and `detail.md` for those shared rules. This file defines only what is **specific to a popup**.

**Format values used on popups**: `Text`, `Textbox`, `Dropdown`, `Datepicker`, `Checkbox`, `Toggle`, `File uploader`, `Button`, `Icon`, plus `Row` / column value types when the popup contains a table.

**The `Required?` column matters on popups.** Unlike view-only screens (where every row is `No`), popups contain input fields: set `Required? = Yes` for mandatory fields (per the rule in 3c) and `No` otherwise.

## 2. Content order

Every popup's description table follows this order:

1. **Close-behaviour row** (see 3a) — always the FIRST row.
2. **Popup components** — described in capture order (top to bottom, left to right), using the component rules in section 3.
3. **CTA button(s)** (see 3k) — the LAST row(s).

## 3. Popup components

Describe the components in capture order. A popup usually contains some of the following.

### 3a. Close behaviour (first row)

A **full-width merged row spanning all 4 columns** (styled like a section-header row: **orange fill** `#FCE4D6`, spanning Fields/Format/Required?/Description). Do NOT add a separate title row before it. Its content depends on whether the capture shows an **X icon**:

- **If there IS an X icon**: `The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved.`
- **If there is NO X icon**: `The popup cannot be closed by clicking out of it.` (Closing is then only possible via the popup's own buttons — describe those in 3i.)

### 3b. Message

Usually found on a **confirmation popup** (a popup asking the user to confirm proceeding with an action). Describe the content exactly as captured:

`Content format: [Exact content as captured from the screen capture provided]`

| [Message] | Text | No | Content format: "[exact message text from the capture]" |

### 3c. Mandatory-field rule (applies to 3d–3i)

An input field (textbox / dropdown / datepicker / checkbox / toggle / file uploader) is **mandatory** when:
- an **asterisk (*)** appears next to its title, **or**
- **none** of the input fields on the popup are marked with an asterisk.

Mandatory fields get a **mandatory check** line: `If clicking out of the field while it is blank -> Show error message E##` — with `E##` **coloured red** (the analyst fills in the code).

### 3d. Textbox

Describe, in order:
- **Appearing condition**: `Always display`, or `Display only when [condition]` (use this when the component does not display in all provided captures of the same popup).
- **Enable condition**: `Always enable`, or `Enable only when [condition]` (use this when the component is not enabled in all provided captures of the same popup).
- **Placeholder**: `Placeholder: [text as on the screen capture]`.
- **Accepted characters**: `Allow entering [types of characters]`, determined by the field's value type:
  - **Text value** → `Allow entering all types of characters`.
  - **Numeric value, integer only** → `Allow entering numeric values` (integers).
  - **Numeric value, decimals supported** → `Allow entering integer and decimal values`.
- **Max length**: `Max length: [number]`, defaulted by value type when the capture doesn't show an explicit limit:
  - **Text field** → `255` (or `256`) characters when the count isn't detectable from the capture.
  - **Non-percentage number field, integer only** → `12` characters.
  - **Non-percentage number field, integer + decimal** → `16` characters (12 integer digits + decimal separator + 3 decimal digits).
  - **Percentage field, integer only** → `3` characters.
  - **Percentage field, integer + decimal** → `6` characters (3 integer digits + decimal separator + 3 decimal digits).
- **Mandatory check** (mandatory fields only): `If clicking out of field while it is blank -> Show error message E##` (red).
- **Positive value check** (numeric/decimal fields only): `If entering 0, display error message E##` (red).
- **Maximum value check** (fields with a max limit on the capture, or percentage fields where max = 100): `If entering a value exceeding [max value / 100 for percentage], display error message E##` (red).

| [Field name] | Textbox | Yes/No | Always display. Always enable. Placeholder: "[…]". Allow entering […]. Max length: […]. [Mandatory check]. [Positive value check]. [Max value check] |

### 3e. Dropdown

Describe, in order:
- **Appearing condition**: `Always display` / `Display only when [condition]`.
- **Placeholder**: `Placeholder: [text as on the screen capture]`.
- **Default selection**: `Default selection: [value from the capture, otherwise None]`.
- **Mandatory check** (mandatory fields only): `If clicking out of field while it is blank -> Show error message E##` (red).
- **List of selections**: `Click on -> Display the list of following options: [options detected from the capture]`.
- **Selection permission** — check whether the capture shows multiple selections on the dropdown:
  - Single selection: `Allow single selection only. Selecting an option automatically deselects the previous selection`.
  - Multiple selection: `Allow single and multiple selection`.
- **Action when selecting**: `Select an option -> ##` — with `##` **coloured red** (the analyst fills in the resulting behaviour).

| [Field name] | Dropdown | Yes/No | Always display. Placeholder: "[…]". Default selection: […]. [Mandatory check]. Click on -> Display the list of following options: […]. [Selection permission]. Select an option -> ## (red) |

### 3f. Datepicker

Describe, in order:
- **Appearing condition**: `Always display` / `Display only when [condition]`.
- **Placeholder**: `Placeholder: [text as on the screen capture]`.
- **Default selection**: `Default selection: [value from the capture, otherwise None]`.
- **List of selections**: `Click on -> Display a datepicker as follow Screen capture ##`.
- **Mandatory check** (mandatory fields only): `If clicking out of field while it is blank -> Show error message E##` (red).
- **Selectable date range**:
  - `Disable past dates`.
  - If it is a **start date** field: `If an end date is selected, disable all dates after the specified end date`.
  - If it is an **end date** field: `If a start date is selected, disable all dates before the specified start date`.
- **Action when selecting**: `Select a date -> ##` — with `##` **coloured red**.

| [Field name] | Datepicker | Yes/No | Always display. Placeholder: "[…]". Default selection: […]. Click on -> Display a datepicker as follow Screen capture ##. [Mandatory check]. Disable past dates. [Start/end cross-disable line]. Select a date -> ## (red) |

### 3g. Checkbox

Describe, in order:
- **Display condition**: `Always display` / `Display only when [condition]` — always the **first** line.
- **Default status**: `Default status: Checked` or `Default status: Unchecked` — the **second** line.
- **Action when checking**: `Tick the checkbox -> ##` (red).
- **Action when unchecking**: `Untick the checkbox -> ##` (red).
- If **mandatory**: add `Clicking out of field while it is blank -> Show error message E##` (red).

| [Field name] | Checkbox | Yes/No | Always display. Default status: Unchecked. Tick the checkbox -> ## (red). Untick the checkbox -> ## (red). [Mandatory check] |

### 3h. Toggle

Same rules as the checkbox (3g), including **display condition first, then default status**, but the two states are **Toggle on** and **Toggle off**; adjust the wording accordingly:
- **Default status**: `Default status: Toggle on` / `Default status: Toggle off` (second line, after the display condition).
- **Action**: `Toggle on -> ##` (red); `Toggle off -> ##` (red).
- If mandatory: add the mandatory-check line.

| [Field name] | Toggle | Yes/No | Always display. Default status: Toggle off. Toggle on -> ## (red). Toggle off -> ## (red). [Mandatory check] |

### 3i. File uploader

An input field for uploading a file. Describe, in order:

- **Instruction text**: the exact instruction text as detected on the screen capture.
- **Acceptable actions**: `Allow dragging and dropping file, as well as uploading from local device`.
- **Action on clicking**: `Click on "Upload" -> Display a popup to select file from local device (Screen capture ##)` — with `##` **coloured red**.
- **Validation 1 — Mandatory check** (only if the field is mandatory per the rule in 3c): `If clicking out of field while it is blank -> Show error message E##` (red).
- **Validation 2 — File format and size** (checked after selecting a file):
  - Format: `Supported file format: [list of supported formats as detected on the screen capture]. If the selected file is in an unsupported format, display error message E##` (red).
  - Size: `Maximum file size: [max limit as detected on the screen capture]. If the selected file is in a supported format yet the file size exceeds the limit, show error message E##` (red).
- **Validation 3 — Valid file**: `If the file is of valid format and size, display the selected file in the frame.` Then describe how the file can be **replaced or removed**, exactly as the capture shows. Common patterns:
  - An `x` icon on the file: `Click on the x icon -> Delete the file`.
  - Hover actions: `Hover on the frame -> Display 2 icons:` then
    - `Pencil icon: Click on -> Open a popup to select file from local device. After selecting a valid file, replace the old file with the new file`
    - `Trash icon: Click on -> Delete the current file`

| [Field name] | File uploader | Yes/No | [Instruction text as captured]. Allow dragging and dropping file, as well as uploading from local device. Click on "Upload" -> Display a popup to select file from local device (Screen capture ## in red). [Mandatory check if applicable]. Supported file format: […]. If the selected file is in an unsupported format, display error message E## (red). Maximum file size: […]. If the selected file is in a supported format yet the file size exceeds the limit, show error message E## (red). If the file is of valid format and size, display the selected file in the frame. [Replace/remove actions as captured] |

### 3j. Table (as an input field)

Some input fields take the form of a table. Apply the **table description rules** from the grid-view / detail screen types (table-level rules on a section-header row, then one row per column).

Additionally:
- **Default rows**: `Default: 1 row without data entered`.
- **Each cell**: detect the type of input field in each cell (textbox / dropdown / datepicker / checkbox / …) and apply that component's describing rule (3d–3i) to it.
- **Row-adding button** (if the table has one): describe it as a button — appear condition, enable condition, then `Click on -> Add a new row without data entered at the bottom of the table`.

### 3k. CTA buttons (last rows)

The popup's primary and secondary actions. Same as describing buttons in other screen types — describe:
- **Appear condition**: `Always appear` / `Only appear when [condition]`.
- **Enable condition**: `Always enabled` / `Only enabled when [condition]`.
- **Action**: `Click on -> …`.

| [Button name] | Button | No | [Appear condition]. [Enable condition]. Click on -> [action] |

---

## Red-flagging in popups

Popups carry more unknowns than other screens. Colour **red** every `E##` error code and every `##` placeholder for an unspecified action or screen-capture reference, so the analyst can fill them in. Everything readable from the capture (placeholder text, options, defaults, message content) is written normally.
