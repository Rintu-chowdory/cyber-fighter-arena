# Cyber Fighter Arena - AI Development Instructions

## Project Overview

Cyber Fighter Arena is a 2D arcade game built with **Phaser 3**, **TypeScript**, and **Vite**. It's deployed via GitHub Pages using a GitHub Actions pipeline that automatically builds and deploys on push to main/master.

## Architecture & Key Patterns

### Scene-Based Game Architecture
- Game state is managed through **Phaser Scenes**: BootScene → MenuScene → GameScene → GameOverScene
- Scenes are registered in `src/config/GameConfig.ts` and transition via `this.scene.start('SceneName')`
- Scene data flows through `init()` method (e.g., passing score to GameOverScene)
- Store persistent data in `this.registry` for cross-scene access

### Physics & Game Mechanics
- **Arcade Physics** with gravity (y: 300) is enabled globally in GameConfig
- Player controlled via `Phaser.Physics.Arcade.Sprite` with cursor key input
- Collision detection uses `this.physics.add.collider()` with callback methods
- Enemy spawning uses physics groups: `this.physics.add.group()` for batch management

### Asset Management
- Assets loaded in `BootScene.preload()` before game starts
- References use texture keys (strings): `this.load.image('player', 'path')` then `physics.add.sprite(..., 'player')`
- Map data and other assets stored in `public/assets/`

## Development Workflow

### Critical Commands
```bash
npm run dev        # Start local dev server on http://localhost:5173/
npm run build      # TypeScript check + Vite build (runs: tsc && vite build)
npm run preview    # Test production build locally
```

### Build Pipeline
The build command runs **TypeScript first** (`tsc`), so type errors must be resolved before Vite compilation.

## Code Organization Patterns

### Adding New Scenes
1. Create class extending `Phaser.Scene` with unique string identifier in constructor
2. Implement lifecycle: `preload()` (assets) → `create()` (setup) → `update()` (per-frame logic)
3. Register in `src/config/GameConfig.ts` scenes array
4. Transition via `this.scene.start('SceneName')`

**Example**: MenuScene uses `pointerdown` and keyboard events to start GameScene. GameScene catches collisions and transitions to GameOverScene with score data.

### Input Handling Patterns
- Cursor keys: `this.input.keyboard!.createCursorKeys()` then check `.isDown` in `update()`
- Single key events: `this.input.keyboard?.on('keydown-SPACE', callback)`
- Mouse/touch: `this.input.on('pointerdown', callback)`

### Physics Body Properties
- **Velocity**: Direct movement `setVelocityX()`, `setVelocityY()`
- **Bounce**: `setBounce(x, y)` for collision response
- **Bounds**: `setCollideWorldBounds(true)` prevents leaving screen
- **Collision**: Check `body?.touching.down` for jump detection

## Configuration

### Game Window & Physics
- Canvas: 1024×768 pixels in `src/config/GameConfig.ts`
- Arcade gravity: `y: 300` (affects fall speed, jump height)
- Debug disabled by default; enable with `arcade: { debug: true }`

## Common Implementation Patterns

### Score Tracking
- Store in scene property: `private score: number = 0`
- Pass to next scene via `this.scene.start('SceneName', { score: this.score })`
- Retrieve in init: `init(data: { score: number }) { this.registry.set('score', data.score) }`

### Player Movement
- Use `update()` method for continuous input checking
- Left/right: `setVelocityX()` with 0 to stop
- Jump: Check `body?.touching.down` to validate ground contact before applying velocity

### Collision Callbacks
Signature: `callback(gameObject1: any, gameObject2: any)`
Called when collision detected; often triggers scene transitions or score updates.

## Debugging

- **DevTools**: F12 → Console for TypeScript/runtime errors
- **Physics debug**: Set `arcade: { debug: true }` in GameConfig to visualize bodies
- **Browser reload**: Hot module reload (HMR) active in dev mode; refresh if changes don't apply

## Deployment

- GitHub Actions workflow in `.github/workflows/deploy.yml`
- Automatically builds (`npm run build`) and deploys `dist/` to GitHub Pages on push to main/master
- Requires: Pages enabled in repo settings, source set to "Deploy from a branch"

## When Adding Features

1. **New visuals**: Add sprites via `this.add.sprite()` or physics sprites in scenes
2. **Game mechanics**: Update logic in `update()` or collision callbacks in GameScene
3. **UI text**: Use `this.add.text(x, y, 'text', config)` with color/fontSize in config object
4. **New scenes**: Follow MenuScene/GameOverScene pattern for UI scenes or GameScene for gameplay
5. **Assets**: Place in `public/assets/`, load in BootScene, reference by texture key in scenes

## Known Patterns to Preserve

- Scene identifiers used for transitions must match constructor names exactly
- Physics bodies created in `create()`, checked/updated in `update()`
- Input callbacks bound with `undefined, this` context to preserve `this` binding
- ESC key transitions back to menu (convention in current scenes)
