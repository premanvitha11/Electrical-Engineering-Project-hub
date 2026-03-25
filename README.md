# EE Project Hub

## Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

---

## Backend Setup

```bash
cd backend
npm install
```

Edit `backend/.env` if using MongoDB Atlas:
```
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/eeprojecthub
```

Start backend:
```bash
npm run dev        # development (auto-restart)
npm start          # production
```
Backend runs on → http://localhost:5000

---

## Frontend Setup

```bash
# from DTI-project-web/
npm install
npm run dev
```
Frontend runs on → http://localhost:3000

---

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | — | Register user |
| POST | /api/auth/login | — | Login |
| GET | /api/auth/me | ✅ | Get current user |
| GET | /api/projects | — | List approved projects |
| POST | /api/projects | ✅ | Upload project (multipart) |
| GET | /api/projects/:id | — | Project detail |
| PATCH | /api/projects/:id/approve | Professor | Approve/reject |
| POST | /api/projects/:id/rate | ✅ | Rate project |
| GET | /api/doubts | — | List doubts |
| POST | /api/doubts | ✅ | Post doubt (with image) |
| POST | /api/doubts/:id/answer | ✅ | Post answer |
| PATCH | /api/doubts/:id/answers/:aid/verify | Professor | Verify answer |
| GET | /api/users/profile | ✅ | Get profile |
| PATCH | /api/users/profile | ✅ | Update profile |
| POST | /api/users/save/:id | ✅ | Toggle save project |
| GET | /api/users/experts | — | List experts |

---

## File Upload Limits

| Field | Accepted | Max Size |
|-------|----------|----------|
| report | .pdf | 50 MB |
| images | .jpg .jpeg .png .webp | 50 MB each, up to 5 |
| simulation | .slx .mdl .m .zip | 50 MB |
| model3d | .glb .obj .zip | 50 MB |
| doubt image | .jpg .jpeg .png .webp .pdf | 10 MB |

Uploaded files are stored in `backend/uploads/` and served at `http://localhost:5000/uploads/`
