import socket


UDP_IP = "0.0.0.0"
UDP_PORT = 5005

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind((UDP_IP, UDP_PORT))

print(f"Mendengarkan data dari Raspberry Pi di port {UDP_PORT}...")

try:
    while True:
        data, addr = sock.recvfrom(1024)
        print(f"Data dari Raspi ({addr[0]}): {data.decode('utf-8')}")
except KeyboardInterrupt:
    print("\nPenerima dihentikan.")
finally:
    sock.close()
