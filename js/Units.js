var particlesPool = [];
var particlesInUse = [];
class Unit {
    constructor() {
        this.mesh = new THREE.Object3D();
        this.mesh.castShadow = true;
    }

    // get tubeControl() {
    //     return this.mesh.getObjectByName('tubeControl');
    // }

    get horizontalControl() {
        return this.mesh.getObjectByName('horizontalControl');
    }

    get verticalController(){
        return this.mesh.getObjectByName('verticalController');
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
        baseMesh.name = 'horizontalControl';
        baseMesh.position.y += baseHeight / 2;
        this.mesh.add(baseMesh);
        var geometry = new THREE.SphereGeometry(baseRadiusTop * 0.8, 32, 32, 0, Math.PI);
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        var hatMesh = new THREE.Mesh(geometry, whiteMat);
        hatMesh.name = 'hatMesh';
        hatMesh.position.y += baseHeight / 2;
        var geometry = new THREE.CylinderGeometry(baseRadiusTop - 1, baseRadiusBottom - 1, baseHeight, 20);
        var horizontalAxle = new THREE.Mesh(geometry);
        horizontalAxle.name = 'verticalController';
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        horizontalAxle.position.copy(hatMesh.position.clone());
        var tubeGemo = new THREE.CylinderGeometry(2, 1, 3, tubeSegments);
        tubeGemo.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
        var tubeMesh = new THREE.Mesh(tubeGemo, blackMat);
        tubeMesh.position.set(-10, 0, 0);
        horizontalAxle.add(tubeMesh);
        // horizontalAxle.rotation.z -= Math.PI / 4;
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

class Copter {
    constructor(){
        this.mesh = new THREE.Object3D();
        this.shape();
    }

    shape(){
        var cabinGeom = new THREE.BoxGeometry(10,10,18);
        var cabinMesh = new THREE.Mesh(cabinGeom);
        cabinMesh.position.set(0,10,0);
        var cabinWinGeom = new THREE.BoxGeometry(10.2,6,8);
        var cabinWinMesh = new THREE.Mesh(cabinWinGeom,glassMat);
        cabinWinMesh.position.set(0,12,5);
        var cabinBsp = new ThreeBSP(cabinMesh);
		var winBsp = new ThreeBSP(cabinWinMesh);
        var result = cabinBsp.subtract(winBsp);
        var cabinmesh = result.toMesh();
        cabinmesh.material = redMat;
        // cabinWinMesh.scale.z = 0.8;
        // cabinWinMesh.position.z -= 1
        this.mesh.add(cabinmesh);
        cabinWinGeom.vertices[5].y -= 2;
        cabinWinGeom.vertices[0].y -= 2;
        this.mesh.add(cabinWinMesh);

        var tubeGroup = new THREE.Object3D();
        var baseTubeGeom = new THREE.CylinderGeometry(.8,.8,5);
        var tubeMesh = new THREE.Mesh(baseTubeGeom,blackMat);
        var tubeMeshClone = tubeMesh.clone();
        tubeMesh.position.x += 5;
        tubeMesh.position.y += 3;
        tubeMesh.position.z += 4;
        tubeMesh.rotation.z += Math.PI/8;
        tubeMeshClone.position.x += 5;
        tubeMeshClone.position.y += 3;
        tubeMeshClone.position.z -= 4;
        tubeMeshClone.rotation.z += Math.PI/8;
        var tubeBottomGeom = new THREE.CylinderGeometry(.8,.8,15);
        tubeBottomGeom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2))
        var tubeBottomMesh = new THREE.Mesh(tubeBottomGeom,blackMat);
        tubeBottomMesh.position.x += 6.2;
        tubeGroup.add(tubeMesh,tubeMeshClone,tubeBottomMesh);
        var tubeGroupOtheside = tubeGroup.clone();
        tubeGroupOtheside.rotation.y += Math.PI;
        this.mesh.add(tubeGroup,tubeGroupOtheside);

        var ridgeGeom = new THREE.BoxGeometry(7,7,8);
        var ridgeMesh = new THREE.Mesh(ridgeGeom,redMat);
        ridgeMesh.position.set(0,12,-8);

        var ridgeGeom2 = new THREE.BoxGeometry(7,7,15);
        ridgeGeom2.vertices[3].y += 5;
        ridgeGeom2.vertices[6].y += 5;
        ridgeGeom2.vertices[1].x -=2;
        ridgeGeom2.vertices[3].x -=2;
        ridgeGeom2.vertices[4].x +=2;
        ridgeGeom2.vertices[6].x +=2;
        var ridgeMesh2 = new THREE.Mesh(ridgeGeom2,redMat);
        ridgeMesh2.position.set(0,12,-19);  
        var ridgeGeom3 = new THREE.BoxGeometry(3,5,3);
        var ridgeMesh3 = new THREE.Mesh(ridgeGeom3,redMat);
        ridgeMesh3.position.set(0,16,-28);
        this.mesh.add(ridgeMesh,ridgeMesh2,ridgeMesh3);
        
        var propellerGroup = new THREE.Object3D();
        var axelGeom = new THREE.CylinderGeometry(1,1,5);
        var axelMesh = new THREE.Mesh(axelGeom,blackMat);
        axelMesh.position.y += 16;
        var axelTopGeom = new THREE.CylinderGeometry(2,2,2);
        var axelTopMesh = new THREE.Mesh(axelTopGeom,blackMat);
        axelTopMesh.position.y += 19;
        propellerGroup.add(axelMesh,axelTopMesh);
        propellerGroup.name = 'propeller';

        var propellerGeom = new THREE.BoxGeometry(40,1,5);
        var propellerMesh = new THREE.Mesh(propellerGeom,blackMat);
        propellerMesh.position.y += 18;
        var propellerGeom2 = new THREE.BoxGeometry(5,1,40);
        var propellerMesh2 = new THREE.Mesh(propellerGeom2,blackMat);
        propellerMesh2.position.y += 18;
        propellerGroup.add(propellerMesh,propellerMesh2);
        propellerGroup.rotation.y += Math.PI/4;
        this.mesh.add(propellerGroup);

        var wingGemo = new THREE.BoxGeometry(26,1,8);
        var wingMesh = new THREE.Mesh(wingGemo,redMat);
        wingMesh.position.y += 10;
        wingMesh.position.z -= 8
        this.mesh.add(wingMesh);

        this.mesh.traverse(function (object) {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        this.mesh.scale.set(.5,.5,.5);
        this.mesh.rotation.y -= Math.PI/2
    }

    update(){
    //    var propeller = this.mesh.getObjectByName('propeller');
    //    propeller.rotation.y += 0.1;
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
        tubeControl.name = "horizontalControl";
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