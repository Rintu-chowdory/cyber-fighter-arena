import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  private player?: Phaser.Physics.Arcade.Sprite;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private score: number = 0;
  

  constructor() {
    super('GameScene');
  }

  create() {
    // Set background
    this.cameras.main.setBackgroundColor('#1a1a1a');

    // Create player (placeholder key)
    this.player = this.physics.add.sprite(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'player'
    );
    this.player.setScale(2);
    this.player.setTint(0x00ff00);
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // Create simple obstacles (enemies)
    const enemies = this.physics.add.group();
    for (let i = 0; i < 3; i++) {
      const enemy = enemies.create(
        Phaser.Math.Between(100, this.cameras.main.width - 100),
        Phaser.Math.Between(50, 200),
        'enemy'
      );
      enemy.setScale(1.5);
      enemy.setTint(0xff0000);
      enemy.setVelocity(Phaser.Math.Between(-100, 100), 100);
      enemy.setBounce(1, 1);
      enemy.setCollideWorldBounds(true);
    }

    // Add collisions
    this.physics.add.collider(this.player, enemies, this.hitEnemy, undefined, this);

    // Setup input
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Setup UI
    this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      color: '#00ff00',
    });

    // Escape to menu
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });
  }

  update() {
    if (!this.player || !this.cursors) return;

    // Player movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown && this.player.body?.touching.down) {
      this.player.setVelocityY(-330);
    }
  }

  private hitEnemy() {
    this.scene.start('GameOverScene', { score: this.score });
  }
}
