import { IDX, FACE } from '../constants';

function Face() {

    this.type = FACE;
    this.id = IDX.get('face');

    this.isReal = false;
    this.edge = null;
    
};

Face.prototype = {

    constructor: Face,

    setDatas: function ( edge, isReal ) {

        this.isReal = isReal !== undefined ? isReal : true;
        this.edge = edge;

    },

    dispose: function() {

        this.edge = null;
        this.isReal = false;

    }

};

export { Face };