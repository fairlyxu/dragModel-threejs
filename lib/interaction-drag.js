// Constructor
InteractionApp = function() {
    Sim.App.call(this);
}

// Subclass Sim.App
InteractionApp.prototype = new Sim.App();

// Our custom initializer
InteractionApp.prototype.init = function(param) {
    // Call superclass init code to set up scene, renderer, default camera
    Sim.App.prototype.init.call(this, param);

    // Create a directional light to show off the model
    var light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 0, 1).normalize();
    this.scene.add(light);

    this.camera.position.set(0, 0, 6);



    this.lastX = 0;
    this.lastY = 0;
    this.mouseDown = false;


    // Create our model
    var geometry = new THREE.SphereGeometry(1, 32, 32);
    var material = new THREE.MeshPhongMaterial({
        color: 0x0000ff,
        wireframe: false
    });
    var mesh = new THREE.Mesh(geometry, material);

    // Create the model and add it to our sim

    var meshes = creatObjects();
    var model = new Model();
    model.init(meshes);
    this.addObject(model);

    // Add the dragger now, couldn't do that until we have a scene
    model.createDragger();

    this.model = model;
    // alert(this.clickedObject + " aaaaaaaaaaaa ");
    //this.scene.add(creatObjects());


}


InteractionApp.prototype.handleMouseDown = function(x, y) {
    console.info("按下鼠标");
    this.lastX = x;
    this.lastY = y;
    this.mouseDown = true;
    var selectObj = this.objectFromMouse().object;
    console.info("ssssssssssssss " + selectObj);
    if (null != selectObj)
        console.info("fine  Obj y=" + y + "       x=" + x)
}

InteractionApp.prototype.handleMouseUp = function(x, y) {
    this.lastX = x;
    this.lastY = y;
    this.mouseDown = false;
}

InteractionApp.prototype.handleMouseMove = function(x, y) {
    if (this.mouseDown) {
        var dx = x - this.lastX;
        if (Math.abs(dx) > InteractionApp.MOUSE_MOVE_TOLERANCE) {
            this.root.rotation.y += (dx * 0.01);
        }
        this.lastX = x;

        return;

        var dy = y - this.lastY;
        if (Math.abs(dy) > InteractionApp.MOUSE_MOVE_TOLERANCE) {
            this.root.rotation.x += (dy * 0.01);

            // Clamp to some outer boundary values
            if (this.root.rotation.x < 0)
                this.root.rotation.x = 0;

            if (this.root.rotation.x > InteractionApp.MAX_ROTATION_X)
                this.root.rotation.x = InteractionApp.MAX_ROTATION_X;

        }
        this.lastY = y;

    }
}


InteractionApp.prototype.handleMouseScroll = function(delta) {
    var dx = delta;

    this.camera.position.z -= dx;

    // Clamp to some boundary values
    if (this.camera.position.z < InteractionApp.MIN_CAMERA_Z)
        this.camera.position.z = InteractionApp.MIN_CAMERA_Z;
    if (this.camera.position.z > InteractionApp.MAX_CAMERA_Z)
        this.camera.position.z = InteractionApp.MAX_CAMERA_Z;
}

InteractionApp.prototype.update = function() {
    TWEEN.update();
    Sim.App.prototype.update.call(this);
}

InteractionApp.prototype.setAnimateDrag = function(animateDrag) {
    this.model.animateDrag = animateDrag;
}

InteractionApp.MOUSE_MOVE_TOLERANCE = 4;
InteractionApp.MAX_ROTATION_X = Math.PI / 2;
InteractionApp.MIN_CAMERA_Z = 4;
InteractionApp.MAX_CAMERA_Z = 12;


// Custom model class
Model = function() {
    Sim.Object.call(this);
}

Model.prototype = new Sim.Object();

Model.prototype.init = function(mesh) {
    /*var group = new THREE.Object3D;

    // Create our model
    var geometry = new THREE.SphereGeometry(1, 32, 32);
    var material = new THREE.MeshPhongMaterial({
        color: 0x0000ff,
        wireframe: false
    });
    var mesh = new THREE.Mesh(geometry, material);


    group.add(mesh);

    this.setObject3D(group);
    this.mesh = mesh;
*/
    // Tell the framework about our object
    this.setObject3D(mesh);
    this.mesh = mesh;

    this.animateDrag = false;
}

Model.prototype.createDragger = function() {
    if (null == selectMesh) {

        alert(11111111);
        return;
    }

    console.info(" 选中物体..........");
    this.init(selectMesh);
    this.dragger = new Sim.PlaneDragger();
    this.dragger.init(this);
    this.dragger.subscribe("drag", this, this.handleDrag)
}

Model.prototype.handleMouseOver = function(x, y) {
    this.mesh.material.ambient.setRGB(.2, .2, .2);
}

Model.prototype.handleMouseOut = function(x, y) {
    this.mesh.material.ambient.setRGB(0, 0, 0);
}

Model.prototype.handleMouseDown = function(x, y, position, normal) {
    console.info("鼠标按下选中物体");
    this.lastx = x;
    this.lasty = y;

    this.dragger.beginDrag(x, y);
    this.lastDragPoint = new THREE.Vector3();
    this.dragDelta = new THREE.Vector3();


}

Model.prototype.handleMouseUp = function(x, y, position, normal) {
    console.info("鼠标松开选中物体");
    this.dragger.endDrag(x, y);

    if (this.animateDrag) {
        var newpos = this.dragDelta.clone();

        newpos.x *= Math.log(Math.abs(this.deltax * Math.E * 10));
        newpos.y *= Math.log(Math.abs(this.deltay * Math.E * 10));

        newpos.addSelf(this.object3D.position);

        new TWEEN.Tween(this.object3D.position)
            .to({
                x: newpos.x,
                y: newpos.y,
                z: newpos.z
            }, 1000)
            .easing(TWEEN.Easing.Quadratic.EaseOut).start();
    }

    this.lastx = x;
    this.lasty = y;

    this.lastDragPoint = null;
    this.dragDelta = null;
}

Model.prototype.handleMouseMove = function(x, y) {
    this.deltax = x - this.lastx;
    this.deltay = y - this.lasty;

    this.dragger.drag(x, y);
}

Model.prototype.handleDrag = function(dragPoint) {
    this.object3D.position.copy(dragPoint);

    this.dragDelta.copy(dragPoint).subSelf(this.lastDragPoint);
    this.lastDragPoint.copy(dragPoint);
}
//创建物体
function creatObjects() {
    var meshGroup = new THREE.Object3D;
    var mapUrl = "../res/crate.jpg";
    var map = THREE.ImageUtils.loadTexture(mapUrl);
    // create a cube
    var cubeGeometry = new THREE.CubeGeometry(1, 1, 1);
    var cubeMaterial = new THREE.MeshPhongMaterial({
        map: map
    });
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);


    // position the cube
    cube.position.x = -3;
    cube.position.y = 0;
    cube.position.z = 0;

    var sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
    var sphereMaterial = new THREE.MeshPhongMaterial({
        map: map
    });
    var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    // position the sphere
    sphere.position.x = 0;
    sphere.position.y = 0;
    sphere.position.z = 0;
    // add the sphere to the scene


    var cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1);
    var cylinderMaterial = new THREE.MeshPhongMaterial({
        map: map
    });
    var cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.position.set(3, 0, 0);

    meshGroup.add(cylinder);
    meshGroup.add(cube);
    meshGroup.add(sphere);

    return meshGroup;
}