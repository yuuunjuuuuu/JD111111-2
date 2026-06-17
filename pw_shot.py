from playwright.sync_api import sync_playwright
pages = [
    ("http://localhost:8789/index.html",      "C:/JD1/v2_index.png"),
    ("http://localhost:8789/curriculum.html", "C:/JD1/v2_curriculum.png"),
    ("http://localhost:8789/apply.html",      "C:/JD1/v2_apply.png"),
]
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    for url, path in pages:
        page.goto(url, wait_until="networkidle")
        page.screenshot(path=path, full_page=True)
        print(f"저장: {path}")
    browser.close()
