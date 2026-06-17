import subprocess, json, urllib.request, time, base64, os
import websocket

CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
PORT = 9224

def take_fullpage(url, out_path):
    proc = subprocess.Popen([
        CHROME, '--headless', f'--remote-debugging-port={PORT}',
        '--no-sandbox', '--disable-gpu', '--window-size=1280,900'
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2)

    with urllib.request.urlopen(f'http://localhost:{PORT}/json/new?{url}') as r:
        target = json.loads(r.read())
    ws_url = target['webSocketDebuggerUrl']

    ws = websocket.create_connection(ws_url)
    _id = 0

    def send(method, params=None):
        nonlocal _id
        _id += 1
        ws.send(json.dumps({"id": _id, "method": method, "params": params or {}}))
        while True:
            msg = json.loads(ws.recv())
            if msg.get('id') == _id:
                return msg.get('result', {})

    # 페이지 로드 대기
    send("Page.enable")
    time.sleep(3)

    # 전체 페이지 크기 가져오기
    metrics = send("Page.getLayoutMetrics")
    w = int(metrics['contentSize']['width'])
    h = int(metrics['contentSize']['height'])

    # 뷰포트 조정
    send("Emulation.setDeviceMetricsOverride", {
        "width": 1280, "height": h,
        "deviceScaleFactor": 1, "mobile": False
    })
    time.sleep(1)

    # 스크린샷
    result = send("Page.captureScreenshot", {"format": "png", "clip": {
        "x": 0, "y": 0, "width": 1280, "height": h, "scale": 1
    }})

    ws.close()
    proc.terminate()

    img_data = base64.b64decode(result['data'])
    with open(out_path, 'wb') as f:
        f.write(img_data)
    print(f"저장됨: {out_path} ({len(img_data)//1024}KB)")

pages = [
    ("http://localhost:8789/index.html",      "C:/JD1/full_index.png"),
    ("http://localhost:8789/curriculum.html", "C:/JD1/full_curriculum.png"),
    ("http://localhost:8789/apply.html",      "C:/JD1/full_apply.png"),
]

for url, path in pages:
    take_fullpage(url, path)
    time.sleep(1)

print("완료!")
