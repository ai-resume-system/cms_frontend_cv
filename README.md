# CMS Frontend CV - Trang Quản Trị

`cms_frontend_cv` là giao diện quản trị cho hệ thống AI Resume System. Source này phục vụ admin quản lý dữ liệu nền tảng, duyệt tin tuyển dụng và theo dõi thống kê hệ thống.

## Liên Kết Source

Khi chạy hoặc kiểm tra từng phần của hệ thống, mở đúng source tương ứng:

- Backend API: [ai-resume-system/backend_cv](https://github.com/ai-resume-system/backend_cv)
- Frontend cho nhà tuyển dụng và người tìm việc: [ai-resume-system/frontend_cv](https://github.com/ai-resume-system/frontend_cv)
- Frontend quản trị admin: [ai-resume-system/cms_frontend_cv](https://github.com/ai-resume-system/cms_frontend_cv)

## Mục Tiêu

- Quản lý danh sách người dùng và trạng thái tài khoản.
- Quản lý danh mục nghề nghiệp.
- Quản lý kỹ năng hệ thống.
- Quản lý, duyệt, từ chối hoặc đóng tin tuyển dụng.
- Xem dashboard thống kê người dùng, tin tuyển dụng, lượt ứng tuyển và hoạt động gần đây.
- Cung cấp giao diện quản trị tách biệt với frontend người dùng.

## Kiến Trúc Hiện Tại

CMS dùng Next.js App Router và tổ chức theo hướng feature-based:

- `src/app`: route và layout dashboard.
- `src/features`: các module UI theo nghiệp vụ như users, categories, jobs, skills, analytics.
- `src/services`: service gọi API backend.
- `src/constants`: route, API endpoint và enum.
- `src/lib`: config môi trường, helper và tiện ích dùng chung.

Luồng gọi API:

```txt
Dashboard Page -> Feature View -> Service -> backend_cv /api/v1/admin
```

## Công Nghệ Sử Dụng

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod
- Zustand
- Recharts
- Lucide React
- React Toastify
- SweetAlert2

## Yêu Cầu Cài Đặt

- Node.js 20+ khuyến nghị
- npm
- Backend `backend_cv` đang chạy
- Tài khoản admin trong database

## Cấu Hình Môi Trường

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Biến quan trọng:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_NODE_ENV=development
```

Lưu ý:

- `NEXT_PUBLIC_API_URL` nên trỏ tới backend và bao gồm `/api`.
- Các API admin có dạng `/api/v1/admin/...`.
- Nếu backend chạy port khác, cập nhật lại biến này.

## Cài Dependency

```bash
cd cms_frontend_cv
npm install
```

## Chạy Development

```bash
npm run dev
```

CMS chạy mặc định ở:

```txt
http://localhost:3001
```

## Lệnh Hữu Ích

```bash
npm run build
npm run start
npm run lint
```

## Luồng Chạy Với Toàn Hệ Thống

1. Chạy hạ tầng PostgreSQL, Redis, MinIO.
2. Chạy `backend_cv`.
3. Đảm bảo đã có tài khoản admin hoặc seed dữ liệu.
4. Chạy `cms_frontend_cv`.
5. Mở `http://localhost:3001`.

## Ghi Chú Vận Hành

- Nếu CMS không đăng nhập được, kiểm tra tài khoản admin và endpoint auth admin.
- Nếu bảng dữ liệu trống, kiểm tra seed hoặc dữ liệu trong PostgreSQL.
- Nếu dashboard không có số liệu, kiểm tra API admin analytics trong backend.
- Nếu lỗi CORS, kiểm tra `CORS_ALLOWED_ORIGINS` trong backend.
