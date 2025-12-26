import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export class Firework {
  constructor(scene, onExplode) {
    this.scene = scene;
    this.onExplode = onExplode;

    // ====== STATE ======
    this.state = "launch";
    this.dead = false;

    // ====== LAUNCH ======
    this.launchSpeed = 25 + Math.random() * 10;
    this.velocity = new THREE.Vector3(0, this.launchSpeed, 0);
    this.gravity = -18;

    // ====== ROCKET ======
    const geo = new THREE.SphereGeometry(0.15, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.rocket = new THREE.Mesh(geo, mat);
    this.scene.add(this.rocket);

    this.explodeHeight = 30 + Math.random() * 15;

    // ====== PARTICLES ======
    this.particles = null;
    this.life = 0;
    this.maxLife = 2.5;
  }

  setPosition(x, y, z) {
    this.rocket.position.set(x, y, z);
  }

  // =====================
  update(delta = 0.016) {
    if (this.dead) return;

    if (this.state === "launch") {
      this.velocity.y += this.gravity * delta;
      this.rocket.position.addScaledVector(this.velocity, delta);

      if (this.velocity.y <= 0 || this.rocket.position.y >= this.explodeHeight) {
        this.explode();
      }
    }

    if (this.state === "explode") {
      this.life += delta;
      this.particles.material.opacity = 1 - this.life / this.maxLife;

      if (this.life >= this.maxLife) {
        this.dispose();
      }
    }
  }

  // =====================
  explode() {
    this.state = "explode";
    this.scene.remove(this.rocket);

    // 🔊 CALLBACK NỔ
    if (this.onExplode) this.onExplode();

    const count = 200;
    const positions = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 8 + Math.random() * 6;

      const v = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      ).multiplyScalar(speed);

      velocities.push(v);

      positions[i * 3] = this.rocket.position.x;
      positions[i * 3 + 1] = this.rocket.position.y;
      positions[i * 3 + 2] = this.rocket.position.z;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.25,
      color: new THREE.Color().setHSL(Math.random(), 1, 0.6),
      transparent: true,
      opacity: 1,
      depthWrite: false
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);

    this.velocities = velocities;
  }

  // =====================
  dispose() {
    if (this.dead) return;
    this.dead = true;

    this.scene.remove(this.particles);
    this.particles.geometry.dispose();
    this.particles.material.dispose();
  }

  isDead() {
    return this.dead;
  }
}
