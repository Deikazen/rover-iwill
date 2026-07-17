from pydantic import BaseModel
from datetime import datetime


class ItemSchema(BaseModel):
    judul: str
    sub_judul: str | None = None
    deskripsi: str | None = None
    image_url: str | None = None


class ItemCreate(ItemSchema):
    pass


class ItemUpdatee(ItemSchema):
    judul: str | None = None


class ItemResponse(ItemSchema):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
