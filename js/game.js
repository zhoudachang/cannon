//https://github.com/dominictarr/canvas-progress-bar/blob/master/index.js
//https://codepen.io/dlanuara/pen/pLaQQd?editors=0010
var whiteMat = new THREE.MeshLambertMaterial({
    color: 0xfaf3d7,
    flatShading: THREE.FlatShading
});
var blackMat = new THREE.MeshPhongMaterial({
    color: 0x403133,
    flatShading: THREE.FlatShading
});
var yellowMat = new THREE.MeshLambertMaterial({
    color: 0xfdd276,
    flatShading: THREE.FlatShading
});

var brownMat = new THREE.MeshBasicMaterial({
    color: 0x9db3b5, 
    side:THREE.DoubleSide,
    overdraw:
        true
});

// var ennemiesPool = [];
var particlesPool = [];
var particlesInUse = [];
var game = {
    shellHitDistance: 20
};

var scene, camera, renderer, controls;
var ambientLight, hemisphereLight, shadowLight;
var HEIGHT, WIDTH, mousePos = {
    x: 0,
    y: 0
};

var cannon, tank;

function createScene() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    scene = new THREE.Scene();
    nearPlane = .1;
    farPlane = 10000;
    camera = new THREE.PerspectiveCamera(
        50,
        WIDTH / HEIGHT,
        .1,
        10000
    );
    scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
    camera.position.x = 100;
    camera.position.z = 200;
    camera.position.y = 50;
    camera.lookAt(new THREE.Vector3(-50, 0, 0));
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;
    renderer.gammaInput = true;
    // renderer.sortObjects = false;
    container = document.body;
    container.appendChild(renderer.domElement);
    var controls = new THREE.OrbitControls(camera);
    window.addEventListener('resize', handleWindowResize, false);
}

function handleWindowResize() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
}

function createLights() {
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9)
    ambientLight = new THREE.AmbientLight(0xdc8874, .5);
    shadowLight = new THREE.DirectionalLight(0xffffff, .9);
    shadowLight.position.set(0, 250, -150);
    shadowLight.castShadow = true;
    shadowLight.shadow.camera.left = -200;
    shadowLight.shadow.camera.right = 200;
    shadowLight.shadow.camera.top = 200;
    shadowLight.shadow.camera.bottom = -200;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1000;
    shadowLight.shadow.mapSize.width = 1024;
    shadowLight.shadow.mapSize.height = 1024;
    // shadowLight.shadowCameraVisible = true;
    // scene.add(new THREE.CameraHelper( shadowLight.shadow.camera));
    var ch = new THREE.CameraHelper(shadowLight.shadow.camera);
    scene.add(ch);
    scene.add(hemisphereLight);
    scene.add(shadowLight);
    scene.add(ambientLight);
}

