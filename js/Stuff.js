class Stuff {

    constructor() {
        this.objectPool = [];
        this.clouds = [];
        this.mesh = new THREE.Object3D();
        this.createClouds(1);
    }

    get explosives() {
        var mesh = new THREE.Object3D();
        var mat = new THREE.MeshPhongMaterial({ color: Colors.red, flatShading: THREE.FlatShading });
        var bottomGeom = new THREE.CylinderGeometry(2, 2, 5);
        var bootomMesh = new THREE.Mesh(bottomGeom, mat);
        bootomMesh.castShadow = true;
        bootomMesh.position.y += 2.5;

        // var middleGeom = new THREE.CylinderGeometry(4,4,3);
        // var middleMesh = new THREE.Mesh(middleGeom,mat);
        // middleMesh.position.y += 3+1.5;
        var geometry = new THREE.TorusGeometry(2, .2, 8, 8);
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(- Math.PI / 2));
        var torus = new THREE.Mesh(geometry, mat);
        torus.castShadow = true;
        // torus.position.y += 2;
        var torusClone = torus.clone();
        torusClone.position.y += 2.5;
        var torusClone2 = torus.clone();
        torusClone2.position.y += 5
        mesh.add(bootomMesh, torus, torusClone, torusClone2);
        return mesh;
    }

    get tree() {
        var mesh = new THREE.Object3D();
        var matTreeLeaves = new THREE.MeshPhongMaterial({ color: Colors.green, flatShading: THREE.FlatShading });
        var geonTreeBase = new THREE.CylinderGeometry(1, 1, 5);
        var matTreeBase = new THREE.MeshBasicMaterial({ color: Colors.brown });
        var treeBase = new THREE.Mesh(geonTreeBase, matTreeBase);
        treeBase.position.y += 2.5;
        treeBase.castShadow = true;
        mesh.add(treeBase);
        var geomTreeLeaves1 = new THREE.CylinderGeometry(1, 5, 5, 4);
        var treeLeaves1 = new THREE.Mesh(geomTreeLeaves1, matTreeLeaves);
        treeLeaves1.castShadow = true;
        treeLeaves1.receiveShadow = true;
        treeLeaves1.position.y = 5
        mesh.add(treeLeaves1);
        var geomTreeLeaves2 = new THREE.CylinderGeometry(1, 4, 4, 4);
        var treeLeaves2 = new THREE.Mesh(geomTreeLeaves2, matTreeLeaves);
        treeLeaves2.castShadow = true;
        treeLeaves2.position.y = 7;
        mesh.add(treeLeaves2);
        var geomTreeLeaves3 = new THREE.CylinderGeometry(1, 3, 3, 4);
        var treeLeaves3 = new THREE.Mesh(geomTreeLeaves3, matTreeLeaves);
        treeLeaves3.castShadow = true;
        treeLeaves3.position.y = 9;
        mesh.add(treeLeaves3);
        return mesh;
    }

    get stone() {
        var mesh = new THREE.Object3D();
        var geom = new THREE.DodecahedronGeometry(5, 0);
        var mat = new THREE.MeshPhongMaterial({
            color: Colors.brown,
        });
        var stone = new THREE.Mesh(geom, mat);
        stone.position.y += 2;
        stone.castShadow = true;
        mesh.add(stone);
        var smallOne = stone.clone();
        smallOne.castShadow = true;
        smallOne.scale.set(.5, .5, .5);
        smallOne.position.set(3, 0, 3);
        mesh.add(smallOne);
        return mesh;
    }

    // get flower() {
    //     var mesh = new THREE.Object3D();
    //     var geomStem = new THREE.BoxGeometry(5, 50, 5, 1, 1, 1);
    //     var matStem = new THREE.MeshPhongMaterial({ color: Colors.green, shading: THREE.FlatShading });
    //     var stem = new THREE.Mesh(geomStem, matStem);
    //     stem.castShadow = false;
    //     stem.receiveShadow = true;
    //     mesh.add(stem);
    //     var geomPetalCore = new THREE.BoxGeometry(10, 10, 10, 1, 1, 1);
    //     var matPetalCore = new THREE.MeshPhongMaterial({ color: Colors.yellow, shading: THREE.FlatShading });
    //     petalCore = new THREE.Mesh(geomPetalCore, matPetalCore);
    //     petalCore.castShadow = false;
    //     petalCore.receiveShadow = true;

    //     var petalColor = petalColors[Math.floor(Math.random() * 3)];

    //     var geomPetal = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1);
    //     var matPetal = new THREE.MeshBasicMaterial({ color: petalColor });
    //     geomPetal.vertices[5].y -= 4;
    //     geomPetal.vertices[4].y -= 4;
    //     geomPetal.vertices[7].y += 4;
    //     geomPetal.vertices[6].y += 4;
    //     geomPetal.translate(12.5, 0, 3);
    //     var petals = [];
    //     for (var i = 0; i < 4; i++) {

    //         petals[i] = new THREE.Mesh(geomPetal, matPetal);
    //         petals[i].rotation.z = i * Math.PI / 2;
    //         petals[i].castShadow = true;
    //         petals[i].receiveShadow = true;
    //     }

    //     petalCore.add(petals[0], petals[1], petals[2], petals[3]);
    //     petalCore.position.y = 25;
    //     petalCore.position.z = 3;
    //     mesh.add(petalCore);
    //     return mesh;
    // }

    createClouds(count) {
        for (var i = 0; i < count; i++) {
            var cloudmesh = this.createCloundOne();
            cloudmesh.position.z += 70;
            cloudmesh.position.y += 50;
            cloudmesh.position.x -= 50;
            this.clouds.push(cloudmesh);
        }
        // this.mesh.add(this.clouds);
        this.clouds.forEach(i => this.mesh.add(i));
    }

    createCloundOne() {
        var mesh = new THREE.Object3D();
        var geom = new THREE.DodecahedronGeometry(20, 0);
        var mat = new THREE.MeshPhongMaterial({
            color: Colors.white,
        });
        var nBlocs = 3 + Math.floor(Math.random() * 3);
        for (var i = 0; i < nBlocs; i++) {
            var m = new THREE.Mesh(geom, mat);
            m.position.z = i * 15;
            m.position.y = Math.random() * 10;
            m.position.x = Math.random() * 10;
            m.rotation.x = Math.random() * Math.PI * 2;
            m.rotation.y = Math.random() * Math.PI * 2;
            var s = .1 + Math.random() * .9;
            m.scale.set(s, s, s);
            mesh.add(m);
        }
        mesh.scale.set(.25,.25,.25);
        return mesh;
    }

    update() {
        this.clouds.forEach(cloud => {
            cloud.position.z -= 0.1;
            if (cloud.position.z > 50) {
            }
        });
    }
}