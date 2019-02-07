class Effect {
  constructor() {
    this.mesh = new THREE.Object3D()
  }

  explode(position) {
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
    var ringGeometry = new THREE.TorusGeometry(2, .7, 2, 32);
    ringGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    var ringMesh = new THREE.Mesh(ringGeometry, new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 1,
      color: new THREE.Color("rgb(255, 205, 74)"),
      flatShading: THREE.FlatShading
    }));
    sphere.material.color.setRGB(sphere.color.r, sphere.color.g, sphere.color.b);
    if (position) {
      sphere.position.copy(position);
      ringMesh.position.copy(position);
    }
    this.mesh.add(sphere, ringMesh);
    var updateColor = function () {
      sphere.material.color.setRGB(sphere.color.r, sphere.color.g, sphere.color.b);
    }
    let explodeTimeline = new TimelineMax();
    var speed = 1;
    explodeTimeline.add([TweenMax.to(sphere.scale, speed, {
      x: 10,
      y: 10,
      z: 10
    }), TweenMax.to(sphere.material, speed, {
      opacity: 0,
      ease: Strong.easeOut
    }), TweenMax.to(sphere.color, speed, {
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
    }), TweenMax.to(ringMesh.material, speed, {
      opacity: 0,
      ease: Strong.easeOut
    })]);
    // explodeTimeline.add();
  }

  fire(position, fireDir) {
    let fireTimeLine = new TimelineMax();
    var particleMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("rgb(255, 205, 74)"),
      transparent: true,
      opacity: 1,
      flatShading: THREE.FlatShading,
    });
    
    let p = ["-=0", "-=0.99", "-=0.98", "-=0.97", "-=0.96", "-=0.95", "-=0.94", "-=0.93", "-=0.92", "-=0.91", "-=0.90"];
    for (let i = 0; i < 10; i++) {
      var geom = new THREE.BoxGeometry(1, 1, 1);
      var fireMesh = new THREE.Mesh(geom, particleMat);
      if (position) {
        fireMesh.position.copy(position)
      }
      this.mesh.add(fireMesh);
      var speed = 1;
      fireTimeLine.add([TweenMax.to(fireMesh.position, speed, {
        x: position.x + fireDir.x * 10,
        y: position.y + fireDir.y * 10 + 5,
        z: position.z + fireDir.z * 10
      }), TweenMax.to(fireMesh.rotation, speed, {
        x: Math.random() * Math.PI * 5,
        z: Math.random() * Math.PI * 5,
      }), TweenMax.to(fireMesh.scale, speed, {
        x: 2 + Math.random() * 5,
        y: 2 + Math.random() * 5,
        z: 2 + Math.random() * 5,
        ease: Strong.easeOut
      }),TweenMax.to(fireMesh.material, speed, {
        opacity: 0,
        ease: Strong.easeOut
    })], p[i], 'start', 0);
    }

  }


}