from __future__ import annotations

import os

import httpx
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.routers import runtime_uploads

os.environ.setdefault("APPIFEX_PROJECT_ID", "test-project")
os.environ.setdefault("APPIFEX_RUNTIME_UPLOAD_PREFIX", "test-project/uploads")
os.environ.setdefault("APPIFEX_RUNTIME_UPLOAD_SIGNING_URL", "https://signer.example.test")


def create_device_session(client: TestClient, device_id: str) -> str:
    response = client.post("/labbuddy/device/session", json={"device_id": device_id})
    assert response.status_code == 200
    return response.json()["auth_token"]


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def analyze_sample_report(client: TestClient, token: str, label: str = "Latest report") -> dict:
    response = client.post(
        "/labbuddy/reports/analyze",
        headers=auth_headers(token),
        json={
            "report_label": label,
            "source_type": "library",
            "content_type": "image/jpeg",
            "original_filename": "lab-report.jpg",
            "image_public_url": "https://cdn.example.test/report.jpg",
            "image_object_key": "test-project/uploads/report.jpg",
            "is_historical_upload": False,
        },
    )
    assert response.status_code == 200
    return response.json()


def test_report_access_is_scoped_to_authenticated_device(client: TestClient) -> None:
    owner_token = create_device_session(client, "device-owner")
    stranger_token = create_device_session(client, "device-stranger")
    report = analyze_sample_report(client, owner_token)

    get_response = client.get(
        f"/labbuddy/reports/{report['id']}",
        headers=auth_headers(stranger_token),
    )
    assert get_response.status_code == 404
    assert get_response.json()["detail"] == "Report not found"

    unlock_response = client.post(
        f"/labbuddy/reports/{report['id']}/unlock",
        headers=auth_headers(stranger_token),
        json={"product_key": "report_unlock"},
    )
    assert unlock_response.status_code == 404
    assert unlock_response.json()["detail"] == "Report not found"


def test_delete_requires_authenticated_session(client: TestClient) -> None:
    response = client.delete("/labbuddy/data")
    assert response.status_code == 401
    assert response.json()["detail"] == "Missing device authorization token."


def test_delete_only_removes_authenticated_device_data(client: TestClient) -> None:
    owner_token = create_device_session(client, "device-owner")
    other_token = create_device_session(client, "device-other")

    analyze_sample_report(client, owner_token)

    delete_response = client.delete(
        "/labbuddy/data",
        headers=auth_headers(other_token),
    )
    assert delete_response.status_code == 200

    owner_dashboard = client.get(
        "/labbuddy/dashboard",
        headers=auth_headers(owner_token),
    )
    assert owner_dashboard.status_code == 200
    assert owner_dashboard.json()["profile"]["total_reports"] == 1


def test_runtime_upload_contract_requires_public_url(monkeypatch, client: TestClient) -> None:
    def fake_call_signing_service(signing_url: str, request_body: dict, headers: dict) -> httpx.Response:
        return httpx.Response(
            status_code=200,
            json={
                "upload_url": "https://upload.example.test/object",
                "headers": {"Content-Type": "image/jpeg"},
            },
            request=httpx.Request("POST", signing_url),
        )

    monkeypatch.setattr(runtime_uploads, "call_signing_service", fake_call_signing_service)

    response = client.post(
        "/runtime-uploads/presign",
        json={
            "filename": "scan.jpg",
            "content_type": "image/jpeg",
            "category": "lab-reports",
        },
    )

    assert response.status_code == 502
    assert "public_url" in response.json()["detail"]


def test_analyze_rejects_missing_public_url(client: TestClient) -> None:
    token = create_device_session(client, "device-owner")

    response = client.post(
        "/labbuddy/reports/analyze",
        headers=auth_headers(token),
        json={
            "report_label": "Latest report",
            "source_type": "library",
            "content_type": "image/jpeg",
            "original_filename": "lab-report.jpg",
            "image_public_url": "",
            "image_object_key": "test-project/uploads/report.jpg",
            "is_historical_upload": False,
        },
    )

    assert response.status_code == 422
    detail = response.json()["detail"]
    assert any("image_public_url is required" in str(item) for item in detail)
