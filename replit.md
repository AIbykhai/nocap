# NoCap Finance

## Overview

NoCap Finance is a full-stack expense tracking application built with a modern tech stack. The application uses a hybrid architecture combining a React frontend with Express.js backend, PostgreSQL database via Drizzle ORM, and Supabase for authentication and additional database services.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query (@tanstack/react-query) for server state
- **Authentication**: Supabase Auth for user management
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Development**: Hot module reloading with Vite integration
- **Session Management**: connect-pg-simple for PostgreSQL session storage

### Database Architecture
- **Primary Database**: PostgreSQL (configured for Neon)
- **ORM**: Drizzle ORM with schema-first approach
- **Migrations**: Drizzle Kit for database migrations
- **Schema Location**: `shared/schema.ts` for type sharing between frontend and backend

## Key Components

### Shared Schema (`shared/schema.ts`)
- Defines database tables using Drizzle ORM
- Exports TypeScript types for both frontend and backend
- Includes Zod validation schemas for data validation
- Currently defines `users` table with username/password authentication

### Authentication System
- **Primary**: Supabase Auth (configured in frontend)
- **Fallback**: Custom user system via Express backend
- **Session Management**: PostgreSQL sessions with connect-pg-simple
- **User Management**: Users table in PostgreSQL with Drizzle ORM

### Frontend Components
- **App.tsx**: Main application component with authentication flow
- **Auth Components**: Login, Register, and authentication management
- **Home Screen**: Main dashboard with expense tracking features
- **Modal Components**: ExpenseModal, BudgetModal for data entry
- **Settings**: User preferences and account management

### Backend Services
- **Storage Interface**: Abstract storage layer with memory and database implementations
- **Routes**: API endpoints (currently minimal, ready for expansion)
- **Vite Integration**: Development server integration for hot reloading

## Data Flow

### Authentication Flow
1. User accesses application
2. Supabase Auth handles login/registration
3. Frontend manages session state
4. Protected routes require authentication
5. Backend can optionally validate sessions

### Data Management Flow
1. Frontend components use React Query for server state
2. API calls go through Express.js backend
3. Backend uses Drizzle ORM to interact with PostgreSQL
4. Database operations return typed data via shared schemas
5. Frontend receives typed responses for type safety

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Supabase**: Authentication and potentially additional database features
- **Drizzle ORM**: Type-safe database operations

### UI Libraries
- **Radix UI**: Unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built components using Radix + Tailwind
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across the stack
- **ESBuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution with auto-reload
- **Database**: Neon Database (cloud PostgreSQL)
- **Integration**: Vite middleware integration for unified development

### Production Build
- **Frontend**: Vite build outputs to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Static Serving**: Express serves built frontend files
- **Database**: Production Neon Database instance

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **VITE_SUPABASE_URL**: Supabase project URL
- **VITE_SUPABASE_ANON_KEY**: Supabase anonymous key
- **NODE_ENV**: Environment detection (development/production)

## Changelog
- July 02, 2025. Initial setup and migration from Bolt to Replit completed
- July 02, 2025. Revised Settings screen with sliding animation and simplified design
- July 02, 2025. Implemented comprehensive Profile management with Change Password and Delete Account features
- July 02, 2025. Added sliding Change Password screen with form validation and database integration
- July 02, 2025. Enhanced Delete Account to properly remove user data from expenses and budgets tables
- July 02, 2025. Added server-side API endpoint for user deletion (note: full auth user deletion requires service role key)

## User Preferences

Preferred communication style: Simple, everyday language.