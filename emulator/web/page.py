from pathlib import Path


ROOT = Path(__file__).resolve().parent
ROUTES = {"wp2-stock": "watch-pro-2", "wp3-stock": "watch-pro-3"}
OG_IMAGES = {"wp2-stock": "og-watch-emulator.png", "wp3-stock": "og-watch-3-pro.png"}
FRAME_FILES = {
    "wp2-stock": ("dark-grey.png", "light-grey.png", "blue.png", "orange.png"),
    "wp3-stock": ("dark-grey.png", "light-grey.png", "light-green.webp", "orange.png"),
}


def render_page(profile, attributes=(), *, model_selector=False):
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    if profile == "wp3-stock":
        attributes = (*attributes, 'data-model="wp3"')
        html = html.replace("Watch Pro 2", "Watch 3 Pro")
        html = html.replace("/emulator/watch-pro-2/", "/emulator/watch-pro-3/")
        html = html.replace('<option value="blue">Blue</option>',
                            '<option value="light-green" data-format="webp">Light Green</option>')
        html = html.replace('<option value="orange">Orange</option>',
                            '<option value="orange" selected>Orange</option>')
        html = html.replace('          <option value="bad-apple">Bad Apple</option>\n', '')
        html = html.replace("Watch 3 Pro AOTA package.", "Watch 3 Pro AOTA package with application and SDFS resources.")
        html = html.replace("Replaces Activity Mood", "Replaces Duskscape")
        html = html.replace("og-watch-emulator.png", OG_IMAGES[profile])
        html = html.replace("CMF Watch 3 Pro with a green dot-matrix watch face beside the words CMF Watch Emulator.",
                            "CMF Watch 3 Pro with an orange strap and analog watch face beside the words CMF Watch Emulator.")
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
