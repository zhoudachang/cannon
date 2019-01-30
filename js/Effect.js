class Effect {
  constructor() {
    this.mesh = new THREE.Object3D()
  }

  explode() {
    var geometry = new THREE.SphereGeometry(1, 8, 8, 0, Math.PI);
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    var material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: .5,
      color: 0xdc143c,
      flatShading: THREE.FlatShading
    });
    var sphereMesh = new THREE.Mesh(geometry, material);
    var coreGeometry = new THREE.SphereGeometry(1, 8, 8, 0, Math.PI);
    coreGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    var materialCore = new THREE.MeshBasicMaterial({
      transparent: true,
      depthWrite :false,
      opacity: 1,
      color: 0xffff00,
      flatShading: THREE.FlatShading
    });
    var coreMesh = new THREE.Mesh(coreGeometry,materialCore);
    var ringGeometry = new THREE.TorusGeometry(2, .5, 2, 32);
    ringGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    var ringMesh = new THREE.Mesh(ringGeometry, new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 1,
      color: 0xffff00,
      flatShading: THREE.FlatShading
    }));
    this.mesh.add(coreMesh,sphereMesh, ringMesh);
    let explodeTimeline = new TimelineMax();
    var speed = 2;
    explodeTimeline.add([TweenMax.to(sphereMesh.scale, speed, {
      x: 10,
      y: 10,
      z: 10
    }), TweenMax.to(sphereMesh.material, speed, {
      opacity: 0,
      ease: Strong.easeOut
    }), TweenMax.to(ringMesh.scale, speed, {
      x: 4,
      y: 1,
      z: 4,
      ease: Strong.easeOut
    }),TweenMax.to(ringMesh.material,speed,{
      opacity: 0,
      ease: Strong.easeOut
    }),TweenMax.to(coreMesh.scale,speed,{
      x: 4,
      y: 4,
      z: 4,
      ease: Strong.easeOut
    }),TweenMax.to(coreMesh.material,speed,{
      opacity: 0,
      ease: Strong.easeOut
    })]);
    explodeTimeline.call(() => this.mesh.remove(coreMesh,sphereMesh, ringMesh))
  }
  fire() {}
}