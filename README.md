
#   Routers  App - Stock Management System

A modern, responsive React-based frontend application for comprehensive stock and inventory management. Built with cutting-edge technologies to provide an intuitive and efficient user experience for managing business operations.

## 🚀 Features

### Core Modules

#### 📊 **Dashboard**
- Interactive dashboard with module tiles
- Search functionality across modules
- Responsive grid layout
- Real-time navigation

#### 🏢 **Common Module**
- **Society Information**: Configure organization details and branding
- **Financial Period**: Manage accounting periods and fiscal years
- **Backup Data**: Create and manage data backups with localStorage persistence
- **Restore Data**: Restore data from backup files with simulation
- **Security Settings**: Access control and system security
- **Default Parameters**: System-wide configuration settings with form validation
  - Organization hierarchy (Society, Organization, Branch, Store)
  - Date and Bank configuration
  - Financial period management (start/end dates)
  - Account settings with lookup functionality (Cash, Bank, Creditor, Debtor accounts)
  - Pay components and GL Bank configuration
  - Savings and processing priority settings
  - Application status management

#### 👥 **Account Module**
- **User Management**: Create, edit, and manage user accounts
- **Roles**: Define user roles and permissions
- **Permissions**: Granular access control system

#### 📦 **Stock Module**
- **Store Information**: Configure store details and settings
- **Essential Commodity**: Manage essential product categories
- **Supplier Management**: Complete supplier lifecycle management
- **Product Management**: Comprehensive product catalog
- **Stock Maintenance**: Real-time inventory tracking
- **Local Purchase Orders (LPO)**: Purchase order management
- **Reports**: Advanced reporting and analytics

## 🛠️ Tech Stack

### Frontend Framework
- **React 18.2.0** - Modern React with hooks and concurrent features
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing

### UI/UX Libraries
- **Bootstrap 5.3.2** - Responsive CSS framework
- **Material-UI (MUI)** - React components library
- **Framer Motion** - Animation library
- **Phosphor React** - Modern icon library
- **Lucide React** - Additional icon set (used for Key icons in DefaultParameter component)

### Styling
- **Custom CSS** - Modular styling approach
- **CSS Variables** - Dynamic theming support
- **Tailwind CSS** - Utility-first CSS framework (configured but removed)

### Development Tools
- **Vite** - Development server and build tool
- **ESLint** - Code linting
- **PostCSS** - CSS processing

### State Management
- **React Context API** - Theme and global state management
- **Local Storage** - Persistent user sessions

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html                 # Main HTML template
├── src/
│   ├── components/                # Reusable UI components
│   │   ├── Layout.jsx            # Layout wrapper
│   │   ├── Sidebar.jsx           # Navigation sidebar
│   │   └── Sidebar.css           # Sidebar styling
│   ├── contexts/                 # React contexts
│   │   └── ThemeContext.jsx      # Theme management
│   ├── pages/                    # Page components
│   │   ├── Login.jsx             # Authentication page
│   │   ├── Dashboard.jsx         # Main dashboard
│   │   ├── Dashboard.css         # Dashboard styling
│   │   ├── AccountPage/          # Account management pages
│   │   │   └── sections/         # Account page sections
│   │   ├── CommonPage/           # Common configuration pages
│   │   │   └── sections/         # Common page sections
│   │   └── StockPage/            # Stock management pages
│   │       └── sections/         # Stock page sections
│   ├── services/                 # API services
│   │   └── AuthService.js        # Authentication service
│   ├── styles/                   # Global styles
│   │   ├── custom.css            # Main custom styles
│   │   ├── tailwind.css          # Tailwind utilities
│   │   └── [component].css       # Component-specific styles
│   ├── utils/                    # Utility functions
│   │   └── withRouter.jsx        # Router HOC
│   ├── App.jsx                   # Main app component
│   └── main.jsx                  # App entry point
├── data/                         # Static data files
├── cics_specifications_part_one.doc  # Project specifications
├── package.json                  # Dependencies and scripts
├── vite.config.js                # Vite configuration
├── tailwind.config.cjs           # Tailwind configuration
├── postcss.config.cjs            # PostCSS configuration
└── README.md                     # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager

### Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000` (or the port shown in terminal)

### Demo Login Credentials
- **Username:** `demo`
- **Password:** `demo`

## 🎨 Design System

### Theme Support
- **Light Mode**: Clean, professional appearance
- **Dark Mode**: Modern dark theme with proper contrast
- **Automatic Persistence**: Theme preference saved in localStorage

### Color Palette
- **Primary**: Blue (#2563eb, #3b82f6)
- **Success**: Green (#16a34a)
- **Warning**: Orange (#f59e0b)
- **Error**: Red (#ef4444)

### Typography
- **Primary Font**: Roboto (Google Fonts)
- **Secondary Font**: Open Sans
- **Icon Fonts**: Phosphor Icons, Tabler Icons

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_TITLE=Polyibadan App
```

### Vite Configuration
Located in `vite.config.js`:
- Development server on port 3000
- React plugin configuration
- Build optimization settings

## 🏗️ Architecture

### Component Architecture
- **Container Components**: Handle state and logic
- **Presentational Components**: Focus on UI rendering
- **Higher-Order Components**: Router integration (`withRouter`)

### State Management
- **Context API**: Theme management
- **Local State**: Component-level state with hooks
- **LocalStorage**: Persistent authentication state

### Routing Structure
```
/ → /login (redirect)
/login → Login page
/dashboard → Main dashboard with sections
```

## 🔌 API Integration

### Current State
- **Mock Authentication**: Demo login functionality
- **TODO Comments**: Marked locations for real API integration

### Planned API Endpoints
```javascript
// Authentication
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me

// Common Module
GET /api/society
PUT /api/society
GET /api/financial-periods
POST /api/backup
GET /api/default-parameters
PUT /api/default-parameters

// Account Module
GET /api/users
POST /api/users
PUT /api/users/:id
GET /api/roles
GET /api/permissions

// Stock Module
GET /api/stores
GET /api/suppliers
GET /api/products
GET /api/stock
POST /api/purchase-orders
GET /api/reports
```

### Service Layer
Located in `src/services/`:
- **AuthService.js**: Authentication logic
- Modular service files for each module

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Features
- Collapsible sidebar
- Touch-friendly interactions
- Optimized layouts
- Mobile navigation overlay

## 🧪 Development Guidelines

### Code Style
- **ES6+ Features**: Modern JavaScript syntax
- **React Hooks**: Functional components preferred
- **Consistent Naming**: PascalCase for components, camelCase for functions
- **CSS Modules**: Scoped styling approach

### Component Patterns
```jsx
// Functional component with hooks
import React, { useState, useEffect } from 'react';

const MyComponent = ({ prop }) => {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // Side effects
  }, [dependencies]);

  return (
    <div className="component">
      {/* JSX content */}
    </div>
  );
};

export default MyComponent;
```

### CSS Organization
- **Custom Properties**: CSS variables for theming
- **Utility Classes**: Reusable styling classes
- **Component Styles**: Scoped component styling
- **Responsive Design**: Mobile-first approach

## 🚀 Build & Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Build Output
- **Dist Directory**: `dist/` folder
- **Optimized Assets**: Minified CSS and JS
- **Static Assets**: Copied to build directory

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards
- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Test components thoroughly

### Branch Naming
- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Critical fixes
- `docs/` - Documentation updates

## 📋 TODO & Roadmap

### Immediate Tasks
- [x] Enhanced Backup Data component with localStorage persistence
- [x] Implemented Restore Data component with simulation
- [x] Updated README.md with feature descriptions
- [ ] Backend API integration
- [ ] Database schema design
- [ ] Real authentication system
- [ ] Data validation and error handling
- [ ] Unit and integration tests

### Future Enhancements
- [ ] Progressive Web App (PWA) features
- [ ] Offline functionality
- [ ] Advanced reporting with charts
- [ ] Multi-language support
- [ ] Real-time notifications
- [ ] Export functionality (PDF, Excel)

## 📄 License

This project is proprietary software. All rights reserved.

## 👥 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions

## 📊 Project Status

**Current Version:** 0.1.0
**Status:** Development


---

*Built with ❤️ using React and modern web technologies*

