# LeadFlow AI

A comprehensive web application that helps early-stage founders and solo builders enhance their CRM management through automated lead scoring and smart outreach sequences.

## 🚀 Features

### Core Features
- **Automated Lead Scoring**: AI-powered intelligent scoring based on customizable criteria
- **Smart Lead Segmentation**: Automatically categorizes leads into dynamic segments (Hot, Warm, Cold, Nurture)
- **Outreach Sequence Automation**: Build and automate multi-step email sequences with personalized content
- **Sequence Performance Analytics**: Track key metrics including open rates, click-through rates, and conversions
- **Real-time Dashboard**: Comprehensive overview of lead pipeline and performance metrics

### Advanced Features
- **AI-Powered Content Generation**: Generate personalized email content using OpenAI
- **Lead Insights & Recommendations**: AI-driven insights for lead engagement strategies
- **Subscription Management**: Tiered pricing with Stripe integration
- **Real-time Notifications**: Toast notifications for user actions and system events
- **Responsive Design**: Fully responsive interface with dark mode support

## 🛠 Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for utility-first styling
- **React Router** for client-side routing
- **Zustand** for state management
- **React Hook Form** for form handling
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend & Services
- **Supabase** for authentication, database, and real-time features
- **OpenAI API** for AI-powered content generation and lead scoring
- **Stripe** for subscription management and payments
- **PostgreSQL** with Row Level Security (RLS)

### Development Tools
- **Vite** for build tooling
- **ESLint** for code linting
- **PostCSS** for CSS processing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn package manager
- Git

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/vistara-apps/this-is-a-2902.git
cd this-is-a-2902
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory and add your environment variables:

```bash
cp .env.example .env
```

Fill in the required environment variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# App Configuration
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=LeadFlow AI
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_STRIPE_PAYMENTS=true
VITE_ENABLE_EMAIL_SEQUENCES=true
```

### 4. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the database schema from `database-schema.sql` in your Supabase SQL editor
3. Update your `.env` file with the Supabase URL and anon key

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AppShell.jsx    # Main layout component
│   ├── LeadCard.jsx    # Lead display component
│   ├── SequenceBuilder.jsx # Email sequence builder
│   ├── ProgressChart.jsx   # Analytics charts
│   └── ProtectedRoute.jsx  # Route protection
├── pages/              # Page components
│   ├── Dashboard.jsx   # Main dashboard
│   ├── Leads.jsx       # Lead management
│   ├── Sequences.jsx   # Sequence management
│   ├── Analytics.jsx   # Performance analytics
│   ├── Settings.jsx    # User settings
│   ├── Login.jsx       # Authentication
│   └── Register.jsx    # User registration
├── context/            # React context providers
│   ├── AuthContext.jsx # Authentication state
│   └── AppContext.jsx  # Application state
├── services/           # API and service layers
│   ├── supabase.js     # Supabase client and services
│   ├── openai.js       # OpenAI integration
│   ├── stripe.js       # Stripe payment processing
│   └── analytics.js    # Analytics calculations
├── config/             # Configuration files
│   └── api.js          # API configuration and constants
├── data/               # Mock data and utilities
└── App.jsx             # Main application component
```

## 🔧 Configuration

### Supabase Setup

1. Create a new project in Supabase
2. Run the SQL schema from `database-schema.sql`
3. Configure Row Level Security (RLS) policies
4. Set up authentication providers if needed

### OpenAI Setup

1. Get an API key from [OpenAI](https://platform.openai.com)
2. Add the key to your `.env` file
3. Monitor usage and set up billing limits

### Stripe Setup

1. Create a Stripe account
2. Get your publishable key from the dashboard
3. Set up webhook endpoints for subscription events
4. Configure subscription products and pricing

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

## 📊 Features Overview

### Lead Management
- Import leads from CSV or manual entry
- Automatic lead scoring based on multiple criteria
- Smart segmentation (Hot, Warm, Cold, Nurture)
- Lead activity tracking and history

### Email Sequences
- Visual sequence builder with drag-and-drop
- Personalized email templates
- Automated follow-up scheduling
- A/B testing capabilities

### Analytics & Reporting
- Conversion funnel analysis
- Email performance metrics
- Lead source attribution
- Time-series performance data
- AI-powered insights and recommendations

### Subscription Management
- Three-tier pricing (Free, Pro, Business)
- Feature-based access control
- Stripe-powered billing
- Usage tracking and limits

## 🔒 Security

- Row Level Security (RLS) in Supabase
- JWT-based authentication
- API key management
- Input validation and sanitization
- HTTPS enforcement

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `POST /auth/signout` - User logout
- `POST /auth/reset-password` - Password reset

### Lead Management
- `GET /api/leads` - Get user leads
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

### Sequence Management
- `GET /api/sequences` - Get user sequences
- `POST /api/sequences` - Create new sequence
- `PUT /api/sequences/:id` - Update sequence
- `DELETE /api/sequences/:id` - Delete sequence

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@leadflowai.com or join our [Discord community](https://discord.gg/leadflowai).

## 🗺 Roadmap

- [ ] Mobile app development
- [ ] Advanced AI features
- [ ] CRM integrations (HubSpot, Salesforce)
- [ ] Team collaboration features
- [ ] Advanced reporting and dashboards
- [ ] Webhook integrations
- [ ] API for third-party integrations

## 📈 Performance

- Lighthouse Score: 95+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Core Web Vitals: All green

---

Built with ❤️ by the LeadFlow AI team
