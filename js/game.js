var whiteMat = new THREE.MeshLambertMaterial({
    color: 0xfaf3d7,
    flatShading: THREE.FlatShading
});
var blackMat = new THREE.MeshPhongMaterial({
    color: 0x403133,
    flatShading: THREE.FlatShading,
    side: THREE.DoubleSide
});
var yellowMat = new THREE.MeshLambertMaterial({
    color: 0xfdd276,
    flatShading: THREE.FlatShading
});
var brownMat = new THREE.MeshLambertMaterial({
    color: 0x9db3b5,
    side: THREE.DoubleSide
});
var greenMat = new THREE.MeshLambertMaterial({
    color: 0xf0fff0,
    flatShading: THREE.FlatShading,
    side: THREE.DoubleSide
});
var redMat = new THREE.MeshLambertMaterial({
    flatShading: THREE.FlatShading,
    color: 0xcd3700
});

var particlesPool = [];
var particlesInUse = [];
var game = {
    round:1,
    stageWidth: 100,
    stageHeight: 100,
    segmentsLength: 10,
    shellHitDistance: 20
};
var stats = new Stats();
var raycaster = new THREE.Raycaster();
var mouseVector = new THREE.Vector3();

var scene, camera, renderer, controls;
var engine, cannon, tank;
var ambientLight, hemisphereLight, shadowLight;
var HEIGHT, WIDTH, mousePos = {
    x: 0,
    y: 0
};
BehaviorTree.register('move-fire', new BehaviorTree.Task({
    title: 'move-fire',
    start: function (unit) {
        var moveRange = calMoveRange(game.map, unit.index, unit.moveRadius);
        engine.targetIndex = moveRange[moveRange.length - 1];
    },
    end: function (obj) {
        obj.isStarted = false;
    },
    run: function (unit) {
        if(!unit.isMoving){
            var moveRange = calMoveRange(game.map, unit.index, unit.moveRadius);
            if(!moveRange || moveRange.length == 1){
                this.fail();
                return;
            }
            engine.targetIndex = moveRange[moveRange.length - 1];
            engine.driveUnit(() => {
                unit.flag = true;
                console.log('action finished', unit);
                this.success();
            });
        }
        this.running();
    }
}));
BehaviorTree.register('fire', new BehaviorTree.Task({
    title: 'fire',
    run: function (unit) {
        console.log('fire');
        unit.flag = true;
        this.success();
    }
}));
BehaviorTree.register('move', new BehaviorTree.Task({
    title: 'move',
    run: function (unit) {
        console.log('move');
        this.success();
    }
}));
BehaviorTree.register('idle', new BehaviorTree.Task({
    title: 'idle',
    run: function (unit) {
        console.log('move');
        this.success();
    }
}));
class Engine {
    constructor() {
        //pending - selected - unitMove - penddingFire - unitFire - over - pending
        this.state = 'pending';
        this.mode = 0;
        this.ennemies = [];
        this.units = [];
        this.current;
        this.target;
        this.targetIndex;
        this.btree = new BehaviorTree({
            title: 'enemy action',
            tree: new BehaviorTree.Priority({
                nodes: [
                    'move-fire', 'fire', 'move', 'idle'
                ]
            })
        });
    }
    driveUnit(callback) {
        this.current.isMoving = true;
        var moveTimeLine = new TimelineLite();
        var routes = findPath(game.map, this.current.index, this.targetIndex);
        var routeArray = tweenPath(routes);
        moveTimeLine.add(TweenLite.to(this.current.tubeControl.rotation,.5,{y:0}));
        routeArray.forEach(route => {
            var vars = {};
            var routeDirection;
            if (route.x) {
                vars.x = "+=" + route.x
                routeDirection = new THREE.Vector3(route.x, 0, 0).normalize();
            } else if (route.z) {
                vars.z = "+=" + route.z
                routeDirection = new THREE.Vector3(0, 0, route.z).normalize();
            }
            var angle = this.current.direction.angleTo(routeDirection);
            var dirProject = this.current.direction.clone().cross(routeDirection);
            this.current.direction = routeDirection;
            this.current.tubeDirection = routeDirection;
            if (dirProject.y > 0) {
                moveTimeLine.add(TweenLite.to(this.current.mesh.rotation, .1, {
                    y: "+=" + angle
                }));
            } else {
                moveTimeLine.add(TweenLite.to(this.current.mesh.rotation, .1, {
                    y: "-=" + angle
                }));
            }
            moveTimeLine.add(TweenLite.to(this.current.mesh.position, .5, vars));
        });
        moveTimeLine.call(() => {
            this.current.isMoving = false;
            this.current.index = this.targetIndex;
            this.state = 'pendingFire';
            if (callback) {
                callback();
            }
        });
    }