var Cannon = function () {
    this.params = {
        horizontalAngle: 0.0,
        shellVelocity: 300,
        verticalAngle: 0
    };
    this.g = 10;
    var baseRadiusTop = 10;
    var baseRadiusBottom = 10;
    var baseHeight = 4;
    var tubeSegments = 10;
    this.mesh = new THREE.Object3D();
    this.shells = [];
    this.clock = new THREE.Clock();
    var geometry = new THREE.CylinderGeometry(baseRadiusTop, baseRadiusBottom, baseHeight, 20);
    var baseMesh = new THREE.Mesh(geometry, whiteMat);
    baseMesh.position.y += baseHeight / 2;
    this.mesh.add(baseMesh);
    var geometry = new THREE.SphereGeometry(baseRadiusTop * 0.8, 32, 32, 0, Math.PI);
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    var hatMesh = new THREE.Mesh(geometry, whiteMat);
    hatMesh.name = 'hatMesh';
    hatMesh.position.y += baseHeight;
    this.mesh.add(hatMesh);
    var geometry = new THREE.CylinderGeometry(baseRadiusTop - 1, baseRadiusBottom - 1, baseHeight, 20);
    var horizontalAxle = new THREE.Mesh(geometry, blackMat);
    horizontalAxle.name = 'horizontalControl';
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    horizontalAxle.position.copy(hatMesh.position.clone());
    var tubeGemo = new THREE.CylinderGeometry(2, 1, 10, tubeSegments);
    tubeGemo.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
    var tubeMesh = new THREE.Mesh(tubeGemo, blackMat);
    tubeMesh.position.set(-10, 0, 0);
    horizontalAxle.add(tubeMesh);
    var tubeGemo2 = new THREE.CylinderGeometry(0.8, 0.8, 20, tubeSegments);
    tubeGemo2.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
    var tubeMesh2 = new THREE.Mesh(tubeGemo2, blackMat);
    tubeMesh2.position.set(-10, 0, 0);
    var tubeTopGemo = new THREE.CylinderGeometry(1, 1, 2, tubeSegments);
    tubeTopGemo.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
    var tubeTopMesh = new THREE.Mesh(tubeTopGemo, blackMat);
    tubeTopMesh.name = 'tubeTopMesh';
    tubeTopMesh.position.x = -20;
    horizontalAxle.add(tubeMesh2, tubeTopMesh);
    this.mesh.add(horizontalAxle);
    this.mesh.traverse(function (object) {
        if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
        }
    });
};

Cannon.prototype.update = function () {
    var t = this.clock.getDelta();
    var horizontalAxle = this.mesh.getObjectByName('horizontalControl');
    horizontalAxle.rotation.z = this.params.horizontalAngle;
    this.mesh.rotation.y = this.params.verticalAngle;
    for (var i = 0; i < this.shells.length; i++) {
        var shellOne = this.shells[i];
        var shellhit = false;
        ennemiesHolder.ennemiesInUse.forEach((ennemy, index) => {
            var diffPos = shellOne.mesh.position.clone().sub(ennemy.mesh.position.clone());
            var d = diffPos.length();
            if (d < game.shellHitDistance) {
                this.shells.splice(i, 1);
                scene.remove(shellOne.mesh);
                shellOne.explode();
                ennemy.hit();
                shellhit = true;
            }
        });
        if (!shellhit) {
            if (shellOne.mesh.position.y > 0) {
                shellOne.mesh.position.x -= Math.cos(shellOne.horizontalAngle) *
                    Math.cos(shellOne.verticalAngle) * this.params.shellVelocity * t;
                var yt = t + shellOne.yt;
                shellOne.yt += t;
                shellOne.mesh.position.y += Math.sin(Math.abs(shellOne.horizontalAngle)) * this.params.shellVelocity * t - this.g * Math.pow(yt, 2) / 2;
                shellOne.mesh.position.z += Math.sin(shellOne.verticalAngle) * this.params.shellVelocity * t;
            } else {
                this.shells.splice(i, 1);
                scene.remove(shellOne.mesh);
                shellOne.explode();
            }
        }
    }
    if (this.fireframe) {
        var f = getParticle();
        var tubeTopMesh = this.mesh.getObjectByName('tubeTopMesh');
        f.mesh.position.copy(tubeTopMesh.getWorldPosition(new THREE.Vector3(0, 0, 0)));
        f.mesh.position.x -= 2;
        f.color = {
            r: 255 / 255,
            g: 205 / 255,
            b: 74 / 255
        };
        f.mesh.material.color.setRGB(f.color.r, f.color.g, f.color.b);
        f.mesh.material.opacity = 1;
        this.mesh.add(f.mesh);
        f.fire(2.5, 1);
        this.fireframe--;
    }

}

Cannon.prototype.shoot = function () {
    this.mesh.updateMatrixWorld();
    if (!this.fireframe) {
        var tubeTopMesh = this.mesh.getObjectByName('tubeTopMesh');
        var shell = new Shell(tubeTopMesh.getWorldPosition(new THREE.Vector3()), this.params.horizontalAngle, this.params.verticalAngle)
        scene.add(shell.mesh);
        this.shells.push(shell);
        this.fireframe = 10;
    }
}

