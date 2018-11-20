class Tank {
    constructor() {
        this.mesh = new THREE.Object3D();
        this.blackMat = new THREE.MeshPhongMaterial({
            color: 0x403133,
            flatShading: THREE.FlatShading
        });
        this.init();
    }

    init() {
        this.createBody();
        this.createHat();
        this.createWheels();
        this.createTube();
    }

    shoot(){

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
        let extrudeSettings = {
            amount: 5,
            steps: 2,
            depth: 1,
            bevelEnabled: false
        };
        let bodyGeom = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
        let bodyMat = new THREE.MeshBasicMaterial({
            color: 0x808000
        });
        let bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
        bodyMesh.scale.set(2, 2, 2);
        bodyMesh.position.y += 5;
        bodyMesh.position.z -= 5;
        this.mesh.add(bodyMesh);
    }
    createHat() {
        let hatGeom = new THREE.CylinderGeometry(5, 5, 5);
        let hatMesh = new THREE.Mesh(hatGeom);
        hatMesh.position.y += 11;
        let hatGeom2 = new THREE.CylinderGeometry(3, 3, 2);
        let hatMesh2 = new THREE.Mesh(hatGeom2);
        hatMesh2.position.y += 14;
        this.mesh.add(hatMesh, hatMesh2);
    }
    createWheels() {
        let frontWheelGeom = new THREE.CylinderGeometry(4, 4, 2,32);
        frontWheelGeom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        let frontWheelMesh = new THREE.Mesh(frontWheelGeom, this.blackMat);
        frontWheelMesh.position.set(6, 4, 5);
        let frontLeftWheelMesh = frontWheelMesh.clone();
        frontLeftWheelMesh.position.z -= 10;
        this.mesh.add(frontWheelMesh, frontLeftWheelMesh);

        let backWheelGeom = new THREE.CylinderGeometry(3, 3, 2,32);
        backWheelGeom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        let backWheelMesh = new THREE.Mesh(backWheelGeom, this.blackMat);
        backWheelMesh.position.set(-7, 3, 5);
        let backLeftWheelMesh = backWheelMesh.clone();
        backLeftWheelMesh.position.z -= 10;
        this.mesh.add(backWheelMesh, backLeftWheelMesh);
    }
    createTube() {
        let tubeAxleGemo = new THREE.CylinderGeometry(2, 2, 4);
        tubeAxleGemo.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        this.tubeAxleMesh = new THREE.Mesh(tubeAxleGemo);
        this.tubeAxleMesh.position.y += 11;
        this.tubeAxleMesh.position.x += 5;
        this.mesh.add(this.tubeAxleMesh);
        let tubeGemo = new THREE.CylinderGeometry(1,1,8);
        tubeGemo.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
        let tubeMesh = new THREE.Mesh(tubeGemo);
        tubeMesh.position.set(10,11,0);
        let tubeTopGemo = new THREE.CylinderGeometry(2,2,3);
        tubeTopGemo.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
        let tubeTopMesh = new THREE.Mesh(tubeTopGemo);
        tubeTopMesh.position.y += 11;
        tubeTopMesh.position.x += 14;
        this.mesh.add(tubeMesh,tubeTopMesh);
    }
}