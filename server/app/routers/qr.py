import io
import os

import qrcode
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

load_dotenv()

router = APIRouter(prefix="/api", tags=["qr"])


@router.get("/qr")
def generate_qr():
    app_url = os.getenv("APP_URL")
    if not app_url:
        raise HTTPException(status_code=500, detail="APP_URL not configured")

    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(app_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    return StreamingResponse(buffer, media_type="image/png")
