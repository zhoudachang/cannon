const Colors = {
    red: 0xf25346,
    white: 0xd8d0d1,
    lightgreen: 0x629265,
    brown: 0x59332e,
    green: 0x458248,
    yellow: 0xfdd276
}
const game = {
    stageWidth: 100,
    stageHeight: 100,
    segmentsLength: 10,
    shellHitDistance: 20,
    map: []
};
const lightGreenMat = new THREE.MeshLambertMaterial({ color: Colors.lightgreen, flatShading: THREE.FlatShading, side: THREE.DoubleSide });
const transparentMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
const whiteMat = new THREE.MeshLambertMaterial({ color: Colors.white, flatShading: THREE.FlatShading });
const blackMat = new THREE.MeshPhongMaterial({ color: 0x403133, flatShading: THREE.FlatShading, side: THREE.DoubleSide });
const yellowMat = new THREE.MeshLambertMaterial({ color: 0xfdd276, flatShading: THREE.FlatShading });
const brownMat = new THREE.MeshLambertMaterial({ color: 0x9db3b5, side: THREE.DoubleSide });
const greenMat = new THREE.MeshLambertMaterial({ color: Colors.green, flatShading: THREE.FlatShading, side: THREE.DoubleSide });
const redMat = new THREE.MeshLambertMaterial({ flatShading: THREE.FlatShading, color: Colors.red });
const glassMat = new THREE.MeshLambertMaterial({ color: 0xd3d3d3, flatShading: THREE.FlatShading, transparent: true, opacity: 0.8 });

class GameScene {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(32, WIDTH / HEIGHT, 1, 1000);
        this.scene.fog = new THREE.Fog(0x000000, 100, 500);
        this.camera.position.x = 180;
        this.camera.position.y = 150;
        this.camera.position.z = 180;
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        // new THREE.OrbitControls(this.camera);
        this.hudScene = new THREE.Scene();
        this.hudCamera = new THREE.OrthographicCamera(- WIDTH / 2, WIDTH / 2, HEIGHT / 2, - HEIGHT / 2, 1, 10);
        this.hudCamera.position.z = 10;
        let handleWindowResize = (event) => {
            this.camera.aspect = WIDTH / HEIGHT;
            this.camera.updateProjectionMatrix();
            if (this.hudCamera) {
                this.hudCamera.left = -WIDTH / 2;
                this.hudCamera.right = WIDTH / 2;
                this.hudCamera.top = HEIGHT / 2;
                this.hudCamera.bottom = - HEIGHT / 2;
                this.hudCamera.updateProjectionMatrix();
            }
        }
        window.addEventListener('resize', handleWindowResize, false);
        this.river = new River();
        this.engine = new Engine();
        var cannon = new Cannon();
        cannon.mesh.position.set(50,0,0);
        this.scene.add(cannon.mesh);
        // this.hudScene.add(this.engine.hudSprites.mesh);
        let controlMesh = new Controller(cannon).mesh;
        // this.scene.add(controlMesh)
        this.hudScene.add(controlMesh);
        this.init();
    }

    init() {
        // var engine = new Engine();
        for (var x = 0; x < game.segmentsLength; x++) {
            game.map[x] = [];
            for (var y = 0; y < game.segmentsLength; y++) {
                game.map[x][y] = 0;
            }
        }
        //create light
        let hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .8);
        hemisphereLight.color.setHSL(0.6, 1, 0.6);
        hemisphereLight.groundColor.setHSL(0.095, 1, 0.75);
        (() => {
            // let ambientLight = new THREE.AmbientLight(0xdc8874, .8);
            let shadowLight = new THREE.DirectionalLight(0xffffff, 1);
            shadowLight.position.set(0, 50, -50);
            shadowLight.castShadow = true;
            shadowLight.shadow.camera.left = - game.stageWidth / 2;
            shadowLight.shadow.camera.right = game.stageWidth / 2;
            shadowLight.shadow.camera.top = game.stageHeight / 2;
            shadowLight.shadow.camera.bottom = - game.stageHeight / 2;
            shadowLight.shadow.camera.near = 1;
            shadowLight.shadow.camera.far = 200;
            shadowLight.shadow.mapSize.width = 1024;
            shadowLight.shadow.mapSize.height = 1024;
            this.scene.add(hemisphereLight);
            this.scene.add(shadowLight);
            // this.scene.add(ambientLight);
        })();
        //create sky
        (() => {
            this.scene.background = new THREE.Color().setHSL(0.6, 0, 1);
            let vertexShader = [
                "varying vec3 vWorldPosition;",
                "void main() {",
                "   vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
                "   vWorldPosition = worldPosition.xyz;",
                "   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
                "}"
            ].join("\n");
            let fragmentShader = [
                "uniform vec3 topColor;",
                "uniform vec3 bottomColor;",
                "uniform float offset;",
                "uniform float exponent;",
                "varying vec3 vWorldPosition;",
                "void main() {",
                "   float h = normalize( vWorldPosition + offset ).y;",
                "   gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );",
                "}"
            ].join("\n");
            let uniforms = {
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
            this.scene.fog.color.copy(uniforms.bottomColor.value);
            let skyGeo = new THREE.SphereBufferGeometry(300, 32, 15);
            let skyMat = new THREE.ShaderMaterial({
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                uniforms: uniforms,
                side: THREE.BackSide
            });
            let sky = new THREE.Mesh(skyGeo, skyMat);
            this.scene.add(sky);
        })();

        //create ground 
        (() => {
            let mats = [transparentMat, blackMat, greenMat, redMat];//lightGreenMat
            let groundGemo = new THREE.PlaneGeometry(game.stageWidth, game.stageHeight, game.stageWidth / 10, game.stageHeight / 10);
            groundGemo.applyMatrix(new THREE.Matrix4().makeRotationY(-Math.PI / 2));
            groundGemo.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
            let groudMesh = new THREE.Mesh(groundGemo, mats);
            groudMesh.name = 'ground';
            groudMesh.receiveShadow = true;
            let groundBaseGemo = new THREE.BoxGeometry(game.stageWidth, 10, game.stageHeight);
            let groundBaseMesh = new THREE.Mesh(groundBaseGemo, blackMat);
            groundBaseMesh.position.y -= 5.2
            let groundBlock = new THREE.Object3D();
            groundBlock.add(groudMesh, groundBaseMesh);
            this.scene.add(groundBlock);
            let groundGeo = new THREE.PlaneBufferGeometry(1000, 1000);
            let groundMat = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                specular: 0x050505
            });
            groundMat.color.setHSL(0.095, 1, 0.75);
            let ground = new THREE.Mesh(groundGeo, groundMat);
            ground.rotation.x = -Math.PI / 2;
            ground.position.y = -10;
            this.scene.add(ground);
            let mountain = new Mountain();
            this.scene.add(mountain.mesh);
        })();
        this.scene.add(this.river.mesh);
        this.scene.add(this.engine.mesh);
        this.engine.boot();
    }

    render(renderer) {
        this.river.update();
        this.engine.update();
        renderer.clear();
        renderer.render(this.scene, this.camera);
        renderer.clearDepth();
        renderer.render(this.hudScene, this.hudCamera);
    }
}