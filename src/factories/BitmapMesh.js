import { Potrace } from '../core/Potrace.js';
import { ShapeSimplifier } from './ShapeSimplifier';
import { RectMesh } from './RectMesh.js';

export class BitmapMesh {

    static buildFromBmpData ( pixel, precision = 1, color ) {

        if( color !== undefined ) Potrace.setColor( color );
        precision = precision || 1;

        let optimised = precision >= 1

        // OUTLINES STEP-LIKE SHAPES GENERATION

        const shapes = Potrace.buildShapes( pixel )
        

        // OPTIMIZED POLYGONS GENERATION FROM GRAPH OF POTENTIAL SEGMENTS GENERATION
        // MESH GENERATION

        let i = shapes.length, j, poly, lng, n = 0, n2 = 0 

        const mesh = new RectMesh( pixel.width, pixel.height )

        while( i-- ){

            if( optimised ) shapes[n] = ShapeSimplifier( shapes[n], precision )

            poly = Potrace.buildPolygon( Potrace.buildGraph( shapes[n] ) )
            
            j = (poly.length - 2) * 0.5
            n2 = 0
            while(j--){
                mesh.insertConstraintSegment( poly[n2], poly[n2+1], poly[n2+2], poly[n2+3] )
                n2 += 2
            }

            mesh.insertConstraintSegment( poly[0], poly[1], poly[n2], poly[n2+1] )

            /*
            lng = poly.length - 2;
            for ( j = 0; j < lng; j += 2 ) mesh.insertConstraintSegment( poly[j], poly[j+1], poly[j+2], poly[j+3] )
            mesh.insertConstraintSegment( poly[0], poly[1], poly[j], poly[j+1] )
            */

            n++

        }

        return mesh

    }

}