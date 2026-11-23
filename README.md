# Papertrails Việt Nam

Game đi bộ thư giãn khám phá văn hoá Việt Nam, đồ hoạ theo phong cách giấy gấp thủ công.
Lấy cảm hứng từ [xikhar/papertrails](https://github.com/xikhar/papertrails) (MIT). Code và hình ở đây viết mới, không dùng lại tài nguyên của repo đó.

## Chạy thử trên máy

Game là một trang tĩnh, không cần build.

    npm run dev        # mở http://localhost:5173

Mở thẳng `index.html` bằng cách bấm đúp cũng chơi được, nhưng khi đó trình duyệt chặn việc nạp tranh trong `assets/sprites/` và game dùng hình vẽ bằng code.

## Điều khiển

| Việc | Phím |
| --- | --- |
| Đi | W A S D hoặc mũi tên; chạm và giữ trên điện thoại |
| Chạy | Giữ Shift (tốn sức) |
| Ném bánh mì dụ chó | Space |
| Chuyển ngày / đêm | N |
| Bật tắt hậu kỳ | P |
| Bật tắt tiếng | M |
| Hiện khung va chạm (kiểm lỗi) | H |
| Sổ tem | J |
| Bản đồ | Tab hoặc B |
| Chụp bưu thiếp | C |
| Đổi góc nhìn | V |
| Cưỡi trâu, voi; qua đò | E |

## Sông và cầu

Các dòng sông chạy chéo qua bản đồ, song song nhau và uốn nhẹ (hàm `riverF` trong `index.html`). Bờ sông chặn đường; chỉ qua được bằng cầu trên các đường mòn Đông - Tây. Mỗi vùng có một kiểu cầu:

| Vùng | Cầu |
| --- | --- |
| Đồng bằng Bắc Bộ | Cầu ngói chợ Lương (Nam Định), kiểu "thượng gia hạ kiều" |
| Miền Tây sông nước | Cầu khỉ thân dừa |
| Phố cổ đèn lồng | Chùa Cầu Hội An, ban đêm đèn lồng sáng và soi bóng xuống sông |
| Ruộng bậc thang Tây Bắc | Cầu treo tre |

## Va chạm

Mỗi vật chặn đường theo đúng phần chân của hình vẽ: game đo cột nào ở dải cao 0,05 đến 0,32 đơn vị của tấm giấy có màu, rồi dựng khối chặn hình viên thuốc theo các đoạn đó (`footprint`, `cardBlk`). Cổng làng chặn ở hai trụ và chừa lối đi giữa; nhà và đình có thêm bề sâu phía sau. Khi tranh mới trong `assets/sprites` nạp xong, khối chặn được đo lại theo tranh mới.

## Cấu trúc

    index.html              khung trang, giao diện, CSS (Three.js r128 nạp từ CDN)
    src/                    mã game, nạp theo thứ tự ghi trong index.html, dùng chung một phạm vi toàn cục
    assets/audio/           nhạc: <vùng>_day.mp3, <vùng>_night.mp3 (vùng: dbsh, tb, ntb, tn, dnb, tnb); thiếu thì dùng day.mp3 / night.mp3
    assets/audio/sfx/       tiếng động CC0 + manifest.json + CREDITS.md
    assets/sprites/         tranh thay thế + manifest.json (game tự nạp nếu có)
    art/reference/          hình hiện tại của từng vật, dùng làm ảnh tham khảo
    art/sprites.json        kích thước ô của từng hình
    art/prompts.json        prompt cho từng hình
    art/generated/          ảnh do model tạo ra (chưa xử lý)
    tools/gen-sprites.mjs   gọi model tạo ảnh qua CLIProxyAPI
    gen-art.bat             bấm đúp: chờ tới 04:20 rồi tạo toàn bộ hình

## Thay hình bằng tranh mới

Game luôn vẽ sẵn mọi hình bằng code. Nếu có `assets/sprites/manifest.json` dạng

    { "sprites": { "nhangoi": { "file": "nhangoi.png", "glow": "nhangoi.glow.png" } } }

thì hình có tên trong đó được dán đè lên. Ảnh phải đúng tỉ lệ `w:h` ghi trong `art/sprites.json`, nền trong suốt, chân vật chạm mép dưới. `glow` là tuỳ chọn: ảnh nền đen, chỗ nào sáng thì chỗ đó phát sáng ban đêm.

## Deploy

Trang tĩnh, không cần database. Trên Vercel: Framework Preset chọn "Other", không có lệnh build, thư mục xuất là gốc dự án. `.vercelignore` đã loại `art/` và `tools/`.
