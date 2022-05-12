import { Geom2D } from '../math/Geom2D.js';
import { Point } from '../math/Point.js';

export const ShapeSimplifier = ( coords, epsilon = 1 ) => {

    epsilon = epsilon || 1;
    let len = coords.length;
    //DDLS.Debug.assertFalse((len & 1) != 0,"Wrong size",{ fileName : "ShapeSimplifier.hx", lineNumber : 18, className : "DDLS.ShapeSimplifier", methodName : "simplify"});
    if(len <= 4) return [].concat(coords);
    let firstPointX = coords[0];
    let firstPointY = coords[1];
    let lastPointX = coords[len - 2];
    let lastPointY = coords[len - 1];
    let index = -1;
    let dist = 0.;
    let _g1 = 1;
    let _g = len >> 1;
    while(_g1 < _g) {
        let i = _g1++;
        let currDist = Geom2D.distanceSquaredPointToSegment( new Point(coords[i << 1],coords[(i << 1) + 1]), new Point(firstPointX,firstPointY), new Point(lastPointX,lastPointY) );
        //let currDist = DDLS.Geom2D.distanceSquaredPointToSegment(coords[i << 1],coords[(i << 1) + 1],firstPointX,firstPointY,lastPointX,lastPointY);
        if(currDist > dist) {
            dist = currDist;
            index = i;
        }
    }
    if(dist > epsilon * epsilon) {
        let l1 = coords.slice(0,(index << 1) + 2);
        let l2 = coords.slice(index << 1);
        let r1 = ShapeSimplifier(l1,epsilon);
        let r2 = ShapeSimplifier(l2,epsilon);
        let rs = r1.slice(0,r1.length - 2).concat(r2);
        return rs;
    } else return [firstPointX,firstPointY,lastPointX,lastPointY];

}