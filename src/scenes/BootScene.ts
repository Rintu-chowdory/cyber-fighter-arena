import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Preload assets here
    this.load.image('player', '/assets/player.png');
    this.load.image('enemy', '/assets/enemy.png');
    this.load.text('mapData', '/assets/map.json');
  }

  create() {
    this.scene.start('MenuScene');
  }
}
