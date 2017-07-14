import { Dictionary, EPSILON } from '../constants';
import { Squared } from '../core/Tools';
import { Point } from '../math/Point';
import { Geom2D } from '../math/Geom2D';


function FieldOfView ( entity, world ) {

    this.entity = entity || null;
    this.world = world || null;
    //this._debug = false;
};

FieldOfView.prototype = {

    constructor: FieldOfView,

    isInField: function ( targetEntity ) {

        if (!this.world) return;//throw new Error("Mesh missing");
        if (!this.entity) return;//throw new Error("From entity missing");

        this.mesh = this.world.getMesh();

        var pos = this.entity.position;
        var direction = this.entity.direction;
        var target = targetEntity.position;
        
        var radius = this.entity.radiusFOV;
        var angle = this.entity.angleFOV;
        
        //var targetX = targetEntity.x;
        //var targetY = targetEntity.y;
        var targetRadius = targetEntity.radius
        
        var distSquared = Squared( pos.x - target.x, pos.y - target.y );//(posX-targetX)*(posX-targetX) + (posY-targetY)*(posY-targetY);
        
        // if target is completely outside field radius
        if ( distSquared >= (radius + targetRadius)*(radius + targetRadius) ){
            //trace("target is completely outside field radius");
            return false;
        }
        
        /*if (distSquared < targetRadius * targetRadius ){
            //trace("degenerate case if the field center is inside the target");
            return true;
        }*/
        
        //var leftTargetX, leftTargetY, rightTargetX, rightTargetY, leftTargetInField, rightTargetInField;

        var leftTarget = new Point();
        var rightTarget = new Point();
        var leftTargetInField, rightTargetInField;
        
        // we consider the 2 cicrles intersections
        var  result = [];
        if ( Geom2D.intersections2Circles(pos, radius, target, targetRadius, result) ){
            leftTarget.set(result[0], result[1]);
            rightTarget.set(result[2], result[3]);
        }

        var mid = pos.clone().add(target).mul(0.5);
        
        if( result.length == 0 || Squared(mid.x-target.x, mid.y-target.y) < Squared(mid.x-leftTarget.x, mid.y-leftTarget.y) ){
            // we consider the 2 tangents from field center to target
            result.splice(0, result.length);
            Geom2D.tangentsPointToCircle(pos, target, targetRadius, result);
            leftTarget.set(result[0], result[1]);
            rightTarget.set(result[2], result[3]);
        }
        
        /*if (this._debug){
            this._debug.graphics.lineStyle(1, 0x0000FF);
            this._debug.graphics.drawCircle(leftTargetX, leftTargetY, 2);
            this._debug.graphics.lineStyle(1, 0xFF0000);
            this._debug.graphics.drawCircle(rightTargetX, rightTargetY, 2);
        }*/
        
        var dotProdMin = Math.cos( this.entity.angleFOV*0.5 );

        // we compare the dots for the left point
        var left = leftTarget.clone().sub(pos);
        var lengthLeft = Math.sqrt( left.x*left.x + left.y*left.y );
        var dotLeft = (left.x/lengthLeft)*direction.x + (left.y/lengthLeft)*direction.y;
        // if the left point is in field
        if (dotLeft > dotProdMin) leftTargetInField = true;
        else leftTargetInField = false;
        
        
        // we compare the dots for the right point
        var right = rightTarget.clone().sub(pos);
        var lengthRight = Math.sqrt( right.x*right.x + right.y*right.y );
        var dotRight = (right.x/lengthRight)*direction.x + (right.y/lengthRight)*direction.y;
        // if the right point is in field
        if (dotRight > dotProdMin) rightTargetInField = true;
        else rightTargetInField = false;
        
        
        // if the left and right points are outside field
        if (!leftTargetInField && !rightTargetInField){
            var pdir = pos.clone().add(direction);
            // we must check if the Left/right points are on 2 different sides
            if ( Geom2D.getDirection(pos, pdir, leftTarget) === 1 && Geom2D.getDirection(pos, pdir, rightTarget) === -1 ){
                //trace("the Left/right points are on 2 different sides"); 
            }else{
                // we abort : target is not in field
                return false;
            }
        }
        
        // we init the window
        if ( !leftTargetInField || !rightTargetInField ){
            var p = new Point();
            var dirAngle;
            dirAngle = Math.atan2( direction.y, direction.x );
            if ( !leftTargetInField ){
                var leftField = new Point( Math.cos(dirAngle - angle*0.5), Math.sin(dirAngle - angle*0.5)).add(pos);
                Geom2D.intersections2segments(pos, leftField , leftTarget, rightTarget, p, null, true);
                leftTarget = p.clone();
            }
            if ( !rightTargetInField ){
                var rightField = new Point( Math.cos(dirAngle + angle*0.5), Math.sin(dirAngle + angle*0.5)).add(pos);
                Geom2D.intersections2segments(pos, rightField , leftTarget, rightTarget, p, null, true);
                rightTarget = p.clone();
            }
        }
        
     
        // now we have a triangle called the window defined by: posX, posY, rightTargetX, rightTargetY, leftTargetX, leftTargetY
        
        // we set a dictionnary of faces done
        var facesDone = new Dictionary( 0 );
        // we set a dictionnary of edges done
        var edgesDone = new Dictionary( 0 );
        // we set the window wall
        var wall = [];
        // we localize the field center
        var startObj = Geom2D.locatePosition( pos, this.mesh );
        var startFace;

        if ( startObj.type == 2 ) startFace = startObj;
        else if ( startObj.type == 1  ) startFace = startObj.leftFace;
        else if ( startObj.type == 0  ) startFace = startObj.edge.leftFace;
        
        
        // we put the face where the field center is lying in open list
        var openFacesList = [];
        var openFaces = new Dictionary( 0 );
        openFacesList.push(startFace);
        openFaces[startFace] = true;
        
        var currentFace, currentEdge, s1, s2;
        var p1 = new Point();
        var p2 = new Point();
        var param1, param2, i, index1, index2;
        var params = [];
        var edges = [];
        // we iterate as long as we have new open facess
        while ( openFacesList.length > 0 ){
            // we pop the 1st open face: current face
            currentFace = openFacesList.shift();
            openFaces.set(currentFace, null);
            facesDone.set(currentFace, true);
            
            // for each non-done edges from the current face
            currentEdge = currentFace.edge;
            if ( !edgesDone.get(currentEdge) && !edgesDone.get(currentEdge.oppositeEdge) ){
                edges.push(currentEdge);
                edgesDone.set(currentEdge, true);
            }
            currentEdge = currentEdge.nextLeftEdge;
            if ( !edgesDone.get(currentEdge) && !edgesDone.get(currentEdge.oppositeEdge) ){
                edges.push(currentEdge);
                edgesDone.set(currentEdge, true);
            }
            currentEdge = currentEdge.nextLeftEdge;
            if ( !edgesDone.get(currentEdge) && !edgesDone.get(currentEdge.oppositeEdge) ){
                edges.push(currentEdge);
                edgesDone.set(currentEdge, true);
            }
            
            while ( edges.length > 0 ){

                currentEdge = edges.pop();
                
                // if the edge overlap (interects or lies inside) the window
                s1 = currentEdge.originVertex.pos;
                s2 = currentEdge.destinationVertex.pos;
                //if ( Geom2D.clipSegmentByTriangle(s1.x, s1.y, s2.x, s2.y, pos.x, pos.y, rightTarget.x, rightTarget.y, leftTarget.x, leftTarget.y, p1, p2) ){
                if ( Geom2D.clipSegmentByTriangle(s1, s2, pos, rightTarget, leftTarget, p1, p2) ){
                    // if the edge if constrained
                    if ( currentEdge.isConstrained ){
                        // we project the constrained edge on the wall
                        params.splice(0, params.length);
                        Geom2D.intersections2segments(pos, p1, leftTarget, rightTarget, null, params, true);
                        Geom2D.intersections2segments(pos, p2, leftTarget, rightTarget, null, params, true);
                        param1 = params[1];
                        param2 = params[3];
                        if ( param2 < param1 ){
                            param1 = param2;
                            param2 = params[1];
                        }
                       
                        // we sum it to the window wall
                        for (i=wall.length-1 ; i>=0 ; i--){
                            if ( param2 >= wall[i] ) break;
                        }
                        index2 = i+1;
                        if (index2 % 2 == 0)
                            wall.splice(index2, 0, param2);
                        
                        for (i=0 ; i<wall.length ; i++){
                            if ( param1 <= wall[i] ) break;
                        }
                        index1 = i;
                        if (index1 % 2 == 0){
                            wall.splice(index1, 0, param1);
                            index2++;
                        }
                        else{
                            index1--;
                        }
                        
                        wall.splice( index1+1, index2-index1-1);
                        
                        // if the window is totally covered, we stop and return false
                        if ( wall.length == 2 && -EPSILON < wall[0] && wall[0] < EPSILON && 1-EPSILON < wall[1] && wall[1] < 1+EPSILON ) return false;
                        
                    }
                    
                    // if the adjacent face is neither in open list nor in faces done dictionnary
                    currentFace = currentEdge.rightFace;
                    if (!openFaces.get(currentFace) && !facesDone.get(currentFace)){
                        // we add it in open list
                        openFacesList.push( currentFace );
                        openFaces.set( currentFace, true );
                    }
                }
            }
        }
        
        /*if (this._debug){
            this._debug.graphics.lineStyle(3, 0x00FFFF);

            for (i=0 ; i<wall.length ; i+=2){
                this._debug.graphics.moveTo(leftTargetX + wall[i]*(rightTargetX-leftTargetX), leftTargetY + wall[i]*(rightTargetY-leftTargetY));
                this._debug.graphics.lineTo(leftTargetX + wall[i+1]*(rightTargetX-leftTargetX), leftTargetY + wall[i+1]*(rightTargetY-leftTargetY));
            }
        }*/
        // if the window is totally covered, we stop and return false
        //if ( wall.length === 2 && -_Math.EPSILON < wall[0] && wall[0] < _Math.EPSILON && 1-_Math.EPSILON < wall[1] && wall[1] < 1+_Math.EPSILON ) return false;
        
        //trace(wall);

        //console.log(wall)
        
        return true;

    }

}

export { FieldOfView };