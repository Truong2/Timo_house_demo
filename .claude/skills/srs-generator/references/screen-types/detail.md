# Screen type: Detail page

The skillset for documenting a **detail page**: a screen that displays the full information of a single record (e.g. View Citizen Details, View Verification Details, View Application Details), usually reached from a list screen's row action. This is the screen-type-specific contract; the document-level skeleton (Business Rule once, screen sections in the middle, Pre-condition/User steps once) is shared with the grid-view type and lives in the main SKILL.md.

---

## 1. Section structure

Same document skeleton as grid view:

- **Business Rule section** (top, once): a 2-column `label | content` table (Authorization, [Action] Rule, [Action] Impact). See `../business-rule.md`.
- **Screen heading**: `Screen ##.N: [screen name]` (e.g. `Screen 27.1: Citizen Details`). The screen-number prefix IS used; the heading text is repeated in bold below it.
- **Screen capture**: embedded and centered under the heading, with the screen name repeated as a bold centered caption below.

**Multiple cases of the same screen.** A detail page often has several visual cases/states (e.g. New / Active / Blocked, or different tabs). Document them in a **single screen section with one description table**: the table covers all cases, and case-specific components carry "Only appear when …" conditions. Give each case's capture its own three-part number `Screen [FR].[N].[case]: [Screen Name] ([Case])` (e.g. `Screen 27.1.1: Citizen Details (Active)`, `Screen 27.1.2: Citizen Details (Blocked)`), written as a **bold, centered caption directly below** that case's capture. Do NOT create a separate section or a separate description table per case.
- **Description table**: the 4-column `Fields | Format | Required? | Description` spec for that screen (same table format, control types, and description conventions as grid view — see `grid-view.md` sections "The description table", "Control types", "Description writing conventions", and "Section-header rows").
- **Closing table**: a 2-column `Pre-condition` / `User steps` table after the last screen section.

The description-table mechanics (4 columns, Format vocabulary, action arrows `->`, inline definitions, cross-references, error codes, section-header rows, vertical cell merging, uniform row height/padding) are identical to grid view; refer to `grid-view.md` for those shared rules. This file defines only what is **specific to a detail page**: its content order and block conventions.

**Additional Format values used on detail pages** (beyond the grid-view vocabulary): `Tab`, `Tag` (a coloured status tag), `Image`, `Video`, `Carousel`, and chart formats such as `Line graph with shaded area`, `Bar chart`, `Pie chart` (use the chart's actual visual type as the Format). Use `Button` for buttons and button-dropdowns, `Text` for label–value display fields, `Dropdown` for the tracking-period selector.

## 2. Content order & sections

Describe the components **in the order they appear in the screen capture: top to bottom, then left to right** within each row.

**Sections = full-width rectangles.** When the capture shows a rectangle/card that spans across the screen (e.g. "Overview", "Submitted Information"), it is a **separate section**. In the description table, mark the start of each section with a **section-header row coloured ORANGE** that spans all 4 columns and holds the section name, then describe the components inside it (in the top-to-bottom, left-to-right order above).

> Detail-page section rows are **orange** (fill `#FCE4D6`, label in regular weight), distinct from grid-view's blue section-header rows. Implement like a spanning `sectionRow` but with the orange fill.

The top area of the page (above the first section rectangle) is itself described first, in capture order — typically: Back button, page title/ID, submitted date, status, and the action buttons (Approve/Reject/etc.). Then each full-width section follows as its own orange-headed group.

### Collapsible components (applies to any section or component)

Some sections/components have an up/down arrow (collapsible). Whenever you see one, add to that component's (or section row's) description:
- `Default status: [Collapsed / Expanded]` (read the default state from the capture).
- `Click on the up/down arrow -> Collapse / Expand the section`.

## 3. Component types

A detail page may contain these components: Tabs (3a), Text (3b), Table (3c), Buttons (3d), Image/Video (3e), Carousel (3f), and Chart (3g). Describe each with the conventions below, always in capture order.

### 3a. Tabs

Tabs are documented in **two parts**:

**Part 1 — the tab list.** Where the tabs appear in the capture, list every tab as its own row:
- First, check whether the capture shows **all** tabs' content. If a tab's screen isn't provided, **ask the user to provide the capture of the missing tab** before describing it.
- Indicate the **default tab** (the first tab on the left): `Default tab`.
- Add: `Highlight the tab while being selected`.
- Add the action: `Click on -> Go to [tab name]`.

| [Tab name] | Tab | No | Default tab. Highlight the tab while being selected. Click on -> Go to [tab name] |
| [Other tab] | Tab | No | Highlight the tab while being selected. Click on -> Go to [tab name] |

