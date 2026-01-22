# Cyber Fighter Arena - Development Instructions

## Project Overview

This is a modern 2D game project built with Vite, TypeScript, and Phaser 3. The project includes:
- **Frontend Build Tool**: Vite for fast development and optimized builds
- **Game Framework**: Phaser 3 for game logic and rendering
- **Language**: TypeScript for type-safe game code
- **CI/CD**: GitHub Actions for automated build and deployment

## Key Project Information

- **Build Tool**: Vite 7.2.4
- **Game Framework**: Phaser 3.90.0
- **Language**: TypeScript 5.9.3
- **Node.js Version**: 20+
- **Deployment**: GitHub Pages via GitHub Actions

## Development Workflow

### Starting Development
```bash
npm run dev
# Server runs on http://localhost:5173/
```

### Building for Production
```bash
npm run build
# Output in dist/ directory
```

### Code Organization

- **Game Configuration** (`src/config/GameConfig.ts`): Phaser game configuration
- **Game Scenes** (`src/scenes/`):
  - BootScene: Asset loading and initialization
  - MenuScene: Main menu
  - GameScene: Main gameplay
  - GameOverScene: Game over and restart

### Important Files

- `src/main.ts` - Application entry point
- `src/style.css` - Global styles
- `vite.config.ts` - Vite configuration (auto-generated)
- `.github/workflows/deploy.yml` - CI/CD pipeline
- `package.json` - Dependencies and scripts

## GitHub Actions CI/CD

The project uses GitHub Actions to automatically:
1. Install dependencies on push
2. Build the project with TypeScript and Vite
3. Deploy to GitHub Pages

### Required GitHub Setup

1. Repository must have Pages enabled in Settings
2. Set Pages source to "Deploy from a branch"
3. GitHub Actions will automatically create `gh-pages` branch

## Common Development Tasks

### Adding New Game Scene
```typescript
// src/scenes/NewScene.ts
import Phaser from 'phaser';

export default class NewScene extends Phaser.Scene {
  constructor() {
    super('NewScene');
  }

  create() {
    // Scene creation logic
  }
}
```

Then add to config in `src/config/GameConfig.ts`:
```typescript
scene: [BootScene, MenuScene, GameScene, GameOverScene, NewScene]
```

### Adding Assets
Place assets in `public/assets/` and load in BootScene:
```typescript
preload() {
  this.load.image('myAsset', 'assets/my-asset.png');
}
```

### Debugging
- Use browser DevTools (F12)
- Enable debug in GameConfig: `arcade: { debug: true }`
- Check console for TypeScript errors

## Performance Tips

1. Minimize asset sizes before committing
2. Use Phaser's built-in object pooling for performance
3. Keep scenes clean by removing unused listeners
4. Test build output with `npm run preview`

## Troubleshooting

- **Build errors**: Run `npm install` to ensure dependencies are installed
- **Module errors**: Check all imports use proper file extensions
- **Game not loading**: Check browser console for TypeScript compilation errors
- **Deployment failed**: Ensure GitHub Pages is enabled in repository settings

## Next Steps

1. Customize game assets and sprites
2. Implement game mechanics and physics
3. Add sound effects and music
4. Create additional scenes as needed
5. Deploy to GitHub Pages via push to main/master branch
