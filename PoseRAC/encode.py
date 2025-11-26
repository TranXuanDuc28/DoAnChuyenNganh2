import base64

path = r"C:\Users\MSI\Pictures\Screenshots\Ảnh chụp màn hình 2025-11-23 053102.png"

with open(path, "rb") as f:
    img64 = base64.b64encode(f.read()).decode()

with open("base64.txt", "w", encoding="utf-8") as out:
    out.write(img64)

print("Done! Saved to base64.txt")
