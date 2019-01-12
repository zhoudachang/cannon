var Colors = {
    red: 0xf25346,
    white: 0xd8d0d1,
    lightgreen: 0x629265,
    brown: 0x59332e,
    green: 0x458248,

}
var lightGreenMat = new THREE.MeshLambertMaterial({
    color: Colors.lightgreen,
    flatShading: THREE.FlatShading,
    side: THREE.DoubleSide
});
var transparentMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0

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

function createScene() {
    scene = new THREE.Scene();
    nearPlane = 1;
    farPlane = 10000;
    camera = new THREE.PerspectiveCamera(
        32,
        WIDTH / HEIGHT,
        nearPlane,
        farPlane
    );
    // var fogcol = 0xcefaeb; //0x1c0403;
    // scene.fog = new THREE.FogExp2( fogcol, 0.005);
    scene.fog = new THREE.Fog(0xf7d9aa, 50, 600);
    // var envMap = new THREE.CubeTextureLoader()
    // 				.setPath( 'images/')
    // 				.load( [ 'px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg' ] );
    // scene.background = envMap;
    camera.position.x = 280;
    camera.position.y = 150;
    camera.lookAt(new THREE.Vector3(-50, 0, 0));
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.gammaInput = true;
    renderer.autoClear = false;
    container = document.body;
    container.appendChild(renderer.domElement);
    // var controls = new THREE.OrbitControls(camera);
    // scene.add(new THREE.GridHelper(100));
    scene.add(new THREE.AxesHelper(100));

    hudCamera = new THREE.OrthographicCamera(-WIDTH / 2, WIDTH / 2, HEIGHT / 2, -HEIGHT / 2, 1, 10);
    hudCamera.position.z = 10;
    hudScene = new THREE.Scene();
    hudScene.add(engine.hudSprites.mesh);
    window.addEventListener('resize', handleWindowResize, false);
}

function handleWindowResize() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
    if(hudCamera){
        hudCamera.left = -WIDTH / 2;
        hudCamera.right = WIDTH / 2;
        hudCamera.top = HEIGHT / 2;
        hudCamera.bottom = -HEIGHT / 2;
        hudCamera.updateProjectionMatrix();
    }
}

function createLights() {
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .8);
    hemisphereLight.color.setHSL(0.6, 1, 0.6);
    hemisphereLight.groundColor.setHSL(0.095, 1, 0.75);
    ambientLight = new THREE.AmbientLight(0xdc8874, .8);
    shadowLight = new THREE.DirectionalLight(0xffffff, 1);
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
    // var ch = new THREE.CameraHelper(shadowLight.shadow.camera);
    // scene.add(ch);
    // scene.add(hemisphereLight);
    scene.add(shadowLight);
    scene.add(ambientLight);
}

function createSky() {
    scene.background = new THREE.Color().setHSL(0.6, 0, 1);
    var vertexShader = document.getElementById('vertexShader').textContent;
    var fragmentShader = document.getElementById('fragmentShader').textContent;
    var uniforms = {
        topColor: {
            value: new THREE.Color(0x0077ff)
        },
        bottomColor: {
            value: new THREE.Color(0xffffff)
        },
        offset: {
            value: 33
        },
        exponent: {
            value: 0.6
        }
    };
    uniforms.topColor.value.copy(hemisphereLight.color);
    scene.fog.color.copy(uniforms.bottomColor.value);
    var skyGeo = new THREE.SphereBufferGeometry(300, 32, 15);
    var skyMat = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: uniforms,
        side: THREE.BackSide
    });
    var sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);
}

function createGroud(blockw, blockh) {
    var mats = [lightGreenMat, blackMat, greenMat, redMat];//transparentMat
    var groundGemo = new THREE.PlaneGeometry(blockw, blockh , blockw / 10, blockh / 10);
    groundGemo.applyMatrix(new THREE.Matrix4().makeRotationY(-Math.PI / 2));
    groundGemo.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
    var groudMesh = new THREE.Mesh(groundGemo, mats);
    groudMesh.name = 'ground';
    groudMesh.receiveShadow = true;
    var groundBaseGemo = new THREE.BoxGeometry(blockw, 10, blockh);
    var groundBaseMesh = new THREE.Mesh(groundBaseGemo, blackMat);
    // groundBaseMesh.position.x -= blockh/2
    groundBaseMesh.position.y -= 5.2
    var groundBlock = new THREE.Object3D();
    groundBlock.add(groudMesh, groundBaseMesh);
    // var groundBlockClone = groundBlock.clone();
    // groundBlockClone.position.x -= blockh;
    // var groundBlockClone2 = groundBlockClone.clone();
    // groundBlockClone2.position.x -= blockh;
    scene.add(groundBlock);

    //
    var groundGeo = new THREE.PlaneBufferGeometry(1000, 1000);
    var groundMat = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        specular: 0x050505
    });
    groundMat.color.setHSL(0.095, 1, 0.75);
    var ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    scene.add(ground);

}

