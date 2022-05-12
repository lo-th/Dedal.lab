
var canvas, camera, scene, renderer, light, controls, clock, mouse, raycaster, offset, select = null, down = false, first = false;
var world, ddlsRender;
var geobox = null;
var matbox = null;
var matboxSelect = null;
var h1;
var objects = [], plane;
var obj = [];
var mousePos = null;

var heroModel = null;

var hero = [];
var heroObj = [];

var INTERSECTED, SELECTED, HERO;
var HEROID = -1;

init();
animate();

function init() {

    DDLS.Debug.callback = gui.log;

    canvas = document.getElementById( 'canvas' );

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set(300, 300, 300+600);

    controls = new THREE.OrbitControls( camera, canvas );
    controls.target.set(300,0,300);
    controls.update();

    scene = new THREE.Scene();

    clock = new THREE.Clock();

    mouse = new THREE.Vector2();
    raycaster = new THREE.Raycaster();
    offset = new THREE.Vector3();
    mousePos = new THREE.Vector3();

    var baseBox = new THREE.BoxGeometry( 1, 1, 1 );
    baseBox.applyMatrix(new THREE.Matrix4().makeTranslation(0,0.5,0));

    var geometry = new THREE.BoxGeometry( 10, 10, 10 );
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,5,0));
    var material = new THREE.MeshBasicMaterial( { color:0x00FF00 } );

    plane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1000, 1000, 8, 8 ), new THREE.ShaderMaterial( THREE.ShaderShadow ) );
    plane.geometry.applyMatrix( new THREE.Matrix4().makeRotationX( -Math.PI*0.5 ) );
    plane.geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 300, 0, 300 ) );
    plane.castShadow = false;
    plane.receiveShadow = true;
    
    scene.add( plane );

    //light = new THREE.SpotLight( 0xffffff, 1, 1000, Math.PI/4, 0.75 );
    light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set(150,600,150);
    light.target.position.set( 300,0,300 );
    light.target.updateMatrixWorld();
    scene.add( light );
	light.castShadow = true;
	light.shadow.bias = 0.0001;
	light.shadow.mapSize.width = 1024;
	light.shadow.mapSize.height = 1024;

	console.log(light.shadow)

    var d = 600;
    light.shadow.camera = new THREE.OrthographicCamera( d, -d, d, -d,  400, 800 );

    /*var h = new THREE.DirectionalLightHelper(light);
    scene.add(h);
    var h2 = new THREE.CameraHelper(light.shadow.camera);
    scene.add(h2);*/


    scene.add( new THREE.AmbientLight( 0xAAAAAA ) );

    renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true, alpha:true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x000000 , 0.0);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.soft = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.renderReverseSided = false;

    //

    canvas.onmousedown = mouseDown;
    canvas.onmouseup = mouseUp;
    canvas.onmousemove = mouseMove;

    window.addEventListener( 'resize', onWindowResize, false );

    gui.init();

    // load assets

    pool.load(['assets/basic.sea'], loadComplete );

}

function loadComplete( p ){

    var meshs = pool.meshByName ( 'basic' );

    heroModel = meshs.hero;
    geobox = meshs.box.geometry;
    matbox = meshs.box.material;
    matboxSelect = matbox.clone();
    matboxSelect.color.setHex( 0xff0000 );
    matboxSelect.transparent = true;
    matboxSelect.opacity = 0.5;

    demo();

}

function demo(){

    world = new DDLS.World(600,600);

    var i = 50, x, y, w, h, r, d, m;
    while(i--) {
        x = DDLS.randInt(50, 600);
        y = DDLS.randInt(50, 600);
        w = DDLS.randInt(10, 40);
        h = DDLS.randInt(10, 40);
        r = DDLS.rand(0, DDLS.TwoPI);
        d = (w*h*0.025)+DDLS.rand(1, 4);

        obj[i] = world.addObject({ x:x, y:y, w:w, h:h, r:r });
        m = new THREE.Mesh( geobox, matbox );

        m.scale.set(w*2,d, h*2);
        m.position.set(x,0,y);
        m.rotation.y = r;

        m.castShadow = true;
        m.receiveShadow = true;

        scene.add( m );

        objects[i] = m;

    }

    ddlsRender = new DDLS.ThreeView( scene, world, THREE );

    var i = 29;
    while(i--){
         addHero(20 + (i*20) ,20, 4, DDLS.rand(0, DDLS.TwoPI));
    }


    setTimeout( function(){
        let i = 29;
        while(i--){
             hero[i].setTarget( DDLS.randInt(10, 590), DDLS.randInt(10, 590) );
        }
    }, 3000 )

    

   
    //h1 = world.addHeroe({x:20, y:20, r:4, speed:10});
}

function addHero(x, y, r, a){

    var id = hero.length;

    //var geo = new THREE.BoxGeometry( r*2, 10, r*2 );
    var geo = new THREE.SphereGeometry( r*2 );
    geo.applyMatrix(new THREE.Matrix4().makeTranslation(0,r*2,0));
    var mat = new THREE.MeshBasicMaterial( { color:0x00FF00 , visible:false } );
    var mat2 = new THREE.MeshBasicMaterial( { color:0x00FF00, wireframe:true, visible:true} );

    var cont = new THREE.Mesh(new THREE.CircleGeometry(r), mat2);
    cont.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI*0.5));

    //var m = clone( heroModel, heroModel.material.clone() );

    var m = heroModel.clone();

    m.material = heroModel.material.clone();
    m.scale.set(25,25,25);
    m.position.y = 7;
    //m.rotation.y = - Math.PI * 0.5;
    m.play("idle", .5);

    hero[id] = world.addHeroe({ x:x, y:y, r:r, speed:0.2, turn:2, angle:a });
    heroObj[id] = new THREE.Mesh( geo, mat );

    hero[id].mesh = heroObj[id];

    var p = hero[id].getPos();
    hero[id].mesh.position.set( p.x, 0, p.y );
    hero[id].mesh.rotation.order = 'YXZ'
    hero[id].mesh.rotation.y = p.r;

    heroObj[id].add(cont);
    heroObj[id].add(m)
    scene.add(heroObj[id]);

}



