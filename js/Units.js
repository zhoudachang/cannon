var particlesPool = [];
var particlesInUse = [];
class Unit {
    constructor() {
        this.mesh = new THREE.Object3D();
        this.mesh.castShadow = true;
    }

    get tubeControl() {
        return this.mesh.getObjectByName('tubeControl');
    }

    get tubeTop() {
        return this.mesh.getObjectByName('tubeTop');
    }
}

class Cannon extends Unit {
    constructor() {
        super();
        this.params = {
            horizontalAngle: 0.0,
            shellVelocity: 300,
            verticalAngle: 0
        };
        this.direction = new THREE.Vector3(-1, 0, 0);
        this.tubeDirection = this.direction.clone();
        this.fireRadius = 3;
        this.g = 10;
        var baseRadiusTop = 10;
        var baseRadiusBottom = 10;
        var baseHeight = 4;
        var tubeSegments = 10;
        this.shells = [];
        var geometry = new THREE.CylinderGeometry(baseRadiusTop, baseRadiusBottom, baseHeight, 20);
        var baseMesh = new THREE.Mesh(geometry, whiteMat);
        baseMesh.name = 'tubeControl';
        baseMesh.position.y += baseHeight / 2;
        this.mesh.add(baseMesh);
        var geometry = new THREE.SphereGeometry(baseRadiusTop * 0.8, 32, 32, 0, Math.PI);
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        var hatMesh = new THREE.Mesh(geometry, whiteMat);
        hatMesh.name = 'hatMesh';
        hatMesh.position.y += baseHeight / 2;
        var geometry = new THREE.CylinderGeometry(baseRadiusTop - 1, baseRadiusBottom - 1, baseHeight, 20);
        var horizontalAxle = new THREE.Mesh(geometry, blackMat);
        horizontalAxle.name = 'horizontalControl';
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        horizontalAxle.position.copy(hatMesh.position.clone());
        var tubeGemo = new THREE.CylinderGeometry(2, 1, 3, tubeSegments);
        tubeGemo.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
        var tubeMesh = new THREE.Mesh(tubeGemo, blackMat);
        tubeMesh.position.set(-10, 0, 0);
        horizontalAxle.add(tubeMesh);
        horizontalAxle.rotation.z -= Math.PI / 4;
        var tubeGemo2 = new THREE.CylinderGeometry(0.8, 0.8, 10, tubeSegments);
        tubeGemo2.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
        var tubeMesh2 = new THREE.Mesh(tubeGemo2, blackMat);
        tubeMesh2.position.set(-10, 0, 0);
        var tubeTopGemo = new THREE.CylinderGeometry(2, 2, 2, tubeSegments);
        tubeTopGemo.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
        var tubeTopMesh = new THREE.Mesh(tubeTopGemo, blackMat);
        tubeTopMesh.name = 'tubeTop';
        tubeTopMesh.position.x = -15;
        horizontalAxle.add(tubeMesh2, tubeTopMesh);
        baseMesh.add(hatMesh);
        baseMesh.add(horizontalAxle);
        this.mesh.add(baseMesh);
        this.mesh.traverse(function (object) {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        this.mesh.scale.set(.5, .5, .5);
    }
}

class Tank extends Unit {
    constructor() {
        super();
        this.direction = new THREE.Vector3(1, 0, 0);
        this.tubeDirection = this.direction.clone();
        this.moveRadius = 3;
        this.fireRadius = 3;
        this.wheels = [];
        this.health = 100;
        this.healthMax = 100;
        this.shape();
    }

    shape() {
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
        var tubeControl = new THREE.Mesh(hatGeom, yellowMat);
        tubeControl.name = "tubeControl";
        tubeControl.position.y += 11;
        var hatGeom2 = new THREE.CylinderGeometry(3, 3, 2);
        var hatMesh2 = new THREE.Mesh(hatGeom2, yellowMat);
        hatMesh2.position.y += 3;
        tubeControl.add(hatMesh2);

        var tubeAxleGemo = new THREE.CylinderGeometry(2, 2, 4);
        tubeAxleGemo.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        this.tubeAxleMesh = new THREE.Mesh(tubeAxleGemo, yellowMat);
        this.tubeAxleMesh.position.x += 5;
        tubeControl.add(this.tubeAxleMesh);
        var tubeGemo = new THREE.CylinderGeometry(1, 1, 8);
        tubeGemo.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
        var tubeMesh = new THREE.Mesh(tubeGemo, blackMat);
        tubeMesh.position.set(10, 0, 0);
        var tubeTopGemo = new THREE.CylinderGeometry(2, 2, 3);
        tubeTopGemo.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
        var tubeTopMesh = new THREE.Mesh(tubeTopGemo, blackMat);
        tubeTopMesh.name = 'tubeTop';
        tubeTopMesh.position.x += 14;
        tubeControl.add(tubeMesh, tubeTopMesh);


        this.mesh.add(tubeControl);
        var frontWheelGeom = new THREE.CylinderGeometry(4, 4, 2, 16);
        frontWheelGeom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        var frontWheelMesh = new THREE.Mesh(frontWheelGeom, blackMat);
        frontWheelMesh.position.set(6, 4, 5);
        var frontLeftWheelMesh = frontWheelMesh.clone();
        frontLeftWheelMesh.position.z -= 10;
        this.mesh.add(frontWheelMesh, frontLeftWheelMesh);
        this.wheels.push(frontWheelMesh);
        this.wheels.push(frontLeftWheelMesh);
        var backWheelGeom = new THREE.CylinderGeometry(3, 3, 2, 16);
        backWheelGeom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        var backWheelMesh = new THREE.Mesh(backWheelGeom, blackMat);
        backWheelMesh.position.set(-7, 3, 5);
        var backLeftWheelMesh = backWheelMesh.clone();
        backLeftWheelMesh.position.z -= 10;
        this.mesh.add(backWheelMesh, backLeftWheelMesh);
        this.wheels.push(backWheelMesh);
        this.wheels.push(backLeftWheelMesh);

        // var canvas = document.createElement('canvas');
        // canvas.width = 128;
        // canvas.height = 32;
        // var ctx = canvas.getContext('2d');
        // ctx.lineJoin = "round";
        // ctx.fillStyle = '#F0FFF0';
        // ctx.fillRect(0, 0, 128, 4);
        // ctx.fillStyle = '#228B22';
        // ctx.fillRect(2, 1, 64, 2);
        // var texture = new THREE.Texture(canvas);
        // texture.needsUpdate = true;
        // var spriteMaterial = new THREE.SpriteMaterial({
        //     map: texture,
        //     transparent: true
        // });
        // var sprite = new THREE.Sprite(spriteMaterial);
        // sprite.position.set(0, 8, 0);
        // sprite.scale.set(30, 30, 30);
        // this.mesh.add(sprite);

        this.mesh.traverse(function (object) {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        this.mesh.scale.set(.5, .5, .5);
    }
    hit() {
        TweenMax.to(this.mesh.position, .5, {
            y: +2,
            ease: Bounce.easeOut
        }).reverse(.5);
        TweenMax.to(this.mesh.rotation, .5, {
            z: +Math.PI / 10,
            ease: Bounce.easeOut
        }).reverse(.5);
    }
    move() {}
}


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
        // this.mesh.material.opacity = .5;
        particlesPool.unshift(this);
    }
    updateColor() {
        this.mesh.material.color.setRGB(this.color.r, this.color.g, this.color.b);
    }
    explode() {
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
    fire(f, speed, delay) {
        var maxSneezingRate = 20;
        var initX = this.mesh.position.x;
        var initY = this.mesh.position.y;
        var initZ = this.mesh.position.z;
        TweenMax.to(this.mesh.position, speed, {
            z: initZ,
            y: initY + 5,
            x: initX - 5,
            ease: Strong.easeOut
        }).delay(delay);
        TweenMax.to(this.mesh.rotation, speed, {
            x: Math.random() * Math.PI * 3,
            y: Math.random() * Math.PI * 3,
            ease: Strong.easeOut
        }).delay(delay);
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
        }).delay(delay);
        TweenMax.to(this.mesh.material, speed, {
            opacity: 0,
            ease: Strong.easeOut
        }).delay(delay);
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
        }).delay(delay);
    }
}

class Shell {
    constructor(position, ha, va) {
        this.mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), blackMat);
        this.mesh.position.copy(position);
        this.horizontalAngle = ha;
        this.verticalAngle = va;
        this.yt = 0;
    }
    explode() {
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
}

function getParticle() {
    if (particlesPool.length) {
        return particlesPool.pop();
    } else {
        return new Particle();
    }
}