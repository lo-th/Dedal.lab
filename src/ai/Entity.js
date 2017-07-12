import { _Math } from '../math/Math';
import { Point } from '../math/Point';
import { FieldOfView } from '../ai/FieldOfView';
import { LinearPathSampler } from '../ai/LinearPathSampler';

function Entity ( s, world ) {

    this.isSee = false;
    this.isWalking = false;
    this.isSelected = false;
    this.isMove = false;

    this.world = world;

    s = s || {};

    
    this.position = new Point( s.x || 0, s.y || 0 );
    this.direction = new Point(1,0);
    this.radius = s.r || 10;
    //this.radiusSquared = 10*10;
    //this.x = this.y = 0;
    //this.dirNormX = 1;
    //this.dirNormY = 0;
    this.angle = 0;
    this.angleFOV = ( s.fov || 120 ) * _Math.torad;
    this.radiusFOV = s.distance || 200;
    this.testSee = s.see || false;


    this.path = [];
    this.tmppath = [];

    this.target = new Point();
    
    this.newPath = false;

    this.mesh = null;

    this.fov = new FieldOfView( this , this.world );

    this.pathSampler = new LinearPathSampler();
    this.pathSampler.entity = this;
    this.pathSampler.path = this.tmppath;
    this.pathSampler.samplingDistance = s.speed || 10;

    // compatibility issue
    this.entity = this;

};

Entity.prototype = {

    constructor: Entity,
    
    setTarget: function ( x, y ) {

        this.path = []
        this.target.set( x, y );
        this.world.pathFinder.entity = this;
        this.world.pathFinder.findPath( this.target, this.path );
        this.testPath();

    },

    testPath: function () {

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

    getPos: function () {

        return { x:this.position.x, y:this.position.y, r:-this.angle };

    },

    update: function () {

        var p;
      
        if( this.pathSampler.hasNext ){

            this.newPath = false;
            this.isMove = true;
            this.pathSampler.next();

        } else {

            this.isMove = false;
            this.tmppath = [];

        }

        if( this.isMove && !this.isWalking ) this.isWalking = true;
        if( !this.isMove && this.isWalking ) this.isWalking = false;

        if( this.mesh !== null ){
            p = this.getPos();
            this.mesh.position.set( p.x, 0, p.y );
            this.mesh.rotation.y = p.r;
        }

    }
};

export { Entity };