var Shell = function (position, ha, va) {
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), blackMat);
    this.mesh.position.copy(position);
    this.horizontalAngle = ha;
    this.verticalAngle = va;
    this.yt = 0;
}

Shell.prototype.explode = function () {
    for (var i = 0; i < 5; i++) {
        var f = getParticle();
        f.mesh.position.copy(this.mesh.position);
        f.color = {
            r: 255 / 255,
            g: 205 / 255,
            b: 74 / 255
        };
        f.mesh.material.color.setRGB(f.color.r, f.color.g, f.color.b);
        f.mesh.material.opacity = 1;
        scene.add(f.mesh);
        f.explode();
    }
}

var EnnemiesHolder = function () {
    this.mesh = new THREE.Object3D();
    this.ennemiesPool = [];
    this.ennemiesInUse = [];
    this.index = 2;
}

EnnemiesHolder.prototype.spawnEnnemies = function () {
    var ennemy;
    if (this.ennemiesPool.length) {
        ennemy = this.ennemiesPool.pop();
    } else {
        ennemy = new Tank();
    }
    ennemy.index = this.index;
    this.index++;
    this.ennemiesInUse.push(ennemy);
    ennemy.mesh.position.x -= 30 * ennemy.index;
    ennemy.mesh.rotation.y -= Math.PI / 2;
    this.mesh.add(ennemy.mesh);
}

EnnemiesHolder.prototype.moveAll = function () {
    this.ennemiesInUse.forEach((ennemy, index) => {
        ennemy.move();
    })
}


var Tank = function () {
    this.mesh = new THREE.Object3D();
    this.wheels = [];
    this.speed = 0.1;
    this.index = 0;
    this.health = 100;
    this.healthMax = 100;
    this.mesh.castShadow = true;
    var bodyShape = new THREE.Shape();
    bodyShape.moveTo(5, 0);
    bodyShape.lineTo(3, -2);
    bodyShape.lineTo(-3, -2);
    bodyShape.lineTo(-5, -1);
    bodyShape.lineTo(-4, 2);
    bodyShape.lineTo(3, 3);
    bodyShape.lineTo(5, 0);
    var extrudeSettings = {
        amount: 5,
        steps: 2,
        depth: 1,
        bevelEnabled: false
    };
    var bodyGeom = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
    var bodyMesh = new THREE.Mesh(bodyGeom, yellowMat);
    bodyMesh.scale.set(2, 2, 2);
    bodyMesh.position.y += 5;
    bodyMesh.position.z -= 5;
    this.mesh.add(bodyMesh);

    var hatGeom = new THREE.CylinderGeometry(5, 5, 5);
    var hatMesh = new THREE.Mesh(hatGeom, yellowMat);
    hatMesh.position.y += 11;
    var hatGeom2 = new THREE.CylinderGeometry(3, 3, 2);
    var hatMesh2 = new THREE.Mesh(hatGeom2, yellowMat);
    hatMesh2.position.y += 14;
    this.mesh.add(hatMesh, hatMesh2);

    var frontWheelGeom = new THREE.CylinderGeometry(4, 4, 2, 8);
    frontWheelGeom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    var frontWheelMesh = new THREE.Mesh(frontWheelGeom, blackMat);
    frontWheelMesh.position.set(6, 4, 5);
    var frontLeftWheelMesh = frontWheelMesh.clone();
    frontLeftWheelMesh.position.z -= 10;
    this.mesh.add(frontWheelMesh, frontLeftWheelMesh);
    this.wheels.push(frontWheelMesh);
    this.wheels.push(frontLeftWheelMesh);

    var backWheelGeom = new THREE.CylinderGeometry(3, 3, 2, 8);
    backWheelGeom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    var backWheelMesh = new THREE.Mesh(backWheelGeom, blackMat);
    backWheelMesh.position.set(-7, 3, 5);
    var backLeftWheelMesh = backWheelMesh.clone();
    backLeftWheelMesh.position.z -= 10;
    this.mesh.add(backWheelMesh, backLeftWheelMesh);
    this.wheels.push(backWheelMesh);
    this.wheels.push(backLeftWheelMesh);

    var tubeAxleGemo = new THREE.CylinderGeometry(2, 2, 4);
    tubeAxleGemo.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    this.tubeAxleMesh = new THREE.Mesh(tubeAxleGemo, yellowMat);
    this.tubeAxleMesh.position.y += 11;
    this.tubeAxleMesh.position.x += 5;
    this.mesh.add(this.tubeAxleMesh);
    var tubeGemo = new THREE.CylinderGeometry(1, 1, 8);
    tubeGemo.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
    var tubeMesh = new THREE.Mesh(tubeGemo, blackMat);
    tubeMesh.position.set(10, 11, 0);
    var tubeTopGemo = new THREE.CylinderGeometry(2, 2, 3);
    tubeTopGemo.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
    var tubeTopMesh = new THREE.Mesh(tubeTopGemo, blackMat);
    tubeTopMesh.position.y += 11;
    tubeTopMesh.position.x += 14;
    this.mesh.add(tubeMesh, tubeTopMesh);

    var canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 32;
    var ctx = canvas.getContext('2d');
    ctx.lineJoin = "round";
    ctx.fillStyle = '#F0FFF0';
    ctx.fillRect(0, 0, 128, 4);
    ctx.fillStyle = '#228B22';
    ctx.fillRect(2, 1, 64, 2);
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    var spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(0, 8, 0)
    sprite.scale.set(30, 30, 30);
    this.mesh.add(sprite);
    this.mesh.traverse(function (object) {
        if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
        }
    });
}

