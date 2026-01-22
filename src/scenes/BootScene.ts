import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Preload assets here
    this.load.text('mapData', 'assets/map.json');
  }

  create() {
    this.scene.start('MenuScene');
  }
}
