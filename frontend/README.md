# AKCity Frontend v2.0

Modern, responsive, and secure frontend application for construction management system built with React, TypeScript, and Clean Architecture.

## 🏗️ Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

```
src/
├── core/                    # Domain layer (business logic)
│   ├── entities/           # Business entities
│   ├── use-cases/          # Business use cases
│   └── interfaces/         # Service contracts
├── infrastructure/         # Infrastructure layer
│   ├── api/               # API client
│   ├── storage/           # Local storage
│   └── auth/              # Authentication
├── application/            # Application layer
│   ├── services/          # Application services
│   ├── hooks/            # Custom hooks
│   └── store/            # State management
└── presentation/           # Presentation layer
    ├── components/       # Reusable components
    ├── pages/           # Page components
    └── layouts/         # Layout components
```

## 🚀 Features

### Modern Tech Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for utility-first styling
- **Redux Toolkit** for state management
- **React Query** for server state management
- **React Hook Form** with Zod validation
- **Framer Motion** for animations
- **React Router** for navigation

### UI/UX Features
- **Responsive Design** - Mobile-first approach
- **Dark/Light Mode** support
- **Accessibility** - WCAG 2.1 compliant
- **Modern Animations** - Smooth transitions
- **Loading States** - Skeleton screens
- **Error Handling** - User-friendly error messages
- **Toast Notifications** - Real-time feedback

### Security Features
- **JWT Authentication** with refresh tokens
- **Role-based Access Control** (RBAC)
- **Route Protection** - Private/public routes
- **Input Validation** - Client-side validation
- **XSS Protection** - Sanitized inputs
- **CSRF Protection** - Secure API calls

### Performance
- **Code Splitting** - Lazy loading
- **Bundle Optimization** - Tree shaking
- **Image Optimization** - WebP support
- **Caching** - Smart caching strategies
- **PWA Ready** - Service worker support

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Development**
```bash
npm run dev
```

4. **Production build**
```bash
npm run build
npm run preview
```

## 📚 Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # TypeScript type checking
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

### Testing
```bash
npm run test         # Run tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue shades for main actions
- **Secondary**: Gray shades for neutral elements
- **Success**: Green shades for positive actions
- **Warning**: Orange shades for caution
- **Error**: Red shades for errors

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: 600 weight
- **Body**: 400 weight
- **Captions**: 500 weight

### Components
- **Button**: Multiple variants and sizes
- **Input**: Form inputs with validation
- **Card**: Content containers
- **Modal**: Overlay dialogs
- **Table**: Data display
- **Badge**: Status indicators

## 🔧 Configuration

### Environment Variables
```bash
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=AKCity
VITE_APP_VERSION=2.0.0
```

### Tailwind Configuration
Custom theme with:
- Extended color palette
- Custom animations
- Component utilities
- Responsive breakpoints

### TypeScript Configuration
- Strict mode enabled
- Path mapping for clean imports
- Type checking for all files

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Features
- Touch-friendly interactions
- Swipe gestures
- Mobile-optimized forms
- Responsive navigation

## 🧪 Testing

### Test Setup
- **Vitest** for unit testing
- **Testing Library** for component testing
- **JSDOM** for DOM simulation
- **Coverage** reporting

### Test Structure
```
src/
├── __tests__/          # Test files
├── test/              # Test utilities
└── components/        # Component tests
```

## 🚀 Deployment

### Build Optimization
- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Remove unused code
- **Minification**: Compressed assets
- **Source Maps**: For debugging

### Performance Metrics
- **Lighthouse Score**: 90+ across all metrics
- **Bundle Size**: < 500KB gzipped
- **Load Time**: < 2s on 3G
- **First Paint**: < 1s

## 🔒 Security

### Authentication
- JWT token management
- Automatic token refresh
- Secure token storage
- Logout on token expiry

### Input Validation
- Client-side validation with Zod
- Server-side validation feedback
- XSS protection
- CSRF protection

### Route Protection
- Private route guards
- Role-based access control
- Permission-based rendering
- Secure navigation

## 🤝 Contributing

### Code Standards
1. Follow Clean Architecture principles
2. Use TypeScript strict mode
3. Write tests for new features
4. Follow ESLint and Prettier rules
5. Document your components
6. Update README if needed

### Git Workflow
1. Create feature branch
2. Make changes with tests
3. Run quality checks
4. Create pull request
5. Code review
6. Merge to main

## 📄 License

MIT License - see LICENSE file for details.
