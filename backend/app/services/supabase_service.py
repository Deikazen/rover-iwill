import os
import requests
from fastapi import HTTPException, status
from dotenv import load_dotenv

load_dotenv()

# Konfigurasi Supabase
# Ambil project ID dari host database jika tidak diset secara manual
DB_HOST = os.getenv("host", "")
default_project_id = ""
if "postgres." in DB_HOST:
    # Contoh: aws-0-ap-southeast-2.pooler.supabase.com atau host direct
    # project_id didapatkan dari username/host, tapi biasanya di supabase.co
    pass

# Kita parse dari username atau host untuk default project ID
DB_USER = os.getenv("user", "")
if "postgres." in DB_USER:
    # format username supabase biasanya: postgres.rumfwjyxhldldgohznlp
    default_project_id = DB_USER.split("postgres.")[1]

SUPABASE_URL = os.getenv("SUPABASE_URL") or (f"https://{default_project_id}.supabase.co" if default_project_id else "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "media")  # Ganti dengan nama bucket Anda di Supabase

class SupabaseStorageService:
    @staticmethod
    def upload_image(file_bytes: bytes, filename: str, content_type: str) -> str:
        """
        Mengunggah file gambar ke Supabase Storage Bucket secara langsung melalui REST API.
        Mengembalikan public URL file yang berhasil diunggah.
        """
        if not SUPABASE_URL:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="SUPABASE_URL tidak terdefinisi di environment variables (.env)."
            )
        if not SUPABASE_KEY:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="SUPABASE_KEY tidak ditemukan di .env. Harap tambahkan SUPABASE_KEY (anon/service_role key)."
            )

        # Bersihkan trailing slash
        base_url = SUPABASE_URL.rstrip('/')
        
        # Endpoint upload Supabase Storage REST API
        # POST /storage/v1/object/{bucket}/{filename}
        upload_url = f"{base_url}/storage/v1/object/{SUPABASE_BUCKET}/{filename}"
        
        headers = {
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": content_type
        }
        
        try:
            # Lakukan upload file binary ke Supabase Storage
            response = requests.post(upload_url, data=file_bytes, headers=headers)
            
            # Cek status upload
            if response.status_code != 200:
                # Jika error karena bucket belum ada atau salah permission
                raise Exception(
                    f"Supabase Storage error (status {response.status_code}): {response.text}"
                )
            
            # Buat URL publik untuk diakses secara online
            # Format: https://{project_id}.supabase.co/storage/v1/object/public/{bucket}/{filename}
            public_url = f"{base_url}/storage/v1/object/public/{SUPABASE_BUCKET}/{filename}"
            return public_url
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Gagal mengunggah gambar ke Supabase Storage: {str(e)}"
            )
