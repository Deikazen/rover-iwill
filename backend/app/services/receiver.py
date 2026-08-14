import cv2
import socket
import numpy as np

# Listen ke semua interface di laptop pada port 5005
LISTEN_IP = "0.0.0.0"
LISTEN_PORT = 5005

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind((LISTEN_IP, LISTEN_PORT))

print(f"Menunggu video stream di port {LISTEN_PORT}...")

try:
    while True:
        # Terima frame UDP (maks buffer 65536 bytes)
        packet, _ = sock.recvfrom(65536)

        # Decode byte menjadi gambar
        np_arr = np.frombuffer(packet, dtype=np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if frame is not None:
            cv2.imshow("GCS - Raspberry Pi Stream", frame)

        # Tekan tombol 'q' di jendela gambar untuk keluar
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

except KeyboardInterrupt:
    print("\nReceiver dihentikan.")

finally:
    sock.close()
    cv2.destroyAllWindows()
