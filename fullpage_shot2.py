import subprocess, json, urllib.request, time, base64
import websocket

CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
PORT = 9225

def take_fullpage(url, out_path):
    proc = subprocess.Popen([
        CHROME, '--headless', f'--remote-debugging-port={PORT}',
        '--no-sandbox', '--disable-gpu', '--window-size=1280,900', url
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(3)

    with urllib.request.urlopen(f'http://localhost:{PORT}/json') as r:
        targets = json.loads(r.read())
    ws_url = targets[0]['webSocketDebuggerUrl']
    ws = websocket.create_connection(ws_url)
    _id = 0

    def send(method, params=None):
        nonlocal _id
        _id += 1
        ws.send(json.dumps({"id": _id, "method": method, "params": params or {}}))
        for _ in range(30):
            msg = json.loads(ws.recv())
            if msg.get('id') == _id:
                return msg.get('result', {})
        return {}

    send("Page.enable")
    time.sleep(2)

    metrics = send("Page.getLayoutMetrics")
    h = int(metrics.get('contentSize', {}).get('height', 900))
    h = min(h, 15000)  # 최대 15000px

    send("Emulation.setDeviceMetricsOverride", {
        "width": 1280, "height": h,
        "deviceScaleFactor": 1, "mobile": False
    })
    time.sleep(1)

    result = send("Page.captureScreenshot", {
        "format": "png",
        "clip": {"x": 0, "y": 0, "width": 1280, "height": h, "scale": 1}
    })

    ws.close()
    proc.terminate()
    time.sleep(0.5)

    img_data = base64.b64decode(result['data'])
    with open(out_path, 'wb') as f:
        f.write(img_data)
    print(f"저장: {out_path} ({len(img_data)//1024}KB, 높이:{h}px)")

pages = [
    ("http://localhost:8789/index.html",      "C:/JD1/full_index.png"),
    ("http://localhost:8789/curriculum.html", "C:/JD1/full_curriculum.png"),
    ("http://localhost:8789/apply.html",      "C:/JD1/full_apply.png"),
]

for url, path in pages:
    take_fullpage(url, path)
    time.sleep(1)

print("완료!")
