class MenuScene {
    constructor(){
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(WIDTH / -2, WIDTH / 2, HEIGHT / 2, HEIGHT / -2, -10, 10);
        this.scene.add(this.camera);
        this.loadResource();
        this.selectedObject;
        this.crossed = false;
    }
    
    loadResource(){
        let playBtnTextures = [];
        var tloader = new THREE.TextureLoader();
        this.scene.background = tloader.load('/images/px.jpg');
        tloader.load('/images/button_play.png', (texture) => {
            var material = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                opacity: 0.8
            });
            playBtnTextures[0] = texture;
            var palyBtnSprite = new THREE.Sprite(material);
            palyBtnSprite.name = 'playBtn';
            palyBtnSprite.scale.set(128, 50, 1);
            // palyBtnSprite.scale.set(material.map.image.width, material.map.image.height, 1);
            palyBtnSprite.position.y -= 50;
            this.scene.add(palyBtnSprite);
        });
        tloader.load('/images/button_play_down.png', (texture) => {
            playBtnTextures[1] = texture;
        });
        var mouseVector = new THREE.Vector3();
        var raycaster = new THREE.Raycaster();
        var getIntersects = (x, y) => {
            x = (x / window.innerWidth) * 2 - 1;
            y = - (y / window.innerHeight) * 2 + 1;
            mouseVector.set(x, y, 0.5);
            raycaster.setFromCamera(mouseVector, this.camera);
            return raycaster.intersectObject(this.scene, true);
        }
        var onDocumentMouseMove = (event) => {
            event.preventDefault();
            var intersects = getIntersects(event.layerX, event.layerY);
            if (intersects.length > 0 && intersects[0].object.name === 'playBtn') {
                var res = intersects.filter(function (res) {
                    return res && res.object;
                })[0];
                if (res && res.object) {
                    this.selectedObject = res.object;
                    this.selectedObject.scale.set(150, 60, 1);
                }
            } else {
                if (this.selectedObject) {
                    this.selectedObject.scale.set(128, 50, 1);
                    this.selectedObject.material.map = playBtnTextures[0];
                }
                this.selectedObject = null;
            }
        };
        var onDocumentMouseDown = (event) => {
            if (this.selectedObject) {
                this.selectedObject.material.map = playBtnTextures[1];
            }
        };
        var onDocumentMouseUp = (event) => {
            if(this.selectedObject){
                this.crossed = true ;
            }
        };

        document.addEventListener("mousemove", onDocumentMouseMove, false);
        document.addEventListener("mouseup", onDocumentMouseUp, false);
        document.addEventListener("mousedown", onDocumentMouseDown, false);
    }

}