Tank.prototype.hit = function () {
    TweenMax.to(this.mesh.position, .5, {
        y: +2,
        ease: Bounce.easeOut
    }).reverse(.5);
    TweenMax.to(this.mesh.rotation, .5, {
        z: +Math.PI / 10,
        ease: Bounce.easeOut
    }).reverse(.5);
}

Tank.prototype.move = function () {
    for (var i = 0; i < this.wheels.length; i++) {
        this.wheels[i].rotation.z -= 0.1;
    }
    this.mesh.position.z += this.speed;
}

function getParticle() {
    if (particlesPool.length) {
        return particlesPool.pop();
    } else {
        return new Particle();
    }
}

var Particle = function () {
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

Particle.prototype.initialize = function () {
    this.mesh.rotation.x = 0;
    this.mesh.rotation.y = 0;
    this.mesh.rotation.z = 0;
    this.mesh.position.x = 0;
    this.mesh.position.y = 0;
    this.mesh.position.z = 0;
    this.mesh.scale.x = 1;
    this.mesh.scale.y = 1;
    this.mesh.scale.z = 1;
    // this.mesh.material.opacity = .5;
    particlesPool.unshift(this);
}

Particle.prototype.updateColor = function () {
    this.mesh.material.color.setRGB(this.color.r, this.color.g, this.color.b);
}
Particle.prototype.explode = function () {
    var speed = 1;
    TweenMax.to(this.mesh.rotation, speed, {
        x: Math.random() * Math.PI * 3,
        y: Math.random() * Math.PI * 3
    });
    TweenMax.to(this.mesh.scale, speed * 2, {
        x: 20,
        y: 20,
        z: 20,
        ease: Strong.easeOut,
        onComplete: () => this.initialize()
    });
    TweenMax.to(this.mesh.material, speed * 2, {
        opacity: 0,
        ease: Strong.easeOut
    });
    var bezierColor = [{
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
    TweenMax.to(this.color, speed, {
        bezier: bezierColor,
        ease: Strong.easeOut,
        onUpdate: () => this.updateColor()
    });

    TweenMax.to(this.mesh.position, speed, {
        y: +5,
        ease: Strong.easeOut
    });

}

Particle.prototype.fire = function (f, speed) {
    var maxSneezingRate = 8;
    var initX = this.mesh.position.x;
    var initY = this.mesh.position.y;
    var initZ = this.mesh.position.z;
    TweenMax.to(this.mesh.position, speed, {
        z: initZ,
        y: initY + 4,
        x: initX - 5,
        ease: Strong.easeOut
    });
    TweenMax.to(this.mesh.rotation, speed, {
        x: Math.random() * Math.PI * 3,
        y: Math.random() * Math.PI * 3,
        ease: Strong.easeOut
    });
    var bezierScale = [{
        x: 1,
        y: 1,
        z: 1
    }, {
        x: f / maxSneezingRate + Math.random() * .3,
        y: f / maxSneezingRate + Math.random() * .3,
        z: f * 2 / maxSneezingRate + Math.random() * .3
    }, {
        x: f / maxSneezingRate + Math.random() * .5,
        y: f / maxSneezingRate + Math.random() * .5,
        z: f * 2 / maxSneezingRate + Math.random() * .5
    }, {
        x: f * 2 / maxSneezingRate + Math.random() * .5,
        y: f * 2 / maxSneezingRate + Math.random() * .5,
        z: f * 4 / maxSneezingRate + Math.random() * .5
    }, {
        x: f * 2 + Math.random() * 5,
        y: f * 2 + Math.random() * 5,
        z: f * 2 + Math.random() * 5
    }];
    TweenMax.to(this.mesh.scale, speed * 2, {
        bezier: bezierScale,
        ease: Strong.easeOut,
        onComplete: () => this.initialize()
    });

    TweenMax.to(this.mesh.material, speed, {
        opacity: 0,
        ease: Strong.easeOut
    });
    var bezierColor = [{
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
    TweenMax.to(this.color, speed, {
        bezier: bezierColor,
        ease: Strong.easeOut,
        onUpdate: () => this.updateColor()
    });
}

function createCannon() {
    cannon = new Cannon();
    scene.add(cannon.mesh);
}

// function createTank() {
//     tank = new Tank();
//     tank.mesh.position.x -= 150;
//     scene.add(tank.mesh);
// }

function createGroud() {
    var groudGemo = new THREE.PlaneGeometry(1000, 1000, 10, 10);
    groudGemo.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    // groudGemo.vertices.forEach(function (value, index) {
    //     if (Math.abs(value.x) > 100 && Math.abs(value.z) > 100) {
    //         value.y -= Math.random() * 50;
    //     }
    // })
    var groudMesh = new THREE.Mesh(groudGemo, brownMat);
    // groudMesh.castShadow = true;
    groudMesh.receiveShadow = true;
    scene.add(groudMesh);
}

function init(event) {
    createScene();
    createGroud();
    createLights();
    createCannon();
    ennemiesHolder = new EnnemiesHolder()
    scene.add(ennemiesHolder.mesh);
    var gui = new dat.GUI();
    gui.add(cannon.params, "horizontalAngle", -Math.PI / 2, 0.0);
    gui.add(cannon.params, "shellVelocity", 100, 500);
    gui.add(cannon.params, "verticalAngle", -Math.PI / 2, Math.PI / 2);
    gui.open();
    // createPlane();
    // createSea();
    // createSky();
    // createCoins();
    // createEnnemies();
    // createParticles();

    // document.addEventListener('mousemove', handleMouseMove, false);
    // document.addEventListener('touchmove', handleTouchMove, false);
    document.addEventListener('mouseup', handleMouseUp, false);
    // document.addEventListener('touchend', handleTouchEnd, false);
    loop();
}

function loop() {
    cannon.update();
    if (ennemiesHolder.ennemiesInUse.length < 5) {
        ennemiesHolder.spawnEnnemies();
    }
    ennemiesHolder.moveAll();
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
}

function handleMouseUp() {
    cannon.shoot();
}

window.addEventListener('load', init, false);