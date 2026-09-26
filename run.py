"""
COGNISCAN-EW Application Launcher
Cognitive Adaptive Spectrum Scanning & Intelligent Interception Scheduler for Electronic Warfare
"""

import sys
import os
import time
import webbrowser
import threading
import uvicorn

BANNER = r"""
================================================================================
   ______ ____   ______ _   __ ____ _____ ______ ___     _   __        ______ _       __
  / ____// __ \ / ____// | / //  _// ___// ____//   |   / | / /       / ____/| |     / /
 / /    / / / // / __ /  |/ / / /  \__ \/ /    / /| |  /  |/ /______ / __/   | | /| / / 
/ /___ / /_/ // /_/ // /|  /_/ /  ___/ / /___ / ___ | / /|  //_____// /___   | |/ |/ /  
\____/ \____/ \____//_/ |_//___/ /____/ \____//_/  |_|/_/ |_/      /_____/   |__/|__/   
================================================================================
 COGNITIVE ADAPTIVE SPECTRUM SCANNING & INTELLIGENT INTERCEPTION SCHEDULER
 Tagline: Learn the Spectrum. Predict the Signal. Scan Smarter.
================================================================================
"""

def open_browser():
    time.sleep(1.2)
    url = "http://127.0.0.1:8000/"
    print(f"[*] Opening browser to {url}...")
    try:
        webbrowser.open(url)
    except Exception:
        pass

def main():
    print(BANNER)
    print("[+] Initializing COGNISCAN-EW Core Engine...")
    print("[+] Backend: FastAPI + NumPy + SciPy + WebSockets")
    print("[+] Frontend: React + TypeScript + Tailwind CSS (Mounted at root)")
    print("[+] Access Dashboard at: http://127.0.0.1:8000/")
    print("[+] Press Ctrl+C to terminate.")
    print("=" * 80)

    # Launch browser in background thread
    threading.Thread(target=open_browser, daemon=True).start()

    # Start Uvicorn
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        log_level="info",
        reload=False
    )

if __name__ == "__main__":
    main()
