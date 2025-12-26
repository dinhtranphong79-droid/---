// js/fireworks.js
export class Firework {
  constructor(scene) {
    this.scene = scene;

    this.count = 300;
    this.positions = new Float32Array(this.count * 3);
    this.velocities = [];

    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.PointsMaterial({
      size: 0.25,
      color: new THREE.Color(`hsl(${Math.random()*360},100%,60%)`),
      transparent: true,
      opacity: 1
    });

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      this.positions[i3] = 0;
      this.positions[i3 + 1] = 0;
      this.positions[i3 + 2] = 0;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = Math.random() * 3 + 1;

      this.velocities.push({
        x: Math.sin(phi) * Math.cos(theta) * speed,
        y: Math.cos(phi) * speed,
        z: Math.sin(phi) * Math.sin(theta) * speed
      });
    }

    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(this.positions, 3)
    );

    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);

    this.life = 120;
  }

  update() {
    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      this.positions[i3] += this.velocities[i].x * 0.03;
      this.positions[i3 + 1] += this.velocities[i].y * 0.03;
      this.positions[i3 + 2] += this.velocities[i].z * 0.03;

      this.velocities[i].y -= 0.02;
    }

    this.material.opacity -= 0.008;
    this.geometry.attributes.position.needsUpdate = true;
    this.life--;
  }

  isDead() {
    return this.life <= 0 || this.material.opacity <= 0;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.scene.remove(this.points);
  }
}
