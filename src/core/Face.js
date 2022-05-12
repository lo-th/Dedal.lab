import { IDX, FACE } from '../constants.js';

export class Face {

    constructor () {

        this.type = FACE;
        this.id = IDX.get('face');

        this.isReal = false;
        this.edge = null;
        
    }

    setDatas ( edge, isReal ) {

        this.isReal = isReal !== undefined ? isReal : true;
        this.edge = edge;

    }

    dispose () {

        this.edge = null;
        this.isReal = false;

    }

}