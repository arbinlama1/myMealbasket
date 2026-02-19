# 🍽️ MealBasket React Frontend

Complete React frontend for the MealBasket smart meal planning and food delivery system.

## 🚀 Features Implemented

### 👤 User Features
- ✅ Product browsing with search
- ✅ Smart meal planner with AI recommendations
- ✅ User authentication (login/register)
- ✅ Order management
- ✅ Profile management

### 🏪 Vendor Features
- ✅ Product management
- ✅ Stock level monitoring
- ✅ Stock prediction alerts
- ✅ Order management
- ✅ Performance dashboard

### 👑 Admin Features
- ✅ User and vendor management
- ✅ System analytics
- ✅ Performance monitoring
- ✅ Stock alerts management
- ✅ Order oversight

## 🛠️ Technology Stack

- **React 18** - Frontend framework
- **Material-UI 5** - UI component library
- **React Router 6** - Navigation and routing
- **Axios** - HTTP client for API calls
- **React Context** - State management
- **React Hook Form** - Form handling
- **Recharts** - Data visualization

## 📦 Installation

1. **Install dependencies**:
```bash
cd react-frontend
npm install
```

2. **Start development server**:
```bash
npm start
```

3. **Build for production**:
```bash
npm build
```

## 🔗 Backend Integration

The frontend is configured to connect to the backend running on:
- **Backend URL**: `http://localhost:8081`
- **Frontend URL**: `http://localhost:3000`

### API Endpoints Used

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

#### Products
- `GET /api/products` - Get all products
- `GET /api/products/search?name={name}` - Search products
- `GET /api/products/{id}` - Get product details

#### Meal Plans
- `GET /api/meal-plans/user` - Get user meal plans
- `POST /api/meal-plans` - Create meal plan
- `POST /api/meal-plans/ai-recommendation` - Get AI recommendation

#### Orders
- `GET /api/orders/user` - Get user orders
- `POST /api/orders` - Create order

#### Stock Alerts
- `GET /api/stock-alerts/active` - Get active alerts
- `POST /api/stock-alerts/predict` - Generate stock prediction

#### System Performance
- `GET /api/system-performance/critical` - Get critical metrics
- `POST /api/system-performance/health-check` - Perform health check

## 🎨 UI Components

### Layout
- **Navbar** - Responsive navigation with role-based menu
- **Protected Routes** - Authentication-based route protection

### Pages
- **Home** - Product showcase with search
- **Login/Register** - Authentication forms
- **Meal Planner** - Smart meal planning with AI
- **Products** - Product catalog and details
- **Orders** - Order management
- **Vendor Dashboard** - Vendor-specific features
- **Admin Dashboard** - Administrative features

## 🔐 Authentication

### JWT Token Management
- Automatic token inclusion in API requests
- Token refresh on expiration
- Auto-logout on invalid tokens

### Role-Based Access
- **USER** - Product browsing, meal planning, ordering
- **VENDOR** - Product management, stock monitoring
- **ADMIN** - Full system access and analytics

## 🎯 Smart Features

### AI Meal Recommendations
- Personalized meal suggestions
- Calorie and cost estimation
- Nutritional recommendations

### Stock Prediction
- 7-day stock forecasting
- Automated alert generation
- Confidence scoring

### Performance Monitoring
- Real-time system metrics
- Health check automation
- Analytics dashboard

## 📱 Responsive Design

- **Mobile-first** approach
- **Material Design** principles
- **Touch-friendly** interactions
- **Adaptive layouts** for all screen sizes

## 🧪 Testing

### Demo Accounts
- **User**: `user@example.com` / `password123`
- **Admin**: `admin@example.com` / `admin123`

### Test Scenarios
1. User registration and login
2. Product browsing and search
3. Meal plan creation with AI recommendations
4. Order placement and tracking
5. Vendor product management
6. Admin dashboard and analytics

## 🔧 Configuration

### Environment Variables
```bash
REACT_APP_API_URL=http://localhost:8081/api
REACT_APP_JWT_SECRET=your-jwt-secret
```

### CORS Configuration
Backend is configured to allow requests from:
- `http://localhost:3000`
- `http://localhost:3001`

## 📊 State Management

### AuthContext
- User authentication state
- JWT token management
- Role-based permissions

### Component State
- Local state for forms and UI
- API integration with error handling
- Loading states and user feedback

## 🎨 Styling

### Material-UI Theme
- **Primary**: Green (#2E7D32)
- **Secondary**: Orange (#FF6B35)
- **Typography**: Roboto font family
- **Shapes**: Rounded corners and soft shadows

### Custom Components
- Enhanced Material-UI components
- Consistent design language
- Accessibility considerations

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Static Hosting
- Build files in `/build` directory
- Can be hosted on any static server
- Backend API must be accessible

## 🔄 Continuous Integration

### Development Workflow
1. Start backend server (`mvn spring-boot:run`)
2. Start frontend server (`npm start`)
3. Test integration between frontend and backend
4. Build and test production version

## 🐛 Troubleshooting

### Common Issues
1. **CORS errors** - Check backend CORS configuration
2. **Authentication failures** - Verify JWT token handling
3. **API connection** - Ensure backend is running on port 8081
4. **Build errors** - Check Node.js and npm versions

### Debug Mode
```bash
npm start -- --verbose
```

## 📈 Performance

### Optimization
- Code splitting for faster loading
- Image optimization
- Bundle size analysis
- Lazy loading of components

### Monitoring
- React DevTools for component debugging
- Network tab for API monitoring
- Performance tab for load analysis

## 🤝 Contributing

### Code Standards
- ESLint for code quality
- Prettier for code formatting
- Component-based architecture
- Responsive design principles

## 📞 Support

For issues and questions:
1. Check backend API status
2. Verify network connectivity
3. Review browser console for errors
4. Test with demo accounts

---

**MealBasket Frontend** - Smart meal planning made simple! 🍽️