    attack(){
        this.current.isFiring = true;
        var moveTimeLine = new TimelineLite();
        var currentPostion = this.current.mesh.getWorldPosition(new THREE.Vector3(0,0,0));
        var targetPostion = this.target.mesh.getWorldPosition(new THREE.Vector3(0,0,0));
        var dir = targetPostion.sub(currentPostion).normalize();
        var angle = this.current.tubeDirection.angleTo(dir);
        var dirProject = this.current.tubeDirection.clone().cross(dir);
        angle = (dirProject.y > 0 ? angle: -angle);
        moveTimeLine.add(TweenLite.to(this.current.tubeControl.rotation,.5,{y:angle}));
        moveTimeLine.call(() => {this.current.isFiring = false});
    }

    selectedUnit(pos) {
        var select;
        this.units.forEach(item => {
            if (item.index[0] == pos[0] && item.index[1] == pos[1]) {
                select = item;
                this.current = select;
                return;
            }
        });
        return select;
    }

    selectedEnnemy(pos){
        var select;
        this.ennemies.forEach(item => {
            if (item.index[0] == pos[0] && item.index[1] == pos[1]) {
                select = item;
                this.target = select;
                return;
            }
        });
        return select;
    }

    controlSide() {
        for (var i = 0; i < this.units.length; i++) {
            if (!this.units[i].flag) {
                return true;
            }
        }
        return false;
    }

    update() {
        if (!this.controlSide()) {
            var ennemy;
            for (var i = 0; i < this.ennemies.length; i++) {
                if (!this.ennemies[i].flag) {
                    ennemy = this.ennemies[i];
                    this.current = ennemy;
                    this.btree.setObject(ennemy);
                    break;
                }
            }
            if(!ennemy){
                game.round +=1;
                this.units.map(i => i.flag = false);
                this.ennemies.map(i => i.flag = false);
                this.current = null;
                console.log("round = " + game.round);
                this.state = "pending";
            }else {
                this.btree.step();
            }

        } else {
            switch (this.state) {
                case "pending":
                    resetGround();
                    break;
                case "selected":
                    var result = calMoveRange(game.map, this.current.index, this.current.moveRadius);
                    if (!result || result.length == 1) {
                        this.state = "pendingFire";
                        return;
                    }
                    renderGround(result, 2);
                    this.state = "pendingMove";
                    break;
                case "unitMove":
                    this.driveUnit();
                    this.state = "moving";
                    break;
                case "pendingFire":
                    resetGround();
                    var fireRange = calFireRange(this.current.index, this.current.fireRadius);
                    if (fireRange) {
                        renderGround(fireRange, 3);
                    }
                    break;
                case "unitFire":
                    // this.current.shoot();
                    this.attack();
                    resetGround();
                    this.state = "pending";
                    this.current.flag = true;
                    break;
            }
        }
    }
}

function resetGround() {
    var battleMapMesh = scene.getObjectByName('ground');
    battleMapMesh.geometry.groupsNeedUpdate = true;
    battleMapMesh.geometry.faces.forEach(face => {
        face.materialIndex = 0;
    });
}

