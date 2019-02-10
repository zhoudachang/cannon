
class Particle {
  constructor() {
    this.color = {
      r: 0,
      g: 0,
      b: 0
    };
    var particleMat = new THREE.MeshLambertMaterial({
      transparent: true,
      opacity: .5,
      flatShading: THREE.FlatShading,
      alphaTest: .1
    });
    var geom = new THREE.BoxGeometry(1, 1, 1);
    this.mesh = new THREE.Mesh(geom, particleMat);
  }

  initialize() {
    this.mesh.rotation.x = 0;
    this.mesh.rotation.y = 0;
    this.mesh.rotation.z = 0;
    this.mesh.position.x = 0;
    this.mesh.position.y = 0;
    this.mesh.position.z = 0;
    this.mesh.scale.x = 1;
    this.mesh.scale.y = 1;
    this.mesh.scale.z = 1;
    particlesPool.unshift(this);
  }
  updateColor() {
    this.mesh.material.color.setRGB(this.color.r, this.color.g, this.color.b);
  }
}

class Effect {
  constructor() {
    this.mesh = new THREE.Object3D()
  }

  explode(position) {
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
      depthWrite: false,
      opacity: 1,
      color: 0xffff00,
      flatShading: THREE.FlatShading
    });
    var ringGeometry = new THREE.TorusGeometry(2, .7, 2, 32);
    var coreMesh = new THREE.Mesh(coreGeometry, materialCore);
    var ringGeometry = new THREE.TorusGeometry(2, .5, 2, 32);
    ringGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    var ringMesh = new THREE.Mesh(ringGeometry, new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 1,
      color: 0xffff00,
      flatShading: THREE.FlatShading
    }));
    if (position) {
      coreMesh.position.copy(position);
      sphereMesh.position.copy(position);
      ringMesh.position.copy(position);
    }
    this.mesh.add(coreMesh, sphereMesh, ringMesh);
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
    }), TweenMax.to(ringMesh.material, speed, {
      opacity: 0,
      ease: Strong.easeOut
    }), TweenMax.to(coreMesh.scale, speed, {
      x: 4,
      y: 4,
      z: 4,
      ease: Strong.easeOut
    }), TweenMax.to(coreMesh.material, speed, {
      opacity: 0,
      ease: Strong.easeOut
    })]);
    explodeTimeline.call(() => this.mesh.remove(coreMesh, sphereMesh, ringMesh));
  }

  fire(tubePosWorld,fdir,callback) {
    var attackTimeLine = new TimelineLite();
    let speed = 1;
    let particlecount = 5;
    let p = ["-=0"];
    for (let i = 1; i < particlecount; i++) {
      p.push('-=' + (speed - .01 * i));
    }
    for (var i = 0; i < particlecount; i++) {
      let f = new Particle();
      let rate = 1;
      f.mesh.position.copy(tubePosWorld);
      f.mesh.translateOnAxis(fdir, 1);
      f.color = {
        r: 255 / 255,
        g: 205 / 255,
        b: 74 / 255
      };
      f.mesh.material.color.setRGB(f.color.r, f.color.g, f.color.b);
      f.mesh.material.opacity = 1;
      this.mesh.add(f.mesh);
      let af = 1;
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
        g: 34 / 255,
        b: 50 / 255
      }, {
        r: 247 / 255,
        g: 34 / 255,
        b: 50 / 255
      }, {
        r: 0 / 255,
        g: 0 / 255,
        b: 0 / 255
      }];
      let bezierScale = [{
        x: 1,
        y: 1,
        z: 1
      }, {
        x: af / rate + Math.random() * .3,
        y: af / rate + Math.random() * .3,
        z: af * 2 / rate + Math.random() * .3
      }, {
        x: af / rate + Math.random() * .5,
        y: af / rate + Math.random() * .5,
        z: af * 2 / rate + Math.random() * .5
      }, {
        x: af * 2 / rate + Math.random() * .5,
        y: af * 2 / rate + Math.random() * .5,
        z: af * 4 / rate + Math.random() * .5
      }, {
        x: af * 2 + Math.random() * 5,
        y: af * 2 + Math.random() * 5,
        z: af * 2 + Math.random() * 5
      }];
      attackTimeLine.add(
        [TweenMax.to(f.mesh.position, speed, {
          x: f.mesh.position.x + fdir.x * 20,
          y: f.mesh.position.y + fdir.y * 20 + 5,
          z: f.mesh.position.z + fdir.z * 20
        }),
        TweenMax.to(f.mesh.rotation, speed, {
          x: Math.random() * Math.PI * 3,
          z: Math.random() * Math.PI * 3,
        }),
        TweenMax.to(f.mesh.scale, speed, {
          bezier: bezierScale,
          ease: Strong.easeOut
        }),
        TweenMax.to(f.mesh.material, speed, {
          opacity: 0,
          ease: Strong.easeOut
        }),
        TweenMax.to(f.color, speed, {
          bezier: bezierColor,
          ease: Strong.easeOut,
          onUpdate: () => f.updateColor()
        })
        ], p[i], "start", 0);
    }
    attackTimeLine.call(() => {
      if (callback) {
        callback();
      }
    });
  }
}