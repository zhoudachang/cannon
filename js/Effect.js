class Effect {
  constructor() {
    this.mesh = new THREE.Object3D()
  }

  explode() {
    let bezierColor = [{
      r: 255 / 255,
      g: 205 / 255,
      b: 74 / 255
    }, {
      r: 255 / 255,
      g: 205 / 255,
      b: 74 / 255
    }, {
      r: 255 / 255,
      g: 205 / 255,
      b: 74 / 255
    }, {
      r: 247 / 255,
      g: 34 / 255,
      b: 50 / 255
    }, {
      r: 0 / 255,
      g: 0 / 255,
      b: 0 / 255
    }];
    var geometry = new THREE.SphereGeometry(1, 8, 8, 0, Math.PI);
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    var material = new THREE.MeshLambertMaterial({
      transparent: true,
      opacity: 1,
      color: 0xffff00,
      flatShading: THREE.FlatShading
    });
    var sphere = new THREE.Mesh(geometry, material);
    sphere.color = {
      r: 255 / 255,
      g: 205 / 255,
      b: 74 / 255
    };
    var ringGeometry = new THREE.TorusGeometry(2, .2, 2, 32);
    ringGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    var ringMesh = new THREE.Mesh(ringGeometry, new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 1,
      color: new THREE.Color("rgb(255, 205, 74)"),
      flatShading: THREE.FlatShading
    }));
    sphere.material.color.setRGB(sphere.color.r, sphere.color.g, sphere.color.b);
    this.mesh.add(sphere, ringMesh);
    var updateColor = function () {
      sphere.material.color.setRGB(sphere.color.r, sphere.color.g, sphere.color.b);
    }
    let explodeTimeline = new TimelineMax();
    var speed = 2;
    explodeTimeline.add([TweenMax.to(sphere.scale, speed, {
      x: 10,
      y: 10,
      z: 10
    }), TweenMax.to(sphere.material, speed, {
      opacity: 0,
      ease: Strong.easeOut
    }), TweenMax.to(sphere.color,speed, {
      bezier: {
        curviness: 2,
        values: bezierColor
      },
      ease: Strong.easeOut,
      onUpdate: () => updateColor()
    }), TweenMax.to(ringMesh.scale, speed, {
      x: 4,
      y: 1,
      z: 4,
      ease: Strong.easeOut
    }),TweenMax.to(ringMesh.material,speed,{
      opacity: 0,
      ease: Strong.easeOut
    })]);
    // explodeTimeline.add();
  }

  fire() {}


}