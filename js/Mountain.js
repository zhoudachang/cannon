class Mountain {
    constructor() {
        this.mesh = new THREE.Object3D();
        this.blockWidth = 100;
        this.shape();
    }

    shape() {
        var baseGemo = new THREE.BoxGeometry(100, 10,100);
        var baseMesh = new THREE.Mesh(baseGemo, blackMat);
        this.mesh.add(baseMesh);
        var layerShape = new THREE.Shape();
        var startx = -50;
        var starty = -50;
        layerShape.moveTo(startx, starty);
        layerShape.lineTo(-50, 50);
        layerShape.lineTo(-40, 50);
        layerShape.lineTo(-35, 40);
        layerShape.lineTo(-15, 40);
        layerShape.lineTo(-10, 50);
        layerShape.lineTo(10, 50);
        layerShape.lineTo(15, 40);
        layerShape.lineTo(35, 40);
        layerShape.lineTo(40, 50);
        layerShape.lineTo(50, 50);
        layerShape.lineTo(50, -50);
        layerShape.lineTo(startx, starty);
        var material = new THREE.MeshPhongMaterial({
            color:Colors.yellow,
            flatShading: THREE.FlatShading,
        });
        var extrudeSettings = {
            amount: 5,
            steps: 2,
            depth: 1,
            bevelEnabled: false
        };
        var layerGeom = new THREE.ExtrudeGeometry(layerShape, extrudeSettings);
        layerGeom.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
        var layer = new THREE.Mesh(layerGeom, material);
        layer.position.y += 10;
        this.mesh.add(layer);
        for(var i=0;i<5;i++){
            var layerclone = layer.clone();
            layerclone.scale.z = 0.9 - i*0.1;
            layerclone.position.y += 5*(i+1);
            this.mesh.add(layerclone);
        }
        this.mesh.position.set(0,-5.2,-100);
    }
}