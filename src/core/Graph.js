import { IDX, Dictionary, Log } from '../constants';

function Graph () {

    this.id = IDX.get('graph');

    this.edge = null;
    this.node = null;

};

Graph.prototype = {

    constructor: Graph,

    dispose: function() {

        while( this.node != null ) this.deleteNode(this.node);

    },

    insertNode: function () {

        var node = new GraphNode();
        if(this.node != null) {
            node.next = this.node;
            this.node.prev = node;
        }
        this.node = node;
        return node;

    },

    deleteNode: function ( node ) {

        while(node.outgoingEdge != null) {
            if(node.outgoingEdge.oppositeEdge != null) this.deleteEdge(node.outgoingEdge.oppositeEdge);
            this.deleteEdge(node.outgoingEdge);
        }
        var otherNode = this.node;
        var incomingEdge;
        while(otherNode != null) {
            incomingEdge = otherNode.successorNodes.get(node);
            if(incomingEdge != null) this.deleteEdge(incomingEdge);
            otherNode = otherNode.next;
        }
        if(this.node == node) {
            if(node.next != null) {
                node.next.prev = null;
                this.node = node.next;
            } else this.node = null;
        } else if(node.next != null) {
            node.prev.next = node.next;
            node.next.prev = node.prev;
        } else node.prev.next = null;
        node.dispose();

    },

    insertEdge: function ( fromNode, toNode ) {

        if( fromNode.successorNodes.get( toNode ) != null ) return null;

        var edge = new GraphEdge();

        if(this.edge != null) {
            this.edge.prev = edge;
            edge.next = this.edge;
        }
        this.edge = edge;
        edge.sourceNode = fromNode;
        edge.destinationNode = toNode;
       
        fromNode.successorNodes.set(toNode,edge);
        if(fromNode.outgoingEdge != null) {
            fromNode.outgoingEdge.rotPrevEdge = edge;
            edge.rotNextEdge = fromNode.outgoingEdge;
            fromNode.outgoingEdge = edge;
        } else fromNode.outgoingEdge = edge;
        var oppositeEdge = toNode.successorNodes.get(fromNode);
        if(oppositeEdge != null) {
            edge.oppositeEdge = oppositeEdge;
            oppositeEdge.oppositeEdge = edge;
        }
        return edge;

    },
    
    deleteEdge: function ( edge ) {

        if(this.edge == edge) {
            if(edge.next != null) {
                edge.next.prev = null;
                this.edge = edge.next;
            } else this.edge = null;
        } else if(edge.next != null) {
            edge.prev.next = edge.next;
            edge.next.prev = edge.prev;
        } else edge.prev.next = null;
        if(edge.sourceNode.outgoingEdge == edge) {
            if(edge.rotNextEdge != null) {
                edge.rotNextEdge.rotPrevEdge = null;
                edge.sourceNode.outgoingEdge = edge.rotNextEdge;
            } else edge.sourceNode.outgoingEdge = null;
        } else if(edge.rotNextEdge != null) {
            edge.rotPrevEdge.rotNextEdge = edge.rotNextEdge;
            edge.rotNextEdge.rotPrevEdge = edge.rotPrevEdge;
        } else edge.rotPrevEdge.rotNextEdge = null;
        edge.dispose();

    }

};

export { Graph };

// EDGE

function GraphEdge () {

    this.id = IDX.get('graphEdge');
    this.next = null;
    this.prev = null;
    this.rotPrevEdge = null;
    this.rotNextEdge = null;
    this.oppositeEdge = null;
    this.sourceNode = null;
    this.destinationNode = null;
    this.data = null;

};

GraphEdge.prototype = {

    dispose: function () {

        this.next = null;
        this.prev = null;
        this.rotPrevEdge = null;
        this.rotNextEdge = null;
        this.oppositeEdge = null;
        this.sourceNode = null;
        this.destinationNode = null;
        this.data = null;

    }

};

//export { GraphEdge };

// NODE

function GraphNode () {

    this.id = IDX.get('graphNode');
    this.successorNodes = new Dictionary( 1 );
    this.prev = null;
    this.next = null;
    this.outgoingEdge = null;
    this.data = null;

};

GraphNode.prototype = {

    dispose: function () {

        this.successorNodes.dispose();
        this.prev = null;
        this.next = null;
        this.outgoingEdge = null;
        this.successorNodes = null;
        this.data = null;

    }

};

//export { GraphNode };