function renderGround(range, matIndex = 0) {
    var battleMapMesh = scene.getObjectByName('ground');
    battleMapMesh.geometry.groupsNeedUpdate = true;
    range.forEach(rindex => {
        var faceIndex = toFaceIndex(rindex);
        battleMapMesh.geometry.faces[faceIndex].materialIndex = matIndex;
        battleMapMesh.geometry.faces[faceIndex + 1].materialIndex = matIndex;
    });

}

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
    camera.position.z = 100;
    camera.position.y = 100;
    camera.lookAt(new THREE.Vector3(-50, 0, 0));
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.gammaInput = true;
    container = document.body;
    container.appendChild(renderer.domElement);
    var controls = new THREE.OrbitControls(camera);
    scene.add(new THREE.GridHelper(100));
    scene.add(new THREE.AxesHelper(100));
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
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .5)
    ambientLight = new THREE.AmbientLight(0xdc8874, .5);
    shadowLight = new THREE.DirectionalLight(0xffffff, .9);
    shadowLight.position.set(0, 50, -50);
    shadowLight.castShadow = true;
    shadowLight.shadow.camera.left = -game.stageWidth / 2;
    shadowLight.shadow.camera.right = game.stageWidth / 2;
    shadowLight.shadow.camera.top = game.stageHeight / 2;
    shadowLight.shadow.camera.bottom = -game.stageHeight / 2;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 200;
    shadowLight.shadow.mapSize.width = 1024;
    shadowLight.shadow.mapSize.height = 1024;
    var ch = new THREE.CameraHelper(shadowLight.shadow.camera);
    scene.add(ch);
    scene.add(hemisphereLight);
    scene.add(shadowLight);
    scene.add(ambientLight);
}

class Cannon {
    constructor() {
        this.params = {
            horizontalAngle: 0.0,
            shellVelocity: 300,
            verticalAngle: 0
        };
        this.direction = new THREE.Vector3(-1, 0, 0);
        this.fireRadius = 3;
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
        this.mesh.scale.set(.5, .5, .5);
    }

