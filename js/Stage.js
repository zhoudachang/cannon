class Stage {
    constructor() {
        this.mesh = new THREE.Object3D();
        this.brownMat = new THREE.MeshLambertMaterial({
            color: 0xFFA500,
            flatShading: THREE.FlatShading,
            // wireframe:true
        });
        this.init();
    }
    init() {
        this.createGroud();
    }
    createGroud() {
        let groudGemo = new THREE.PlaneGeometry(1000, 1000, 10, 10);
        groudGemo.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        groudGemo.vertices.forEach(function (value, index) {
            if (Math.abs(value.x) > 100 && Math.abs(value.z) > 100) {
                value.y -= Math.random() * 50;
            }
        })
        var groudMesh = new THREE.Mesh(groudGemo, this.brownMat);
        groudMesh.castShadow = false;
        groudMesh.receiveShadow = true;
        this.mesh.add(groudMesh);
    }

}