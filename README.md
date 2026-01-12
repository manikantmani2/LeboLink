# 🔗 LeboLink

> On-demand labour platform connecting customers with local workers. 30-minute delivery guarantee.

## ✨ Features

- 🚀 Instant worker booking (30-min guarantee)
- 🔐 OTP authentication with JWT
- 👥 Multi-role support (Customer/Worker/Admin)
- 🎨 Glassmorphism UI with 7 color themes
- 📱 PWA-ready & mobile-first
- 💼 15+ professional service categories

## 🛠️ Tech Stack

**Frontend:** Next.js 14, React 18, Tailwind CSS, Framer Motion  
**Backend:** NestJS 10, MongoDB, Mongoose, JWT  
**DevOps:** Docker, npm workspaces

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone repository
git clone https://github.com/manikantmani2/lebolink.git
cd lebolink

# Install dependencies
npm install

# Start development servers (API: 3001, Web: 3000)
npm run dev
```

**Access:** Frontend at [localhost:3000](http://localhost:3000), API at [localhost:3001](http://localhost:3001)

## � Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both API & Web in dev mode |
| `npm run build` | Build for production |
| `npm run dev:web` | Web only (3000) |
| `npm run dev:api` | API only (3001) |

## 🔐 Authentication

**Test Admin:** Phone `9155682599` | Password `Hello@&1234`

- **User/Worker:** OTP-based registration with phone verification
- **Admin:** Phone + Password + OTP (2FA)
- Role-based routing (Customer → Home, Worker → Jobs, Admin → Dashboard)

## 📱 Project Structure

```
apps/
├── web/          # Next.js frontend (App Router)
└── api/          # NestJS backend (MongoDB)
packages/
└── shared/       # Shared TypeScript types
```

## 🎨 Themes

7 dynamic color themes: Blue Ocean, Purple Dream, Sunset Glow, Pink Blossom, Emerald Forest, Amber Warmth, Teal Wave

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 👨‍💻 Author

**Manikant Mani**  
📧 manikantsrma12@gmail.com  
🐙 [@manikantmani2](https://github.com/manikantmani2)

---

<div align="center">Made with ❤️ by Manikant Mani</div>
