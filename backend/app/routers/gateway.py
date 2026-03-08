"""Gateway proxy router (Appifex scaffold).

Routes all third-party API calls through the Appifex Gateway.
DO NOT modify this file — it is managed by the scaffold service.
"""

import io
from typing import Literal

import httpx
from app.gateway_config import GATEWAY_URL, get_api_key, validate_config
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

router = APIRouter(prefix="/gateway", tags=["gateway"])


# ---------------------------------------------------------------------------
# Weather
# ---------------------------------------------------------------------------


@router.get("/weather")
def get_weather(city: str, units: str = "metric"):
    validate_config()
    with httpx.Client(timeout=10.0) as client:
        response = client.get(
            f"{GATEWAY_URL}/weather/weather",
            params={"q": city, "units": units},
            headers={"x-appifex-key": get_api_key()},
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()


@router.get("/weather/forecast")
def get_weather_forecast(city: str, units: str = "metric", days: int = 5):
    validate_config()
    with httpx.Client(timeout=10.0) as client:
        response = client.get(
            f"{GATEWAY_URL}/weather/forecast",
            params={"q": city, "units": units, "cnt": days},
            headers={"x-appifex-key": get_api_key()},
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()


# ---------------------------------------------------------------------------
# Stocks
# ---------------------------------------------------------------------------


@router.get("/stocks/quote")
def get_stock_quote(symbol: str):
    validate_config()
    with httpx.Client(timeout=10.0) as client:
        response = client.get(
            f"{GATEWAY_URL}/stocks/query",
            params={"function": "GLOBAL_QUOTE", "symbol": symbol.upper()},
            headers={"x-appifex-key": get_api_key()},
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()


@router.get("/stocks/search")
def search_stocks(keywords: str):
    validate_config()
    with httpx.Client(timeout=10.0) as client:
        response = client.get(
            f"{GATEWAY_URL}/stocks/query",
            params={"function": "SYMBOL_SEARCH", "keywords": keywords},
            headers={"x-appifex-key": get_api_key()},
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()


# ---------------------------------------------------------------------------
# LLM — Chat / Vision / TTS / STT
# ---------------------------------------------------------------------------


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    model: str = "gpt-4o-mini"
    temperature: float = 0.7
    max_tokens: int = 1000


@router.post("/llm/chat")
def chat_completion(request: ChatRequest):
    validate_config()
    with httpx.Client(timeout=120.0) as client:
        response = client.post(
            f"{GATEWAY_URL}/llm/chat/completions",
            json={
                "model": request.model,
                "messages": [
                    {"role": m.role, "content": m.content} for m in request.messages
                ],
                "temperature": request.temperature,
                "max_tokens": request.max_tokens,
            },
            headers={"x-appifex-key": get_api_key()},
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        data = response.json()
        return {
            "content": data["choices"][0]["message"]["content"],
            "usage": data.get("usage"),
        }


class VisionRequest(BaseModel):
    prompt: str
    image_base64: str
    image_type: str = "jpeg"
    max_tokens: int = 1000


@router.post("/llm/vision")
def analyze_image(request: VisionRequest):
    validate_config()
    image_url = f"data:image/{request.image_type};base64,{request.image_base64}"
    with httpx.Client(timeout=120.0) as client:
        response = client.post(
            f"{GATEWAY_URL}/llm/chat/completions",
            json={
                "model": "gpt-4o",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": request.prompt},
                            {
                                "type": "image_url",
                                "image_url": {"url": image_url},
                            },
                        ],
                    }
                ],
                "max_tokens": request.max_tokens,
            },
            headers={"x-appifex-key": get_api_key()},
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        data = response.json()
        return {
            "content": data["choices"][0]["message"]["content"],
            "usage": data.get("usage"),
        }


class SpeechRequest(BaseModel):
    text: str
    voice: str = "alloy"
    model: str = "tts-1"
    speed: float = 1.0


@router.post("/llm/speech")
def text_to_speech(request: SpeechRequest):
    validate_config()
    with httpx.Client(timeout=60.0) as client:
        response = client.post(
            f"{GATEWAY_URL}/llm/audio/speech",
            json={
                "model": request.model,
                "input": request.text,
                "voice": request.voice,
                "speed": request.speed,
            },
            headers={"x-appifex-key": get_api_key()},
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return StreamingResponse(io.BytesIO(response.content), media_type="audio/mpeg")


@router.post("/llm/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...), language: str | None = Form(None)
):
    validate_config()
    content = await file.read()
    with httpx.Client(timeout=120.0) as client:
        files = {"file": (file.filename, content, file.content_type)}
        data = {"model": "whisper-1"}
        if language:
            data["language"] = language
        response = client.post(
            f"{GATEWAY_URL}/llm/audio/transcriptions",
            files=files,
            data=data,
            headers={"x-appifex-key": get_api_key()},
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()


# ---------------------------------------------------------------------------
# Images — Generate / Edit
# ---------------------------------------------------------------------------


class ImageGenerateRequest(BaseModel):
    prompt: str
    aspect_ratio: Literal[
        "1:1", "16:9", "21:9", "3:2", "2:3", "4:5", "5:4", "9:16", "9:21"
    ] = "1:1"
    num_outputs: int = 1
    output_format: Literal["webp", "jpg", "png"] = "webp"
    output_quality: int = 80
    megapixels: str = "1"
    seed: int | None = None
    num_inference_steps: int = 4
    disable_safety_checker: bool = False
    go_fast: bool = True


@router.post("/images/generate")
def generate_image(request: ImageGenerateRequest):
    """Generate images using Flux Schnell model (hardcoded version)."""
    validate_config()
    with httpx.Client(timeout=120.0) as client:
        response = client.post(
            f"{GATEWAY_URL}/images/predictions",
            json={
                "version": "black-forest-labs/flux-schnell",
                "input": {
                    "prompt": request.prompt,
                    "aspect_ratio": request.aspect_ratio,
                    "num_outputs": request.num_outputs,
                    "output_format": request.output_format,
                    "output_quality": request.output_quality,
                    "megapixels": request.megapixels,
                    "num_inference_steps": request.num_inference_steps,
                    "disable_safety_checker": request.disable_safety_checker,
                    "go_fast": request.go_fast,
                    **({"seed": request.seed} if request.seed is not None else {}),
                },
            },
            headers={"x-appifex-key": get_api_key()},
        )
        if response.status_code != 201:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()


class ImageEditRequest(BaseModel):
    prompt: str
    input_image: str  # URL or base64 data URI
    aspect_ratio: str | None = None  # defaults to "match_input_image"
    num_inference_steps: int = 30
    guidance: float = 2.5
    output_format: Literal["webp", "jpg", "png"] = "webp"
    output_quality: int = 80
    seed: int | None = None
    disable_safety_checker: bool = False


@router.post("/images/edit")
def edit_image(request: ImageEditRequest):
    """Edit images using Flux Kontext model (hardcoded version)."""
    validate_config()
    input_data = {
        "prompt": request.prompt,
        "input_image": request.input_image,
        "num_inference_steps": request.num_inference_steps,
        "guidance": request.guidance,
        "output_format": request.output_format,
        "output_quality": request.output_quality,
        "disable_safety_checker": request.disable_safety_checker,
    }

    if request.aspect_ratio:
        input_data["aspect_ratio"] = request.aspect_ratio
    if request.seed is not None:
        input_data["seed"] = request.seed

    with httpx.Client(timeout=120.0) as client:
        response = client.post(
            f"{GATEWAY_URL}/images/predictions",
            json={
                "version": "black-forest-labs/flux-kontext-dev",
                "input": input_data,
            },
            headers={"x-appifex-key": get_api_key()},
        )
        if response.status_code != 201:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()
