//-------------------------
//     EDGE
//-------------------------

/*DDLS.FromEdgeToRotatedEdges = function() {
};*/


//-------------------------
//     FACE
//-------------------------
export class FromFaceToInnerEdges {

    constructor () {

        this._fromFace = null
        this._nextEdge = null

    }

    set fromFace ( value ) {

        this._fromFace = value;
        this._nextEdge = this._fromFace.edge;

    }

    next () {
        if(this._nextEdge != null) {
            this._resultEdge = this._nextEdge;
            this._nextEdge = this._nextEdge.nextLeftEdge;
            if(this._nextEdge == this._fromFace.edge) this._nextEdge = null;
        } else this._resultEdge = null;
        return this._resultEdge;
    }

}


//!\\ not used
/*
function FromFaceToInnerVertices() {

    this._fromFace = null;
    this._nextEdge = null;

    Object.defineProperty(this, 'fromFace', {
        set: function(value) { 
            this._fromFace = value;
            this._nextEdge = this._fromFace.edge;
        }
    });

};

FromFaceToInnerVertices.prototype = {

    next: function() {
        if(this._nextEdge != null) {
            this._resultVertex = this._nextEdge.originVertex;
            this._nextEdge = this._nextEdge.nextLeftEdge;
            if(this._nextEdge == this._fromFace.edge) this._nextEdge = null;
        } else this._resultVertex = null;
        return this._resultVertex;
    }

};

export { FromFaceToInnerVertices };
*/

//

//!\\ not used
/*
function FromFaceToNeighbourFaces () {
   // this._fromFace = null;
   // this._nextEdge = null;
    Object.defineProperty(this, 'fromFace', {
        set: function(value) { 
            this._fromFace = value;
            this._nextEdge = this._fromFace.edge;
        }
    });
};

FromFaceToNeighbourFaces.prototype = {

    next: function() {
        if(this._nextEdge != null) {
            do{
                this._resultFace = this._nextEdge.rightFace;
                this._nextEdge = this._nextEdge.nextLeftEdge;
                if(this._nextEdge == this._fromFace.edge){
                    this._nextEdge = null;
                    if ( ! this._resultFace.isReal ) this._resultFace = null;
                    break;
                }
            } while ( ! this._resultFace.isReal )
        } else this._resultFace = null;
        return this._resultFace;
    }
};

export { FromFaceToNeighbourFaces };
*/

//-------------------------
//     MESH
//-------------------------
export class FromMeshToVertices {

    constructor () {

        this._fromMesh = null;
        this._currIndex = 0;

    }

    set fromMesh ( value ) {

        this._fromMesh = value;
                this._currIndex = 0;

    }

    next () {
        do if(this._currIndex < this._fromMesh._vertices.length) {
            this._resultVertex = this._fromMesh._vertices[this._currIndex];
            this._currIndex++;
        } else {
            this._resultVertex = null;
            break;
        } while(!this._resultVertex.isReal);
        return this._resultVertex;
    }

}


//!\\ not used
/*
function FromMeshToFaces () {

    this._fromMesh = null;
    this._currIndex = 0;

    Object.defineProperty(this, 'fromMesh', {
        set: function(value) { 
            this._fromMesh = value;
            this._currIndex = 0;
        }
    });
};

FromMeshToFaces.prototype = {

    next: function() {
        do if(this._currIndex < this._fromMesh._faces.length) {
            this._resultFace = this._fromMesh._faces[this._currIndex];
            this._currIndex++;
        } else {
            this._resultFace = null;
            break;
        } while(!this._resultFace.isReal);
        return this._resultFace;
    }

};

export { FromMeshToFaces };
*/

//-------------------------
//     VERTEX
//-------------------------


export class FromVertexToHoldingFaces {

    constructor () {

        this._fromVertex = null;
        this._nextEdge = null;

    }

    set fromVertex ( value ) {

        this._fromVertex = value;
        this._nextEdge = this._fromVertex.edge;
        // if(this._fromVertex) this._nextEdge = this._fromVertex.edge;// || null;
         // else DDLS.Log('!! null vertex')

    }

    next () {
        if(this._nextEdge != null) do {
            this._resultFace = this._nextEdge.leftFace;
            this._nextEdge = this._nextEdge.rotLeftEdge;
            if(this._nextEdge == this._fromVertex.edge) {
                this._nextEdge = null;
                if(!this._resultFace.isReal) this._resultFace = null;
                break;
            }
        } while(!this._resultFace.isReal); 
        else this._resultFace = null;
        return this._resultFace;
    }

}

//

export class FromVertexToIncomingEdges {

    constructor () {

        this._fromVertex = null;
        this._nextEdge = null;

    }

    set fromVertex ( value ) {

        this._fromVertex = value;
        this._nextEdge = this._fromVertex.edge
        while(!this._nextEdge.isReal) this._nextEdge = this._nextEdge.rotLeftEdge;

    }

    next () {
        if(this._nextEdge != null) {
            this._resultEdge = this._nextEdge.oppositeEdge;
            do {
                this._nextEdge = this._nextEdge.rotLeftEdge;
                if(this._nextEdge == this._fromVertex.edge) {
                    this._nextEdge = null;
                    break;
                }
            } while(!this._nextEdge.isReal);
        } else this._resultEdge = null;
        return this._resultEdge;
    }

}


//
export class FromVertexToOutgoingEdges {

    constructor () {

        this.realEdgesOnly = true;
        this._fromVertex = null;
        this._nextEdge = null;

    }

    set fromVertex ( value ) {

        this._fromVertex = value;
        this._nextEdge = this._fromVertex.edge;
        if(this._nextEdge!=null)
        while(this.realEdgesOnly && !this._nextEdge.isReal) this._nextEdge = this._nextEdge.rotLeftEdge;

    }

    next() {
        if(this._nextEdge != null) {
            this._resultEdge = this._nextEdge;
            do {
                this._nextEdge = this._nextEdge.rotLeftEdge;
                if(this._nextEdge == this._fromVertex.edge) {
                    this._nextEdge = null;
                    break;
                }
            } while(this.realEdgesOnly && !this._nextEdge.isReal);
        } else this._resultEdge = null;
        return this._resultEdge;
    }
}


//!\\ not used
/*
function FromVertexToNeighbourVertices() {

    this._fromVertex = null;
    this._nextEdge = null;

    Object.defineProperty(this, 'fromVertex', {
        set: function(value) { 
            this._fromVertex = value;
            this._nextEdge = this._fromVertex.edge
        }
    });
};

FromVertexToNeighbourVertices.prototype = {

    next: function() {
        if(this._nextEdge != null){
            this._resultVertex = this._nextEdge.destinationVertex;
            do {
                this._nextEdge = this._nextEdge.rotLeftEdge;
            } while(!this._nextEdge.isReal);

            if(this._nextEdge == this._fromVertex.edge) {
                this._nextEdge = null;
            }
        }
        else this._resultVertex = null;
        return this._resultVertex;
    }
};

export { FromVertexToNeighbourVertices };
*/