# 🔗 LeboLink - On-Demand Labour Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2.35-black)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0.0-red)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> A professional, mobile-first platform connecting local labour workers with customers. **30-minute delivery guarantee** for emergency labour services.

## 🌟 Overview

LeboLink is a modern full-stack application built with cutting-edge technologies to revolutionize the local labour market. Whether you need a plumber, electrician, cleaner, or any skilled worker, LeboLink connects you with verified professionals in minutes.

### ✨ Key Features

- 🚀 **Instant Connect** - Find and book workers within 30 minutes
- 🔐 **Secure Authentication** - OTP-based verification with JWT tokens
- 👥 **Multi-Role Support** - Customer, Worker, and Admin interfaces
- 🎨 **Beautiful UI** - Glassmorphism design with 7 dynamic themes
- 📱 **Mobile-First** - Fully responsive with PWA support
- 💼 **Professional Categories** - 15+ service categories
- 📍 **Location-Based** - Smart worker matching by location
- 💳 **Flexible Payments** - Secure payment processing
- ⚡ **Real-time Updates** - Live status tracking

## 🏗️ Architecture

```
lebolink-monorepo/
├── apps/
│   ├── web/              # Next.js 14 Frontend
│   │   ├── app/          # App Router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities & context
│   │   └── public/       # Static assets
│   └── api/              # NestJS Backend
│       ├── src/
│       │   ├── modules/  # Feature modules
│       │   └── main.ts   # Entry point
├── packages/
│   └── shared/           # Shared TypeScript types
├── docs/                 # Documentation
└── infra/                # Docker & deployment
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/manikantmani2/lebolink.git
   cd lebolink
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

   This command starts both API (port 3001) and Web (port 3000) servers concurrently.

### Access the Application

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API**: [http://localhost:3001](http://localhost:3001)
- **API Docs**: [http://localhost:3001/docs](http://localhost:3001/docs)

## 📚 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both API & Web in development mode |
| `npm run build` | Build both API & Web for production |
| `npm run start` | Start both servers in production mode |
| `npm run dev:web` | Start Web only (port 3000) |
| `npm run dev:api` | Start API only (port 3001) |
| `npm run build:web` | Build Web for production |
| `npm run build:api` | Build API for production |

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14.2.35 (App Router)
- **UI**: React 18, Tailwind CSS, Framer Motion
- **State**: Zustand, React Query
- **Forms**: React Hook Form, Zod validation
- **Icons**: Lucide React
- **PWA**: Next-PWA

### Backend
- **Framework**: NestJS 10
- **Database**: MongoDB (In-memory for dev)
- **ORM**: Mongoose
- **Auth**: JWT, Passport, OTP generation
- **Validation**: Class Validator
- **API Docs**: Swagger/OpenAPI

### DevOps
- **Containerization**: Docker, Docker Compose
- **Package Manager**: npm workspaces
- **Build**: Turbo (planned)

## 👥 User Roles

### 1. **Customer**
- Browse workers by category
- Book services instantly
- Track worker location
- Rate and review workers
- Manage bookings

### 2. **Worker**
- Create professional profile
- Set hourly rates
- Manage availability
- Accept/reject bookings
- Track earnings

### 3. **Admin**
- User management
- Worker verification
- Analytics dashboard
- Platform monitoring
- Content moderation

## 🎨 Design System

LeboLink features a modern glassmorphism design with **7 dynamic color themes**:

1. 🔵 Blue Ocean
2. 🟣 Purple Dream
3. 🌅 Sunset Glow
4. 🌺 Pink Blossom
5. 🌿 Emerald Forest
6. 🔶 Amber Warmth
7. 🌊 Teal Wave

Each theme includes carefully crafted gradients, shadows, and animations.

## 🔐 Authentication Flow

### User/Worker Registration
1. Enter phone number
2. Verify OTP (6-digit code)
3. Complete profile (name, email, password, role)
4. Workers: Add job category, rates, location

### Admin Login
- Phone: 9155682599
- Password: Hello@&1234
- OTP verification

### Features
- JWT token-based sessions
- Refresh token rotation
- Role-based access control
- Development OTP display (testing)

## 📱 PWA Support

LeboLink is a Progressive Web App with:
- Offline functionality
- Add to home screen
- Push notifications (planned)
- Background sync (planned)

## 🐳 Docker Support

```bash
# Build and run with Docker Compose
docker-compose up --build

# Stop services
docker-compose down
```

## 📖 Documentation

Detailed documentation available in the `/docs` folder:

- [Project Status](docs/PROJECT_STATUS.md) - Current implementation status
- [Theme System](docs/THEME_SYSTEM.md) - Design system guide
- [Admin Features](docs/ADMIN_FEATURES.md) - Admin dashboard details
- [Error Fixes](docs/ERROR_FIX_SUMMARY.md) - Troubleshooting guide
- [Updates](docs/PROJECT_UPDATES.md) - Changelog and updates

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Development Workflow

1. **Create a branch** for your feature
2. **Make changes** with meaningful commits
3. **Test thoroughly** - both API and Web
4. **Update documentation** if needed
5. **Submit PR** with clear description

## 🐛 Known Issues

- MongoDB in-memory resets on server restart
- Push notifications not yet implemented
- Payment gateway integration pending

## 🚧 Roadmap

- [ ] Real-time chat between customer and worker
- [ ] Google Maps integration
- [ ] Payment gateway (Razorpay/Stripe)
- [ ] Worker background verification
- [ ] Advanced analytics dashboard
- [ ] Mobile apps (React Native)
- [ ] Email notifications
- [ ] Multi-language support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Manikant Mani**
- Email: manikantsrma12@gmail.com
- GitHub: [@manikantmani2](https://github.com/manikantmani2)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- NestJS team for the robust backend framework
- All open-source contributors

## 📞 Support

For support, email manikantsrma12@gmail.com or open an issue on GitHub.

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by Manikant Mani

</div>
