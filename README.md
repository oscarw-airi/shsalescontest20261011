# NeoDerm Double Month Grand Prix v9

## Data source
Google Sheet:
`13bEDi4qQHvfYnOBOQiYgD4HSxlNAK6YWWrAkCkkikOQ`

GID: `0`

Fixed mapping:
- Column A = Centre
- Column B = Individual
- Column C = Target
- **Column D = Actual Sales (current total sales)**

The code deliberately ignores rows containing `Total` or `Grand Total`.
It does not use any total/grand-total row as a driver and does not display a source total card.

Target groups:
- 400K = orange
- 250K = blue
- 100K–150K = green
- Below 100K = purple

The Shanghai Double Month banner is stored at:
`assets/double-month-banner.png`

Upload the entire folder to GitHub and enable GitHub Pages.


## $30M Mission Counter
Remaining = $30,000,000 - SUM(individual Actual Sales from Column D). Total / Grand Total rows are ignored.

## Race Character
Race drivers are represented by animated cat characters (🐱) instead of cars.


## v12 logic from the cat evolution reference
- Actual Sales is the race distance.
- Target = Diamond checkpoint.
- 2 × Target = Gold checkpoint.
- 3 × Target = Crown checkpoint.
- Example: 250K target → 250K Diamond → 500K Gold → 750K Crown.
- Driver name is attached to the moving cat.
- Race scale is money-based and extends to $2M.
- The reference image is stored at `assets/cat-evolution-reference.png`.