**Part 2 — one section per tab's content.** After the tab list, each tab's content is described in its **own orange section within the same screen** (NOT a new screen number), headed with the tab name (e.g. `[Tab name] Tab`). The header may carry a cross-reference label in parentheses when useful (e.g. `Application Tab (Screen ##.N)`), but the tab content remains an orange sub-section of the current screen — do not promote a tab into a separate `Screen ##.N` section. Inside that section:
- If the tab has status/rule information (e.g. a "[Object] Status" block explaining the statuses and transitions), describe it first as its own labelled sub-section (a section-header row), then the components.
- Then describe the tab's components (Text, Table, Buttons, etc.) in capture order, following their component rules.

So a tabbed section reads: **tab-list rows** -> **`[Tab 1] Tab` orange section** (status/rules + components) -> **`[Tab 2] Tab` orange section** (status/rules + components) -> …

Do not describe a tab's inner components inline in the tab-list rows; each tab's content belongs in its own section after the list.

### 3b. Text

Describe, in order:
- **Meaning**: `Display [field name] of [the object being described]`.
- **Content format** (when applicable):
  - Decimal values: `Display up to [N] digits` (N = number of decimal digits shown in the capture). For values smaller than the smallest representable value, `display as "0." + [N zeros] + "..."` with a tooltip showing the full value.
  - Datetime: `Format: YYYY/MM/DD hh:mm:ss` (or whatever the capture shows).
  - Other formats as shown in the capture.
- **Copy icon** (if present next to the text): `Copy icon: Click on -> Copy the full value into the clipboard`.
- **Clickable value** (coloured text with highlight): `Click on -> Go to the detail page of the related [field name] (refer to FR##)`. The `refer to FR##` must be **red** (needs a user-supplied FR number).
- **See More / See Less** (long text): `Display when the content length exceeds 3 lines`, and `Click on the "See More"/"See Less" button -> Expand / Collapse the section`.

| [Field name] | Text | No | Display [field name] of [object]. [Content format]. [Copy icon line if any]. [Clickable line if any]. [See More/Less lines if any] |

### 3c. Table

Describe **exactly following the grid-view table rules** (see `grid-view.md` section "[Entity] List / Table"): table-level rules on the section-header row, one row per column (Format = value type, meaning, shortened display, copy icon, action icons), and a page-number row if paginated.

### 3d. Buttons

Every button is described with **exactly these three points, in this order — each as its own separate bullet** in the Description cell (never merge the display and enable conditions onto one line):

1. **Display condition** — `Always display`, or `Display only when [condition]`.
2. **Enable condition** — `Always enabled`, or `Enabled only when [condition]`.
3. **Action when clicking** — `Click on -> Go to screen## (refer to FR##)`. The **whole action line is red**, including `Go to screen##` and `(refer to FR##)` (the analyst fills in the screen and FR numbers). Common patterns:
   - Navigate to another screen: `Click on -> Go to screen## (refer to FR##)`.
   - Create / Edit: `Click on -> Go to [Action name + Object] screen (refer to FR##)`.
   - Block / Unblock / Delete / Approve / Reject: `Click on -> Display [action name] confirmation popup (refer to FR##)`.
   - Other actions: **ask the user for the specification**.

`Always display` and `Always enabled` are **two distinct points** (display condition and enable condition) and must appear on **two separate bullets**, not combined as "Always display. Always enabled." on one line.

A button may be a **single button** or a **button dropdown**. For a **dropdown button** the action is `Click on -> display a dropdown for actions`; if the option list isn't visible in the capture, **ask the user for more screenshots**. A capture supplied purely to show a dropdown's option list is **reference-only**: use it to fill in the options, but do not embed it as a screen (see "Gather inputs" in SKILL.md).

(The example row below shows the points run together in prose for compactness; in the actual output each is its own bullet.)

| [Button name] | Button | No | - Always display<br>- Always enabled<br>- Click on -> Go to screen## (refer to FR##) *(the Click on -> … line in red)* |

### 3e. Image / Video

- **Meaning**: `Display [object name]`.
- **Action**: `Click on -> Open a popup to view the image/video in full`.

| [Image/Video name] | Image / Video | No | Display [object name]. Click on -> Open a popup to view the image/video in full |

### 3f. Carousel

- **Navigation**: `Click on the < > button -> Display the next items in the carousel`.
- **Item selection**: `Click on an item in the carousel -> Display the selected item`.

| [Carousel name] | Carousel | No | Click on the < > button -> Display the next items in the carousel. Click on an item in the carousel -> Display the selected item |

### 3g. Chart

Charts come in two types: **rectangular charts** (2-axis, e.g. line/bar with X and Y axes) and **pie charts**. A chart is usually paired with a **Tracking period** dropdown that controls the data range.

