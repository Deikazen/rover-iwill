import sys
import argparse
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, ItemsModel, Base, engine

# Data seed untuk diisi ke database
SEED_ITEMS = [
    {
        "judul": "Rover Perseverance",
        "sub_judul": "Misi Mars 2020 NASA",
        "deskripsi": "Robot penjelajah paling canggih milik NASA yang mendarat di Kawah Jezero pada Februari 2021 untuk mencari tanda-tanda kehidupan mikroba purba.",
        "image_url": "https://images-assets.nasa.gov/image/PIA24479/PIA24479~medium.jpg"
    },
    {
        "judul": "Rover Curiosity",
        "sub_judul": "Mars Science Laboratory",
        "deskripsi": "Robot penjelajah seukuran mobil yang mendarat di Kawah Gale di Mars pada Agustus 2012 untuk menyelidiki iklim dan geologi Mars.",
        "image_url": "https://images-assets.nasa.gov/image/PIA19821/PIA19821~medium.jpg"
    },
    {
        "judul": "Rover Opportunity",
        "sub_judul": "Mars Exploration Rover B (MER-B)",
        "deskripsi": "Rover legendaris yang aktif di Mars dari tahun 2004 hingga 2018. Misi yang awalnya direncanakan 90 hari berhasil bertahan hingga 15 tahun.",
        "image_url": "https://images-assets.nasa.gov/image/PIA18411/PIA18411~medium.jpg"
    },
    {
        "judul": "Rover Spirit",
        "sub_judul": "Mars Exploration Rover A (MER-A)",
        "deskripsi": "Kembaran Opportunity yang mendarat di Mars pada Januari 2004 dan aktif mengumpulkan data sains penting hingga kehilangan kontak pada tahun 2010.",
        "image_url": "https://images-assets.nasa.gov/image/PIA11538/PIA11538~medium.jpg"
    },
    {
        "judul": "Rover Sojourner",
        "sub_judul": "Misi Mars Pathfinder 1997",
        "deskripsi": "Rover beroda pertama milik manusia yang berhasil beroperasi di planet lain, membuka jalan bagi era penjelajahan robotik modern di Mars.",
        "image_url": "https://images-assets.nasa.gov/image/PIA01555/PIA01555~medium.jpg"
    }
]

def seed_database(clear_existing: bool = False):
    print("Mempersiapkan pembuatan tabel database...")
    # Membuat tabel jika belum ada
    Base.metadata.create_all(bind=engine)
    print("Tabel berhasil dipastikan ada.")

    db: Session = SessionLocal()
    try:
        if clear_existing:
            print("Membersihkan data lama di tabel 'items'...")
            db.query(ItemsModel).delete()
            db.commit()
            print("Tabel 'items' berhasil dikosongkan.")
        
        # Cek apakah tabel kosong
        count = db.query(ItemsModel).count()
        if count > 0 and not clear_existing:
            print(f"Database sudah terisi dengan {count} item.")
            print("Gunakan argumen '--clear' jika ingin mengosongkan database terlebih dahulu.")
            return

        print(f"Memulai pengisian {len(SEED_ITEMS)} data seed ke database...")
        for item_data in SEED_ITEMS:
            item = ItemsModel(
                judul=item_data["judul"],
                sub_judul=item_data["sub_judul"],
                deskripsi=item_data["deskripsi"],
                image_url=item_data["image_url"]
            )
            db.add(item)
        
        db.commit()
        print("Pengisian data seed selesai dengan sukses!")
        
        # Menampilkan data yang berhasil di-seed
        items = db.query(ItemsModel).all()
        print("\nData saat ini di database:")
        print("-" * 80)
        for idx, it in enumerate(items, 1):
            print(f"{idx}. ID: {it.id} | Judul: {it.judul}")
            print(f"   Subjudul: {it.sub_judul}")
            print(f"   Deskripsi: {it.deskripsi[:70]}...")
            print(f"   Image URL: {it.image_url}")
            print("-" * 80)

    except Exception as e:
        db.rollback()
        print(f"Terjadi kesalahan saat melakukan seeding: {e}", file=sys.stderr)
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Script untuk mengisi data seed ke database.")
    parser.add_argument(
        "--clear", 
        action="store_true", 
        help="Kosongkan tabel 'items' terlebih dahulu sebelum mengisi data seed."
    )
    args = parser.parse_args()
    
    seed_database(clear_existing=args.clear)
