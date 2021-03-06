class River {
    constructor() {
        this.mesh = new THREE.Object3D();
        this.init();
    }

    init() {
        var geom = new THREE.BoxGeometry(100, 9, 100,10,1,10);
        geom.mergeVertices();
        var l = geom.vertices.length;
        this.waves = [];
        for (var i = 0; i < l; i++) {
            var v = geom.vertices[i];
            if(v.y > 0){
                this.waves.push({
                    y: v.y,
                    x: v.x,
                    z: v.z,
                    ang: Math.random() * Math.PI * 2,
                    amp: 1,
                    speed: 0.016 + Math.random() * 0.032
                });
            }
        };
        var mat = new THREE.MeshPhongMaterial({
            color:0x68c3c0,
            specular: 0x68c3c0,
            transparent: true,
            opacity: .8,
            flatShading: THREE.FlatShading,
        });
        var riverMesh = new THREE.Mesh(geom, mat);
        riverMesh.receiveShadow = true;
        riverMesh.position.set(0,-6,100);
        riverMesh.name = 'river';
        this.mesh.add(riverMesh);
    }

    update() {
        var riverMesh = this.mesh.getObjectByName('river');
        var verts = riverMesh.geometry.vertices;
        var l = verts.length;
        var waveIndex = 0;
        for (var i = 0; i < l; i++) {
            var v = verts[i];
            if(v.y > 0){
                var vprops = this.waves[waveIndex];
                // v.x = vprops.x + Math.cos(vprops.ang) * vprops.amp;
                v.y = vprops.y + Math.sin(vprops.ang) * vprops.amp;
                vprops.ang += vprops.speed;
                waveIndex ++;
            }
        }
        riverMesh.geometry.verticesNeedUpdate = true;
    }
}