class Stuff {

    constructor() {
        this.objectPool = [];
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
        // mesh.position.set(5,0,-45);
        return mesh;
    }

    get stone() {
        var mesh = new THREE.Object3D();
        var geom = new THREE.DodecahedronGeometry(5, 0);
        var mat = new THREE.MeshPhongMaterial({
            color: Colors.brown,
        });
        var stone = new THREE.Mesh(geom,mat);
        stone.position.y += 2;
        stone.castShadow = true;
        mesh.add(stone);
        var smallOne = stone.clone();
        smallOne.castShadow = true;
        smallOne.scale.set(.5,.5,.5);
        smallOne.position.set(3,0,3);
        mesh.add(smallOne);
        return mesh;
    }
}