class Tank {
    constructor() {
        this.mesh = new THREE.Object3D();
        this.init();
    }

    init() {
        this.createBody();
    }

    createBody() {
        var bodyShape = new THREE.Shape();
        bodyShape.moveTo(5, 0);
        bodyShape.lineTo(3, -2);
        bodyShape.lineTo(-3, -2);
        bodyShape.lineTo(-5, -1);
        bodyShape.lineTo(-4, 2);
        bodyShape.lineTo(3, 3);
        bodyShape.lineTo(5, 0);
        var extrudeSettings = {
            steps: 2,
            depth: 1,
            bevelEnabled: false
            // bevelThickness: 1,
            // bevelSize: 1,
            // bevelSegments: 1
        };
        var bodyGeom = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
        var bodyMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        var bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
        this.mesh.add(bodyMesh);
    }
}