class Stuff {

    constructor() {
        this.objects = [];
        this.objectPool = [];
        this.clouds = [];
        this.mesh = new THREE.Object3D();
        this.createClouds(1);
        this.objects.push(this.explosives);
        this.objects.push(this.tree);
        this.objects.push(this.stone);
    }

    refreshStuff(engine) {
        for (var i = 0; i < game.stageHeight / game.segmentsLength; i++) {
            if (Math.random() * 5 < 4 && i % 2 == 1) {
                let idx = Math.floor(Math.random()*this.objects.length)
                let obj = this.objects[idx];
                let objClone = obj.clone();
                let y = Math.floor(Math.random()*9);
                objClone.position.copy(toPosition([i,y]));
                engine.stuff.push(objClone);
                game.map[i][y] = 1;
            }
        }
        var entity = new Tank();
        entity.index = [0, 0];
        entity.mesh.position.copy(toPosition(entity.index));
        engine.units.push(entity);
    }

    get explosives() {
        var mesh = new THREE.Object3D();
        var mat = new THREE.MeshPhongMaterial({
            color: Colors.red,
            flatShading: THREE.FlatShading
        });
        var bottomGeom = new THREE.CylinderGeometry(2, 2, 5);
        var bootomMesh = new THREE.Mesh(bottomGeom, mat);
        bootomMesh.castShadow = true;
        bootomMesh.position.y += 2.5;

        // var middleGeom = new THREE.CylinderGeometry(4,4,3);
        // var middleMesh = new THREE.Mesh(middleGeom,mat);
        // middleMesh.position.y += 3+1.5;
        var geometry = new THREE.TorusGeometry(2, .2, 8, 8);
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
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
        var matTreeLeaves = new THREE.MeshPhongMaterial({
            color: Colors.green,
            flatShading: THREE.FlatShading
        });
        var geonTreeBase = new THREE.CylinderGeometry(1, 1, 5);
        var matTreeBase = new THREE.MeshBasicMaterial({
            color: Colors.brown
        });
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

    createClouds(count) {
        for (var i = 0; i < count; i++) {
            var cloudmesh = this.createCloundOne();
            cloudmesh.position.z += 70;
            cloudmesh.position.y += 50;
            cloudmesh.position.x -= 0;
            this.clouds.push(cloudmesh);
        }
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
        mesh.scale.set(.25, .25, .25);
        return mesh;
    }

    update() {
        this.clouds.forEach(cloud => {
            cloud.position.z -= 0.1;
            if (cloud.position.z > 50) {}
        });
    }
}