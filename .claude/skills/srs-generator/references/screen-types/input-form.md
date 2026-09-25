# Screen type: Input form

The skillset for documenting an **input form screen** — usually a **Create** or **Edit** screen. Unlike a popup, it is a full screen (not a modal), and it may be divided into multiple **steps**.

The document-level skeleton (Business Rule once, screen sections in the middle, Pre-condition/User steps once) is shared with the other screen types and lives in the main SKILL.md.

---

## 1. Section structure

- **Screen heading**: `Screen ##.N: [Screen name]` (e.g. `Screen 12.1: Create Issuer`). The screen-number prefix IS used; the heading text is repeated in bold below it.
- **Screen capture**: embedded and centered under the heading, with the screen name repeated as a bold centered caption below.
- **Description table**: the 4-column `Fields | Format | Required? | Description` spec.

**If the form is divided into steps**, each step is documented as its **own screen** with its **own description table** (`Screen ##.1`, `Screen ##.2`, …), each starting with the progress-bar row (see 3b).

**Do not repeat unchanged shell sections across steps.** The Left Menu, Header, and any other page-level chrome that is identical on every step should be described **once only, in the first step's description table**. In the subsequent steps' tables, omit those sections entirely and begin with the progress-bar row. Only describe a shell section again in a later step if it genuinely differs there (and then describe only the difference). The same applies to any page-level element repeated verbatim across steps (e.g. the page title, breadcrumb, or page Back button).

The description-table mechanics (4 columns, Format vocabulary, action arrows `->`, inline definitions, cross-references, section-header rows, vertical cell merging, uniform row height/padding, red-flagging of unknowns) are identical to the other screen types.

**The input-field components are the same as the popup skillset** (see `popup.md` sections 3c–3j): the mandatory-field rule (asterisk, or none-marked-means-all-mandatory), Textbox, Dropdown, Datepicker, Checkbox, Toggle, File uploader, and Table-as-input, each with their appear/enable conditions and validation lines. `Required? = Yes` for mandatory fields.

This file defines only what is **specific to an input form**: the Back button, the progress bar and step navigation, the CTA buttons, and the Edit-screen convention.

## 2. Content order

*(On a stepped form, items 0–1 appear only in the first step's table; later steps begin at item 2.)*

0. **Shell** — Left Menu, Header, page title/breadcrumb. Described once, in the first step only (see section 1).
1. **Back button** (if visible) — see 3a.
2. **Progress bar + step indicator** (if the form has steps) — see 3b.
3. **Input fields** — in capture order, following the popup component rules (`popup.md` 3c–3j).

   **Group fields into sections with an orange row.** Whenever multiple fields belong to the same section of the screen (a titled card, a toggled block, a bordered group), precede them with an **orange section-header row** spanning all 4 columns, carrying the section name. This matches the detail-page convention (fill `#FCE4D6`, label in regular weight). Fields then follow beneath their section row, in capture order. A field that stands alone outside any section needs no orange row.
4. **Step navigation buttons** (Back / Next), if the form has steps — see 3c.
5. **CTA button(s)** — see 3d.

## 3. Input-form specifics

### 3a. Back button

Check whether a Back button is visible. Its description is written as a **branching structure with each sentence as its own bullet**, not a single run-on line:

```
Click on -> check if there are any changes made to input
  - If there are not -> go back to the previous screen
  - If there are -> display a confirmation popup (Provide screen capture ##) (Screen ##)
```

The `Provide screen capture ##` and `Screen ##` references are **coloured red**. Use the same nested-bullet structure for the **Discard** and **Cancel** buttons, which behave the same way.

| Back | Button | No | Always appear. Always enabled. Click on -> check if there are any changes made to input<br>- If there are not -> go back to the previous screen<br>- If there are -> display a confirmation popup (Provide screen capture ## in red) (Screen ## in red) |

### 3b. Progress bar and steps

Check whether the form is divided into steps: a **progress bar** appears below the page title on the screen capture.

If so:
- Add a **separate row** in the description table for the progress bar. Its Fields cell holds the progress-bar image/label; its Description states:
  - `Display the current progress in the [creation/edition] process`
  - `All current and completed steps are highlighted`
  - Include any other visual rule read from the capture (e.g. `Blue checkmark appears on completed steps`).
- Add a **row signalling which step is being described** (e.g. a section-header row `Step 1: [step name]`), because **each step is a separate screen with its own description table**.

| Progress Bar | [image] | No | - Display the current progress in the [creation] process<br>- All current and completed steps are highlighted<br>- [Other visual rules read from the capture] |

### 3c. Step navigation buttons (Back / Next)

If the creation/edition process is divided into steps, the screen has **Back** and **Next** buttons. Describe each with appear condition, enable condition, and action:

- **Next**: does **not** appear on the last step. `Click on -> Go to the next step`.
- **Back**: does **not** appear on the first step. `Click on -> Go to the previous step`.
  - If a Back button **does** appear on the first step, it is the Back button of 3a — apply that description instead.

| Next | Button | No | Only appear when the current step is not the last step. [Enable condition]. Click on -> Go to the next step |
| Back | Button | No | Only appear when the current step is not the first step. [Enable condition]. Click on -> Go to the previous step |

### 3d. CTA buttons

Describe every CTA with **appear condition**, **enable condition**, and **action when clicking**.

**Create / Add button** (creation screens). Name format: `Create [Object]` / `Add [Object]`.

Action:
```
Click on -> Validate in the following order:
- If there are any fields with invalid values, display error messages as mentioned above
- Specify additional validations (if applicable)##   <- red
- If all conditions above are satisfied, display confirmation popup (Screen ##)   <- Screen ## red
```

| Create [Object] | Button | No | [Appear condition]. [Enable condition]. Click on -> Validate in the following order:<br>- If there are any fields with invalid values, display error messages as mentioned above<br>- Specify additional validations## (red)<br>- If all conditions above are satisfied, display confirmation popup (Screen ## in red) |

**Save Changes button** (edit screens) — same description pattern as the Create button.

**Discard button** — functions the same as the Back button; apply the 3a description rule (including its nested-bullet branching structure).

**Any other button** — describe appear condition and enable condition, then add a row appending the action:
`Click on -> Validate in the following order: Specify validation rules#` — with the placeholder **coloured red**.

### 3e. Edit screen convention

When describing an **Edit** screen, do NOT repeat the create screen's field logic. Instead:

1. Add a row **directly below the title row** containing these two lines:
   - `Apart from the following points, all logics and processings are similar to those of creation screen (refer to FR##)` — with `FR##` **coloured red**.
   - `The default values of all fields are set to those of the latest version`
2. Add **one row per input field** of the screen. Fill only **Field name**, **Format**, and **Mandatory** (`Required?`). In the Description cell put only this line, **coloured red**:
   - `Please specify any differences in this field from the create screen. If there are no differences, please remove this row`
3. Then describe the **CTA buttons** normally (3d).

| *(row below title)* | | | Apart from the following points, all logics and processings are similar to those of creation screen (refer to FR## in red). The default values of all fields are set to those of the latest version |
| [Field name] | [Format] | Yes/No | Please specify any differences in this field from the create screen. If there are no differences, please remove this row *(red)* |
| … one row per input field … | | | |
| [CTA buttons per 3d] | | | |
