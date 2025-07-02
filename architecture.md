# NoCap Finance - Architecture Documentation

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Auth.tsx        # Authentication form component
│   └── ProtectedRoute.tsx # Route protection wrapper
├── contexts/           # React context providers
│   └── AuthContext.tsx # Authentication state management
├── lib/               # Utility functions and configurations
│   └── supabaseClient.js # Supabase client setup
├── pages/             # Page-level components
│   ├── Dashboard.tsx  # Main dashboard page
│   ├── Home.tsx       # Landing page
│   ├── Login.tsx      # Login page
│   └── Register.tsx   # Registration page
├── App.tsx            # Main application component
├── main.tsx           # Application entry point
└── index.css          # Global styles (Tailwind imports)
```

## Component Architecture

### Core Components

#### `App.tsx`
- **Purpose**: Main application wrapper and routing
- **Responsibilities**:
  - Provides authentication context to entire app
  - Manages top-level routing with React Router
  - Renders protected and public routes

#### `AuthContext.tsx`
- **Purpose**: Centralized authentication state management
- **Responsibilities**:
  - Manages user session state
  - Provides authentication methods (signIn, signUp, signOut)
  - Handles Supabase auth state changes
  - Exposes loading states for UI feedback

#### `ProtectedRoute.tsx`
- **Purpose**: Route protection wrapper
- **Responsibilities**:
  - Checks authentication status
  - Redirects unauthenticated users to login
  - Shows loading state during auth checks

### Page Components

#### `Home.tsx`
- **Purpose**: Landing page for the application
- **Responsibilities**:
  - Displays app branding and description
  - Provides navigation to login/register or dashboard
  - Adapts UI based on authentication status

#### `Login.tsx` & `Register.tsx`
- **Purpose**: Authentication forms
- **Responsibilities**:
  - Handle user input for credentials
  - Integrate with AuthContext for authentication
  - Display error messages and loading states
  - Navigate users after successful authentication

#### `Dashboard.tsx`
- **Purpose**: Main application interface (post-authentication)
- **Responsibilities**:
  - Display user information
  - Provide navigation and sign-out functionality
  - Serve as container for future expense tracking features

### Utility Components

#### `Auth.tsx` (Legacy)
- **Status**: Replaced by dedicated Login/Register pages
- **Purpose**: Originally handled both login and registration
- **Note**: Kept for reference but not actively used

## Data Flow

### Authentication Flow
1. User visits application
2. `AuthContext` checks for existing session via Supabase
3. If authenticated: User sees Dashboard
4. If not authenticated: User sees Home page with login/register options
5. User submits credentials via Login/Register forms
6. `AuthContext` handles Supabase authentication
7. On success: User redirected to Dashboard
8. On failure: Error displayed to user

### State Management
- **Authentication State**: Managed by `AuthContext` using React Context API
- **Form State**: Local component state using `useState`
- **Loading States**: Component-level state for UI feedback
- **Error Handling**: Component-level state with user-friendly messages

## Technology Stack

### Frontend
- **React 18**: Component library with hooks
- **TypeScript**: Type safety and better developer experience
- **React Router DOM**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Backend/Services
- **Supabase**: Backend-as-a-Service
  - Authentication
  - Database (PostgreSQL)
  - Real-time subscriptions
  - Row Level Security (RLS)

### Build Tools
- **Vite**: Fast build tool and dev server
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## Configuration Files

### `package.json`
- Defines project dependencies and scripts
- Includes both runtime and development dependencies

### `tailwind.config.js`
- Tailwind CSS configuration
- Defines content paths for purging unused styles

### `vite.config.ts`
- Vite build tool configuration
- React plugin setup
- Optimization settings

### `tsconfig.json` (multiple files)
- TypeScript configuration
- Separate configs for app and Node.js environments

### Environment Variables
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- Stored in `.env` file (not tracked in git)

## Security Considerations

### Authentication
- Uses Supabase's built-in authentication system
- Passwords are handled securely by Supabase
- Session tokens managed automatically
- Email confirmation can be enabled in Supabase settings

### Environment Variables
- Sensitive keys stored in environment variables
- Client-side validation prevents app startup with missing config
- Supabase anon key is safe for client-side use

### Route Protection
- Protected routes check authentication status
- Automatic redirection for unauthorized access
- Loading states prevent flash of unauthenticated content

## Future Architecture Considerations

### Database Schema (Planned)
- User profiles table
- Expenses table with foreign key to users
- Categories table for expense categorization
- Budgets table for budget tracking

### State Management Evolution
- Consider Redux Toolkit for complex state management
- Implement React Query for server state management
- Add optimistic updates for better UX

### Component Organization
- Create feature-based folder structure as app grows
- Implement compound components for complex UI patterns
- Add Storybook for component documentation and testing