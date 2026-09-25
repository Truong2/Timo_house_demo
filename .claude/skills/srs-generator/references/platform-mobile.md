# Platform: Mobile

The skillset for documenting a **mobile application screen**. Every screen type in `screen-types/` was written for **website** screens. This file is a **delta layer**: it does not replace those files — it overrides specific rules and swaps the shell blocks. Read the screen-type file first, then apply this file on top.

Read this file whenever the capture is a mobile screen (see §1).

---

## 1. Platform detection (do this before anything else)

Determine the platform from the **screen capture** itself. Do not ask the user first — detect, then state your conclusion and let them correct it.

### 1a. Shape (first signal, not sufficient alone)

| Aspect ratio (width ÷ height) | Reading |
| :-- | :-- |
| `>= 1.2` (landscape, wide) | Website |
| `<= 0.75` (portrait, narrow) | Mobile |
| between | **Ambiguous** — a cropped web popup or a tablet. Go to 1b. |

### 1b. Corroborating signals (decisive)

**Mobile** — the capture shows one or more of:
- A **device status bar** (clock, signal bars, wifi, battery) across the top.
- A **notch / dynamic island / punch-hole** or a rounded device frame.
- A **bottom navigation bar**: 3–5 icon+label tabs pinned to the bottom edge.
- **No left navigation rail** and **no breadcrumb / page directory**.
- Single-column content: full-width stacked cards, large touch targets.

**Website** — the capture shows one or more of:
- A **left menu rail** (collapsed icon strip, or expanded with labels).
- A **header bar** with page directory / breadcrumb, language dropdown, notification icon, admin account block.
- Multi-column layouts, or a dense data table with column headers and a page-number row.

The two example captures in this skill's development: web = left icon rail + `Management / Citizens / Details` breadcrumb + `English` dropdown + admin email; mobile = `9:41` status bar + notch + `Home / Credentials / Verifications / Notifications / Profile` bottom bar.

### 1c. Mixed inputs

A single FR can contain **both** platforms (e.g. an admin web console and a citizen mobile app in the same flow). Classify **each capture independently**; a screen section follows the platform of its own capture. Say so explicitly when you present the scaffold.

### 1d. State the detection

Before writing, tell the user what you concluded, e.g.:

> "These captures are **mobile** screens (portrait, status bar + bottom tab bar), so I'll use the mobile conventions. Screen type — is this a **list screen**, **detail screen**, **bottom sheet**, or **input form**?"

If the shape is ambiguous and the signals don't settle it (a cropped component, a tablet layout), **ask**.

---

## 2. Device chrome is NOT documented

The following belong to the **device / OS**, not the application, and never appear as rows in a description table:

