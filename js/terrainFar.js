// js/terrainFar.js
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

function noise(x, z) {
  return Math.sin(x * 0.05) * Math.cos(z * 0.05);
}

export function createFarMountains() {
  const size = 900;
  const segments = 80;

  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
  geometry.rotateX(-Math.PI / 2);

  const pos = geometry.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);

    let height =
      noise(x, z) * 20 +
      noise(x * 2, z * 2) * 10;

    pos.setY(i, height);
  }

  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: 0x070a10,     // rất tối → silhouette
    roughness: 1,
    metalness: 0,
    flatShading: true
  });

  const mountains = new THREE.Mesh(geometry, material);

  mountains.position.y = -25;
  mountains.position.z = -180; // đẩy ra xa
  mountains.receiveShadow = false;

  return mountains;
}
