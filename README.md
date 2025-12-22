# Min Zhang Photography Portfolio

A modern, minimalist photography portfolio website showcasing photo collections from around the world. Built with React and featuring smooth animations and an elegant gallery experience.

## Overview

This is a single-page application (SPA) that presents photography projects in a visually striking format. The site features full-screen project cards, a centralized navigation modal, and an immersive gallery viewer.

## Features

### 🎨 **Modern Design**
- Clean, minimalist interface with a warm beige color palette
- Smooth animations powered by Framer Motion
- Responsive layout that works across devices
- Full-screen hero section with statistics

### 📸 **Gallery Experience**
- **Featured Projects**: First 3 projects displayed as full-screen cards
- **Navigation Modal**: Centralized project browser with filtering options
  - Filter by all projects
  - Filter by location
- **Gallery Viewer**: Immersive full-screen gallery with blurred backgrounds
- Direct navigation from browse to gallery (no intermediate steps)

### 🚀 **Performance**
- Built with Vite for fast development and optimized builds
- Lazy loading for images
- Smooth scroll animations
- Efficient state management with React hooks

## Tech Stack

- **Framework**: React 18+
- **Build Tool**: Vite
- **Animations**: Framer Motion
- **Styling**: Inline styles with CSS-in-JS
- **API**: RESTful API for fetching photo collections

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/minzhang28/minzhangphoto.git
cd minzhangphoto
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## Project Structure

```
minzhangphoto/
├── src/
│   ├── App.jsx          # Main application component
│   ├── index.jsx        # Application entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## API Integration

The application fetches photo collections from:
```
https://api.minzhangphoto.com/api/collections
```

### Expected API Response Format

```json
[
  {
    "id": "unique-id",
    "title": "Project Title",
    "location": "Location Name",
    "year": "2024",
    "count": 25,
    "cover": "/path/to/cover-image.jpg",
    "images": [
      {
        "url": "/path/to/image1.jpg"
      },
      {
        "url": "/path/to/image2.jpg"
      }
    ]
  }
]
```

## User Flow

1. **Landing**: User arrives at hero section with portfolio statistics
2. **Browse**: Scroll through featured projects (first 3 collections)
3. **Explore**: Click "VIEW ALL" in the "EXPLORE ALL PROJECTS" section
4. **Navigate**: Use the modal to browse all projects or filter by location
5. **View**: Click any project to open the immersive gallery viewer
6. **Close**: Exit gallery and return to browsing

## Key Components

### Hero Section
- Display photographer name (MIN ZHANG)
- Show statistics (total projects, photos, locations)
- Random hero background from project covers

### Featured Projects
- Full-screen cards for the first 3 projects
- Overlay with project metadata (location, year, photo count)
- Click to view full gallery

### Navigation Modal
- Centered overlay with dark background
- Two filter modes: All Projects / By Location
- Direct click-to-gallery navigation
- Close button and click-outside-to-close

### Gallery Viewer
- Full-screen immersive view
- Blurred background using project cover
- Scrollable image grid
- Project metadata display
- Multiple close options

## Customization

### Changing Colors

Edit the `styles` object in `src/App.jsx`:

```javascript
const styles = {
  container: {
    backgroundColor: "#F5F1E8",  // Main background (cream/beige)
    color: "#1a1a1a",            // Text color (dark gray)
    // ...
  }
}
```

### Modifying API Endpoint

Update the `API_BASE_URL` constant in `src/App.jsx`:

```javascript
const API_BASE_URL = "https://your-api-endpoint.com";
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

© 2025 MIN ZHANG · ALL RIGHTS RESERVED

## Contributing

This is a personal portfolio project. For questions or collaboration inquiries, please contact the owner.

---

**Built with ❤️ using React + Vite**