**Precede the chart with a section-header row.** Because a chart row's Description is long, put a **section-header row** (a filled spanning row, like `Chart` or the chart's name) immediately before the chart row, to visually separate the chart from the components before and after it. The tracking-period dropdown, if present, sits under this section-header row along with the chart. On a grid-view screen use the blue `sectionRow`; on a detail page the chart typically sits inside an orange tab/section, so use a blue `sectionRow` labelled `Chart` (or the chart's title) as the sub-section divider before the chart row.

**Describe the object being demonstrated.** In the chart's row of the description table (the row whose Fields cell holds the chart title), the **first description line** must state what the chart demonstrates: `Display [the object being demonstrated in the chart]` — e.g. "Display the total DEP holding trend of the pool over time", "Display the breakdown of companies by status". Put this line before the axis / slice descriptions.

**Tracking period dropdown** (describe first, if present):
- It is a dropdown of tracking-period options (e.g. Today, Last 24 hours, Last 7 days, Last 30 days, All Time, …). **Default option: "All Time"**.
- For **each** option, describe its meaning as `Tracking period from [Start time] to [End time]`, computing Start time as:
  - Last week / month / year: Start time = 00:00 of the first day of the week / month / year.
  - Last [N] days: Start time = 00:00 of [N] days before the current date.
  - Today: Start time = 00:00 of the current date.
  - Last [N] hours: Start time = [N] hours before now.
  - End time = now (in all cases).
- Selection permission: `Allow single selection only. Selecting an option automatically deselects the previous selection`.
- Action: `Select an option -> Update the chart to display the values recorded in the selected tracking period`.

| Tracking period | Dropdown | No | Default option: "All Time". Click on -> Display the list of options; for each option describe "Tracking period from [Start time] to [End time]" (see rules above), e.g. Today, Last 24 hours, Last 7 days, Last 30 days, All Time. Allow single selection only; selecting an option automatically deselects the previous selection. Select an option -> Update the chart to display the values recorded in the selected tracking period |

**Rectangular chart (2-axis)** — Format e.g. `Line graph with shaded area`, `Bar chart`. Describe, in order:
- **Object demonstrated**: `Display [the object being demonstrated in the chart]`.
- **Y-axis**: `Display the value of [tracking object]. Value marks on the axis change dynamically based on the demonstrated values`.
- **X-axis**: describe how the value marks change with the selected tracking period:
  - **< 30 days**: display all dates within the tracking period, each date shown in format `DD/MM`. Each mark represents the total [object] recorded on that date.
  - **Last 90 days**: select 31 dates — today plus the dates within the period whose ordinal numbers divide evenly by 3 (the 3rd, 6th, 9th, … date). Each mark = total [object] recorded on the selected date; date shown as `MM/DD`. If data is only available up to the last 30 days, display the same as Last 30 days.
  - **Last year**: for each month within the period, select 2 points — recorded at the beginning (1st) and the 15th of the month. Each mark = total [object] on the selected date; date shown as `MM/DD`.
  - **All Time**:
    - If total duration > 1 year: divide the axis into years; each year represents the total [object] recorded across the days in that year.
    - If total duration is between 30 days and 1 year: display the same as Last 90 days.
    - If total duration < 30 days: display the same as Last 30 days.
  - For any other >30-day period not covered above, **ask the user** for the grouping rule.
- **Tooltip on hover**: `Hover on a data point -> Display a tooltip with the following information: [list each piece of info with its meaning and display format]` (e.g. datetime format `DD/MM/YYYY`, value format).

| [Chart name] | [Line graph with shaded area / Bar chart] | No | - Display [the object being demonstrated in the chart]<br>- Y-axis: Display the value of [tracking object]. Value marks on the axis change dynamically based on the demonstrated values<br>- X-axis: Display time of demonstrated values. The value marks change based on the selected tracking period: (< 30 days) display all dates within the period, each date in format DD/MM, each mark = total [object] recorded in that date; (> 30 days) <r>confirm the X-axis grouping</r><br>- Hover on a data point -> Display a tooltip with: [info 1 (meaning + format)], [info 2], … |

**Pie chart** — describe, in order:
- **Object demonstrated**: `Display [the object being demonstrated in the chart]`.
- Then, for **each item/slice** in the chart:
  - **Item name**.
  - **Percentage value**: `{Percentage}% = {item value} / {total} x 100%` (cite the applicable Common Rule for the display format if one applies).
  - **Actual value**: `{Count} = [meaning]. Display full amount` (or the applicable display format).
  - **Tooltip** (if the slice has a `(?)` or hover tooltip): `Click (?) / Hover -> display tooltip: "[tooltip text]"`.

| [Pie chart name] | Pie chart | No | Display [the object being demonstrated in the chart].<br>For each item in the chart:<br>- [Item name]:<br>  - {Count} = [meaning of the actual value]. Display full amount<br>  - {Percentage}% = {Count} / [total] x 100%. Display follows [Common Rule N]<br>  - [If tooltip:] Click (?) / Hover -> display tooltip: "[tooltip text]"<br>- [next item] … |

---

## Standard blocks

The top area and each orange section are assembled from the component types above, in capture order. There is no fixed block list as in grid view — the detail page's structure is driven by the sections and components actually present in the capture. Reuse the shared grid-view conventions (control types, action arrows, error codes, section-header row mechanics, vertical merge, row height) for everything not specified here.
