class Cannon {
    constructor() {
        this.baseRadiusTop = 10;
        this.baseRadiusBottom = 10;
        this.baseHeight = 4;
        this.mesh = new THREE.Object3D();
        this.whiteMat = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            flatShading: THREE.FlatShading
        });
        this.blackMat = new THREE.MeshPhongMaterial({
            color: 0x000000,
            flatShading: THREE.FlatShading
        });
        this.init();
    }
    init() {
        this.createBase();
        this.createHat();
        this.createTube();
    }
    createHat() {
        let geometry = new THREE.SphereGeometry(this.baseRadiusTop * 0.8, 32, 32, 0, Math.PI);
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        let hatMesh = new THREE.Mesh(geometry, this.whiteMat);
        hatMesh.name = 'hatMesh';
        hatMesh.position.y += this.baseHeight;
        this.mesh.add(hatMesh);
    }
    createBase() {
        let geometry = new THREE.CylinderGeometry(this.baseRadiusTop, this.baseRadiusBottom, this.baseHeight, 20);
        let baseMesh = new THREE.Mesh(geometry, this.whiteMat);
        baseMesh.position.y += this.baseHeight / 2;
        this.mesh.add(baseMesh);
    }
    createTube() {
        let geometry = new THREE.CylinderGeometry(this.baseRadiusTop - 1, this.baseRadiusBottom - 1, this.baseHeight, 20);
        let tubeAxleMesh = new THREE.Mesh(geometry, this.blackMat);
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        let hatMesh = this.mesh.getObjectByName('hatMesh');
        console.log(hatMesh.position.clone());
        tubeAxleMesh.position.copy(hatMesh.position.clone());
        let tubeGemo = new THREE.CylinderGeometry(1,1,10,6);
        tubeGemo.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
        let tubeMesh = new THREE.Mesh(tubeGemo,this.blackMat);
        tubeMesh.position.x -= 10;
        tubeAxleMesh.add(tubeMesh);
        this.mesh.add(tubeAxleMesh);
    }
}