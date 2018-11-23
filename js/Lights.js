class Lights {
    constructor() {
        this.lights = new THREE.Object3D();
        this.init();
    }

    init() {
        this.lights.add(new THREE.HemisphereLight(0xaaaaaa, 0xb3858c, .8));
        let shadowLight = new THREE.DirectionalLight(0xffffff, .9);
        shadowLight.position.set(0, 350, 350);
        shadowLight.castShadow = true;
        // define the visible area of the projected shadow
        shadowLight.shadow.camera.left = -650;
        shadowLight.shadow.camera.right = 650;
        shadowLight.shadow.camera.top = 650;
        shadowLight.shadow.camera.bottom = -650;
        shadowLight.shadow.camera.near = 1;
        shadowLight.shadow.camera.far = 1000;
        // Shadow map size
        shadowLight.shadow.mapSize.width = 2048;
        shadowLight.shadow.mapSize.height = 2048;
        this.lights.add(shadowLight);
    }
}