    shoot(target) {
        this.mesh.updateMatrixWorld();
        var tubeTopMesh = this.mesh.getObjectByName('tubeTopMesh');
        const tubePos = tubeTopMesh.getWorldPosition(new THREE.Vector3(0, 0, 0));
        for (var i = 0; i < 20; i++) {
            var f = getParticle();
            f.mesh.position.copy(tubePos);
            f.mesh.translateOnAxis(this.direction, 1);
            f.color = {
                r: 255 / 255,
                g: 205 / 255,
                b: 74 / 255
            };
            f.mesh.material.color.setRGB(f.color.r, f.color.g, f.color.b);
            f.mesh.material.opacity = 1;
            this.mesh.parent.add(f.mesh);
            var delay = 0.1;
            f.fire(2.5, 1, delay);
        }
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

class Unit {
    constructor (){
        this.mesh = new THREE.Object3D();
        this.mesh.castShadow = true;
    }

    get tubeControl (){
        return this.mesh.getObjectByName('tubeControl');
    }
}

class Tank extends Unit{
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

    shape(){
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
        sprite.position.set(0, 8, 0);
        sprite.scale.set(30, 30, 30);
        this.mesh.add(sprite);
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

    // shoot(target) {

    // }
}

function getParticle() {
    if (particlesPool.length) {
        return particlesPool.pop();
    } else {
        return new Particle();
    }
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

function createGroud(w, h) {
    var groundGemo = new THREE.PlaneGeometry(w, h, w / 10, h / 10);
    var mats = [brownMat, blackMat, greenMat, redMat];
    groundGemo.applyMatrix(new THREE.Matrix4().makeRotationY(-Math.PI / 2));
    groundGemo.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
    // groundGemo.faces[20].materialIndex = 2;
    // groundGemo.faces[21].materialIndex = 2;
    var groudMesh = new THREE.Mesh(groundGemo, mats);
    groudMesh.name = 'ground';
    groudMesh.receiveShadow = true;
    var groundBaseGemo = new THREE.BoxGeometry(w, 10, h);
    var groundBaseMesh = new THREE.Mesh(groundBaseGemo, blackMat);
    groundBaseMesh.position.y -= 5.2
    scene.add(groudMesh, groundBaseMesh);
}


function init(event) {
    document.body.appendChild(stats.dom)
    var loader = new THREE.FileLoader();
    var placeUnit = function (unitArr, engineContainer) {
        unitArr.forEach(unit => {
            var entity;
            switch (unit.type) {
                case "tank":
                    entity = new Tank();
                    break;
                case "cannon":
                    entity = new Cannon();
                    break;
            }
            entity.index = unit.index;
            entity.mesh.position.copy(toPosition(unit.index));
            scene.add(entity.mesh);
            engineContainer.push(entity);
            game.map[unit.index[0]][unit.index[1]] = 1;
        });
    };
    loader.load(
        // resource URL
        'stage/stage_1.json',
        // onLoad callback
        function (data) {
            engine = new Engine();
            var stageData = JSON.parse(data);
            game.stageWidth = stageData.width;
            game.stageHeight = stageData.height;
            game.map = [
                []
            ];
            for (var x = 0; x < game.segmentsLength; x++) {
                game.map[x] = [];
                for (var y = 0; y < game.segmentsLength; y++) {
                    game.map[x][y] = 0;
                }
            }
            createScene();
            createGroud(game.stageWidth, game.stageHeight);
            createLights();
            placeUnit(stageData.user, engine.units);
            placeUnit(stageData.ennemies, engine.ennemies);
            loop();
        },
        // onProgress callback
        function (xhr) {
            //console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
        },
        function (err) {
            console.error('An error happened');
        }
    );
    // var stageData = JSON.parse(data);
    // var gui = new dat.GUI();
    // gui.add(cannon.params, "horizontalAngle", -Math.PI / 2, 0.0);
    // gui.add(cannon.params, "shellVelocity", 100, 500);
    // gui.add(cannon.params, "verticalAngle", -Math.PI / 2, Math.PI / 2);
    // gui.open();
    // createPlane();
    // createSea();
    // createSky();
    // createCoins();
    // createEnnemies();
    // createParticles();

    document.addEventListener('mousemove', handleMouseMove, false);
    // document.addEventListener('touchmove', handleTouchMove, false);
    document.addEventListener('mouseup', handleMouseUp, false);
    // document.addEventListener('touchend', handleTouchEnd, false);

}

function handleMouseUp() {
    if (!scene) return;
    var groundMesh = scene.getObjectByName('ground');
    var intersects = raycaster.intersectObject(groundMesh, true);
    if (intersects.length > 0) {
        var res = intersects.filter(function (res) {
            return res && res.object && res.object.name == 'ground';
        })[0];
        var findex1 = res.faceIndex;
        var findex2 = findex1 % 2 == 0 ? (findex1 + 1) : findex1 - 1;
        var index = toIndex(findex1 > findex2 ? findex2 : findex1);
        if (engine.state == 'pending') {
            var selectUnit = engine.selectedUnit(index);
            if(selectUnit){
                engine.state = 'selected';
            }
        // } else if (groundMesh.geometry.faces[res.faceIndex].materialIndex == 2) { //selected state
        } else if(engine.state == 'pendingMove' && groundMesh.geometry.faces[res.faceIndex].materialIndex == 2) {
            engine.targetIndex = index;
            engine.state = 'unitMove';
        // } else if (groundMesh.geometry.faces[res.faceIndex].materialIndex == 3) { //
        } else if(engine.state == 'pendingFire' && groundMesh.geometry.faces[res.faceIndex].materialIndex == 3) {
            var target = engine.selectedEnnemy(index);
            if(target){
                engine.target = target;
                engine.targetIndex = index;
                engine.state = 'unitFire';
            }
        } else {
            engine.state = 'pending';
        }
    }
}

function handleMouseMove(event) {
    event.preventDefault();
    var x = event.layerX;
    var y = event.layerY;
    x = (x / window.innerWidth) * 2 - 1;
    y = -(y / window.innerHeight) * 2 + 1;
    mouseVector.set(x, y, 0.5);
    raycaster.setFromCamera(mouseVector, camera);
    if (scene) {
        var groundMesh = scene.getObjectByName('ground');
        var intersects = raycaster.intersectObject(groundMesh, true);
        if (intersects.length > 0) {
            var res = intersects.filter(function (res) {
                return res && res.object && res.object.name == 'ground';
            })[0];
            groundMesh.geometry.groupsNeedUpdate = true;
            groundMesh.geometry.faces.forEach(face => {
                if (face.materialIndex < 2) {
                    face.materialIndex = 0;
                }
            });
            var findex1 = res.faceIndex;
            var findex2 = findex1 % 2 == 0 ? (findex1 + 1) : findex1 - 1;
            if (groundMesh.geometry.faces[res.faceIndex].materialIndex < 2) {
                groundMesh.geometry.faces[findex1].materialIndex = 1;
                groundMesh.geometry.faces[findex2].materialIndex = 1;
            } else {

            }
        }
    }
}

function loop() {
    engine.update();
    stats.update();
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
}

window.addEventListener('load', init, false);