var stuff;

function init(event) {
    document.body.appendChild(stats.dom)
    // var loader = new THREE.FileLoader();
    engine = new Engine();
    stuff = new Stuff();
    var entity = new Tank();
    entity.index = [0,0];
    entity.mesh.position.copy(toPosition(entity.index));
    engine.units.push(entity);
    createScene();
    scene.add(entity.mesh);
    createLights();
    createSky();
    createGroud(100,100);
    loop();
    // scene.add(stuff.mesh);
    // createHUD();
    // var placeUnit = function (unitArr, engineContainer) {
    //     unitArr.forEach(unit => {
    //         var entity;
    //         switch (unit.type) {
    //             case "tank":
    //                 entity = new Tank();
    //                 break;
    //             case "cannon":
    //                 entity = new Cannon();
    //                 break;
    //             case "tree":
    //                 entity = stuff.tree;
    //                 break;
    //             case "stone":
    //                 entity = stuff.stone;
    //                 break;
    //             case "explosives":
    //                 entity = stuff.explosives;
    //                 break;
    //         }

    //         game.map[unit.index[0]][unit.index[1]] = 1;
    //         if (engineContainer) {
    //             engineContainer.push(entity);
    //             entity.index = unit.index;
    //             entity.mesh.position.copy(toPosition(unit.index));
    //             scene.add(entity.mesh);
    //         } else {
    //             entity.position.copy(toPosition(unit.index));
    //             scene.add(entity);
    //         }
    //     });
    // };
    // loader.load(
    //     // resource URL
    //     'stage/stage_1.json',
    //     // onLoad callback
    //     function (data) {
    //         engine = new Engine();
    //         var stageData = JSON.parse(data);
    //         game.stageWidth = stageData.width;
    //         game.stageHeight = stageData.height;
    //         game.map = [];
    //         for (var x = 0; x < game.segmentsLength; x++) {
    //             game.map[x] = [];
    //             for (var y = 0; y < game.segmentsLength; y++) {
    //                 game.map[x][y] = 0;
    //             }
    //         }
    //         createScene();
    //         scene.add(stuff.mesh);
    //         createGroud(game.stageWidth, game.stageHeight);
    //         createLights();
    //         createSky();
    //         placeUnit(stageData.user, engine.units);
    //         placeUnit(stageData.ennemies, engine.ennemies);
    //         placeUnit(stageData.stuff);
    //         createHUD();
    //         hudScene.add(engine.hudSprites.mesh);
    //         // var staff = new Stuff();
    //         // var stone = staff.stone;
    //         // stone.position.set(15,0,5);
    //         // scene.add(stone);
    //         // var tree = staff.tree;
    //         // tree.position.set(15,0,15);
    //         // scene.add(tree);
    //         loop();
    //     },
    //     // onProgress callback
    //     function (xhr) {
    //         //console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
    //     },
    //     function (err) {
    //         console.error('An error happened');
    //     }
    // );
    document.addEventListener('mousemove', handleMouseMove, false);
    document.addEventListener('mouseup', handleMouseUp, false);

}

function handleMouseMove(event) {
    event.preventDefault();
    var x = event.layerX;
    var y = event.layerY;
    x = (x / window.innerWidth) * 2 - 1;
    y = -(y / window.innerHeight) * 2 + 1;
    mouseVector.set(x, y, 0.5);
    raycaster.setFromCamera(mouseVector, camera);
}

function handleMouseUp() {
    event.preventDefault();
    var groundMesh = scene.getObjectByName('ground');
    if(!groundMesh || !scene) {
        return;
    }
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