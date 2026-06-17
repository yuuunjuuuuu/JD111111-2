import subprocess, json, urllib.request, time, base64, os, sys

# Chrome을 리모트 디버깅 모드로 시작
chrome = subprocess.Popen([
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '--headless', '--remote-debugging-port=9223',
    '--no-sandbox', '--disable-gpu',
    '--window-size=1280,900'
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(2)

def cdp(method, params=None):
    # 타겟 찾기
    with urllib.request.urlopen('http://localhost:9223/json') as r:
        targets = json.loads(r.read())
    ws_url = targets[0]['webSocketDebuggerUrl']
    
    import websocket
    ws = websocket.create_connection(ws_url)
    msg = json.dumps({"id":1, "method": method, "params": params or {}})
    ws.send(msg)
    result = json.loads(ws.recv())
    ws.close()
    return result

print("CDP 준비 확인")
try:
    with urllib.request.urlopen('http://localhost:9223/json') as r:
        print("OK:", r.status)
except Exception as e:
    print("실패:", e)

chrome.terminate()
