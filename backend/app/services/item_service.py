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


class ItemUpdate(ItemSchema):
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
    def create(db: Session, payload: ItemCreate):
        new_content = ItemsModel(**payload.model_dump())
        db.add(new_content)
        db.commit()
        db.refresh(new_content)
        return new_content

    @staticmethod
    def update(db: Session, content_id: int, payload: ItemUpdate):
        db_content = db_query(ItemsModel).filter(
            ItemsModel.id == content_id).first()

        if not db_content:
            return None

        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_content, key, value)

        db.commit()
        db.refresh(db_content)
        return db_content

    @staticmethod
    def delete(db: Session, content_id: int):
        db_content = db.query(ItemsModel).filter(
            ItemsModel.id == content_id).first()

        if not db_content:
            return False

        db.delete(db_content)
        db.commit()
        return True
