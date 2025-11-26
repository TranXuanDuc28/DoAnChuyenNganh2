import json
import subprocess

# Đọc base64 từ file
with open("base64.txt", "r", encoding="utf-8") as f:
    img64 = f.read()

# Gọi code realtime
proc = subprocess.Popen(
    ["python", "realtime_frame_inference.py", img64, "squat"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

out, err = proc.communicate()

print("OUTPUT:\n", out)
print("ERROR:\n", err)
