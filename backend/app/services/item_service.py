from sqlalchemy.orm import Session
from ..core.database import ItemsModel
from pydantic import BaseModel
from datetime import datetime


# Schema Item
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


# Logika Bisnis


class ItemService:

    @staticmethod
    def get_all(db: Session):
        return db.query(ItemsModel).all()

    @staticmethod
    def get_by_id(db: Session, content_id: int):
        return db.query(ItemsModel).filter(ItemsModel.id == content_id).first()

    @staticmethod
    def create(db: Session, payload: ItemsModel):
        new_content = ItemsModel(**payload.model_dump())
        db.commit()
        db.refresh(new_content)
        return new_content

    @staticmethod
    def update(db: Session, content_id: int, payload: ItemsModel):
        db_content = ItemsModel