function findTargetHero(id){
    //console.log( id, mousePos.x, mousePos.z )
    hero[id].setTarget( mousePos.x, mousePos.z );
    //console.log(mousePos.x)
};

function selectHero(id){
    if( HEROID !== -1 ) unSelectHero( HEROID );
    //if( HERO ) unSelectHero( heroObj.indexOf(HERO) );

    HERO = heroObj[id];
    HEROID = id;
    //hero[id].mesh.material = new THREE.MeshBasicMaterial( { color:0xFFFF00, visible:false } );
    hero[id].mesh.children[0].material.color.setHex(0xFFFF00);
    hero[id].mesh.children[1].material.color.setHex(0xFFFF00);
    hero[id].isSelected = true;
};

function unSelectHero(id){

    HEROID = -1;

    HERO = null;
    //hero[id].mesh.material = new THREE.MeshBasicMaterial( { color:0x00FF00 } );
    hero[id].mesh.children[0].material.color.setHex(0x00FF00);
    hero[id].mesh.children[1].material.color.setHex(0xFFFFFF);
    hero[id].isSelected = false;
};

function updateWorldMesh( id ){

    obj[id].position( objects[id].position.x, objects[id].position.z );
    obj[id].rotation = objects[id].rotation.y;

    world.updateMesh();
    //world.update();

};


function mouseUp(e){
    down = false;
    e.preventDefault();
    controls.enabled = true;
    if ( INTERSECTED ) SELECTED = null;
    canvas.style.cursor = 'auto';
}

function mouseDown(e){

    down = true;
    first = true;

    //if( hero[0].move ) return;

    updateRaycast();

    if ( SELECTED != null ) return

        //console.log('mmmm')

    var inter;
    raycaster.setFromCamera( mouse, camera );

    inter = raycaster.intersectObjects( heroObj );
    if ( inter.length > 0 ) {
        if(down){ 
            selectHero( heroObj.indexOf(inter[ 0 ].object) );
        }
    } /*else {
        if(HERO!=null && down){
            unSelectHero(heroObj.indexOf(HERO));
        }
    }*/

    inter = raycaster.intersectObject( plane );
    if ( inter.length > 0 ) {
        var p = inter[ 0 ].point;
        mousePos.copy(p).round();
        /*mousePos.x = mousePos.x < 10 ? 10 : mousePos.x;
        mousePos.x = mousePos.x > 590 ? 590 : mousePos.x;

        mousePos.z = mousePos.z < 10 ? 10 : mousePos.z;
        mousePos.z = mousePos.z > 590 ? 590 : mousePos.z;*/

       // console.log(mousePos)
       // if()
        //if( HERO!==null && down ) findTargetHero( heroObj.indexOf(HERO) );
        if( HEROID !== -1 ) findTargetHero( HEROID );
    }

    e.preventDefault();
}

function mouseMove(e){

    mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
    updateRaycast();

}

function updateRaycast(){

    var inter;
    raycaster.setFromCamera( mouse, camera );

    //if( HERO && HERO.move ) return;
    
    inter = raycaster.intersectObjects( objects );
    if ( inter.length > 0 ) {
        if ( INTERSECTED != inter[ 0 ].object ) {
            if ( INTERSECTED ) INTERSECTED.material = matbox;
            INTERSECTED = inter[ 0 ].object;
            INTERSECTED.material = matboxSelect;
        }
        canvas.style.cursor = 'pointer';
    } else {
        if ( INTERSECTED )  INTERSECTED.material = matbox;
        INTERSECTED = null;
        SELECTED = null;
        canvas.style.cursor = 'auto';
    }

    if(first && INTERSECTED){
        controls.enabled = false;
        SELECTED = INTERSECTED;
        canvas.style.cursor = 'move';
    }

    if ( SELECTED ) {

         if( HEROID !== -1 ) unSelectHero( HEROID );
        //if(HERO) unSelectHero( heroObj.indexOf(HERO) );
        inter = raycaster.intersectObject( plane );
        if ( inter.length > 0 ) {
            var p = inter[ 0 ].point;
            mousePos.copy(p);
            if(first){
                offset.x = SELECTED.position.x-p.x;
                offset.z = SELECTED.position.z-p.z;
            }
            SELECTED.position.copy( p.add( offset ) );
            updateWorldMesh( objects.indexOf( SELECTED ) );
        }
    }

    //if( SELECTED && HERO ) 

    if(first) first = false;
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    requestAnimationFrame( animate );

    var delta = clock.getDelta();
    THREE.SEA3D.AnimationHandler.update( delta*0.6 );

    var i = hero.length, p;
    while(i--){
        if( hero[i].isWalking ) { 
            hero[i].mesh.children[1].play("walk", 0.1);
            p = hero[i].getPos();
            hero[i].mesh.position.set( p.x, 0, p.y );
            hero[i].mesh.rotation.y = p.r;
        } else {
            hero[i].mesh.children[1].play("idle", 0.1);
        }
    }

    //controls.update();
    if( ddlsRender ) ddlsRender.update();

    renderer.render( scene, camera );

    gui.update();

}
