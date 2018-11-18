class Cannon {
    constructor() {
        this.params = {
            horizontalAngle: 0.0,
            shellVelocity: 100,
            verticalAngle: 0
        };
        this.tubeTopPosition;
        this.g = 10;
        this.horizontalAxle;
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
        this.init();
    }
    init() {
        this.createBase();
        this.createHat();
        this.createTube();
        var gui = new dat.GUI();
        gui.add(this.params, "horizontalAngle", -Math.PI / 2, 0.0);
        gui.add(this.params, "shellVelocity", 100, 500);
        gui.add(this.params, "verticalAngle", -Math.PI / 2, Math.PI / 2);
        gui.open();
    }

    createBase() {
        let geometry = new THREE.CylinderGeometry(this.baseRadiusTop, this.baseRadiusBottom, this.baseHeight, 20);
        let baseMesh = new THREE.Mesh(geometry, this.whiteMat);
        baseMesh.position.y += this.baseHeight / 2;
        this.mesh.add(baseMesh);
    }
    createHat() {
        let geometry = new THREE.SphereGeometry(this.baseRadiusTop * 0.8, 32, 32, 0, Math.PI);
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        let hatMesh = new THREE.Mesh(geometry, this.whiteMat);
        hatMesh.name = 'hatMesh';
        hatMesh.position.y += this.baseHeight;
        this.mesh.add(hatMesh);
    }
    createTube() {
        let geometry = new THREE.CylinderGeometry(this.baseRadiusTop - 1, this.baseRadiusBottom - 1, this.baseHeight, 20);
        this.horizontalAxle = new THREE.Mesh(geometry, this.blackMat);
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        let hatMesh = this.mesh.getObjectByName('hatMesh');
        this.horizontalAxle.position.copy(hatMesh.position.clone());
        let tubeGemo = new THREE.CylinderGeometry(2, 1, 10, this.tubeSegments);
        tubeGemo.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
        let tubeMesh = new THREE.Mesh(tubeGemo);
        tubeMesh.position.set(-10, 0, 0);
        this.horizontalAxle.add(tubeMesh);
        let tubeGemo2 = new THREE.CylinderGeometry(0.8, 0.8, 20, this.tubeSegments);
        tubeGemo2.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
        let tubeMesh2 = new THREE.Mesh(tubeGemo2);
        tubeMesh2.position.set(-10, 0, 0);
        let tubeTopGemo = new THREE.CylinderGeometry(1, 1, 2, this.tubeSegments);
        tubeTopGemo.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
        this.tubeTopMesh = new THREE.Mesh(tubeTopGemo, this.blackMat);
        this.tubeTopMesh.position.x = -20;
        this.horizontalAxle.add(tubeMesh2, this.tubeTopMesh);
        this.mesh.add(this.horizontalAxle);
    }

    shoot() {
        this.mesh.updateMatrixWorld();
        if (this.mesh.parent) {
            let shell = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), this.yellowMat);
            shell.position.copy(this.tubeTopMesh.getWorldPosition(new THREE.Vector3()));
            this.mesh.parent.add(shell);
            shell.yt = 0;
            shell.ha = this.params.horizontalAngle;
            shell.va = this.params.verticalAngle;
            this.shells.push(shell);
        }
    }

    update() {
        let t = this.clock.getDelta();
        this.horizontalAxle.rotation.z = this.params.horizontalAngle;
        this.mesh.rotation.y = this.params.verticalAngle;
        for (let i = 0; i < this.shells.length; i++) {
            let shellOne = this.shells[i];
            if (shellOne.position.y > 0) {
                shellOne.position.x -= Math.cos(shellOne.ha)
                    * Math.cos(shellOne.va) * this.params.shellVelocity * t;
                let yt = t + shellOne.yt;
                shellOne.yt += t;
                shellOne.position.y += Math.sin(Math.abs(shellOne.ha)) * this.params.shellVelocity * t - this.g * Math.pow(yt, 2) / 2;
                shellOne.position.z += Math.sin(shellOne.va) * this.params.shellVelocity * t;
            }
        }
    }


}