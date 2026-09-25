# Screen type: List screen (mobile)

The skillset for documenting a **mobile list screen**: a screen showing a list of records as cards, optionally divided into tabs, with a searchbox, a filter icon, and quick-action buttons.

This is the mobile counterpart of `grid-view.md`. It is a **standalone contract**, not a delta — read this file instead of `grid-view.md` when the platform is mobile (see `../platform-mobile.md` §1) and the screen type is a list. The document-level skeleton (Business Rule once, screen sections in the middle, Pre-condition/User steps once) still lives in the main SKILL.md, and the shell blocks (Screen header, Bottom navigation bar) still come from `../platform-mobile.md` §5.

---

## 1. Golden rule: capture order

Describe every component **from top to bottom, then from left to right**. Each component is one row of the description table. This ordering governs everything below — the content order in §2 is simply what that ordering usually produces.

## 2. Content order

1. **Screen header** — from `../platform-mobile.md` §5a.
2. **Quick-action buttons** — if any sit above the filter icon (§6).
3. **Searchbox** — if it sits **above** the tabs (§4).
4. **Filter icon** — if it sits **above** the tabs (§5).
5. **Tab list** — one row per tab (§3).
6. **Per tab**, an **orange section-header row** bearing the tab title, then inside it:
   - **Searchbox** — if it sits **below** the tabs (§4).
   - **Filter icon** — if it sits **below** the tabs (§5).
   - **Total-records line** — if present (§7).
   - **Blue section-header row** carrying the list's common rules (§8).
   - **One row per detail** shown on a card (§9).
7. **Bottom navigation bar** — from `../platform-mobile.md` §5b.

If the screen has **no tabs**, skip steps 5–6's orange row and describe the searchbox, filter, total line, list rules, and card details directly in that order.

### Two section-row colours

| Colour | Fill | Used for |
| :-- | :-- | :-- |
| **Orange** | `#FCE4D6` | A **tab's content section** — the tab title (§3) |
| **Blue** | the grid-view `sectionRow` fill | The **list's common rules** (§8) |

Both span all 4 columns, with the label in regular weight (the fill colour is what marks the row), per the section-header-row mechanics in `grid-view.md`.

## 3. Tabs

Some list screens are divided into tabs. For the **tab list**, one row per tab, left to right:

- The **default tab** is the first one on the left.
- The currently selected tab is **highlighted**.
- A tab may show a **number next to the tab name** — it is the **total number of records in that tab's list**. If so, describe it: `Display the total number of [object name] in the [tab name] tab. The number changes according to [search and/or filter, per their appearance on the screen]`. When tab counts are present, the separate total-records line (§7) is usually absent — don't invent one.
- Action: `Click on -> Display the content of the selected tab`.

| [First tab] | Tab | No | - Default tab<br>- Highlight the tab while being selected<br>- Display the total number of [object name] in the [tab name] tab next to the tab name. The number changes according to [search and/or filter]<br>- Click on -> Display the content of the selected tab |
| [Tab] | Tab | No | - Highlight the tab while being selected<br>- Display the total number of [object name] in the [tab name] tab next to the tab name. The number changes according to [search and/or filter]<br>- Click on -> Display the content of the selected tab |

**Keep the count and its change-rule in one bullet.** The record count and the sentence stating what it changes with ("The number changes according to …") describe the same value, so write them as a **single bullet**, not two — here and in the §7 total-records line. The same joins-one-value rule applies wherever a displayed value is immediately followed by the rule that governs it.

Then **each tab's content becomes its own orange section** in the same description table, headed with the tab title:

| **[Tab name]** *(orange, spanning all 4 columns)* | | | |

Do **not** promote a tab into a separate `Screen ##.N` section, and do not describe a tab's inner components inline in the tab-list rows.

**Repeated components across tabs.** When the searchbox / filter / list rules / card details are identical in every tab, describe them fully in the **first** tab's orange section and, in the later tabs' sections, describe only what genuinely differs. When they differ per tab (different search criteria, different card fields), describe each in full.

## 4. Searchbox

Describe, in this order:

1. **Placeholder**: `Placeholder: [text as detected from the screen capture]`
2. **Max length**: `Max length: [number] characters`

   > ⚠️ Read the number from the input. `grid-view.md` (web) states **255**; the mobile spec was given as "usually **256**". These are almost certainly the same limit written two ways. Confirm the project's value once and use it on both platforms rather than letting them diverge.
