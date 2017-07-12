import { Point } from '../math/Point';
import { EntityAI } from '../ai/EntityAI';
import { FieldOfView } from '../ai/FieldOfView';
import { LinearPathSampler } from '../ai/LinearPathSampler';

function Heroe ( s, world ) {
    s = s || {};
    
    this.world = world;

    this.path = [];
    //this._path = [];
    this.tmppath = [];

    this.target = new Point();
    this.move = false;
    this.newPath = false;

    this.mesh = null;
    this.isSelected = false;
    this.isWalking = false;

    this.testSee = s.see || false;

    this.entity = new EntityAI( s.x || 0, s.y || 0, s.r || 4 );

    this.fov = new FieldOfView( this.entity, this.world );

    this.pathSampler = new LinearPathSampler();
    this.pathSampler.entity = this.entity;
    this.pathSampler.path = this.tmppath;
    this.pathSampler.samplingDistance = s.speed || 10;

};

Heroe.prototype = {
    
    setTarget:function(x, y){

        this.path = []
        this.target.set( x, y );
        this.world.pathFinder.entity = this.entity;
        //this.world.pathFinder.findPath( this.target, this.path );
        this.world.pathFinder.findPath( this.target, this.path );
        this.testPath();

    },
    testPath:function(){
        if( !this.path ) return;
        if( this.path.length > 0 ){
        //if( this.path.length > 0 ){
            this.pathSampler.reset();
            this.tmppath = [];
            var i = this.path.length;
            while(i--) this.tmppath[i] = this.path[i];
            this.pathSampler.path = this.tmppath;

            /*this.path = [];
            var i = this._path.length;
            while(i--) this.path[i] = this._path[i];
            //this.tmppath = this.path;*/
            this.newPath = true;
        }
    },
    getPos:function(){
        return { x:this.entity.position.x, y:this.entity.position.y, r:-this.entity.angle };
    },
    update:function(){

        var p;
        /*if(this.mesh !== null){ 
            this.mesh.position.set( this.entity.position.x, 0, this.entity.position.y );
            this.mesh.rotation.y = -this.entity.angle;
        }*/
        //if(this.newPath){
            //console.log(this.path);
            ////this.newPath = false;
            //this.pathSampler.reset();
            //this.pathSampler.path = this._path;
        //}
      
        if( this.pathSampler.hasNext ){

            this.newPath = false;
            this.move = true;
            this.pathSampler.next();

        } else {
            this.move = false;
            this.tmppath = [];
        }

        if(this.move && !this.isWalking) this.isWalking = true;
        if(!this.move && this.isWalking) this.isWalking = false;

        if( this.mesh !== null ){
            p = this.getPos();
            this.mesh.position.set( p.x, 0, p.y );
            this.mesh.rotation.y = p.r;
        }



    }
};

export { Heroe };