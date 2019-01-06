var Colors = {
    red:0xf25346,
    white:0xd8d0d1,
    lightgreen:0x629265,
    brown:0x59332e,
    green:0x458248,
    
}
var lightGreenMat = new THREE.MeshLambertMaterial({
    color: Colors.lightgreen,
    flatShading: THREE.FlatShading,
    side: THREE.DoubleSide
});
var whiteMat = new THREE.MeshLambertMaterial({
    color: Colors.white,
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
    color: Colors.green,
    flatShading: THREE.FlatShading,
    side: THREE.DoubleSide
});
var redMat = new THREE.MeshLambertMaterial({
    flatShading: THREE.FlatShading,
    color: Colors.red
});

var particlesPool = [];
var particlesInUse = [];
var game = {
    round: 1,
    stageWidth: 100,
    stageHeight: 100,
    segmentsLength: 10,
    shellHitDistance: 20
};
var stats = new Stats();
var raycaster = new THREE.Raycaster();
var mouseVector = new THREE.Vector3();

var scene, camera, renderer, controls;
var hudScene, hudCamera;

var engine, cannon, tank;
var ambientLight, hemisphereLight, shadowLight;
var HEIGHT, WIDTH, mousePos = {
    x: 0,
    y: 0
};

HEIGHT = window.innerHeight;
WIDTH = window.innerWidth;

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

function createHUD() {
    hudCamera = new THREE.OrthographicCamera(-WIDTH / 2, WIDTH / 2, HEIGHT / 2, -HEIGHT / 2, 1, 10);
    hudCamera.position.z = 10;
    hudScene = new THREE.Scene();
}

function createScene() {
    scene = new THREE.Scene();
    nearPlane = 1;
    farPlane = 10000;
    camera = new THREE.PerspectiveCamera(
        50,
        WIDTH / HEIGHT,
        nearPlane,
        farPlane
    );
    var fogcol = 0xcefaeb;//0x1c0403
    scene.fog = new THREE.FogExp2( fogcol, 0.0028 );
    // scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
    camera.position.x =  150;
    camera.position.z = 0;
    camera.position.y = 100;
    camera.lookAt(new THREE.Vector3(-50, 0, 0));
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor(0x73b2ce);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.gammaInput = true;
    renderer.autoClear = false;

    container = document.body;
    container.appendChild(renderer.domElement);
    var controls = new THREE.OrbitControls(camera);
    scene.add(new THREE.GridHelper(100));
    // scene.add(new THREE.AxesHelper(100));
    window.addEventListener('resize', handleWindowResize, false);
}

function handleWindowResize() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
    hudCamera.left = - WIDTH / 2;
    hudCamera.right = WIDTH / 2;
    hudCamera.top = HEIGHT / 2;
    hudCamera.bottom = - HEIGHT / 2;
    hudCamera.updateProjectionMatrix();
}

function createLights() {
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .8)
    ambientLight = new THREE.AmbientLight(0xdc8874, .8);
    shadowLight = new THREE.DirectionalLight(0xffffff, 1);
    shadowLight.position.set(0, 50, -50);
    shadowLight.castShadow = true;
    // shadowLight.shadowDarkness = .5;
    shadowLight.shadow.camera.left = -game.stageWidth / 2;
    shadowLight.shadow.camera.right = game.stageWidth / 2;
    shadowLight.shadow.camera.top = game.stageHeight / 2;
    shadowLight.shadow.camera.bottom = -game.stageHeight / 2;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 200;
    shadowLight.shadow.mapSize.width = 1024;
    shadowLight.shadow.mapSize.height = 1024;
    // var ch = new THREE.CameraHelper(shadowLight.shadow.camera);
    // scene.add(ch);
    // scene.add(hemisphereLight);
    scene.add(shadowLight);
    scene.add(ambientLight);
}

function createSky(){

}


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
    move() { }

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
    var mats = [lightGreenMat, blackMat, greenMat, redMat];
    groundGemo.applyMatrix(new THREE.Matrix4().makeRotationY(-Math.PI / 2));
    groundGemo.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
    var groudMesh = new THREE.Mesh(groundGemo, mats);
    groudMesh.name = 'ground';
    groudMesh.receiveShadow = true;
    var groundBaseGemo = new THREE.BoxGeometry(w, 10, h);
    var groundBaseMesh = new THREE.Mesh(groundBaseGemo, blackMat);
    groundBaseMesh.position.y -= 5.2
    scene.add(groudMesh, groundBaseMesh);
}

var stuff;
function init(event) {
    document.body.appendChild(stats.dom)
    var loader = new THREE.FileLoader();
    stuff = new Stuff();
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
                case "tree":
                    entity = stuff.tree;
                    break;
                case "stone":
                    entity = stuff.stone;
                    break;
                case "explosives":
                    entity = stuff.explosives;
                    break;
            }

            game.map[unit.index[0]][unit.index[1]] = 1;
            if(engineContainer){
                engineContainer.push(entity);
                entity.index = unit.index;
                entity.mesh.position.copy(toPosition(unit.index));
                scene.add(entity.mesh);
            } else {
                entity.position.copy(toPosition(unit.index));
                scene.add(entity);
            }
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
            game.map = [];
            for (var x = 0; x < game.segmentsLength; x++) {
                game.map[x] = [];
                for (var y = 0; y < game.segmentsLength; y++) {
                    game.map[x][y] = 0;
                }
            }
            createScene();
            scene.add(stuff.mesh);
            createGroud(game.stageWidth, game.stageHeight);
            createLights();
            placeUnit(stageData.user, engine.units);
            placeUnit(stageData.ennemies, engine.ennemies);
            placeUnit(stageData.stuff);
            // scene.add(stuff.flower);
            createHUD();
            hudScene.add(engine.hudSprites.mesh);
            // var staff = new Stuff();
            // var stone = staff.stone;
            // stone.position.set(15,0,5);
            // scene.add(stone);
            // var tree = staff.tree;
            // tree.position.set(15,0,15);
            // scene.add(tree);
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
            if (selectUnit && !selectUnit.flag) {
                engine.state = 'selected';
            }
            // } else if (groundMesh.geometry.faces[res.faceIndex].materialIndex == 2) { //selected state
        } else if (engine.state == 'pendingMove' && groundMesh.geometry.faces[res.faceIndex].materialIndex == 2) {
            engine.targetIndex = index;
            engine.state = 'unitMove';
            // } else if (groundMesh.geometry.faces[res.faceIndex].materialIndex == 3) { //
        } else if (engine.state == 'pendingFire' && groundMesh.geometry.faces[res.faceIndex].materialIndex == 3) {
            engine.targetIndex = index;
            var target = engine.selectedEnnemy(index);
            if (target) {
                engine.target = target;
            }
            engine.state = 'unitFire';
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
    stuff.update();
    renderer.clear();
    renderer.render(scene, camera);
    renderer.clearDepth();
    renderer.render(hudScene, hudCamera);
    requestAnimationFrame(loop);
}

window.addEventListener('load', init, false);