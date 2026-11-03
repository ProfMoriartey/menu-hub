# Menu-Hub (Menupedia)

A modern, full-stack web application for restaurant menu management and discovery. Menu-Hub connects food lovers with local restaurants through an intuitive platform that allows restaurant owners to manage their menus digitally while providing customers with a seamless dining discovery experience.

## 🌟 Features

### For Restaurant Owners

- **Admin Dashboard**: Complete restaurant management system with authentication
- **Menu Management**: Add, edit, and organize menu items with categories
- **Image Upload**: Upload and manage restaurant logos and menu item images
- **Appearance**: Pick a menu design and brand colours for your menu
- **Restaurant Profile**: Manage restaurant details, contact information, and descriptions
- **Dietary Labels**: Add dietary information (vegetarian, vegan, gluten-free, etc.)

### For Customers

- **Restaurant Discovery**: Browse and search through featured restaurants
- **Menu Exploration**: View detailed menus with images, descriptions, and pricing
- **Menu Designs**: Every menu is shown in one of three designs: Classic, Photo grid or Compact
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
   Copy `.env.example` to `.env` and fill it in (`src/env.js` validates it):

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/menu-hub"

   # Public address of the site, used in QR codes and shared links
   NEXT_PUBLIC_APP_URL="https://your-domain.com"

   # Authentication (Clerk)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_WEBHOOK_SECRET=your_clerk_webhook_signing_secret

   # File Upload (UploadThing)
   UPLOADTHING_TOKEN=your_uploadthing_token

   # Optional: visitor country for the Menus page when the host doesn't report one
   # VISITOR_COUNTRY_FALLBACK="TR"
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
│   ├── app/                      # Next.js App Router
│   │   ├── [locale]/
│   │   │   ├── (site)/           # Marketing pages, Menus directory, sign-in
│   │   │   │   ├── (client)/dashboard/  # Owner dashboard
│   │   │   │   └── admin/        # Admin area
│   │   │   └── [restaurantSlug]/ # Public menus (and branches)
│   │   ├── actions/              # Server actions
│   │   ├── api/                  # UploadThing and Clerk webhook
│   │   └── r/[restaurantId]/     # Permanent QR-code links
│   ├── components/               # React components, grouped by feature
│   │   ├── public/               # Public menu
│   │   ├── menu-editor/          # Owner menu editor
│   │   ├── admin/                # Admin area
│   │   └── ui/                   # Reusable UI components
│   ├── lib/                      # Shared helpers
│   ├── server/                   # Server-only code
│   │   └── db/                   # Schema and migrations
│   ├── messages/                 # Translations
│   └── types/                    # TypeScript type definitions
├── scripts/                      # Upload cleanup and i18n tools
├── public/                       # Static assets
└── package.json
```

## 🎨 Menu Designs

Every design is the same single scrolling page, made for phones first (see `src/lib/menu-design.ts`); they differ in how each dish is shown:

1. **Classic**: A list of dishes with small photos
2. **Photo grid**: Dishes as photo cards
3. **Compact**: Dense rows for long menus

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
pnpm check            # Lint and type-check

# Maintenance
pnpm i18n:check       # Check translation keys and formatting
pnpm uploads:cleanup  # Remove uploaded files nothing uses
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

## 👨‍💻 Author

**Ahmed Alhusaini**

## 🙏 Acknowledgments

- Built with [T3 Stack](https://create.t3.gg/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**Menu-Hub** - Simplifying restaurant menu management and discovery for the modern digital age.
