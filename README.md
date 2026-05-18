# Publication Impact Grader

A static web app for bibliometric portfolio analysis. Drop a CSV of PubMed IDs; the browser calls NIH's [iCite API](https://icite.od.nih.gov/api) for each paper, then renders a one-page editorial-styled dashboard (RCR distribution, year histogram, top journals, top-cited papers) and lets you download the augmented CSV.

The entire app runs in the browser — there is no backend. iCite enables CORS for cross-origin browser requests.

<p align="center">
  <img src="docs/screenshot-upload.png" alt="Upload page" width="640">
  <br><em>Upload page.</em>
</p>
<p align="center">
  <img src="docs/screenshot-dashboard.png" alt="Summary dashboard" width="640">
  <br><em>Summary dashboard after a 10-PMID portfolio is processed.</em>
</p>
<p align="center">
  <img src="docs/screenshot-about.png" alt="About page" width="640">
  <br><em>About page (methodology and credits).</em>
</p>

## What does this do?

A plain-language summary of the tool, suitable for newsletters, press notes, social posts, announcements, or anywhere a non-technical description is useful. Copy-pasteable; no bibliometric or web-development background assumed.

### Tagline (one sentence)

A free, private web tool that turns a list of PubMed papers into an instant publication-impact report — without sending the data anywhere.

### Short summary (~50 words)

Publication Impact Grader is a free web app that takes a spreadsheet of PubMed IDs and produces a one-page report on publication impact — field-normalized citation scores, publication-year trends, top journals, open-access rates, and most-cited papers — using authoritative data from the U.S. National Institutes of Health. The entire analysis runs inside the user's web browser, so publication lists never leave their computer.

### Long summary (~150 words)

Publication Impact Grader is a free, open-source web app that lets researchers, librarians, department leaders, and program officers analyze the impact of any set of biomedical publications in seconds. The user uploads a CSV containing a column of PubMed IDs; the tool retrieves bibliometric data through the NIH iCite API and renders an editorial-style dashboard featuring the Relative Citation Ratio (RCR) — a field-normalized measure of citation impact maintained by the NIH Office of Portfolio Analysis — alongside publication-year trends, top journals, open-access rates, and the most-cited papers in the set. Users can also download an augmented CSV for further analysis. Because the app runs entirely in the user's browser, no publication lists, institutional identifiers, or other data are ever transmitted to a server. The project is open source under the MIT license and free to use.

### Key talking points

- **Free and open source** (MIT license); no account, login, or registration required.
- **Privacy-preserving by design.** The CSV is read locally and analysis happens in the browser. No publication lists or institutional data are stored on a server.
- **Built on authoritative NIH data.** Uses the [iCite API](https://icite.od.nih.gov/api) from the NIH Office of Portfolio Analysis — the same source NIH itself uses for portfolio analysis. Open-access status comes from [Unpaywall](https://unpaywall.org/).
- **Field-normalized impact.** Reports the Relative Citation Ratio (RCR), which adjusts for differences in citation rates across biomedical fields and across time — a fairer comparison than raw citation counts.
- **One-page editorial dashboard.** Designed to be readable at a glance, not a wall of numbers.
- **Works for portfolios of any size**, from a single investigator's CV to a multi-hundred-paper program review.

### Who it's for

- **Department chairs and research deans** preparing faculty or program summaries.
- **Program officers and funders** reviewing a portfolio of supported publications.
- **Librarians and research-impact specialists** supporting investigator profiles, biosketches, and tenure dossiers.
- **Individual investigators** preparing progress reports, grant renewals, or CVs.
- **Research-evaluation offices** doing routine portfolio assessment.

### Contact

Sean Davis — <seandavi@gmail.com>
Source code: <https://github.com/seandavi/pubmed-grader>

## Quickstart

```bash
just install   # bun install in ./frontend
just dev       # Vite dev server on http://localhost:5173
just test      # vitest
just build     # static SPA in frontend/dist
```

`just --list` enumerates the rest.

## Configuration

`.env` (gitignored) sets a single env var consumed at build time:

```
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX   # leave empty to disable analytics
```

In production, set the same variable under **Netlify → Site settings → Environment variables**. Vite reads it at build time, so a fresh deploy is required after changing it.

## CSV format

Any CSV with a column of PubMed IDs. The PMID column name is auto-detected case-insensitively (default `pmid`); override it from the upload page if your column is called something else (e.g. `pubmed_id`). Original columns and row order are preserved; iCite columns are appended. If an iCite field name collides with one of your column names (e.g. you already have a `year`), the iCite version is renamed with an `icite_` prefix so your data is untouched.

## Deployment

Deployed to [Netlify](https://www.netlify.com/). Build settings live in [`netlify.toml`](./netlify.toml); custom domain + CNAME are configured in the Netlify UI. `VITE_GA_MEASUREMENT_ID` is set as a Netlify environment variable for production builds.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/seandavi/pubmed-grader)

## Architecture

```
upload → parseCSV (papaparse) → validPmids
       → fetchMany (iCite, batched, with retry)
       → computeSummary (RCR, year, journals, top cited)
       → writeAugmentedCSV → Blob URL → download
```

- `frontend/src/lib/icite.ts` — async generator batching PMIDs (default 200/call), retries 429/5xx with exponential backoff.
- `frontend/src/lib/csv.ts` — parse + augment, collision-safe iCite column rename.
- `frontend/src/lib/stats.ts` — pure dashboard-summary computation.
- `frontend/src/hooks/useGrading.ts` — orchestrates the flow + drives progress state for the UI.
- `frontend/src/components/` — editorial UI (Fraunces / DM Sans / JetBrains Mono, cream paper + ink + CU gold).

## Why client-only?

For "read a CSV, call a public API for each row, render stats, give the file back," a backend buys you very little and costs you operational complexity. We're trading that complexity for: no infra to run, no auth, no rate-limit proxy, no file storage, no shareable job URLs. If any of those needs surface later, a backend can be added back — but starting here keeps the surface small.

## Credits

Built by [Sean Davis](mailto:seandavi@gmail.com). Bibliometric data courtesy of the [NIH Office of Portfolio Analysis](https://icite.od.nih.gov/) via the iCite API. Open Access status via [Unpaywall](https://unpaywall.org/).

## License

MIT.
