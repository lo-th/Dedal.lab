import { _Math } from '../math/Math';
import { FACE } from '../constants';

function Face() {

    this.type = FACE;
    this.id = _Math.generateUUID();
    //DDLS.FaceID ++;
    this.isReal = false;
    this.edge = null;
};

Face.prototype = {

    constructor: Face,

    setDatas: function(edge, isReal) {

        this.isReal = isReal !== undefined ? isReal : true;
        this.edge = edge;

    },

    dispose: function() {

        this.edge = null;

    }

};

export { Face };