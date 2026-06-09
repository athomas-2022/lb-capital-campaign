# LB Capital Campaign Website

The official website for the **LB Capital Campaign Committee** — a sub-committee of the LB Athletic Boosters, working with LB Local Schools to fund the future of LB Athletics.

- **Live site:** https://athomas-2022.github.io/lb-capital-campaign/
- **Hosted with:** GitHub Pages (auto-publishes from the `main` branch)

> 📄 A full, plain-English walkthrough lives in **"How to Update the Website - Guide.docx"** (kept privately, not in this repo). This README is the quick reference.

---

## How updates work

This is a plain static website (HTML/CSS/JS). **Every time you commit a change to `main`, the live site rebuilds automatically in about one minute.** No build tools, no installs — you can edit everything right here in your browser on GitHub.

**The basic routine for any edit:**
1. Open the file (almost always `index.html`).
2. Click the ✏️ pencil ("Edit this file").
3. Make your change.
4. Scroll down and click **Commit changes**.
5. Wait ~1 minute, then refresh the live site (`Ctrl + F5` to force the newest version).

💡 Press `Ctrl + F` while editing to find the exact text you want to change.

---

## Project structure

```
index.html              All page content and text (95% of edits happen here)
assets/
  css/style.css         Colors, fonts, layout (advanced — usually leave alone)
  js/main.js            Animations & interactivity (advanced — usually leave alone)
  images/               All photos
  social/               Social-media graphics (profile pic, banners)
```

---

## Quick edit reference

In `index.html`, use `Ctrl + F` to search for these:

| To change… | Search for… | Notes |
|---|---|---|
| Fundraising bar — **amount raised** | `data-count-to="185000"` | Plain number, no `$` or commas. The % updates itself. |
| Fundraising bar — **goal** | `data-goal="500000"` | Change this **and** the visible `$500,000` below it. |
| Main headline / committee name | `LB Capital Campaign Committee` | Edit the words between the tags. |
| A project's dollar amount | the project name (e.g. `Softball Field`) | Edit its amount. |
| Contact email | `lbcap2020@gmail.com` | Appears a few times. |
| Social media links | `instagram.com/` | Replace placeholder handles with your real URLs. |

### Golden rule for text
Only change the words **between** the tags — never delete the angle brackets `< >`.
Example: in `<h3>Stadium LED Lighting</h3>` you may edit `Stadium LED Lighting`, but leave `<h3>` and `</h3>`.
Type the `&` symbol as `&amp;` (e.g. `Track &amp; Field`).

### Adding a donor
Find the giving level (`id="panel-cornerstone"`, `panel-legacy`, `panel-foundational`, `panel-friends`, or `panel-corporate`) and add a line in its list:
```html
<li>First &amp; Last Name</li>
```
The count badge on each tab updates automatically.

### Replacing a photo
Upload a new image to `assets/images/` with the **exact same file name** as the one you're replacing (Add file → Upload files → Commit). It swaps in automatically.
If a file name has spaces, write `%20` for each space in the HTML (e.g. `New Photo.png` → `New%20Photo.png`).

---

## Adding a completed project

Completed projects live in the **Completed Projects** grid. Each one is a block that starts with `<article` and ends with `</article>`. The easiest way to add a new one is to **copy an existing block and edit the copy.**

**Steps:**
1. In `index.html`, press `Ctrl + F` and search for `<div class="project-grid">` — every project card sits between this line and its closing `</div>`.
2. Pick any existing card to copy. A standard card looks exactly like this:
   ```html
   <article class="project-card tilt" data-reveal>
     <div class="project-media"><img src="assets/images/YOUR-PHOTO.jpg" alt="Short description of the photo"></div>
     <div class="project-body">
       <span class="project-year">2026</span>
       <h3>Your Project Name</h3>
       <p class="project-amount">$000,000</p>
       <p>A sentence or two describing the project and who funded it.</p>
     </div>
   </article>
   ```
3. Select that whole block (from `<article` to `</article>`), copy it, and paste it where you want the new card to appear in the grid.
4. Edit the copy:
   - **Photo:** first upload your image to `assets/images/`, then put its file name in `src="assets/images/..."` (use `%20` for spaces). Update the `alt="..."` text to describe it.
   - **Year:** the `<span class="project-year">` (e.g. `2026`).
   - **Title:** the `<h3>` line.
   - **Amount:** the `<p class="project-amount">` line. (You can delete this line if there's no dollar figure to show.)
   - **Description:** the last `<p>` line.
5. Commit. The new card appears automatically.

**Tips:**
- To make a card stand out with a red border (like the big ones), use `class="project-card featured tilt"` instead of `class="project-card tilt"`.
- Keep the `data-reveal` part — that's what makes the card fade in as visitors scroll.

> 💡 When a project moves from "What's Next" to "done," you can also delete its card from the `next-grid` (the What's Next section) so it's not listed in both places.

---

## Starting a new campaign (replacing "Capital Campaign 2026")

The **What's Next** section is the current campaign. When you launch a new campaign in the future, here's everything to update. All of it is in `index.html` unless noted.

**1. Rename the campaign (3 spots — search each and edit the text):**
| Search for… | What it is |
|---|---|
| `Capital Campaign 2026` (in `<p class="eyebrow">`) | The small red label above the "What's Next?" heading |
| `raised toward Capital Campaign 2026` | The label under the fundraising bar |
| `all six Capital Campaign 2026 projects` | The sentence under the fundraising bar (also update "six" if the number of projects changes) |

Replace `Capital Campaign 2026` with your new campaign name in each. You can also change the `<h2>What's Next?</h2>` heading itself if you'd like a different title.

**2. Reset the fundraising bar for the new goal:**
- Search `data-goal="500000"` → set the new campaign's total goal (plain number, no commas), and update the visible `$500,000` just below it to match.
- Search `data-count-to="185000"` → set the amount raised so far for the new campaign (often `0` at launch).

**3. Swap in the new campaign's projects:**
- Search `<div class="next-grid">` — the project cards for the current campaign are between this line and its closing `</div>`.
- Each card is an `<article class="next-card tilt" data-reveal> ... </article>` block. Replace the old project cards with new ones for your campaign by editing the title (`<h3>`), the timing (`<p class="next-when">`), the amount (`<p class="project-amount">`), and the bullet list (`<ul>...</ul>`) inside each.
- To add or remove a card, copy/paste or delete a whole `<article>...</article>` block (same idea as completed projects above).

**4. (Optional) Move finished projects to Completed Projects:**
- For any 2026 project that got done, follow the **Adding a completed project** steps above to add it to the Completed Projects grid, then delete its old card from `next-grid`.

> Tip: rename one thing, commit, and check the live site before moving to the next. Small steps are easy to undo.

---

## You can't permanently break it
Every commit is a saved snapshot. To undo, open the **Commits** history, find the earlier version, and restore it. Make one small change at a time and check the live site.