3. **Supported characters**: `Allow entering all types of characters`
4. **Space handling**: `Cut off the space before and after the keyword before searching`
5. **Action**: `Click on -> Display a keyboard to enter search keyword (insert keyboard capture##)`
6. **Search action**: `After entering keyword and pressing Enter key -> Search for all records in [applied tabs] that satisfies at least one of the following conditions:` followed by the condition list.

`capture##` is **red** — a keyboard capture must be supplied.

### 4a. Applied tabs — read it from the searchbox's position

| Searchbox position | `[applied tabs]` |
| :-- | :-- |
| **Above** the tabs | `all tabs` |
| **Below** the tabs | the **name of the tab being described** |
| No tabs on the screen | omit the `in [applied tabs]` clause |

A searchbox above the tabs is described **once**, before the tab list. A searchbox below the tabs is described **inside each tab's orange section**, each time naming that tab.

### 4b. Condition list

One bullet per condition, in the order the fields appear in the placeholder. Format:

`[Condition name as detected from the placeholder]: [search type]`

Search type is determined by the field:

| Field kind | Search type |
| :-- | :-- |
| Name, email | `[Criterion name] contains the specified keyword (Relative search)` |
| ID, phone number, address | `[Criterion name] = specified keyword (Absolute search)` |

If a field falls outside both lists, **ask** rather than guess.

**Row:**

