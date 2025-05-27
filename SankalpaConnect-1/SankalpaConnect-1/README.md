# Sankalp Sathi - Companion Assistance Platform

A comprehensive web application designed to connect users, especially those with disabilities, with verified companions for assistance. The platform prioritizes accessibility (WCAG 2.1 compliant), security, and real-time support.

## Features

- **User Authentication**: Secure login system using Replit Auth
- **Companion Matching**: Real-time location-based companion finding
- **Task Management**: Request and manage assistance tasks
- **Accessibility Features**: 
  - Voice assistance with text-to-speech
  - High contrast mode
  - Large text support
  - Screen reader compatibility
- **Emergency Support**: SOS button with immediate response
- **Real-time Communication**: WebSocket-based live updates
- **Mobile Responsive**: Optimized for all device sizes
- **Admin Dashboard**: Platform management and user oversight

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Shadcn/ui components
- TanStack Query for data fetching
- Wouter for routing
- Framer Motion for animations

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL database
- Drizzle ORM
- WebSocket support
- Passport.js for authentication

### Database
- PostgreSQL with comprehensive schema
- User, companion, task, and notification management
- Location tracking and emergency alerts
- Session storage for authentication

## Getting Started

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database
- Environment variables configured

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd sankalp-sathi
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Database configuration
DATABASE_URL=your_postgresql_url
PGHOST=your_host
PGPORT=your_port
PGDATABASE=your_database
PGUSER=your_username
PGPASSWORD=your_password

# Authentication
SESSION_SECRET=your_session_secret
REPL_ID=your_repl_id
REPLIT_DOMAINS=your_domains
```

4. Set up the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Route components
│   │   └── lib/            # Utility functions
├── server/                 # Backend Express application
│   ├── db.ts              # Database connection
│   ├── routes.ts          # API route handlers
│   ├── storage.ts         # Data access layer
│   └── replitAuth.ts      # Authentication setup
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema and types
└── docs/                  # Documentation files
```

## API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Start login flow
- `GET /api/logout` - Logout user

### Tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks` - Get user tasks
- `GET /api/tasks/active` - Get active tasks
- `PATCH /api/tasks/:id` - Update task

### Companions
- `GET /api/companions/nearby` - Find nearby companions
- `POST /api/companions` - Register as companion
- `PATCH /api/companions/:id` - Update companion profile

### Emergency
- `POST /api/emergency` - Create emergency alert
- `GET /api/emergency/active` - Get active alerts

## Accessibility Features

The platform is designed with accessibility as a core principle:

- **WCAG 2.1 Compliance**: Meets web accessibility standards
- **Voice Assistance**: Text-to-speech for all content
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Visual Adjustments**: High contrast and large text options
- **Reduced Motion**: Respects user motion preferences

## Security

- Secure authentication with Replit Auth
- Session-based security with PostgreSQL storage
- Input validation and sanitization
- CSRF protection
- Secure WebSocket connections

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please contact the development team or create an issue in the repository.

## Acknowledgments

- Built with accessibility-first design principles
- Inspired by the need for inclusive technology solutions
- Community-driven development approach