- The status bar (clock, signal, wifi, battery).
- The notch, dynamic island, home indicator bar, device frame / bezel.
- OS-level back gestures and the Android hardware back button (unless the app overrides it — then document the override as a rule on the screen's Back button row).

Crop them out mentally. The first documented element is the app's own topmost element.

---

## 3. Vocabulary overrides

**`Click on ->` is kept on mobile.** It is the house convention across all Ekotek FR documents, web and mobile alike; it reads as "activate this element", not "use a mouse". Do **not** rewrite it to `Tap on`.

Only the interactions with no mouse equivalent change:

| Web wording | Mobile wording |
| :-- | :-- |
| `Click on ->` | `Click on ->` *(unchanged)* |
| `Click out of the popup` | `Click out of the popup` *(unchanged)*, plus `swipe down to dismiss` when the sheet has a drag handle |
| `Hover on -> Display tooltip` | `Click on the (?) icon -> Display tooltip` (no hover on touch) |
| `Hover on the frame -> Display 2 icons` | `Click on the frame -> Display 2 icons` |
| `Enter keyword and press Enter or wait for 3 seconds` | `Click on -> Display a keyboard to enter search keyword (insert keyboard capture##). After entering keyword and pressing Enter key -> Search for …` |
| `Page number row` | Infinity scroll — see §7e |
| `Popup` | `Popup`, or `Bottom sheet` when the capture shows one — see §6c |
| `Redirect to [screen]` | `Go to [screen]` |

Everything else — the 4-column table, the `Fields | Format | Required? | Description` contract, action arrows, one-sentence-per-bullet, inline option behaviour, red-flagging of unknowns, error codes, vertical merge, row height and cell padding — is **unchanged**.

**There is no hover state on mobile.** Any inherited rule that depends on hover must be re-expressed as a click, a long-press, or removed. If the capture doesn't reveal how a hover-only web affordance works on mobile, **red-flag it and ask**.

---

## 4. Format vocabulary additions

Beyond the web vocabulary (`Text`, `Textbox`, `Dropdown`, `Datepicker`, `Checkbox`, `Icon`, `Button`, `Tab`, `Tag`, `Image`, `Video`, `Carousel`, `Toggle`, `File uploader`, chart formats):

- `Tab Bar Item` — an entry in the bottom navigation bar.
- `Card` — a tappable content tile (see §6a).
- `Toast` — a transient message strip (see §6b).
- `Bottom sheet` — a panel sliding up from the bottom edge.
- `Switch` — the mobile rendering of a Toggle; use `Toggle` for consistency unless the project calls it a switch.
- `Segmented control` — a two-to-four option inline selector (mobile's rendering of a tab strip inside content).
- `Link` — an inline text action such as `VIEW ALL >`.
- `Badge` — the count bubble on an icon or tab (see §6e).
- `Avatar` — a circular profile image or initials disc.

Do NOT use `Menu Item` (that is the web left-nav format) — use `Tab Bar Item`.

---

## 5. Shell blocks

The web shell is **Left Menu + Header**. On mobile it is **Screen header + Bottom navigation bar**. Substitute directly: wherever a web screen-type file says "start with Left Menu, then Header", a mobile screen starts with the blocks below.

### 5a. Screen header (top app bar)

The app's own top strip, immediately below the device status bar. It is **not** the web Header block — there is no page directory, no language dropdown, no admin account block.

Read its composition from the capture. Common shapes:
- **Back + title** (`<` arrow, screen title, sometimes a right-hand action icon).
- **Greeting header** (a welcome line, the user's name, an avatar or logo) — typical of a home screen.
- **None** — some screens run content to the top edge.

Rows (`Fields | Format | Required? | Description`):

| **Screen Header** | | | |
| Back button | Icon | No | - Always display<br>- Always enabled<br>- Click on -> Go back to the previous screen<br>- *(If the screen has unsaved input, apply the Back-button branching rule from `screen-types/input-form.md` §3a)* |
| Screen title | Text | No | - Display content: "[title as captured]"<br>- Unclickable |
| [Right action icon] | Icon | No | - Click on -> [action] |

For a greeting header:

| **Screen Header** | | | |
| Welcome text | Text | No | - Display content: "WELCOME," followed by the logged-in user's full name<br>- If the user's name is unavailable, display "--" |
| [Logo / Avatar] | Image | No | - Display [the organisation logo / the user's avatar]<br>- Unclickable *(or the tap action, if any)* |

**Language setting.** Web puts it in the Header. Mobile normally puts it in a Profile / Settings screen, not on every screen. Only document it where the capture actually shows it.

### 5b. Bottom navigation bar

The mobile replacement for the web **Left Menu**. Same rules, adapted:

- Display the tabs **in the order they appear in the capture, left to right**.
- The **first tab** is the **default tab** (shown when the app is opened).
- Each tab is **highlighted when it is the selected tab** — read the highlight treatment from the capture (e.g. filled icon, coloured label, underline bar).
- Tapping a tab navigates to that tab's screen (cite the target FR).
- The bar is **persistent** across the tabs' root screens, and **hidden** on screens pushed on top of them (detail screens, forms) — check the capture and state which applies.
- If a tab carries a **badge**, describe it per §6e.

| **Bottom Navigation Bar**<br>- Always display on the root screen of each tab<br>- [Hidden on screens navigated to from a tab / Always display] | | | |
| [First tab] | Tab Bar Item | No | - Default tab when opening the application<br>- Highlight the tab while being selected<br>- Click on -> Display [its screen] |
| [Tab] | Tab Bar Item | No | - Highlight the tab while being selected<br>- Click on -> Display [target screen] (refer to FR## - [target screen name]) |
| [Notifications tab] | Tab Bar Item | No | - Highlight the tab while being selected<br>- If there are unread notifications, display a red badge with the number of unread notifications on top of the icon. If there are more than 99, display 99+<br>- Click on -> Display [target screen] (refer to FR## - [target screen name]) |

### 5c. Dev-only elements

Mobile prototypes frequently ship a **dev toggle / debug menu** (the `DEV TOGGLES` strip in the example capture). This is **not part of the specification**.

- Do **not** write a description row for it.
- Add a single **red** note under the screen's capture caption: `Dev-only element (DEV TOGGLES) present in the capture — confirm it is excluded from the specification`.
- If the user confirms it is in scope, document it as an ordinary component.

Apply the same treatment to any element visibly labelled dev, debug, mock, or QA.

---

## 6. Screen-type deltas

Read the web screen-type file, then apply the delta. Only the differences are listed.

### 6a. List screen — **not a delta**

The mobile list screen diverges from `grid-view.md` far enough that it has its own standalone contract: **`screen-types/mobile-list.md`**. Read that file instead of `grid-view.md`.

Summary of the divergence, for orientation only:
- **Dropped**: the Column settings icon, the Column Settings popup, the per-column rows, and the page-number row.
- **Added**: tabs as orange content sections, the searchbox's position-dependent scope (above the tabs = all tabs, below = the current tab), quick-action buttons above the filter icon, and the infinity-scroll pagination rule.
- **Changed**: the list's common rules move onto a **blue** section-header row; each card detail becomes its own description row.

`mobile-list.md` still draws the Screen header and Bottom navigation bar from §5 of this file, and the Format vocabulary from §4.

### 6b. Detail screen (delta on `screen-types/detail.md`)

A screen showing the full information of a single record. **Almost entirely inherited** from `detail.md`. Describe every component **top to bottom, then left to right** of the capture (§1 golden rule). The detail-page conventions — orange section-header rows for sections, capture-order description, collapsible sections, tabs in two parts, and the text / table / button / image / carousel / chart component rules — all apply unchanged. Only the deltas below differ.

**Shell & vocabulary:**
- Shell: §5a / §5b instead of Left Menu + Header.
- Vocabulary: §3 (Click on kept; no hover).

**1. Back button / X button** (the screen's top-left dismiss control). Describe with the standard **three-point button rule** (`detail.md` §3d): display condition, enable condition, action. The action is `Click on -> Go back to the previous screen`. A detail screen opened as an overlay may show an **X** instead of a back arrow — same three points, same action wording (`Click on -> Go back to the previous screen`). Put this row in the Screen header block (§5a).

**2. Information (label–value fields)** — follow `detail.md` §3b unchanged: **meaning** (`Display [field name] of [object name]`), then **display format** when applicable (`Display format: YYYY/MM/DD`, etc.), then any **icon next to the value** described by its click action (`Copy icon: Click on -> Copy the full value into the clipboard`; a clickable value → `Click on -> Go to the [related] detail screen (refer to FR##)`, FR## red).

**3. Information group (section)** — on mobile a section is a full-width **card/rectangle**. Mark the start of each section with an **orange section-header row** bearing the section title, then the section's information rows (point 2) beneath it, in capture order. This is the same as the general multi-section rule (`grid-view.md` §5) and detail.md §2.
  - **Collapsible section** (with an up/down arrow): on the section's orange header row, state `Default status: Expanded` or `Default status: Collapsed` (read from the capture), and `Click on the up/down arrow -> Collapse / Expand the section`.

**4. Button** — the standard three-point button rule (`detail.md` §3d): display condition, enable condition, `Click on -> Go to screen## (refer to FR##)` with the whole action line red (or the in-place action, still red).

**5. Tabs** — when the detail screen is divided into tabs, describe them with the **existing tab rule, `detail.md` §3a**, unchanged: two parts — (a) the **tab-list rows** (one row per tab, mark the leftmost as `Default tab`, `Highlight the tab while being selected`, `Click on -> Go to [tab name]`; if a tab's content isn't in the captures, **ask for the missing capture**), then (b) **one orange section per tab's content**, headed with the tab name (`[Tab name] Tab`), described as a sub-section of the same screen — never a new `Screen ##.N`. Inside each tab's orange section, describe its components (Information, Buttons, etc.) in capture order per points 2–4.
  - Mobile rendering: tabs usually appear as a **segmented control** or a scrollable tab strip; keep Format `Tab` and add `Horizontally scrollable` if they overflow the width.
  - **If a tab's body is a list of records** (e.g. an "Issued Credentials" tab showing a card list), that tab's orange section nests the mobile **list** treatment: the blue `[Entity] List` common-rules row (`mobile-list.md` §8) plus one row per card detail (`mobile-list.md` §9), inside the tab's orange section. This is the one place mobile detail and mobile list meet.

**Other inherited specifics:**
- A **section** on mobile is a full-width **card**, not a page-width rectangle — same orange-header treatment.
- A **table inside a detail screen** follows §6a's card block, not the web per-column rules — unless the capture shows a horizontally scrollable table, in which case keep the web rules and add `The table is horizontally scrollable`.
- **Charts** — inherited wholesale from `detail.md` §3g, with `Hover on a data point` → `Click on a data point`. The tracking-period dropdown often renders as a segmented control on mobile; the option-meaning rules (`Tracking period from [Start time] to [End time]`) are unchanged.

### 6c. Bottom sheet / dialog (delta on `screen-types/popup.md`)

Mobile has two modal shapes. Read which one from the capture:

- **Bottom sheet** — slides up from the bottom edge, anchored to it, usually with a drag handle (a short horizontal bar) at the top. Format `Bottom sheet`.
- **Dialog** — a centred card floating over a dimmed backdrop. Format matches the web `popup`.

Everything in `popup.md` applies: the close-behaviour row first, components in capture order, CTA rows last, the mandatory-field rule (asterisk, or none-marked-means-all-mandatory), and the per-component rules 3d–3j.

**Close-behaviour row — same rule as the web popup (`popup.md` §3a).** Use the web rule exactly: a **full-width merged row spanning all 4 columns, styled like a section-header row with orange fill** (`#FCE4D6`, no separate title row, no "Close behaviour" label in the Fields column). The sentence pattern is the web one, unchanged — `The [modal] can be closed by [means] or by clicking out of the [modal]. Closing the [modal] redirects the user to the underlying screen without any changes saved.` — with only two mobile substitutions:

- `popup` → `bottom sheet` when the capture shows one anchored to the bottom edge (a `dialog`/centred modal keeps the word `popup`, matching web).
- Add the mobile dismissal gestures to the `[means]` list: **swipe it down** when the sheet has a **drag handle**, and **tapping outside of it** (mobile's equivalent of "clicking out of").

Applying the web rule to each shape gives:

- **Bottom sheet with a drag handle (no X)**: `The bottom sheet can be closed by swiping it down or by clicking out of it. Closing the bottom sheet redirects the user to the underlying screen without any changes saved.`
- **Bottom sheet with an X icon and a drag handle**: `The bottom sheet can be closed by the X icon, by swiping it down, or by clicking out of it. Closing the bottom sheet redirects the user to the underlying screen without any changes saved.`
- **Dialog with an X icon**: `The popup can be closed by the X icon or by clicking out of it. Closing the popup redirects the user to the underlying screen without any changes saved.`
- **No X icon and no drag handle**: `The [bottom sheet / popup] cannot be closed by clicking out of it.` (Closing is then only possible via its own buttons — describe those with the CTA rows.)

**Delta — file uploader (`popup.md` §3i).** On mobile, `Click on "Upload" -> Display a popup to select file from local device` becomes:

```
Click on "Upload" -> Display the native file/photo picker
  - If the app requests permission for the first time -> Display the OS permission prompt (see §7a)
```

Camera-based uploads add a source-choice sheet — document it as its own screen section if the capture shows one.

### 6d. Input form / form-entering screen (delta on `screen-types/input-form.md`)

A full screen for entering a form, optionally divided into steps. Describe every component **top to bottom, then left to right** (§1). **Inherited wholesale** from `input-form.md`: the Back-button branching rule, one-screen-per-step with the shell described once in step 1, the orange section rows grouping fields, and the Edit-screen convention.

**Shell & vocabulary:**
- Shell: §5a / §5b. The bottom navigation bar is usually **hidden** on a form screen — say so on the shell row.
- Vocabulary: §3 (Click on kept; no hover).

The components you may encounter:

**1. Progress bar** — when the process is divided into steps. Describe it with the **same rule as the web form** (`input-form.md` §3b): a progress-bar row (`Display the current progress in the [creation/edition] process`, `All current and completed steps are highlighted`, plus any visual rule from the capture), and a `Step n: [step name]` row marking which step the table documents. One screen/table per step; shell described once in step 1.

**2. Mandatory fields** — a component is **mandatory** when an **asterisk (\*)** appears next to its name, **or** when **none** of the fields on the screen have an asterisk (`input-form.md` / `popup.md` §3c). Mandatory fields carry the mandatory-check line and `Required? = Yes`.

**3. Textbox** — follow the canonical textbox rule (`popup.md` §3d) for placeholder, accepted characters, max length (including the text 255/256, number 12/16, percentage 3/6 defaults), mandatory check, entering-0 check, and max-value check. **Mobile delta — the keyboard:** clicking a textbox opens the mobile keyboard. Add: `Click on -> Display [keyboard type] (insert capture##)` where
  - **number field** → `number keypad`,
  - **otherwise** → `full keyboard`.
  `capture##` is **red** (a keyboard capture is supplied).

**4. Dropdown** — follow the canonical dropdown rule (`popup.md` §3e) for placeholder, default selection, mandatory check, and single/multiple-selection permission. **Mobile delta — it opens a bottom sheet, not an inline list:** replace the list-of-options line with `Click on -> Display a bottom sheet containing the following options:` and list each option as a dot point. Add: `Selecting an option automatically closes the bottom sheet and returns to the underlying screen with the selected option displayed.`

**5. Checkbox / Toggle / Datepicker** — same as the web form (`popup.md` §3g checkbox, §3h toggle, §3f datepicker), with the mobile substitutions: datepicker opens the **native date picker** (`Click on -> Display the native date picker`; selectable-range rules unchanged); checkbox/toggle wording unchanged (display condition first, then default status).

**6. CTA button** — follow the web CTA rule (`input-form.md` §3d) for the name and the validate-in-order action. **Mobile delta — the enable condition:** the CTA is `Enabled only when all mandatory fields are filled` (rather than always enabled). Keep the three-point button structure (display condition, this enable condition, action).

**Step navigation (Back / Next)** — inherited from `input-form.md` §3c; usually **pinned to the bottom** of the screen above the safe area — note `Pinned to the bottom of the screen` when the capture shows that.

---

## 7. Mobile-only components

Describe each in capture order, like any other component.

### 7a. Permission prompt

When an action needs a device capability (camera, location, photo library, notifications, biometrics), the OS shows a permission prompt the first time.

- The prompt is **OS chrome** — do not write a description row for its buttons.
- Instead, describe the branch on the **triggering element's** row:

```
Click on -> Check the [camera] permission status
  - If permission has not been requested -> Display the OS permission prompt
    - If the user grants permission -> [proceed to the intended action]
    - If the user denies permission -> Display error message E## and remain on the current screen
  - If permission was previously denied -> Display a dialog directing the user to the device Settings (Screen ##)
  - If permission is granted -> [proceed to the intended action]
```

`E##` and `Screen ##` are **red** unless the input supplies them.

### 7b. Card

A tappable content tile. Describe:
- **Meaning**: `Display [what the card shows]`.
- **Appear condition**: `Always appear` / `Only appear when [condition]`.
- **Action when clicking**: `Click on -> [action]`, or `Unclickable` if it is display-only.
- Then **one row per element inside the card**, in capture order, if the card has more than a label and a value.

| [Card name] | Card | No | - Display [meaning]<br>- Always appear<br>- Click on -> Go to [screen] (refer to FR##) |

### 7c. Toast / snackbar

A transient message strip, usually at the top or bottom edge, that disappears on its own.

- **Trigger**: state which action produces it, on **that action's row** (`Click on -> ... and display a success toast`).
- **Content**: `Display content: "[exact text as captured]"`.
- **Duration**: `Automatically disappear after [N] seconds` — read N from the input; **red-flag** it if unknown.
- **Dismissal**: `Swipe to dismiss` / `Click on the X icon to dismiss`, if the capture shows one.

A toast is **not** a screen section. It gets a row in the description table of the screen that raises it.

### 7d. Pull to refresh

If the screen supports it: `Pull the screen down from the top -> Reload the [entity] list with the current search, filter and sort criteria applied`. State it on the list's section-header row. If the capture doesn't reveal whether it is supported, **ask** rather than assume.

### 7e. Scrolling and pagination

Mobile lists replace the web page-number row. Determine which pattern from the capture or the input:

- **Infinite scroll**: `Default number of records loaded: [N]. Scroll to the bottom of the list -> Load the next [N] records. Display a loading indicator while loading. When all records are loaded, no further records are loaded.`
- **Load more button**: a `Button` row — `Only appear when there are unloaded records. Click on -> Load the next [N] records`.
- **Paginated**: keep the web page-number row.

If the pattern isn't determinable from the capture, **red-flag it and ask**. Never default silently to one.

### 7f. See all / View all link

An inline text action next to a section title that opens the full list (the `VIEW ALL ›` in the example capture).

| View All | Link | No | - Only appear when there is at least one [entity]<br>- Click on -> Go to [the full list screen] (refer to FR## - View [Entity] List) |

### 7g. Badge

A count bubble on an icon, a tab, or a card.

`If there are [unread items], display a red badge with the number of [unread items] on top of the [icon]. If there are more than 99, display 99+. If there are none, hide the badge.`

### 7h. Empty state

A mobile list's empty state is usually an illustration plus a message, not an error code.

- If the input's convention uses error codes, keep them (`display error message E##`).
- If the capture shows an illustrated empty state, describe it: `If there are no [entity], display the empty state: an illustration and the content "[exact text]"`, plus any CTA button inside it.

---

## 8. Offline and connectivity

If the application has an offline mode, state on each action's row whether it requires connectivity:

- `This action requires an internet connection. If the device is offline -> Display error message E##`
- `This action can be performed offline.`

Do not invent connectivity requirements. If the input doesn't state them and the capture doesn't show an offline indicator, leave them out.

---

## 9. Output overrides (docx)

Everything in SKILL.md's docx section holds — Poppins throughout, 11pt body text, one size per heading level, decimal-numbered headings, bold centered caption **below** each capture, 4-column tables, uniform row height (`460 atLeast`) and cell margins, red runs for unknowns, portrait Letter with 0.5″ margins, and the `[Current Page]/[Total number of pages]` footer on every page.

Two overrides for mobile captures:

**Capture width and layout.** A mobile capture is tall and narrow. Embedding it at the web width (~560px) makes it taller than the page. Instead:
- **One capture per line, always.** Embed each capture **centered at ~300px wide**, preserving aspect ratio (a 345×680 capture becomes ~300×591), with its **bold centered caption on the line directly below it**. Never place two captures on the same line, whatever the case count.
- **Multiple cases**: stack them **vertically**, one capture per line, each with its own caption (`Screen ##.N.1: …`, `Screen ##.N.2: …`), in case order. A tall run of cases simply flows onto the next page — do not shrink them or place them side by side to fit more per line.

**Mixed-platform documents.** When one FR contains both web and mobile screen sections, size each capture by **its own** platform (web ~560px, mobile ~240px). Do not normalise them to a common width.