| Search box | Textbox | No | - Placeholder: "[text as detected from the screen capture]"<br>- Max length: [N] characters<br>- Allow entering all types of characters<br>- Cut off the space before and after the keyword before searching<br>- Click on -> Display a keyboard to enter search keyword (insert keyboard capture##)<br>- After entering keyword and pressing Enter key -> Search for all records in [applied tabs] that satisfies at least one of the following conditions:<br>  - [Condition name]: [Criterion name] contains the specified keyword (Relative search)<br>  - [Condition name]: [Criterion name] = specified keyword (Absolute search) |

## 5. Filter

**Scope follows the searchbox.** If the searchbox searches across multiple tabs at once, the filter also filters all tabs at once — and vice versa. Determine the searchbox's scope from §4a, then apply the same scope to the filter. If there is no searchbox, read the filter icon's own position against the tabs the same way.

On mobile the filter icon almost always opens a **filter popup**:

- `Click on -> Open filter popup (Screen ##)`
- If filter criteria are being applied, a number is displayed on top of the icon.

Document the popup as its **own screen section** (`Screen ##.N: Filter popup`), following `popup.md` with the mobile close-behaviour rules from `../platform-mobile.md` §6c. Do **not** list the filter criteria on the list screen.

| Filter icon | Icon | No | - Click on -> Open filter popup (Screen ##)<br>- If there are filter criteria being applied, display the number of applied filter criteria on top of the filter icon |

`Screen ##` is **red** until the popup's screen number is assigned.

## 6. Quick-action buttons

Buttons sitting **above the filter icon** for quick actions. They come **before** the filter icon in the description table (capture order). Describe them with the standard **three-point button rule** (`detail.md` §3d) — the same three points, same wording, on every screen type:

1. **Display condition**: `Always display`, or `Display only when##`
2. **Enable condition**: `Always enabled`, or `Enabled only when##`
3. **Action when clicking**: `Click on -> Go to screen## (refer to FR##)` — the **whole `Click on -> …` line is red**. (For a button that performs an in-place action rather than navigating, describe that action instead, still red.)

Every `##` placeholder is **red** — the analyst fills in the condition, screen, or FR number.

| [Button name] | Button | No | - Always display<br>- Always enabled<br>- Click on -> Go to screen## (refer to FR##) *(the Click on -> … line in red)* |

## 7. Total-records line

Some screens carry no counts on the tab titles but show a line above the list instead, e.g. `Total Issued Credentials: 1`.

- **Format**: `Total [object name]: [Number]`
- **Meaning**: `Display the total number of [object name] in the list`
- **Logic**: `The number changes according to [search and/or filter]` — name only the controls that actually appear on the screen. Search only → `according to search`. Both → `according to search and filter`.

| Total [object name] | Text | No | - Display format: "Total [object name]: [Number]"<br>- Display the total number of [object name] in the list. The number changes according to [search and filter] |

If the tabs already carry counts (§3), this line is usually absent. Never emit both without seeing both in the capture.

## 8. List common rules (blue section-header row)

A **blue** section-header row spanning all 4 columns, whose Description carries the list's common rules. Cover, in this order:

1. **No data**: `If there are no [object name], display error message ##`
2. **No match**: `If there are no [object name] matched with the specified [search and filter] criteria, display error message ##`
3. **Matched data**: `In case of matched results, display the list of result:` then, as sub-bullets:
   - **Default sorting**: `Default sorting by [criterion name], from [order] to [order]` (e.g. `from newest to oldest`)
   - **Pagination**: `The list supports infinity scrolls. FE will get 10 records from BE per API call, once 70% of the collected records are called, FE will trigger another API call`
   - **Item action**: `Click on -> Go to detail page of the selected [object name] (refer to screen##)` — with `refer to screen##` in **red**

**Grammatical number in the object name.** Use the **plural** for countable nouns (`If there are no credentials`), the **singular** for uncountable nouns (`If there is no data`). Match the verb accordingly.

Name only the controls that exist on the screen in rule 2 — `the specified search criteria` if there is no filter, `the specified search and filter criteria` if both are present.

`##` error codes are **red** unless the input supplies the project's codes (E8, E14, …), in which case carry those through.

| **[Object name] List** *(blue, spanning all 4 columns)*<br>- If there are no [object name], display error message ##<br>- If there are no [object name] matched with the specified [search and filter] criteria, display error message ##<br>- In case of matched results, display the list of result:<br>  - Default sorting by [criterion name], from [order] to [order]<br>  - The list supports infinity scrolls. FE will get 10 records from BE per API call, once 70% of the collected records are called, FE will trigger another API call<br>  - Click on -> Go to detail page of the selected [object name] (refer to screen##) | | | |

## 9. Card details

On mobile each item in the list is a **card**. Describe the card's details **in capture order** (§1) — one detail per row of the description table. Do not collapse the card into a single row.

For each detail, describe:

1. **Meaning**: `Display [detail name] of [object name]`
2. **Display format**: `Display format: [format]` — read the format from the capture (e.g. `YYYY/MM/DD hh:mm:ss` for a datetime, a shortened `[6 initial characters]...[4 ending characters]` for an identifier). Omit this line when the value is plain text with no format.

   > ⚠️ Always read the datetime order off the capture rather than reusing a remembered example. The reference captures render `2025/04/22 00:12:23` and `2025/09/28 08:02:05` — that is **`YYYY/MM/DD hh:mm:ss`**, matching `grid-view.md`.

Then, when the capture shows them, add the applicable lines from the shared conventions:
- **Copy icon**: `Click on the copy icon -> Copy the full value into the clipboard`
- **Tag / status**: define each status value inline
- **Empty value**: `If [detail name] has no data, display "--"`
- **Its own action**, if the detail is tappable independently of the card body

| [Detail name] | [Text / Tag / Icon / Image] | No | - Display [detail name] of [object name]<br>- Display format: [format]<br>- [Copy-icon / empty-value / status-definition lines, if applicable] |

The card body's own tap action is **not** repeated here — it belongs on the blue list-rules row (§8).

---

## Skeleton

```
Screen ##.N: [Screen name]
**Screen ##.N: [Screen name]**

  [Screen Header]                          <- platform-mobile.md §5a
  [Quick-action buttons]                   <- §6
  [Search box]         (if above the tabs) <- §4, applied tabs = all tabs
  [Filter icon]        (if above the tabs) <- §5

  [Tab 1] | [Tab 2] | ...                  <- §3, tab-list rows

  ORANGE: [Tab 1]                          <- §3
    [Search box]       (if below the tabs) <- §4, applied tabs = Tab 1
    [Filter icon]      (if below the tabs) <- §5
    [Total [object]]                       <- §7
    BLUE:  [Object] List (common rules)    <- §8
    [Card detail 1]                        <- §9
    [Card detail 2]
    ...

  ORANGE: [Tab 2]
    ... (only what differs from Tab 1)

  [Bottom Navigation Bar]                  <- platform-mobile.md §5b
```

---

## Inherited, unchanged

Everything not named above comes from the shared contract: the 4-column `Fields | Format | Required? | Description` table, the Format vocabulary (plus the mobile additions in `../platform-mobile.md` §4), one sentence per bullet with nested conditional sub-bullets, option-specific actions written inline with the option, cross-references preserved not invented, vertical cell merging, uniform row height (`460 atLeast`) and cell margins, and red-flagging of every unknown. See `grid-view.md` sections "The description table", "Description writing conventions", and "Section-header rows".

Not applicable on mobile: the **Column settings icon**, the **Column Settings popup**, the **per-column rows**, and the **page-number row**. Drop all four.
