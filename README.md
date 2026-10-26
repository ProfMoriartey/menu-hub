Dont forget to Submit https://www.menu-pedia.com/sitemap.xml in Google Search Console.

# Menu-Hub (Menupedia)

A modern, full-stack web application for restaurant menu management and discovery. Menu-Hub connects food lovers with local restaurants through an intuitive platform that allows restaurant owners to manage their menus digitally while providing customers with a seamless dining discovery experience.

## 🌟 Features

### For Restaurant Owners

- **Admin Dashboard**: Complete restaurant management system with authentication
- **Menu Management**: Add, edit, and organize menu items with categories
- **Image Upload**: Upload and manage restaurant logos and menu item images
- **Theme Customization**: Choose from multiple display themes for your menu
- **Restaurant Profile**: Manage restaurant details, contact information, and descriptions
- **Dietary Labels**: Add dietary information (vegetarian, vegan, gluten-free, etc.)

### For Customers

- **Restaurant Discovery**: Browse and search through featured restaurants
- **Menu Exploration**: View detailed menus with images, descriptions, and pricing
- **Multiple Theme Layouts**: Experience menus in different visual styles:
  - Classic Layout
  - Accordion Card Layout
  - Sidebar List Layout
  - Category Cards Image Dominant Layout
- **Responsive Design**: Optimized for both mobile and desktop devices
- **Internationalization**: Multi-language support (English, Arabic, Spanish, Russian, Turkish)

### Technical Features

- **Real-time Search**: Instant restaurant and menu item search
- **Dynamic Theming**: Light/dark mode support with theme switching
- **SEO Optimized**: Server-side rendering for better search engine visibility
- **Performance Optimized**: Built with Next.js 15 and React 19
- **Type Safety**: Full TypeScript implementation

## 🛠️ Technology Stack

### Frontend

- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **Tailwind CSS 4**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Beautiful icons
- **Radix UI**: Accessible UI components

### Backend & Database

- **Drizzle ORM**: Type-safe database operations
- **PostgreSQL**: Robust relational database
- **Next.js API Routes**: Server-side API endpoints

### Authentication & File Upload

- **Clerk**: Authentication and user management
- **UploadThing**: File upload service for images

### Internationalization

- **next-intl**: Multi-language support

### Development Tools

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **pnpm**: Fast package manager

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL database
- Clerk account for authentication
- UploadThing account for file uploads

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd menu-hub
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with the following variables:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/menu-hub"

   # Authentication (Clerk)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # Admin Access
   ADMIN_USER_ID=your_admin_user_id

   # File Upload (UploadThing)
   UPLOADTHING_SECRET=your_uploadthing_secret
   UPLOADTHING_APP_ID=your_uploadthing_app_id
   ```

4. **Database Setup**

   ```bash
   # Generate database migrations
   pnpm db:generate

   # Apply migrations
   pnpm db:migrate

   # (Optional) Open Drizzle Studio
   pnpm db:studio
   ```

5. **Start Development Server**

   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
menu-hub/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/          # Internationalized routes
│   │   │   ├── admin/         # Admin dashboard
│   │   │   ├── restaurants/   # Restaurant listing
│   │   │   └── [restaurantSlug]/ # Individual restaurant pages
│   │   ├── actions/           # Server actions
│   │   └── api/              # API routes
│   ├── components/            # React components
│   │   ├── admin/            # Admin-specific components
│   │   ├── home/             # Homepage components
│   │   ├── public/           # Public-facing components
│   │   ├── themes/           # Menu theme components
│   │   └── ui/               # Reusable UI components
│   ├── server/               # Server-side code
│   │   └── db/              # Database schema and configuration
│   ├── messages/             # Internationalization files
│   └── types/               # TypeScript type definitions
├── drizzle/                 # Database migrations
├── public/                  # Static assets
└── package.json
```

## 🎨 Available Menu Themes

1. **Classic Layout**: Traditional menu layout with clean typography
2. **Accordion Card Layout**: Collapsible categories with card-based design
3. **Sidebar List Layout**: Sidebar navigation with detailed item lists
4. **Category Cards Image Dominant**: Image-focused category cards

## 🌐 Internationalization

The application supports multiple languages:

- English (en)
- Arabic (ar)
- Spanish (es)
- Russian (ru)
- Turkish (tr)

Language files are located in `src/messages/` and use the `next-intl` library for translations.

## 🔧 Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm preview          # Preview production build

# Database
pnpm db:generate      # Generate database migrations
pnpm db:migrate       # Apply migrations
pnpm db:push          # Push schema changes
pnpm db:studio        # Open Drizzle Studio

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm format:write     # Format code with Prettier
pnpm format:check     # Check code formatting
pnpm typecheck        # Run TypeScript type checking
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Ahmed Alhusaini**

## 🙏 Acknowledgments

- Built with [T3 Stack](https://create.t3.gg/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide](https://lucide.dev/)
- Animations powered by [Framer Motion](https://www.framer.com/motion/)

---

**Menu-Hub** - Simplifying restaurant menu management and discovery for the modern digital age.
