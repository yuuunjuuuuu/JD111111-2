import subprocess, json, urllib.request, time, base64
import websocket

CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
PORT = 9227

def take_fullpage(url, out_path):
    proc = subprocess.Popen([
        CHROME, '--headless', f'--remote-debugging-port={PORT}',
        '--no-sandbox', '--disable-gpu', '--window-size=1280,900',
        '--remote-allow-origins=*', url
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
        for _ in range(100):
            raw = ws.recv()
            msg = json.loads(raw)
            if msg.get('id') == _id:
                return msg
        return {}

    send("Page.enable")
    time.sleep(2)

    r = send("Page.getLayoutMetrics")
    print("metrics:", r)
    h = int(r.get('result', {}).get('contentSize', {}).get('height', 900))
    h = min(h, 12000)

    send("Emulation.setDeviceMetricsOverride", {
        "width": 1280, "height": h,
        "deviceScaleFactor": 1, "mobile": False
    })
    time.sleep(1)

    r2 = send("Page.captureScreenshot", {
        "format": "png",
        "clip": {"x": 0, "y": 0, "width": 1280, "height": h, "scale": 1}
    })
    print("screenshot keys:", list(r2.get('result', {}).keys()))

    ws.close()
    proc.terminate()
    time.sleep(0.5)

    data = r2.get('result', {}).get('data', '')
    if not data:
        print("데이터 없음!")
        return
    img_data = base64.b64decode(data)
    with open(out_path, 'wb') as f:
        f.write(img_data)
    print(f"저장: {out_path} ({len(img_data)//1024}KB, 높이:{h}px)")

take_fullpage("http://localhost:8789/index.html", "C:/JD1/full_index.png")
