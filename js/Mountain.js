class Mountain {
    constructor() {
        this.mesh = new THREE.Object3D();
        this.blockWidth = 100;
    }

    get one() {
        var baseRadius = 40;
        var points = [];
        var pointCount = 10;
        var layerShape = new THREE.Shape();
        var startx = -50;
        var starty = -50;
        layerShape.moveTo(startx,starty);
        // for(var i = 0; i < pointCount; i++){
            // var x = baseRadius + Math.random()*10;
            layerShape.lineTo(-50,50);
            layerShape.bezierCurveTo(-45,30,-5,-30,0,50);
            layerShape.bezierCurveTo(5,30,45,30,50,50);
        // }
        layerShape.lineTo(50, - 50);
        layerShape.lineTo(startx,starty);
        var geometry = new THREE.ShapeBufferGeometry( layerShape );
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
        var material = new THREE.MeshBasicMaterial( { color: 0x00ff00,side:THREE.BackSide } );
        var layer = new THREE.Mesh( geometry, material ) ;
        return layer;
        // for (var i = 0; i < pointCount; i++) {
        //     var nr = baseRadius + Math.random()*10;
        //     // var v = new THREE.Vector3(nr*Math.sin(i*2*Math.PI/pointCount), 0, nr*Math.cos(i*2*Math.PI/pointCount));
        //     var v = new THREE.Vector3(50 - i*10,0,nr);
        //     points.push(v);
        //     if(i == 9){
        //         points.push(new THREE.Vector3(- 50,0,nr));
        //     }
        // }
        // points.push(new THREE.Vector3(points[points.length - 1].x,0, -50));
        // points.push(new THREE.Vector3(-points[points.length - 1].x ,0, -50));
        // console.log(points.length);
        // var curve = new THREE.CatmullRomCurve3(points,true);
        // var curvePoints = curve.getPoints(points.length);
        // var geometry = new THREE.BufferGeometry().setFromPoints( curvePoints );//curvePoints
        // var material = new THREE.MeshPhongMaterial( { color : 0xff0000 } );
        // var curveObject = new THREE.Mesh( geometry, material );
        // return curveObject;
    }
}