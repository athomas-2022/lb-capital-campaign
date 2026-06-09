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

## You can't permanently break it
Every commit is a saved snapshot. To undo, open the **Commits** history, find the earlier version, and restore it. Make one small change at a time and check the live site.
