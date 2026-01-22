import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data: { score: number }) {
    this.registry.set('score', data.score);
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const score = this.registry.get('score') || 0;

    // Game Over text
    this.add.text(width / 2, height / 3, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Score display
    this.add.text(width / 2, height / 2, `Final Score: ${score}`, {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Restart instructions
    this.add.text(width / 2, height * 0.7, 'Click or Press SPACE to Play Again', {
      fontSize: '24px',
      color: '#00ff00',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Input handlers
    this.input.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    this.input.keyboard?.on('keydown-SPACE', () => {
      this.scene.start('MenuScene');
    });
  }
}
