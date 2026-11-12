"""Pydantic-схемы (v2) по API-контракту docs/api.md."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class Localized(BaseModel):
    ru: str = ""
    kk: str = ""
    en: str = ""


class BranchRef(BaseModel):
    id: int | None = None
    slug: str = ""
    name: str = ""


class FileInfo(BaseModel):
    id: int
    filename: str
    mime: str = ""
    size: int = 0
    access: str = "needs_check"
    downloadable: bool = False


class UnitCard(BaseModel):
    id: int
    level: str
    code: str
    fond_id: int | None = None
    inventory_id: int | None = None
    title: Localized = Field(default_factory=Localized)
    years: list[int] = Field(default_factory=list)
    doc_type: str = ""
    place: str = ""
    theme: str = ""
    author: str = ""
    extent: str = ""
    branch: BranchRef = Field(default_factory=BranchRef)
    has_public_file: bool = False
    access_note: str = ""
    is_demo: bool = False
    url: str = ""


class VersionPublic(BaseModel):
    version: int
    status_changed_at: str = ""


class Parents(BaseModel):
    fond: dict[str, Any] | None = None
    inventory: dict[str, Any] | None = None


class UnitDetail(UnitCard):
    description: Localized = Field(default_factory=Localized)
    files: list[FileInfo] = Field(default_factory=list)
    versions_public: list[VersionPublic] = Field(default_factory=list)
    parents: Parents = Field(default_factory=Parents)


class Facets(BaseModel):
    type: dict[str, int] = Field(default_factory=dict)
    branch: dict[str, int] = Field(default_factory=dict)
    level: dict[str, int] = Field(default_factory=dict)


class SearchResponse(BaseModel):
    total: int = 0
    page: int = 1
    per_page: int = 10
    items: list[UnitCard] = Field(default_factory=list)
    facets: Facets = Field(default_factory=Facets)
    query_variants: list[str] = Field(default_factory=list)


class Branch(BaseModel):
    id: int | None = None
    slug: str = ""
    kind: str = ""
    name_ru: str = ""
    name_kk: str = ""
    name_en: str = ""
    address_ru: str = ""
    address_kk: str = ""
    address_en: str = ""
    phones: str = ""
    email: str = ""
    hours_ru: str = ""
    hours_kk: str = ""
    hours_en: str = ""
    lat: float | None = None
    lon: float | None = None
    head: str = ""
    note: str = ""


class NewsItem(BaseModel):
    id: int | None = None
    date: str = ""
    title_ru: str = ""
    title_kk: str = ""
    lead_ru: str = ""
    lead_kk: str = ""
    html_ru: str = ""
    html_kk: str = ""
    image: str = ""
    pub_status: str = "published"


class User(BaseModel):
    id: int | None = None
    username: str
    role: str = "editor"
    branch_id: int | None = None
    display_name: str = ""


class LoginRequest(BaseModel):
    # потолки длины(SEC-02) - scrypt и запрос к БД не получают мегабайтные строки
    username: str = Field(max_length=64)
    password: str = Field(max_length=256)


class Transition(BaseModel):
    to: str = Field(max_length=32)
    comment: str = Field(default="", max_length=2000)


class AiRequest(BaseModel):
    question: str = Field(max_length=500)
    lang: str = Field(default="ru", max_length=8)


class AiSource(BaseModel):
    type: str
    id: int | None = None
    code: str = ""
    title: str = ""
    url: str = ""


class AiResponse(BaseModel):
    mode: str = "no_data"
    answer: str = ""
    sources: list[AiSource] = Field(default_factory=list)
    generated: bool = True
    provider: str = "local-demo"
    disclaimer: str = ""


class ImportPreview(BaseModel):
    job_id: str = ""
    columns: list[str] = Field(default_factory=list)
    mapping_suggested: dict[str, str] = Field(default_factory=dict)
    rows_preview: list[dict[str, Any]] = Field(default_factory=list)
    errors: list[dict[str, Any]] = Field(default_factory=list)
    duplicates: list[dict[str, Any]] = Field(default_factory=list)
    total: int = 0


class ImportResult(BaseModel):
    inserted: int = 0
    updated: int = 0
    skipped: int = 0
    errors: list[dict[str, Any]] = Field(default_factory=list)
