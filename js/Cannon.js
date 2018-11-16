class Cannon {
    constructor() {
        this.tubeTopPosition;
        this.baseRadiusTop = 10;
        this.baseRadiusBottom = 10;
        this.baseHeight = 4;
        this.tubeSegments = 10;
        this.mesh = new THREE.Object3D();
        this.shells = [];
        this.clock = new THREE.Clock();
        this.whiteMat = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            flatShading: THREE.FlatShading
        });
        this.blackMat = new THREE.MeshPhongMaterial({
            color: 0x000000,
            flatShading: THREE.FlatShading
        });
        this.yellowMat = new THREE.MeshLambertMaterial({
            color: 0xfdd276,
            flatShading: THREE.FlatShading
        });
        // this.shell;
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
        tubeAxleMesh.position.copy(hatMesh.position.clone());
        let tubeGemo = new THREE.CylinderGeometry(2, 1, 10, this.tubeSegments);
        tubeGemo.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
        let tubeMesh = new THREE.Mesh(tubeGemo);
        tubeMesh.position.set(-10, 0, 0);
        tubeAxleMesh.add(tubeMesh);
        let tubeGemo2 = new THREE.CylinderGeometry(0.8, 0.8, 20, this.tubeSegments);
        tubeGemo2.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
        let tubeMesh2 = new THREE.Mesh(tubeGemo2);
        tubeMesh2.position.set(-10, 0, 0);
        let tubeTopGemo = new THREE.CylinderGeometry(1, 1, 2, this.tubeSegments);
        tubeTopGemo.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
        let tubeTopMesh = new THREE.Mesh(tubeTopGemo, this.blackMat);
        tubeTopMesh.position.x = -20;
        this.tubeTopPosition = tubeTopMesh.getWorldPosition(new THREE.Vector3());
        tubeAxleMesh.add(tubeMesh2, tubeTopMesh);
        // this.shell = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32),this.yellowMat);
        // this.shell.position.copy(tubeTopMesh.position.clone());
        // this.shell.visiable = false;
        // tubeAxleMesh.add(shell);
        // scene.add(shell);
        this.mesh.add(tubeAxleMesh);
    }

    shoot() {
        let shell = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), this.yellowMat);
        shell.position.copy(this.tubeTopPosition.clone());
        this.mesh.parent.add(shell);
        this.shells.push(shell);
    }

    update() {
        // console.log(this.clock.getDelta());
        for(let i=0;i<this.shells.length;i++){
            this.shells[i].position.y -= 0.01;
        }
    }
}