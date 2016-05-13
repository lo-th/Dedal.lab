DDLS.Heroe = function(s, world) {
    s = s || {};
    
    this.world = world;

    this.path = [];
    this.tmppath = [];

    this.target = new DDLS.Point();
    this.move = false;
    this.newPath = false;

    this.mesh = null;
    this.isSelected = false;
    this.isWalking = false;



    this.entity = new DDLS.EntityAI( s.x || 0, s.y || 0, s.r || 4 );

    this.fov = new DDLS.FieldOfView( this.entity, this.world );

    this.pathSampler = new DDLS.LinearPathSampler();
    this.pathSampler.entity = this.entity;
    this.pathSampler.path = this.path;
    this.pathSampler.samplingDistance = s.speed || 10;

};

DDLS.Heroe.prototype = {
    setTarget:function(x, y){

        this.target.set( x, y );
        this.world.pathFinder.entity = this.entity;
        this.world.pathFinder.findPath( this.target, this.path );
        this.testPath();

    },
    testPath:function(){
        if(this.path.length > 0){
            this.tmppath = [];
            var i = this.path.length;
            while(i--) this.tmppath[i] = this.path[i];
            //this.tmppath = this.path;
            this.newPath = true;
        }
    },
    getPos:function(){
        return { x:this.entity.position.x, y:this.entity.position.y, r:-this.entity.angle };
    },
    update:function(){
        /*if(this.mesh !== null){ 
            this.mesh.position.set( this.entity.position.x, 0, this.entity.position.y );
            this.mesh.rotation.y = -this.entity.angle;
        }*/
        if(this.newPath){
            //console.log(this.path);
            //this.newPath = false;
            this.pathSampler.reset();
        }
      
        if( this.pathSampler.hasNext ){

            this.newPath = false;
            this.move = true;
            this.pathSampler.next();

        } else {
            this.move = false;
        }

        if(this.move && !this.isWalking) this.isWalking = true;
        if(!this.move && this.isWalking) this.isWalking = false;



    }
};