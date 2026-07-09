import os
import re
import sys


def main() -> int:
    # EasyOCR печатает прогресс-бар с unicode-символами; на Windows cp1251 это падает.
    # Принудительно включаем UTF-8 для stdout/stderr.
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

    os.environ.setdefault("PYTHONIOENCODING", "utf-8")

    # Путь к скриншоту в workspace (передайте через аргумент при желании)
    img = (
        sys.argv[1]
        if len(sys.argv) > 1
        else r"C:\Users\Computer\.cursor\projects\c-Users-Computer-vybor-les\assets\c__Users_Computer_AppData_Roaming_Cursor_User_workspaceStorage_52ad953a8b0bd32cc330d77160a52602_images_photo_2026-04-21_16-43-05-a61dc765-3a91-46e3-ba4e-5129aadcc5ac.png"
    )

    import easyocr  # noqa: PLC0415
    from PIL import Image  # noqa: PLC0415
    import numpy as np  # noqa: PLC0415

    reader = easyocr.Reader(["ru", "en"], gpu=False, verbose=False)

    image = Image.open(img).convert("RGB")
    w, h = image.size
    # Пробуем вытащить зону с инструкциями/токеном (правая панель)
    roi = image.crop((int(w * 0.32), int(h * 0.25), int(w * 0.98), int(h * 0.88)))

    def ocr(im: Image.Image) -> list[str]:
        arr = np.array(im)
        return reader.readtext(
            arr,
            detail=0,
            paragraph=False,
            allowlist="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_./-\"=< >",
        )

    full_res = ocr(image)
    roi_res = ocr(roi)

    full_text = "\n".join(full_res)
    roi_text = "\n".join(roi_res)

    filenames = re.findall(r"zen_[A-Za-z0-9]+\.html", full_text + "\n" + roi_text)
    tokens = re.findall(r"[A-Za-z0-9]{25,}", full_text + "\n" + roi_text)

    print("=== OCR TEXT ===")
    print("--- FULL ---")
    print(full_text)
    print("\n--- ROI ---")
    print(roi_text)
    print("\n=== CANDIDATES ===")
    print("FILENAME_CANDIDATES:", filenames)
    print("TOKEN_CANDIDATES:", tokens[:50])

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

