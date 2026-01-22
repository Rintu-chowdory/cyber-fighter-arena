# Cyber Fighter Arena

A modern 2D game built with **Vite**, **TypeScript**, and **Phaser 3** game framework.

## Features

- 🚀 **Fast Development** with Vite
- 🎮 **Phaser 3** Game Framework
- 📝 **TypeScript** for Type Safety
- 🌐 **Automatic Deployment** via GitHub Actions
- 🎨 **Modern Game Architecture** with Scene Management

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cyber-fighter-arena.git
cd cyber-fighter-arena
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The game will be available at `http://localhost:5173/`

### Building

Build for production:
```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Game Controls

- **Arrow Keys** - Move left/right and jump
- **Space** - Start game from menu
- **Click** - Start game from menu
- **ESC** - Return to menu

## Project Structure

```
src/
├── config/          # Game configuration
│   └── GameConfig.ts
├── scenes/          # Game scenes
│   ├── BootScene.ts
│   ├── MenuScene.ts
│   ├── GameScene.ts
│   └── GameOverScene.ts
├── main.ts          # Application entry point
└── style.css        # Global styles
```

## Game Scenes

### BootScene
- Loads assets
- Initializes the game

### MenuScene
- Main menu with start button
- Game title and instructions

### GameScene
- Main gameplay
- Player movement and collision detection
- Enemy management
- Score tracking

### GameOverScene
- Game over screen
- Final score display
- Restart option

## CI/CD Pipeline

The project uses **GitHub Actions** for automated deployment:

1. **Build** - Compiles TypeScript and builds with Vite
2. **Test** - Validates the build (optional)
3. **Deploy** - Automatically deploys to GitHub Pages on push to main/master

### Setting Up GitHub Pages

1. Go to your repository settings
2. Navigate to "Pages"
3. Set source to "Deploy from a branch"
4. Select `gh-pages` branch (created automatically by the workflow)

## Technologies Used

- **Vite** - Next Generation Frontend Tooling
- **TypeScript** - JavaScript with Type Safety
- **Phaser 3** - HTML5 Game Framework
- **GitHub Actions** - CI/CD Automation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Resources

- [Phaser Documentation](https://photonstorm.github.io/phaser3-docs/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Author

Your Name - [@yourhandle](https://github.com/yourusername)
