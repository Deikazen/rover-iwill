from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from app.services.item_service import (
    ItemService,
    ItemCreate,
    ItemUpdate,
    ItemResponse

)
from app.core.database import get_db

router = APIRouter()


@router.get("/", response_model=List[ItemResponse])
def get_all_items(db: Session = Depends(get_db)):
    """Mengambil semua data item"""
    return ItemService.get_all(db)


@router.get("/{item_id}", response_model=ItemResponse)
def get_item_by_id(item_id: int, db: Session = Depends(get_db)):
    """Mengambil satu item berdasarkan ID"""
    item = ItemService.get_by_id(db, content_id=item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item tidak ditemukan"
        )
    return item


@router.post("/", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
def create_item(payload: ItemCreate, db: Session = Depends(get_db)):
    """Membuat item baru"""
    return ItemService.create(db, payload=payload)


@router.put("/{item_id}", response_model=ItemResponse)
def update_item(item_id: int, payload: ItemUpdate, db: Session = Depends(get_db)):
    """Memperbarui data item (sebagian atau seluruhnya)"""
    updated_item = ItemService.update(db, content_id=item_id, payload=payload)
    if not updated_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item tidak ditemukan"
        )
    return updated_item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    """Menghapus item berdasarkan ID"""
    is_deleted = ItemService.delete(db, content_id=item_id)
    if not is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item tidak ditemukan"
        )
    return None
