import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

/**
 * Simple 2D noise (đủ dùng – nhanh – không phụ thuộc lib)
 */
function noise(x, z) {
  return Math.sin(x * 0.15) * Math.cos(z * 0.15);
}

/**
 * Tạo địa hình Lũng Cú dạng thung lũng
 */
export function createLungCuTerrain() {

  const size = 400;
  const segments = 200;

  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
  geometry.rotateX(-Math.PI / 2);

  const pos = geometry.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);

    // Multi-octave noise
    let height =
      noise(x * 0.5, z * 0.5) * 6 +
      noise(x * 1.2, z * 1.2) * 3 +
      noise(x * 2.5, z * 2.5) * 1.5;

    // Tạo thung lũng (Lũng Cú không nhọn)
    const dist = Math.sqrt(x * x + z * z);
    const valley = Math.max(0, 1 - dist / 180);
    height *= valley;

    pos.setY(i, height);
  }

  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: 0x0b0b0b,
    roughness: 1,
    metalness: 0,
    flatShading: false
  });

  const terrain = new THREE.Mesh(geometry, material);
  terrain.receiveShadow = true;



  return terrain;
}

