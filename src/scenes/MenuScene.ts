import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Title
    this.add.text(width / 2, height / 4, 'Cyber Fighter Arena', {
      fontSize: '48px',
      color: '#00ff00',
      fontStyle: 'bold',
      fontFamily: 'monospace',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Instructions
    this.add.text(width / 2, height / 2, 'Click or Press SPACE to Start', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'monospace',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Add input handlers
    this.input.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    this.input.keyboard?.on('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });
  }
}
