
import { TwoPI } from '../constants.js';
import { Face } from '../core/Face.js';
import { Vertex } from '../core/Vertex.js';
import { Segment } from '../core/Segment.js';
import { Edge } from '../core/Edge.js';
import { Shape } from '../core/Shape.js';
import { Mesh2D } from '../core/Mesh2D.js';


export class CircleMesh {

    constructor( x = 100, y = 100, r = 100, n = 8 ) {
    
        let v = [];
        let e = [];
        let f = [];
        let s = [];
        let coord = [];

        let i = n;

        while(i--){
            f.push(new Face());
            v.push(new Vertex());
            s.push(new Segment());
            e.push(new Edge(), new Edge(), new Edge());
        }

        let boundShape = new Shape();    
        let offset = 10;
        
        let ndiv = 1/n;
        i = 0;
        while( i < n ) {

            v[i].pos.set( x + ((r+offset) * Math.cos( TwoPI * i * ndiv)), y + ((r+offset) * Math.sin( TwoPI * i * ndiv)) );
            v[i].setDatas(e[i*2]);
            i++;

        }

        // TODO edge ? face ?

        /*
        v[0].pos.set(0 - offset,0 - offset);
        v[1].pos.set(w + offset,0 - offset);
        v[2].pos.set(w + offset,h + offset);
        v[3].pos.set(0 - offset,h + offset);
        v[0].setDatas(e[0]);
        v[1].setDatas(e[2]);
        v[2].setDatas(e[4]);
        v[3].setDatas(e[6]);
        e[0].setDatas(v[0],e[1],e[2],f[3],true,true);
        e[1].setDatas(v[1],e[0],e[7],f[0],true,true);
        e[2].setDatas(v[1],e[3],e[11],f[3],true,true);
        e[3].setDatas(v[2],e[2],e[8],f[1],true,true);
        e[4].setDatas(v[2],e[5],e[6],f[2],true,true);
        e[5].setDatas(v[3],e[4],e[3],f[1],true,true);
        e[6].setDatas(v[3],e[7],e[10],f[2],true,true);
        e[7].setDatas(v[0],e[6],e[9],f[0],true,true);
        e[8].setDatas(v[1],e[9],e[5],f[1],true,false);
        e[9].setDatas(v[3],e[8],e[1],f[0],true,false);
        e[10].setDatas(v[0],e[11],e[4],f[2],false,false);
        e[11].setDatas(v[2],e[10],e[0],f[3],false,false);
        f[0].setDatas(e[9]);
        f[1].setDatas(e[8]);
        f[2].setDatas(e[4],false);
        f[3].setDatas(e[2],false);
        v[0].fromConstraintSegments = [s[0],s[3]];
        v[1].fromConstraintSegments = [s[0],s[1]];
        v[2].fromConstraintSegments = [s[1],s[2]];
        v[3].fromConstraintSegments = [s[2],s[3]];
        e[0].fromConstraintSegments.push(s[0]);
        e[1].fromConstraintSegments.push(s[0]);
        e[2].fromConstraintSegments.push(s[1]);
        e[3].fromConstraintSegments.push(s[1]);
        e[4].fromConstraintSegments.push(s[2]);
        e[5].fromConstraintSegments.push(s[2]);
        e[6].fromConstraintSegments.push(s[3]);
        e[7].fromConstraintSegments.push(s[3]);
        s[0].edges.push(e[0]);
        s[1].edges.push(e[2]);
        s[2].edges.push(e[4]);
        s[3].edges.push(e[6]);
        s[0].fromShape = boundShape;
        s[1].fromShape = boundShape;
        s[2].fromShape = boundShape;
        s[3].fromShape = boundShape;
        boundShape.segments.push(s[0], s[1], s[2], s[3]);// = s;*/
        /*this.tmpObj = new DDLS.Object();
        this.tmpObj.matrix.translate(x || 0,y || 0);
        let coordinates = [];
        this.tmpObj.coordinates = coordinates;
        */
        
        i = 0;
        while( i < n ) {

            coord.push(x+(r * Math.cos( TwoPI * i * ndiv)));
            coord.push(y+(r * Math.sin( TwoPI * i * ndiv)));
            coord.push(x+(r * Math.cos( TwoPI * (i + 1) * ndiv)));
            coord.push(y+(r * Math.sin( TwoPI * (i + 1) * ndiv)));
            i++;

        }


        let mesh = new Mesh2D( r*2, r*2 );
        mesh._vertices = v;
        mesh._edges = e;
        mesh._faces = f;
        mesh._constraintShapes.push( boundShape );

        mesh.clipping = false;
        mesh.insertConstraintShape( coord );
        mesh.clipping = true;

        return mesh;

    }
}
