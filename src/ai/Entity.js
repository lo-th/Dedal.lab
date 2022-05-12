
import { torad, todeg } from '../constants.js';
import { Point } from '../math/Point.js';
import { FieldOfView } from '../ai/FieldOfView.js';
import { LinearPathSampler } from '../ai/LinearPathSampler.js';
import { unwrap } from '../core/Tools.js';

export class Entity {

    constructor( s = {}, world ) {

        this.isSee = false
        this.isWalking = false
        this.isSelected = false
        this.isMove = false
        this.isTurn = false

        this.isActive = false

        this.world = world

        this.turnSpeed = s.turn || 0
        this.turnStep = 0
        this.needTurn = false
        this.step = 0

        this.color = { r:255, g:255, b:255, a:0.75 }
        this.color2 = { r:0, g:0, b:255, a:0.75 }

        
        this.position = new Point( s.x || 0, s.y || 0 )
        this.direction = new Point(1,0)
        this.distance = 0;
        this.radius = s.r || 10;

        this.angle = s.angle || 0;
        this.angleNext = 0;

        this.angleFOV = ( s.fov || 120 ) * torad
        this.radiusFOV = s.distance || 200
        this.testSee = s.see || false

        this.angledelta = 0 
        this.turnStep = 0
        this.needTurn = false


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
        //this.entity = this;

    }

    clearTarget(){

        if( this.pathSampler.hasNext ){

            //this.path = []
            //this.tmppath = []
            //this.pathSampler.reset()

            this.pathSampler.hasPrev = false
            this.pathSampler.hasNext = false
            this.pathSampler._count = 0


        }

        this.isActive = false

    }

    setAngle( a ) {
        this.angle = unwrap( a )
    }
    
    setTarget( x, y, a ) {

        this.path = []
        this.target.set( x, y )
        this.world.pathFinder.entity = this
        this.world.pathFinder.findPath( this.target, this.path )
        return this.testPath( a )

    }

    testPath( a ) {

        if( !this.path ) return false
        if( this.path.length > 0 ){

            const startAngle = a !== undefined ? unwrap( a ) : this.angle

            this.pathSampler.reset()
            this.tmppath = [...this.path]
            this.pathSampler.path = this.tmppath
            this.newPath = true

            this.step = 0
            this.turnStep = 0
            
            // auto turn 
            
            if( this.turnSpeed !== 0 && this.tmppath.length >= 4 ){

                this.angleNext = this.position.angleTo( { x:this.tmppath[2], y:this.tmppath[3]} )
                let diff = this.getNear( this.angleNext, startAngle )

                this.turnStep = Math.floor( Math.abs( Math.round( diff*todeg )) / this.turnSpeed )
                this.angledelta =  diff / this.turnStep
                this.needTurn = true
                this.step = 0

                if(this.angledelta === Infinity || this.angledelta === -Infinity || isNaN(this.angledelta)){ 
                    this.angledelta = 0 
                    this.turnStep = 0
                    this.needTurn = false
                }

                //console.log( this.angledelta, this.turnStep  )
            }

            return true;
        }
    }

    getNear( s1, s2 ){ 
        let r =  Math.atan2(Math.sin(s1-s2), Math.cos(s1-s2))
        return r
    }

    getPos() {

        return { x:this.position.x, y:this.position.y, r:-this.angle };

    }

    update() {

        var p;
      
        if( this.pathSampler.hasNext ){

            if( this.needTurn ){

                this.isTurn = true
                this.step ++
                this.angle += this.angledelta
                if ( this.step === this.turnStep ) this.needTurn = false

            } else {

                this.newPath = false
                this.isMove = true
                this.isTurn = false
                this.pathSampler.next();

            }

        } else {

            this.isMove = false;
            this.isTurn = false;
            this.tmppath = [];

        }

        this.isActive = this.isMove || this.isTurn ? true : false

        if( this.isMove && !this.isWalking ) this.isWalking = true;
        if( !this.isMove && this.isWalking ) this.isWalking = false;

        if( this.mesh !== null ){
            p = this.getPos();
            this.mesh.position.set( p.x, 0, p.y );
            this.mesh.rotation.y = p.r-(Math.PI*0.5);
        }

    }
}