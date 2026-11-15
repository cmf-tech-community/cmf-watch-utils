from pathlib import Path


ROOT = Path(__file__).resolve().parent
ROUTES = {"wp2-stock": "watch-pro-2", "wp3-stock": "watch-pro-3"}


def render_page(profile, attributes=(), *, model_selector=False):
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    if profile == "wp3-stock":
        attributes = (*attributes, 'data-model="wp3"')
        html = html.replace("Watch Pro 2", "Watch 3 Pro")
        html = html.replace("/emulator/watch-pro-2/", "/emulator/watch-pro-3/")
        html = html.replace("Explore stock, try Bad Apple and watch faces, or load your own firmware.",
                            "Explore the stock firmware on a virtual watch.")
        html = "\n".join(line for line in html.split("\n")
                         if 'property="og:image' not in line and 'name="twitter:card"' not in line)
    if model_selector:
        current = "Watch 3 Pro" if profile == "wp3-stock" else "Watch Pro 2"
        alternate = "wp2-stock" if profile == "wp3-stock" else "wp3-stock"
        other = "Watch Pro 2" if alternate == "wp2-stock" else "Watch 3 Pro"
        selector = (f'<div class="model-picker"><h1><button type="button" id="model-toggle" '
                    f'aria-controls="model-list" aria-expanded="false">{current}<svg viewBox="0 0 16 16" aria-hidden="true">'
                    '<path d="m4 6 4 4 4-4"/></svg></button></h1>'
                    '<nav id="model-list" hidden aria-label="Watch models">'
                    f'<a href="../{ROUTES[profile]}/" aria-current="page">{current}</a>'
                    f'<a href="../{ROUTES[alternate]}/">{other}</a></nav></div>')
        html = html.replace(f"<h1>{current}</h1>", selector)
    if attributes:
        html = html.replace("<body>", f"<body {' '.join(attributes)}>", 1)
    return html
