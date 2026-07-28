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
        "image_url": "https://images-assets.nasa.gov/image/PIA24479/PIA24479~medium.jpg",
        "status": "active",
        "launch_date": "30 Juli 2020",
        "landing_date": "18 Februari 2021",
        "landing_site": "Kawah Jezero",
        "weight": "1.025 kg",
        "dist_traveled": "29.1 km",
        "power_source": "MMRTG (Nuklir)"
    },
    {
        "judul": "Rover Curiosity",
        "sub_judul": "Mars Science Laboratory",
        "deskripsi": "Robot penjelajah seukuran mobil yang mendarat di Kawah Gale di Mars pada Agustus 2012 untuk menyelidiki iklim dan geologi Mars.",
        "image_url": "https://images-assets.nasa.gov/image/PIA19821/PIA19821~medium.jpg",
        "status": "active",
        "launch_date": "26 November 2011",
        "landing_date": "6 Agustus 2012",
        "landing_site": "Kawah Gale",
        "weight": "899 kg",
        "dist_traveled": "32.4 km",
        "power_source": "MMRTG (Nuklir)"
    },
    {
        "judul": "Rover Opportunity",
        "sub_judul": "Mars Exploration Rover B (MER-B)",
        "deskripsi": "Rover legendaris yang aktif di Mars dari tahun 2004 hingga 2018. Misi yang awalnya direncanakan 90 hari berhasil bertahan hingga 15 tahun.",
        "image_url": "https://images-assets.nasa.gov/image/PIA18411/PIA18411~medium.jpg",
        "status": "lost",
        "launch_date": "8 Juli 2003",
        "landing_date": "25 Januari 2004",
        "landing_site": "Meridiani Planum",
        "weight": "185 kg",
        "dist_traveled": "45.16 km",
        "power_source": "Panel Surya"
    },
    {
        "judul": "Rover Spirit",
        "sub_judul": "Mars Exploration Rover A (MER-A)",
        "deskripsi": "Kembaran Opportunity yang mendarat di Mars pada Januari 2004 dan aktif mengumpulkan data sains penting hingga kehilangan kontak pada tahun 2010.",
        "image_url": "https://images-assets.nasa.gov/image/PIA11538/PIA11538~medium.jpg",
        "status": "lost",
        "launch_date": "10 Juni 2003",
        "landing_date": "4 Januari 2004",
        "landing_site": "Kawah Gusev",
        "weight": "185 kg",
        "dist_traveled": "7.73 km",
        "power_source": "Panel Surya"
    },
    {
        "judul": "Rover Sojourner",
        "sub_judul": "Misi Mars Pathfinder 1997",
        "deskripsi": "Rover beroda pertama milik manusia yang berhasil beroperasi di planet lain, membuka jalan bagi era penjelajahan robotik modern di Mars.",
        "image_url": "https://images-assets.nasa.gov/image/PIA01555/PIA01555~medium.jpg",
        "status": "retired",
        "launch_date": "4 Desember 1996",
        "landing_date": "4 Juli 1997",
        "landing_site": "Ares Vallis",
        "weight": "11.5 kg",
        "dist_traveled": "100+ meter",
        "power_source": "Panel Surya & Baterai"
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
                image_url=item_data["image_url"],
                status=item_data["status"],
                launch_date=item_data["launch_date"],
                landing_date=item_data["landing_date"],
                landing_site=item_data["landing_site"],
                weight=item_data["weight"],
                dist_traveled=item_data["dist_traveled"],
                power_source=item_data["power_source"]
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
