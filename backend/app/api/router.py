from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File
from typing import List
from sqlalchemy.orm import Session
import os
import uuid
from app.services.item_service import (
    ItemService,
    ItemCreate,
    ItemUpdate,
    ItemResponse
)
from app.core.database import get_db
from app.services.supabase_service import SupabaseStorageService

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


@router.post("/upload-image", status_code=status.HTTP_201_CREATED)
def upload_image(file: UploadFile = File(...)):
    """Upload gambar secara umum ke Supabase Storage dan mendapatkan public URL"""
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File harus berupa gambar (image/*)"
        )

    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_extension}"

    try:
        file_bytes = file.file.read()
        image_url = SupabaseStorageService.upload_image(
            file_bytes=file_bytes, 
            filename=filename, 
            content_type=file.content_type
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal memproses file upload: {str(e)}"
        )
    finally:
        file.file.close()

    return {"image_url": image_url}


@router.post("/{item_id}/upload-image", response_model=ItemResponse)
def upload_item_image(
    item_id: int, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    """Upload gambar khusus untuk item tertentu ke Supabase Storage dan langsung menyimpannya ke kolom image_url di database"""
    item = ItemService.get_by_id(db, content_id=item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item tidak ditemukan"
        )

    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File harus berupa gambar (image/*)"
        )

    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_extension}"

    try:
        file_bytes = file.file.read()
        image_url = SupabaseStorageService.upload_image(
            file_bytes=file_bytes, 
            filename=filename, 
            content_type=file.content_type
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal memproses file upload: {str(e)}"
        )
    finally:
        file.file.close()

    updated_item = ItemService.update_image(db, content_id=item_id, image_url=image_url)
    return updated_item

