/**
 * @license
 * Copyright 2010-2022 Ddls.js Authors lo-th
 * SPDX-License-Identifier: MIT
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.DDLS = {}));
})(this, (function (exports) { 'use strict';

	/*
	 * A list of constants built-in for
	 * the dedal engine.
	 */
	const REVISION = '1.0.0'; // MATH

	const TTIER = 0.3333333333333333;
	const torad = Math.PI / 180;
	const todeg = 180 / Math.PI;
	const EPSILON_NORMAL = 0.01;
	const EPSILON_SQUARED = 0.0001;
	const INFINITY = Infinity;
	const TwoPI = Math.PI * 2; // INTERSECTION

	const VERTEX = 0;
	const EDGE = 1;
	const FACE = 2;
	const NULL = 3; // MAIN

	var Main = {
		view: null,
		get: function () {
			return this.view;
		},
		set: function (o) {
			this.view = o;
		}
	};
	const IDX = {
		id: {
			segment: 0,
			shape: 0,
			edge: 0,
			face: 0,
			mesh2D: 0,
			object2D: 0,
			vertex: 0,
			graph: 0,
			graphEdge: 0,
			graphNode: 0
		},
		get: function (type) {
			this.id[type]++;
			return this.id[type];
		},
		reset: function () {
			this.id = {
				segment: 0,
				shape: 0,
				edge: 0,
				face: 0,
				mesh2D: 0,
				object2D: 0,
				vertex: 0,
				graph: 0,
				graphEdge: 0,
				graphNode: 0
			};
		}
	}; // LOG

	var Debug = {
		callback: function (s) {
			console.log(s);
		},
		log: function (s) {
			this.callback(s);
		}
	};

	const Log = str => {
		Debug.log(str);
	}; // DICTIONARY

	class Dictionary {
		constructor(type = 0) {
			this.type = type;
			this.m = new Map();
		}

		set(key, value) {
			this.m.set(this.type === 1 ? key.id : key, value);
		}

		get(key) {
			if (!this.m.has(this.type === 1 ? key.id : key)) return null;
			return this.m.get(this.type === 1 ? key.id : key);
		}

		remove(key) {
			this.m.delete(this.type === 1 ? key.id : key);
		}

		dispose() {
			this.m.clear(); //this.m = null
		}

	}
	/*

	function Dictionary ( type ){

			this.type = type || 0;

			if( this.type === 0 ){

					this.k = [];
					this.v = [];

			} else {

					this.h = {};

			}

	};

	Dictionary.prototype = {

			set: function ( key, value ) {

					var t = this.type;

					if( t === 0 ){

							this.k.push(key);
							this.v.push(value);

					}

					if( t === 1 ) this.h[ key.id ] = value;
					if( t === 2 ) this.h[ key ] = value;

			},

			get: function ( key ) {

					var t = this.type, i;

					if( t === 0 ){

							i = this.k.indexOf( key );
							if(i != -1) return this.v[ i ];

					}

					if( t === 1 ) return this.h[ key.id ];
					if( t === 2 ) return this.h[ key ];

			},

			dispose: function () {

					var t = this.type;

					if( t === 0 ){

							while( this.k.length > 0 ) this.k.pop();
							while( this.v.length > 0 ) this.v.pop();
							this.k = null;
							this.v = null;

					}

					if( t === 1 ){ 

							for ( var key in this.h ) this.h[ key.id ] = undefined;
							this.h = null;

					}

					if( t === 2 ){ 

							for ( var key in this.h ) this.h[ key ] = undefined;
							this.h = null;

					}

			}

	}

	export { Dictionary };*/

	// MATH function
	const rand = (low, high) => low + Math.random() * (high - low);
	const randInt = (low, high) => low + Math.floor(Math.random() * (high - low + 1));
	const unwrap = r => r - Math.floor((r + Math.PI) / (2 * Math.PI)) * 2 * Math.PI;
	const SquaredSqrt = (a, b) => Math.sqrt(a * a + b * b);
	const nearEqual = (a, b, e) => Math.abs(a - b) < e;
	const fix = (x, n) => x.toFixed(n || 3) * 1;
	const Squared = (a, b) => a * a + b * b;
	const Integral = x => Math.floor(x); //export const ARRAY = (typeof Float32Array !== 'undefined') ? Float32Array : Array;
	// IMAGE DATA

	const fromImageData = (image, imageData, w, h) => {
		let canvas, ctx;

		if (image) {
			w = image.width;
			h = image.height;
			canvas = document.createElement("canvas");
			canvas.width = w;
			canvas.height = h;
			ctx = canvas.getContext("2d");
			ctx.drawImage(image, 0, 0, w, h);
			imageData = ctx.getImageData(0, 0, w, h);
		}

		const pixels = {
			bytes: imageData.data,
			width: w,
			height: h
		};

		if (image) {
			ctx.clearRect(0, 0, w, h);
			canvas = null;
			ctx = null;
		}

		return pixels;
	};

	class Face {
		constructor() {
			this.type = FACE;
			this.id = IDX.get('face');
			this.isReal = false;
			this.edge = null;
		}

		setDatas(edge, isReal) {
			this.isReal = isReal !== undefined ? isReal : true;
			this.edge = edge;
		}

		dispose() {
			this.edge = null;
			this.isReal = false;
		}

	}

	class Point {
		constructor(x = 0, y = 0) {
			this.x = x;
			this.y = y;
		}

		set(x, y) {
			this.x = x;
			this.y = y;
			return this;
		}

		transform(matrix) {
			matrix.tranform(this);
			return this;
		}

		copy(p) {
			this.x = p.x;
			this.y = p.y;
			return this;
		}

		clone() {
			return new Point(this.x, this.y);
		}

		sub(p) {
			this.x -= p.x;
			this.y -= p.y;
			return this;
		}

		mul(s) {
			this.x *= s;
			this.y *= s;
			return this;
		}

		add(n) {
			this.x += n.x;
			this.y += n.y;
			return this;
		}

		div(s) {
			let v = 1 / s;
			this.x *= v;
			this.y *= v;
			return this;
		}

		negate() {
			return new Point(-this.x, -this.y);
		}

		transformMat2D(matrix) {
			let x = this.x,
					y = this.y,
					n = matrix.n;
			this.x = n[0] * x + n[2] * y + n[4];
			this.y = n[1] * x + n[3] * y + n[5];
			return this;
		}

		length() {
			return Math.sqrt(this.x * this.x + this.y * this.y);
		}

		angular(a) {
			this.x = Math.cos(a);
			this.y = Math.sin(a);
			return this;
		}

		normalize() {
			const norm = this.length();
			this.x /= norm;
			this.y /= norm;
			return this;
		}

		distanceTo(p) {
			let diffX = p.x - this.x;
			let diffY = p.y - this.y;
			return Math.sqrt(diffX * diffX + diffY * diffY);
		}

		distanceSquaredTo(p) {
			let diffX = p.x - this.x;
			let diffY = p.y - this.y;
			return diffX * diffX + diffY * diffY;
		}

		equals(p) {
			return this.x === p.x && this.y === p.y;
		}
		/*angleTo( p ){
					return Math.atan2( p.x - this.x, p.y - this.y )
				
		}*/


		angle() {
			return Math.atan2(-this.y, -this.x) + Math.PI;
		}

		angleTo(p) {
			return Math.atan2(p.y - this.y, p.x - this.x);
		}

	}

	class Vertex {
		constructor() {
			this.type = VERTEX;
			this.id = IDX.get('vertex');
			this.pos = new Point();
			this.fromConstraintSegments = [];
			this.edge = null;
			this.isReal = false;
		}

		setDatas(edge, isReal) {
			this.isReal = isReal !== undefined ? isReal : true;
			this.edge = edge;
		}

		addFromConstraintSegment(segment) {
			if (this.fromConstraintSegments.indexOf(segment) === -1) this.fromConstraintSegments.push(segment);
		}

		removeFromConstraintSegment(segment) {
			const index = this.fromConstraintSegments.indexOf(segment);
			if (index !== -1) this.fromConstraintSegments.splice(index, 1);
		}

		dispose() {
			this.pos = null;
			this.edge = null;
			this.fromConstraintSegments = null;
		}

		toString() {
			return "ver_id " + this.id;
		}

	}

	class Segment {
		constructor(x, y) {
			this.id = IDX.get('segment');
			this.edges = [];
			this.fromShape = null;
		}

		addEdge(edge) {
			if (this.edges.indexOf(edge) === -1 && this.edges.indexOf(edge.oppositeEdge) === -1) this.edges.push(edge);
		}

		removeEdge(edge) {
			const index = this.edges.indexOf(edge);
			if (index === -1) index = this.edges.indexOf(edge.oppositeEdge);
			if (index !== -1) this.edges.splice(index, 1);
		}

		dispose() {
			this.edges = null;
			this.fromShape = null;
		}

		toString() {
			return "seg_id " + this.id;
		}

	}

	class Edge {
		constructor() {
			this.type = EDGE;
			this.id = IDX.get('edge');
			this.fromConstraintSegments = [];
			this.isConstrained = false;
			this.isReal = false;
			this.originVertex = null;
			this.oppositeEdge = null;
			this.nextLeftEdge = null;
			this.leftFace = null;
		}

		get destinationVertex() {
			return this.oppositeEdge.originVertex;
		}

		get nextRightEdge() {
			return this.oppositeEdge.nextLeftEdge.nextLeftEdge.oppositeEdge;
		}

		get prevRightEdge() {
			return this.oppositeEdge.nextLeftEdge.oppositeEdge;
		}

		get prevLeftEdge() {
			return this.nextLeftEdge.nextLeftEdge;
		}

		get rotLeftEdge() {
			return this.nextLeftEdge.nextLeftEdge.oppositeEdge;
		}

		get rotRightEdge() {
			return this.oppositeEdge.nextLeftEdge;
		}

		get rightFace() {
			return this.oppositeEdge.leftFace;
		}

		setDatas(originVertex, oppositeEdge, nextLeftEdge, leftFace, isReal, isConstrained) {
			this.isConstrained = isReal !== undefined ? isConstrained : false;
			this.isReal = isReal !== undefined ? isReal : true;
			this.originVertex = originVertex;
			this.oppositeEdge = oppositeEdge;
			this.nextLeftEdge = nextLeftEdge;
			this.leftFace = leftFace;
		}

		getDatas() {
			return [this.originVertex.pos.x, this.originVertex.pos.y, this.destinationVertex.pos.x, this.destinationVertex.pos.y, this.isConstrained ? 1 : 0];
		}

		addFromConstraintSegment(segment) {
			if (this.fromConstraintSegments.indexOf(segment) === -1) this.fromConstraintSegments.push(segment);
		}

		removeFromConstraintSegment(segment) {
			const index = this.fromConstraintSegments.indexOf(segment);
			if (index !== -1) this.fromConstraintSegments.splice(index, 1);
		}

		dispose() {
			this.originVertex = null;
			this.oppositeEdge = null;
			this.nextLeftEdge = null;
			this.leftFace = null;
			this.fromConstraintSegments = null;
		}

		toString() {
			return "edge " + this.originVertex.id + " - " + this.destinationVertex.id;
		}

	}

	class Shape {
		constructor() {
			this.id = IDX.get('shape');
			this.segments = [];
		}

		dispose() {
			while (this.segments.length > 0) this.segments.pop().dispose();

			this.segments = null;
		}

	}

	class Matrix2D {
		constructor(a = 1, b = 0, c = 0, d = 1, e = 0, f = 0) {
			this.n = [a || 1, b || 0, c || 0, d || 1, e || 0, f || 0];
		}

		identity() {
			this.n = [1, 0, 0, 1, 0, 0];
			return this;
		}

		translate(p) {
			let n = this.n;
			n[4] += p.x;
			n[5] += p.y;
			return this;
		}

		scale(p) {
			let n = this.n;
			n[0] *= p.x;
			n[1] *= p.y;
			n[2] *= p.x;
			n[3] *= p.y;
			n[4] *= p.x;
			n[5] *= p.y;
			return this;
		}

		rotate(rad) {
			let n = this.n;
			let aa = n[0],
					ab = n[1],
					ac = n[2],
					ad = n[3],
					atx = n[4],
					aty = n[5],
					st = Math.sin(rad),
					ct = Math.cos(rad);
			n[0] = aa * ct + ab * st;
			n[1] = -aa * st + ab * ct;
			n[2] = ac * ct + ad * st;
			n[3] = -ac * st + ct * ad;
			n[4] = ct * atx + st * aty;
			n[5] = ct * aty - st * atx;
			return this;
		}

		tranform(p) {
			let n = this.n;
			let x = n[0] * p.x + n[2] * p.y + n[4];
			let y = n[1] * p.x + n[3] * p.y + n[5];
			p.x = x;
			p.y = y;
		}

		transformX(x, y) {
			let n = this.n;
			return n[0] * x + n[2] * y + n[4];
		}

		transformY(x, y) {
			let n = this.n;
			return n[1] * x + n[3] * y + n[5];
		}

		concat(matrix) {
			// multiply
			let n = this.n;
			let m = matrix.n;
			let a = n[0] * m[0] + n[1] * m[2];
			let b = n[0] * m[1] + n[1] * m[3];
			let c = n[2] * m[0] + n[3] * m[2];
			let d = n[2] * m[1] + n[3] * m[3];
			let e = n[4] * m[0] + n[5] * m[2] + m[4];
			let f = n[4] * m[1] + n[5] * m[3] + m[5];
			n[0] = a;
			n[1] = b;
			n[2] = c;
			n[3] = d;
			n[4] = e;
			n[5] = f;
			return this;
		}

		clone() {
			let n = this.n;
			return new Matrix2D(n[0], n[1], n[2], n[3], n[4], n[5]);
		}

	}

	class RandGenerator {
		constructor(seed = 1234, min = 0, max = 1) {
			this.min = min;
			this.max = max;
			this.seed = this.currentSeed = seed;
			this.nid = 0;
		}

		getSeed() {
			return this.seed;
		}

		setSeed(value) {
			this.seed = this.currentSeed = value;
		}

		reset() {
			this.currentSeed = this.seed;
			this.nid = 0;
		}

		next() {
			let tmp = this.currentSeed * 1;
			let temp = (tmp * tmp).toString();

			while (temp.length < 8) temp = "0" + temp;

			this.currentSeed = parseInt(temp.substr(1, 5));
			let res = Math.round(this.min + this.currentSeed / 99999 * (this.max - this.min));
			if (this.currentSeed === 0) this.currentSeed = this.seed + this.nid;
			this.nid++;
			if (this.nid === 200) this.reset();
			return res;
		}

		nextInRange(min, max) {
			this.min = min;
			this.max = max;
			return this.next();
		}

		shuffle(ar) {
			let i = ar.length,
					n,
					t;

			while (i--) {
				n = this.nextInRange(0, i);
				t = ar[i];
				ar[i] = ar[n];
				ar[n] = t;
			}
		}

	}

	//-------------------------
	//		 EDGE
	//-------------------------

	/*DDLS.FromEdgeToRotatedEdges = function() {
	};*/
	//-------------------------
	//		 FACE
	//-------------------------
	class FromFaceToInnerEdges {
		constructor() {
			this._fromFace = null;
			this._nextEdge = null;
		}

		set fromFace(value) {
			this._fromFace = value;
			this._nextEdge = this._fromFace.edge;
		}

		next() {
			if (this._nextEdge != null) {
				this._resultEdge = this._nextEdge;
				this._nextEdge = this._nextEdge.nextLeftEdge;
				if (this._nextEdge == this._fromFace.edge) this._nextEdge = null;
			} else this._resultEdge = null;

			return this._resultEdge;
		}

	} //!\\ not used

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
	//		 MESH
	//-------------------------

	class FromMeshToVertices {
		constructor() {
			this._fromMesh = null;
			this._currIndex = 0;
		}

		set fromMesh(value) {
			this._fromMesh = value;
			this._currIndex = 0;
		}

		next() {
			do if (this._currIndex < this._fromMesh._vertices.length) {
				this._resultVertex = this._fromMesh._vertices[this._currIndex];
				this._currIndex++;
			} else {
				this._resultVertex = null;
				break;
			} while (!this._resultVertex.isReal);

			return this._resultVertex;
		}

	} //!\\ not used

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
	//		 VERTEX
	//-------------------------

	class FromVertexToHoldingFaces {
		constructor() {
			this._fromVertex = null;
			this._nextEdge = null;
		}

		set fromVertex(value) {
			this._fromVertex = value;
			this._nextEdge = this._fromVertex.edge; // if(this._fromVertex) this._nextEdge = this._fromVertex.edge;// || null;
			// else DDLS.Log('!! null vertex')
		}

		next() {
			if (this._nextEdge != null) do {
				this._resultFace = this._nextEdge.leftFace;
				this._nextEdge = this._nextEdge.rotLeftEdge;

				if (this._nextEdge == this._fromVertex.edge) {
					this._nextEdge = null;
					if (!this._resultFace.isReal) this._resultFace = null;
					break;
				}
			} while (!this._resultFace.isReal);else this._resultFace = null;
			return this._resultFace;
		}

	} //

	class FromVertexToIncomingEdges {
		constructor() {
			this._fromVertex = null;
			this._nextEdge = null;
		}

		set fromVertex(value) {
			this._fromVertex = value;
			this._nextEdge = this._fromVertex.edge;

			while (!this._nextEdge.isReal) this._nextEdge = this._nextEdge.rotLeftEdge;
		}

		next() {
			if (this._nextEdge != null) {
				this._resultEdge = this._nextEdge.oppositeEdge;

				do {
					this._nextEdge = this._nextEdge.rotLeftEdge;

					if (this._nextEdge == this._fromVertex.edge) {
						this._nextEdge = null;
						break;
					}
				} while (!this._nextEdge.isReal);
			} else this._resultEdge = null;

			return this._resultEdge;
		}

	} //

	class FromVertexToOutgoingEdges {
		constructor() {
			this.realEdgesOnly = true;
			this._fromVertex = null;
			this._nextEdge = null;
		}

		set fromVertex(value) {
			this._fromVertex = value;
			this._nextEdge = this._fromVertex.edge;
			if (this._nextEdge != null) while (this.realEdgesOnly && !this._nextEdge.isReal) this._nextEdge = this._nextEdge.rotLeftEdge;
		}

		next() {
			if (this._nextEdge != null) {
				this._resultEdge = this._nextEdge;

				do {
					this._nextEdge = this._nextEdge.rotLeftEdge;

					if (this._nextEdge == this._fromVertex.edge) {
						this._nextEdge = null;
						break;
					}
				} while (this.realEdgesOnly && !this._nextEdge.isReal);
			} else this._resultEdge = null;

			return this._resultEdge;
		}

	} //!\\ not used

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

	const Geom2D = {
		__samples: [],
		__circumcenter: new Point(),
		_randGen: null,
		locatePosition: function (p, mesh) {
			let i, numSamples; // jump and walk algorithm

			if (Geom2D._randGen === null) Geom2D._randGen = new RandGenerator();

			Geom2D._randGen.setSeed(Integral(p.x * 10 + 4 * p.y));

			Geom2D.__samples.splice(0, Geom2D.__samples.length);

			numSamples = Integral(Math.pow(mesh._vertices.length, TTIER)); //let numSamples = Integral(Math.pow(mesh._vertices.length,));
			//console.log(numSamples, mesh._vertices.length);

			Geom2D._randGen.min = 0;
			Geom2D._randGen.max = mesh._vertices.length - 1;
			i = 0;

			while (i < numSamples) {
				//while(i--){
				//for ( i = 0 ; i < numSamples; i++ ){
				Geom2D.__samples.push(mesh._vertices[Geom2D._randGen.next()]);

				i++;
			}

			let currVertex, currVertexPos, distSquared;
			let minDistSquared = INFINITY;
			let closedVertex = null;
			i = 0; //let n = 0

			while (i < numSamples) {
				//for ( i = 0 ; i < numSamples; i++ ){
				currVertex = Geom2D.__samples[i];
				currVertexPos = currVertex.pos;
				distSquared = Squared(currVertexPos.x - p.x, currVertexPos.y - p.y);

				if (distSquared < minDistSquared) {
					minDistSquared = distSquared;
					closedVertex = currVertex;
				}

				i++;
			}

			let iterFace = new FromVertexToHoldingFaces();

			if (closedVertex === null) {
				Log('no closedVertex find ?'); //return {type:NULL};
			}

			iterFace.fromVertex = closedVertex;
			let currFace = iterFace.next();
			let faceVisited = new Dictionary(0);
			let currEdge;
			let iterEdge = new FromFaceToInnerEdges();
			let relativPos = 0;
			let numIter = 0;
			let objectContainer = Geom2D.isInFace(p, currFace);

			while (faceVisited.get(currFace) || objectContainer.type === NULL) {
				faceVisited.set(currFace, true);
				numIter++;
				if (numIter == 50) Log("WALK TAKE MORE THAN 50 LOOP");

				if (numIter == 1000) {
					Log("WALK TAKE MORE THAN 1000 LOOP -> WE ESCAPE");
					objectContainer = {
						type: NULL
					};
					break;
				}

				iterEdge.fromFace = currFace;

				do {
					currEdge = iterEdge.next();

					if (currEdge === null) {
						Log("KILL PATH");
						return null;
					}

					relativPos = Geom2D.getRelativePosition(p, currEdge);
				} while (relativPos == 1 || relativPos == 0);

				currFace = currEdge.rightFace;
				objectContainer = Geom2D.isInFace(p, currFace);
			}

			faceVisited.dispose();
			return objectContainer;
		},
		isCircleIntersectingAnyConstraint: function (p, radius, mesh) {
			if (p.x <= 0 || p.x >= mesh.width || p.y <= 0 || p.y >= mesh.height) return true;
			let loc = Geom2D.locatePosition(p, mesh);
			let face;

			switch (loc.type) {
				case 0:
					face = loc.edge.leftFace;
					break;

				case 1:
					face = loc.leftFace;
					break;

				case 2:
					face = loc;
					break;

				case 3:
					face = null;
					break;
			}

			let radiusSquared = radius * radius;
			let pos;
			let distSquared;
			pos = face.edge.originVertex.pos;
			distSquared = Squared(pos.x - p.x, pos.y - p.y);
			if (distSquared <= radiusSquared) return true;
			pos = face.edge.nextLeftEdge.originVertex.pos;
			distSquared = Squared(pos.x - p.x, pos.y - p.y);
			if (distSquared <= radiusSquared) return true;
			pos = face.edge.nextLeftEdge.nextLeftEdge.originVertex.pos;
			distSquared = Squared(pos.x - p.x, pos.y - p.y);
			if (distSquared <= radiusSquared) return true;
			let edgesToCheck = [];
			edgesToCheck.push(face.edge);
			edgesToCheck.push(face.edge.nextLeftEdge);
			edgesToCheck.push(face.edge.nextLeftEdge.nextLeftEdge);
			let edge, pos1, pos2;
			let checkedEdges = new Dictionary(0);
			let intersecting;

			while (edgesToCheck.length > 0) {
				edge = edgesToCheck.pop();
				checkedEdges.set(edge, true); //true;

				pos1 = edge.originVertex.pos;
				pos2 = edge.destinationVertex.pos;
				intersecting = Geom2D.intersectionsSegmentCircle(pos1, pos2, p, radius);

				if (intersecting) {
					if (edge.isConstrained) return true;else {
						edge = edge.oppositeEdge.nextLeftEdge;
						if (!checkedEdges.get(edge) && !checkedEdges.get(edge.oppositeEdge) && edgesToCheck.indexOf(edge) == -1 && edgesToCheck.indexOf(edge.oppositeEdge) == -1) edgesToCheck.push(edge);
						edge = edge.nextLeftEdge;
						if (!checkedEdges.get(edge) && !checkedEdges.get(edge.oppositeEdge) && edgesToCheck.indexOf(edge) == -1 && edgesToCheck.indexOf(edge.oppositeEdge) == -1) edgesToCheck.push(edge);
					}
				}
			} //this.checkedEdges.dispose();


			return false;
		},
		getDirection: function (p1, p2, p3) {
			let dot = (p3.x - p1.x) * (p2.y - p1.y) + (p3.y - p1.y) * (-p2.x + p1.x);
			return dot == 0 ? 0 : dot > 0 ? 1 : -1;
			/*if(dot == 0) return 0; 
			else if(dot > 0) return 1; 
			else return -1;*/
		},
		getRelativePosition: function (p, eUp) {
			return Geom2D.getDirection(eUp.originVertex.pos, eUp.destinationVertex.pos, p);
		},
		getRelativePosition2: function (p, eUp) {
			if (eUp === undefined) {
				console.log('error no eUp'); //eUp.originVertex.pos, eUp.destinationVertex.pos, p )

				return 0;
			}

			return Geom2D.Orient2d(eUp.originVertex.pos, eUp.destinationVertex.pos, p);
		},
		Orient2d: function (p1, p2, p3) {
			let val = (p1.x - p3.x) * (p2.y - p3.y) - (p1.y - p3.y) * (p2.x - p3.x);
			if (val > -EPSILON_SQUARED && val < EPSILON_SQUARED) return 0; // collinear
			else if (val > 0) return -1; // ccw
			else return 1; // cw
		},
		// the function checks by priority:
		// - if the (x, y) lies on a vertex of the polygon, it will return this vertex
		// - if the (x, y) lies on a edge of the polygon, it will return this edge
		// - if the (x, y) lies inside the polygon, it will return the polygon
		// - if the (x, y) lies outside the polygon, it will return null
		isInFace: function (p, polygon) {
			// remember polygons are triangle only,
			// and we suppose we have not degenerated flat polygons !
			let result = {
				type: NULL
			};
			if (polygon === null) return result;
			let e1_2 = polygon.edge;
			let e2_3 = e1_2.nextLeftEdge;
			let e3_1 = e2_3.nextLeftEdge;

			if (Geom2D.getRelativePosition(p, e1_2) >= 0 && Geom2D.getRelativePosition(p, e2_3) >= 0 && Geom2D.getRelativePosition(p, e3_1) >= 0) {
				let v1 = e1_2.originVertex;
				let v2 = e2_3.originVertex;
				let v3 = e3_1.originVertex;
				let x1 = v1.pos.x;
				let y1 = v1.pos.y;
				let x2 = v2.pos.x;
				let y2 = v2.pos.y;
				let x3 = v3.pos.x;
				let y3 = v3.pos.y;
				let v_v1squared = Squared(x1 - p.x, y1 - p.y);
				let v_v2squared = Squared(x2 - p.x, y2 - p.y);
				let v_v3squared = Squared(x3 - p.x, y3 - p.y);
				let inv_v1_v2 = 1 / Squared(x2 - x1, y2 - y1);
				let inv_v2_v3 = 1 / Squared(x3 - x2, y3 - y2);
				let inv_v3_v1 = 1 / Squared(x1 - x3, y1 - y3);
				let dot_v_v1v2 = (p.x - x1) * (x2 - x1) + (p.y - y1) * (y2 - y1);
				let dot_v_v2v3 = (p.x - x2) * (x3 - x2) + (p.y - y2) * (y3 - y2);
				let dot_v_v3v1 = (p.x - x3) * (x1 - x3) + (p.y - y3) * (y1 - y3);
				let v_e1_2squared = v_v1squared - dot_v_v1v2 * dot_v_v1v2 * inv_v1_v2;
				let v_e2_3squared = v_v2squared - dot_v_v2v3 * dot_v_v2v3 * inv_v2_v3;
				let v_e3_1squared = v_v3squared - dot_v_v3v1 * dot_v_v3v1 * inv_v3_v1;
				let closeTo_e1_2 = v_e1_2squared <= EPSILON_SQUARED ? true : false;
				let closeTo_e2_3 = v_e2_3squared <= EPSILON_SQUARED ? true : false;
				let closeTo_e3_1 = v_e3_1squared <= EPSILON_SQUARED ? true : false;

				if (closeTo_e1_2) {
					if (closeTo_e3_1) result = v1;else if (closeTo_e2_3) result = v2;else result = e1_2;
				} else if (closeTo_e2_3) {
					if (closeTo_e3_1) result = v3;else result = e2_3;
				} else if (closeTo_e3_1) result = e3_1;else result = polygon;
			}

			return result;
		},
		clipSegmentByTriangle: function (s1, s2, t1, t2, t3, pResult1, pResult2) {
			let side1_1 = Geom2D.getDirection(t1, t2, s1);
			let side1_2 = Geom2D.getDirection(t1, t2, s2);
			if (side1_1 <= 0 && side1_2 <= 0) return false;
			let side2_1 = Geom2D.getDirection(t2, t3, s1);
			let side2_2 = Geom2D.getDirection(t2, t3, s2);
			if (side2_1 <= 0 && side2_2 <= 0) return false;
			let side3_1 = Geom2D.getDirection(t3, t1, s1);
			let side3_2 = Geom2D.getDirection(t3, t1, s2);
			if (side3_1 <= 0 && side3_2 <= 0) return false;

			if (side1_1 >= 0 && side2_1 >= 0 && side3_1 >= 0 && side1_2 >= 0 && side2_2 >= 0 && side3_2 >= 0) {
				pResult1 = s1.clone();
				pResult2 = s2.clone();
				return true;
			}

			let n = 0;
			if (Geom2D.intersections2segments(s1, s2, t1, t2, pResult1, null)) n++;

			if (n == 0) {
				if (Geom2D.intersections2segments(s1, s2, t2, t3, pResult1, null)) n++;
			} else if (Geom2D.intersections2segments(s1, s2, t2, t3, pResult2, null)) {
				if (-0.01 > pResult1.x - pResult2.x || pResult1.x - pResult2.x > EPSILON_NORMAL || -EPSILON_NORMAL > pResult1.y - pResult2.y || pResult1.y - pResult2.y > EPSILON_NORMAL) n++;
			}

			if (n == 0) {
				if (Geom2D.intersections2segments(s1, s2, t3, t1, pResult1, null)) n++;
			} else if (n == 1) {
				if (Geom2D.intersections2segments(s1, s2, t3, t1, pResult2, null)) {
					if (-EPSILON_NORMAL > pResult1.x - pResult2.x || pResult1.x - pResult2.x > EPSILON_NORMAL || -EPSILON_NORMAL > pResult1.y - pResult2.y || pResult1.y - pResult2.y > EPSILON_NORMAL) n++;
				}
			}

			if (n == 1) {
				if (side1_1 >= 0 && side2_1 >= 0 && side3_1 >= 0) pResult2 = s1.clone();else if (side1_2 >= 0 && side2_2 >= 0 && side3_2 >= 0) pResult2 = s2.clone();else n = 0;
			}

			if (n > 0) return true;else return false;
		},

		/*isSegmentIntersectingTriangle: function( s1, s2, t1, t2, t3 ) {
					let side1_1 = Geom2D.getDirection(t1, t2, s1);
				let side1_2 = Geom2D.getDirection(t1, t2, s2);
				if(side1_1 <= 0 && side1_2 <= 0) return false;
				let side2_1 = Geom2D.getDirection(t2, t3, s1);
				let side2_2 = Geom2D.getDirection(t2, t3, s2);
				if(side2_1 <= 0 && side2_2 <= 0) return false;
				let side3_1 = Geom2D.getDirection(t3, t1, s1);
				let side3_2 = Geom2D.getDirection(t3, t1, s2);
				if(side3_1 <= 0 && side3_2 <= 0) return false;
				if(side1_1 == 1 && side2_1 == 1 && side3_1 == 1) return true;
				if(side1_1 == 1 && side2_1 == 1 && side3_1 == 1) return true;
				let side1, side2;
				if(side1_1 == 1 && side1_2 <= 0 || side1_1 <= 0 && side1_2 == 1) {
						side1 = Geom2D.getDirection(s1, s2, t1);
						side2 = Geom2D.getDirection(s1, s2, t2);
						if(side1 == 1 && side2 <= 0 || side1 <= 0 && side2 == 1) return true;
				}
				if(side2_1 == 1 && side2_2 <= 0 || side2_1 <= 0 && side2_2 == 1) {
						side1 = Geom2D.getDirection(s1, s2, t2);
						side2 = Geom2D.getDirection(s1, s2, t3);
						if(side1 == 1 && side2 <= 0 || side1 <= 0 && side2 == 1) return true;
				}
				if(side3_1 == 1 && side3_2 <= 0 || side3_1 <= 0 && side3_2 == 1) {
						side1 = Geom2D.getDirection(s1, s2, t3);
						side2 = Geom2D.getDirection(s1, s2, t1);
						if(side1 == 1 && side2 <= 0 || side1 <= 0 && side2 == 1) return true;
				}
				return false;
			},*/
		isDelaunay: function (edge) {
			let vLeft = edge.originVertex;
			let vRight = edge.destinationVertex;
			let vCorner = edge.nextLeftEdge.destinationVertex;
			let vOpposite = edge.nextRightEdge.destinationVertex; //getCircumcenter(vCorner.pos.x,vCorner.pos.y,vLeft.pos.x,vLeft.pos.y,vRight.pos.x,vRight.pos.y,__circumcenter);

			Geom2D.getCircumcenter(vCorner.pos, vLeft.pos, vRight.pos, Geom2D.__circumcenter);
			let squaredRadius = (vCorner.pos.x - Geom2D.__circumcenter.x) * (vCorner.pos.x - Geom2D.__circumcenter.x) + (vCorner.pos.y - Geom2D.__circumcenter.y) * (vCorner.pos.y - Geom2D.__circumcenter.y);
			let squaredDistance = (vOpposite.pos.x - Geom2D.__circumcenter.x) * (vOpposite.pos.x - Geom2D.__circumcenter.x) + (vOpposite.pos.y - Geom2D.__circumcenter.y) * (vOpposite.pos.y - Geom2D.__circumcenter.y);
			return squaredDistance >= squaredRadius ? true : false;
		},
		getCircumcenter: function (p1, p2, p3, result) {
			if (result == null) result = new Point();
			let m1 = (p1.x + p2.x) * 0.5;
			let m2 = (p1.y + p2.y) * 0.5;
			let m3 = (p1.x + p3.x) * 0.5;
			let m4 = (p1.y + p3.y) * 0.5;
			let t1 = (m1 * (p1.x - p3.x) + (m2 - m4) * (p1.y - p3.y) + m3 * (p3.x - p1.x)) / (p1.x * (p3.y - p2.y) + p2.x * (p1.y - p3.y) + p3.x * (p2.y - p1.y));
			result.x = m1 + t1 * (p2.y - p1.y);
			result.y = m2 - t1 * (p2.x - p1.x);
			return result;
		},
		intersections2segments: function (s1p1, s1p2, s2p1, s2p2, posIntersection, paramIntersection, infiniteLineMode) {
			if (infiniteLineMode == null) infiniteLineMode = false;
			let t1 = 0;
			let t2 = 0;
			let result;
			let divisor = (s1p1.x - s1p2.x) * (s2p1.y - s2p2.y) + (s1p2.y - s1p1.y) * (s2p1.x - s2p2.x);
			if (divisor == 0) result = false;else {
				result = true;
				let invDivisor = 1 / divisor;

				if (!infiniteLineMode || posIntersection != null || paramIntersection != null) {
					t1 = (s1p1.x * (s2p1.y - s2p2.y) + s1p1.y * (s2p2.x - s2p1.x) + s2p1.x * s2p2.y - s2p1.y * s2p2.x) * invDivisor;
					t2 = (s1p1.x * (s2p1.y - s1p2.y) + s1p1.y * (s1p2.x - s2p1.x) - s1p2.x * s2p1.y + s1p2.y * s2p1.x) * invDivisor;
					if (!infiniteLineMode && !(0 <= t1 && t1 <= 1 && 0 <= t2 && t2 <= 1)) result = false;
				}
			}

			if (result) {
				if (posIntersection != null) {
					posIntersection.x = s1p1.x + t1 * (s1p2.x - s1p1.x);
					posIntersection.y = s1p1.y + t1 * (s1p2.y - s1p1.y);
				}

				if (paramIntersection != null) {
					paramIntersection.push(t1, t2);
				}
			}

			return result;
		},
		intersections2edges: function (edge1, edge2, posIntersection, paramIntersection, infiniteLineMode) {
			if (infiniteLineMode == null) infiniteLineMode = false;
			return Geom2D.intersections2segments(edge1.originVertex.pos, edge1.destinationVertex.pos, edge2.originVertex.pos, edge2.destinationVertex.pos, posIntersection, paramIntersection, infiniteLineMode);
		},
		isConvex: function (edge) {
			let result = true;
			let eLeft;
			let vRight;
			eLeft = edge.nextLeftEdge.oppositeEdge;
			vRight = edge.nextRightEdge.destinationVertex;
			if (Geom2D.getRelativePosition(vRight.pos, eLeft) != -1) result = false;else {
				eLeft = edge.prevRightEdge;
				vRight = edge.prevLeftEdge.originVertex;
				if (Geom2D.getRelativePosition(vRight.pos, eLeft) != -1) result = false;
			}
			return result;
		},
		projectOrthogonaly: function (vertexPos, edge) {
			let a = edge.originVertex.pos.x;
			let b = edge.originVertex.pos.y;
			let c = edge.destinationVertex.pos.x;
			let d = edge.destinationVertex.pos.y;
			let e = vertexPos.x;
			let f = vertexPos.y;
			let t1 = (a * a - a * c - a * e + b * b - b * d - b * f + c * e + d * f) / (a * a - 2 * a * c + b * b - 2 * b * d + c * c + d * d);
			vertexPos.x = a + t1 * (c - a);
			vertexPos.y = b + t1 * (d - b);
		},

		/*projectOrthogonalyOnSegment: function	(px, py, sp1x, sp1y, sp2x, sp2y, result) {
				let a = sp1x;
				let b = sp1y;
				let c = sp2x;
				let d = sp2y;
				let e = px;
				let f = py;			 
				let t1 = (a*a - a*c - a*e + b*b - b*d - b*f + c*e + d*f) / (a*a - 2*a*c + b*b - 2*b*d + c*c + d*d);
				result.x = a + t1*(c - a);
				result.y = b + t1*(d - b);
		},*/
		intersections2Circles: function (c1, r1, c2, r2, result) {
			let factor, a, b, first, dist, invd, trans;
			dist = Squared(c2.x - c1.x, c2.y - c1.y);
			invd = 1 / (2 * dist);

			if ((c1.x != c2.x || c1.y != c2.y) && dist <= (r1 + r2) * (r1 + r2) && dist >= (r1 - r2) * (r1 - r2)) {
				trans = Math.sqrt(((r1 + r2) * (r1 + r2) - dist) * (dist - (r2 - r1) * (r2 - r1)));
				factor = c2.clone().sub(c1).mul(invd);
				a = c1.clone().add(c2).mul(0.5);
				b = factor.clone().mul(r1 * r1 - r2 * r2); //b = c2.clone().sub(c1).mul(r1 * r1 - r2 * r2).mul(invd);

				first = a.clone().add(b);
				/*let xFirstPart = (c1.x + c2.x) * 0.5 + (c2.x - c1.x) * (r1 * r1 - r2 * r2) * invd;
				let yFirstPart = (c1.y + c2.y) * 0.5 + (c2.y - c1.y) * (r1 * r1 - r2 * r2) * invd;
				let xFactor = (c2.y - c1.y) * invd;
				let yFactor = (c2.x - c1.x) * invd;*/

				if (result != null) {
					//result.push(	xFirstPart + xFactor * trans , yFirstPart - yFactor * trans	, xFirstPart - xFactor * trans , yFirstPart + yFactor * trans );
					//result.push(	xFirstPart + factor.y * trans , yFirstPart - factor.x * trans	, xFirstPart - factor.y * trans , yFirstPart + factor.x * trans );
					result.push(first.x + factor.y * trans, first.y - factor.x * trans, first.x - factor.y * trans, first.y + factor.x * trans);
				}

				return true;
			} else return false;
		},
		intersectionsSegmentCircle: function (p0, p1, c, r, result) {
			let p0xSQD = p0.x * p0.x;
			let p0ySQD = p0.y * p0.y;
			let a = p1.y * p1.y - 2 * p1.y * p0.y + p0ySQD + p1.x * p1.x - 2 * p1.x * p0.x + p0xSQD;
			let b = 2 * p0.y * c.y - 2 * p0xSQD + 2 * p1.y * p0.y - 2 * p0ySQD + 2 * p1.x * p0.x - 2 * p1.x * c.x + 2 * p0.x * c.x - 2 * p1.y * c.y;
			let cc = p0ySQD + c.y * c.y + c.x * c.x - 2 * p0.y * c.y - 2 * p0.x * c.x + p0xSQD - r * r;
			let delta = b * b - 4 * a * cc;
			let deltaSQRT;
			let t0;
			let t1;
			if (delta < 0) return false;else if (delta == 0) {
				t0 = -b / (2 * a);
				if (t0 < 0 || t0 > 1) return false;

				if (result != null) {
					result.push(p0.x + t0 * (p1.x - p0.x), p0.y + t0 * (p1.y - p0.y), t0);
				}

				return true;
			} else {
				deltaSQRT = Math.sqrt(delta);
				t0 = (-b + deltaSQRT) / (2 * a);
				t1 = (-b - deltaSQRT) / (2 * a);
				let intersecting = false;

				if (0 <= t0 && t0 <= 1) {
					if (result != null) {
						result.push(p0.x + t0 * (p1.x - p0.x), p0.y + t0 * (p1.y - p0.y), t0);
					}

					intersecting = true;
				}

				if (0 <= t1 && t1 <= 1) {
					if (result != null) {
						result.push(p0.x + t1 * (p1.x - p0.x), p0.y + t1 * (p1.y - p0.y), t1);
					}

					intersecting = true;
				}

				return intersecting;
			}
		},

		/*intersectionsLineCircle: function(p0x,p0y,p1x,p1y,cx,cy,r,result) {
				let p0xSQD = p0x * p0x;
				let p0ySQD = p0y * p0y;
				let a = p1y * p1y - 2 * p1y * p0y + p0ySQD + p1x * p1x - 2 * p1x * p0x + p0xSQD;
				let b = 2 * p0y * cy - 2 * p0xSQD + 2 * p1y * p0y - 2 * p0ySQD + 2 * p1x * p0x - 2 * p1x * cx + 2 * p0x * cx - 2 * p1y * cy;
				let c = p0ySQD + cy * cy + cx * cx - 2 * p0y * cy - 2 * p0x * cx + p0xSQD - r * r;
				let delta = b * b - 4 * a * c;
				let deltaSQRT, t0, t1;
				if(delta < 0) return false; 
				else if(delta == 0) {
						t0 = -b / (2 * a);
						result.push( p0x + t0*(p1x - p0x), p0y + t0*(p1y - p0y),	t0 );
				} else if(delta > 0) {
						deltaSQRT = Math.sqrt(delta);
						t0 = (-b + deltaSQRT) / (2 * a);
						t1 = (-b - deltaSQRT) / (2 * a);
						result.push( p0x + t0*(p1x - p0x), p0y + t0*(p1y - p0y), t0, p0x + t1*(p1x - p0x), p0y + t1*(p1y - p0y), t1 );
				}
				return true;
		},*/
		tangentsPointToCircle: function (p, c, r, result) {
			let c2 = p.clone().add(c).mul(0.5);
			let r2 = 0.5 * SquaredSqrt(p.x - c.x, p.y - c.y);
			return Geom2D.intersections2Circles(c2, r2, c, r, result);
		},
		tangentsCrossCircleToCircle: function (r, c1, c2, result) {
			let distance = SquaredSqrt(c1.x - c2.x, c1.y - c2.y);
			let radius = distance * 0.25;
			let center = c2.clone().sub(c1).mul(0.25).add(c1);

			if (Geom2D.intersections2Circles(c1, r, center, radius, result)) {
				let t1x = result[0];
				let t1y = result[1];
				let t2x = result[2];
				let t2y = result[3];
				let mid = c1.clone().add(c2).mul(0.5);
				let dotProd = (t1x - mid.x) * (c2.y - c1.y) + (t1y - mid.y) * (-c2.x + c1.x);
				let tproj = dotProd / (distance * distance);
				let projx = mid.x + tproj * (c2.y - c1.y);
				let projy = mid.y - tproj * (c2.x - c1.x);
				let t4x = 2 * projx - t1x;
				let t4y = 2 * projy - t1y;
				let t3x = t4x + t2x - t1x;
				let t3y = t2y + t4y - t1y;
				result.push(t3x, t3y, t4x, t4y);
				return true;
			} else return false;
		},
		tangentsParalCircleToCircle: function (r, c1, c2, result) {
			let distance = SquaredSqrt(c1.x - c2.x, c1.y - c2.y);
			let invD = 1 / distance;
			let t1x = c1.x + r * (c2.y - c1.y) * invD;
			let t1y = c1.y + r * (-c2.x + c1.x) * invD;
			let t2x = 2 * c1.x - t1x;
			let t2y = 2 * c1.y - t1y;
			let t3x = t2x + c2.x - c1.x;
			let t3y = t2y + c2.y - c1.y;
			let t4x = t1x + c2.x - c1.x;
			let t4y = t1y + c2.y - c1.y;
			result.push(t1x, t1y, t2x, t2y, t3x, t3y, t4x, t4y);
		},

		/*distanceSquaredPointToLine: function(p,a,b) {
				let a_b_squared = Squared(b.x - a.x, b.y - a.y);
				let dotProduct = (p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y);
				let p_a_squared = Squared(a.x - p.x, a.y - p.y);
				return p_a_squared - dotProduct * dotProduct / a_b_squared;
		},*/
		distanceSquaredPointToSegment: function (p, a, b) {
			let a_b_squared = Squared(b.x - a.x, b.y - a.y);
			let dotProduct = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / a_b_squared;
			if (dotProduct < 0) return Squared(p.x - a.x, p.y - a.y);else if (dotProduct <= 1) {
				let p_a_squared = Squared(a.x - p.x, a.y - p.y);
				return p_a_squared - dotProduct * dotProduct * a_b_squared;
			} else return Squared(p.x - b.x, p.y - b.y);
		},
		distanceSquaredVertexToEdge: function (vertex, edge) {
			return Geom2D.distanceSquaredPointToSegment(vertex.pos, edge.originVertex.pos, edge.destinationVertex.pos);
		},
		pathLength: function (path) {
			let sumDistance = 0.;
			let fromX = path[0];
			let fromY = path[1];
			let nextX, nextY, x, y, distance;
			let i = 2;
			let l = path.length;

			while (i < l) {
				nextX = path[i];
				nextY = path[i + 1];
				x = nextX - fromX;
				y = nextY - fromY;
				distance = SquaredSqrt(x, y);
				sumDistance += distance;
				fromX = nextX;
				fromY = nextY;
				i += 2;
			}

			return sumDistance;
		}
	};

	class Mesh2D {
		constructor(width, height) {
			this.id = IDX.get('mesh2D');
			this.__objectsUpdateInProgress = false;
			this.width = width;
			this.height = height;
			this.clipping = true;
			this._edges = [];
			this._faces = [];
			this._objects = [];
			this._vertices = [];
			this._constraintShapes = []; //this.__constraintShapes = []; // ??

			this.constraintShape = null;
			this.__edgesToCheck = [];
			this.__centerVertex = null;
			this.AR_vertex = null;
			this.AR_edge = null;
			this.isRedraw = true;
		}
		/*get __constraintShapes(){
				return _constraintShapes
		}*/


		deDuplicEdge() {
			let edges = this._edges;
			let lng = edges.length;
			let i, j, a, b, m, n;

			for (j = lng; j;) {
				b = edges[--j];
				a = edges[--j];

				for (i = j; i;) {
					n = edges[--i];
					m = edges[--i];

					if (a === m && b === n || a === n && b === m) {
						edges.splice(j, 2);
						edges.splice(i, 2);
						break;
					}
				}
			}
		}

		clear(notObjects) {
			while (this._vertices.length > 0) this._vertices.pop().dispose();

			this._vertices = [];

			while (this._edges.length > 0) this._edges.pop().dispose();

			this._edges = [];

			while (this._faces.length > 0) this._faces.pop().dispose();

			this._faces = [];

			while (this._constraintShapes.length > 0) this._constraintShapes.pop().dispose();

			this._constraintShapes = [];

			if (!notObjects) {
				while (this._objects.length > 0) this._objects.pop().dispose();

				this._objects = [];
			}

			this.__edgesToCheck = [];
			this.__centerVertex = null;
			this.AR_vertex = null;
			this.AR_edge = null;
		}

		dispose() {
			while (this._vertices.length > 0) this._vertices.pop().dispose();

			this._vertices = null;

			while (this._edges.length > 0) this._edges.pop().dispose();

			this._edges = null;

			while (this._faces.length > 0) this._faces.pop().dispose();

			this._faces = null;

			while (this._constraintShapes.length > 0) this._constraintShapes.pop().dispose();

			this._constraintShapes = null;

			while (this._objects.length > 0) this._objects.pop().dispose();

			this._objects = null;
			this.__edgesToCheck = null;
			this.__centerVertex = null;
			this.AR_vertex = null;
			this.AR_edge = null;
		}

		buildFromRecord(rec) {
			let positions = rec.split(";");
			let l = positions.length,
					i = 0;

			while (i < l) {
				this.insertConstraintSegment(parseFloat(positions[i]), parseFloat(positions[i + 1]), parseFloat(positions[i + 2]), parseFloat(positions[i + 3]));
				i += 4;
			}
		}

		insertObject(o) {
			if (o.constraintShape !== null) this.deleteObject(o);
			let shape = new Shape();
			let segment;
			let coordinates = o.coordinates;
			o.updateMatrixFromValues();
			let m = o.matrix || new Matrix2D();
			let p1 = new Point();
			let p2 = new Point();
			let l = coordinates.length,
					i = 0; //while(i < l) {

			for (i = 0; i < l; i += 4) {
				p1.set(coordinates[i], coordinates[i + 1]).transformMat2D(m);
				p2.set(coordinates[i + 2], coordinates[i + 3]).transformMat2D(m);
				segment = this.insertConstraintSegment(p1.x, p1.y, p2.x, p2.y);

				if (segment != null) {
					segment.fromShape = shape;
					shape.segments.push(segment);
				} //i += 4;

			}

			this._constraintShapes.push(shape);

			o.constraintShape = shape;
			if (!this.__objectsUpdateInProgress) this._objects.push(o); //console.log(this._objects.length)
		}

		deleteObject(o) {
			if (o.constraintShape === null) return;
			this.deleteConstraintShape(o.constraintShape);
			o.constraintShape = null; //o._constraintShape = null

			if (!this.__objectsUpdateInProgress) {
				let index = this._objects.indexOf(o);

				this._objects.splice(index, 1);
			}
		}

		updateAll() {
			//this.__objectsUpdateInProgress = true
			this.clear(true);
			let i = this._objects.length,
					n = 0,
					ob;

			while (i--) {
				ob = this._objects[n];
				ob.build(); //ob._constraintShape = null

				this.insertObject(ob);
				n++;
			} //this.__objectsUpdateInProgress = false

		}

		updateObjects() {
			this.__objectsUpdateInProgress = true;
			let i = this._objects.length,
					n = 0,
					ob; //this._objects[0].hasChanged = true

			while (i--) {
				ob = this._objects[n];

				if (ob.hasChanged) {
					this.deleteObject(ob);
					this.insertObject(ob);
					ob.hasChanged = false; //this.isRedraw = true
				}

				n++;
			}

			this.__objectsUpdateInProgress = false; //console.log('updated')
		} // insert a new collection of constrained edges.
		// Coordinates parameter is a list with form [x0, y0, x1, y1, x2, y2, x3, y3, x4, y4, ....]
		// where each 4-uple sequence (xi, yi, xi+1, yi+1) is a constraint segment (with i % 4 == 0)
		// and where each couple sequence (xi, yi) is a point.
		// Segments are not necessary connected.
		// Segments can overlap (then they will be automaticaly subdivided).


		insertConstraintShape(coordinates) {
			let shape = new Shape();
			let segment = null;
			let l = coordinates.length,
					i = 0;

			while (i < l) {
				segment = this.insertConstraintSegment(coordinates[i], coordinates[i + 1], coordinates[i + 2], coordinates[i + 3]);

				if (segment != null) {
					segment.fromShape = shape;
					shape.segments.push(segment);
				}

				i += 4;
			}

			this._constraintShapes.push(shape);

			return shape;
		}

		deleteConstraintShape(shape) {
			let i = shape.segments.length,
					n = 0;

			while (i--) {
				this.deleteConstraintSegment(shape.segments[n]);
				n++;
			}

			shape.dispose(); //console.log('yoch', this._constraintShapes.indexOf(shape))

			this._constraintShapes.splice(this._constraintShapes.indexOf(shape), 1);
		}

		insertConstraintSegment(x1, y1, x2, y2) {
			let newX1 = x1;
			let newY1 = y1;
			let newX2 = x2;
			let newY2 = y2;
			if (x1 > this.width && x2 > this.width || x1 < 0 && x2 < 0 || y1 > this.height && y2 > this.height || y1 < 0 && y2 < 0) return null;else {
				let nx = x2 - x1;
				let ny = y2 - y1;
				let tmin = -INFINITY;
				let tmax = INFINITY;

				if (nx != 0.0) {
					let tx1 = (0 - x1) / nx;
					let tx2 = (this.width - x1) / nx;
					tmin = Math.max(tmin, Math.min(tx1, tx2));
					tmax = Math.min(tmax, Math.max(tx1, tx2));
				}

				if (ny != 0.0) {
					let ty1 = (0 - y1) / ny;
					let ty2 = (this.height - y1) / ny;
					tmin = Math.max(tmin, Math.min(ty1, ty2));
					tmax = Math.min(tmax, Math.max(ty1, ty2));
				}

				if (tmax >= tmin) {
					if (tmax < 1) {
						//Clip end point
						newX2 = nx * tmax + x1;
						newY2 = ny * tmax + y1;
					}

					if (tmin > 0) {
						//Clip start point
						newX1 = nx * tmin + x1;
						newY1 = ny * tmin + y1;
					}
				} else return null;
			} // we check the vertices insertions

			let vertexDown = this.insertVertex(newX1, newY1);
			if (vertexDown == null) return null;
			let vertexUp = this.insertVertex(newX2, newY2);
			if (vertexUp == null) return null;
			if (vertexDown.id === vertexUp.id) return null; //if(vertexDown === vertexUp) return null;
			// useful

			let iterVertexToOutEdges = new FromVertexToOutgoingEdges();
			let currVertex;
			let currEdge;

			let segment = new Segment();
			let tempEdgeDownUp = new Edge();
			let tempSdgeUpDown = new Edge();
			tempEdgeDownUp.setDatas(vertexDown, tempSdgeUpDown, null, null, true, true);
			tempSdgeUpDown.setDatas(vertexUp, tempEdgeDownUp, null, null, true, true);
			let intersectedEdges = [];
			let leftBoundingEdges = [];
			let rightBoundingEdges = [];
			let currObjet = {
				type: 3
			};
			let pIntersect = new Point();
			let edgeLeft;
			let newEdgeDownUp;
			let newEdgeUpDown;
			let done = false;
			currVertex = vertexDown;
			currObjet = currVertex; //currObjet = currVertex;

			while (true) {
				done = false;

				if (currObjet.type === 0) {
					// VERTEX
					currVertex = currObjet;
					iterVertexToOutEdges.fromVertex = currVertex;

					while ((currEdge = iterVertexToOutEdges.next()) != null) {
						//if(currEdge.destinationVertex == vertexUp) {
						if (currEdge.destinationVertex.id === vertexUp.id) {
							if (!currEdge.isConstrained) {
								currEdge.isConstrained = true;
								currEdge.oppositeEdge.isConstrained = true;
							}

							currEdge.addFromConstraintSegment(segment);
							currEdge.oppositeEdge.fromConstraintSegments = currEdge.fromConstraintSegments;
							vertexDown.addFromConstraintSegment(segment);
							vertexUp.addFromConstraintSegment(segment);
							segment.addEdge(currEdge);
							return segment;
						}

						if (Geom2D.distanceSquaredVertexToEdge(currEdge.destinationVertex, tempEdgeDownUp) <= EPSILON_SQUARED) {
							if (!currEdge.isConstrained) {
								currEdge.isConstrained = true;
								currEdge.oppositeEdge.isConstrained = true;
							}

							currEdge.addFromConstraintSegment(segment);
							currEdge.oppositeEdge.fromConstraintSegments = currEdge.fromConstraintSegments;
							vertexDown.addFromConstraintSegment(segment);
							segment.addEdge(currEdge);
							vertexDown = currEdge.destinationVertex;
							tempEdgeDownUp.originVertex = vertexDown;
							currObjet = vertexDown;
							done = true;
							break;
						}
					}

					if (done) continue;
					iterVertexToOutEdges.fromVertex = currVertex;

					while ((currEdge = iterVertexToOutEdges.next()) != null) {
						currEdge = currEdge.nextLeftEdge;

						if (Geom2D.intersections2edges(currEdge, tempEdgeDownUp, pIntersect)) {
							if (currEdge.isConstrained) {
								vertexDown = this.splitEdge(currEdge, pIntersect.x, pIntersect.y);
								iterVertexToOutEdges.fromVertex = currVertex;

								while ((currEdge = iterVertexToOutEdges.next()) != null) {
									//if(currEdge.destinationVertex == vertexDown) {
									if (currEdge.destinationVertex.id === vertexDown.id) {
										currEdge.isConstrained = true;
										currEdge.oppositeEdge.isConstrained = true;
										currEdge.addFromConstraintSegment(segment);
										currEdge.oppositeEdge.fromConstraintSegments = currEdge.fromConstraintSegments;
										segment.addEdge(currEdge);
										break;
									}
								}

								currVertex.addFromConstraintSegment(segment);
								tempEdgeDownUp.originVertex = vertexDown;
								currObjet = vertexDown;
							} else {
								intersectedEdges.push(currEdge);
								leftBoundingEdges.unshift(currEdge.nextLeftEdge);
								rightBoundingEdges.push(currEdge.prevLeftEdge);
								currEdge = currEdge.oppositeEdge;
								currObjet = currEdge;
							}

							break;
						}
					}
				} else if (currObjet.type === 1) {
					// EDGE
					currEdge = currObjet;
					edgeLeft = currEdge.nextLeftEdge;

					if (edgeLeft.destinationVertex.id === vertexUp.id) {
						//if ( edgeLeft.destinationVertex == vertexUp ){
						//trace("end point reached");
						leftBoundingEdges.unshift(edgeLeft.nextLeftEdge);
						rightBoundingEdges.push(edgeLeft);
						newEdgeDownUp = new Edge();
						newEdgeUpDown = new Edge();
						newEdgeDownUp.setDatas(vertexDown, newEdgeUpDown, null, null, true, true);
						newEdgeUpDown.setDatas(vertexUp, newEdgeDownUp, null, null, true, true);
						leftBoundingEdges.push(newEdgeDownUp);
						rightBoundingEdges.push(newEdgeUpDown);
						this.insertNewConstrainedEdge(segment, newEdgeDownUp, intersectedEdges, leftBoundingEdges, rightBoundingEdges);
						return segment;
					} else if (Geom2D.distanceSquaredVertexToEdge(edgeLeft.destinationVertex, tempEdgeDownUp) <= EPSILON_SQUARED) {
						//trace("we met a vertex");
						leftBoundingEdges.unshift(edgeLeft.nextLeftEdge);
						rightBoundingEdges.push(edgeLeft);
						newEdgeDownUp = new Edge();
						newEdgeUpDown = new Edge();
						newEdgeDownUp.setDatas(vertexDown, newEdgeUpDown, null, null, true, true);
						newEdgeUpDown.setDatas(edgeLeft.destinationVertex, newEdgeDownUp, null, null, true, true);
						leftBoundingEdges.push(newEdgeDownUp);
						rightBoundingEdges.push(newEdgeUpDown);
						this.insertNewConstrainedEdge(segment, newEdgeDownUp, intersectedEdges, leftBoundingEdges, rightBoundingEdges);
						intersectedEdges.splice(0, intersectedEdges.length);
						leftBoundingEdges.splice(0, leftBoundingEdges.length);
						rightBoundingEdges.splice(0, rightBoundingEdges.length);
						vertexDown = edgeLeft.destinationVertex;
						tempEdgeDownUp.originVertex = vertexDown;
						currObjet = vertexDown;
					} else {
						if (Geom2D.intersections2edges(edgeLeft, tempEdgeDownUp, pIntersect)) {
							//trace("1st left edge intersected");
							if (edgeLeft.isConstrained) {
								//trace("edge is constrained");
								currVertex = this.splitEdge(edgeLeft, pIntersect.x, pIntersect.y);
								iterVertexToOutEdges.fromVertex = currVertex;

								while ((currEdge = iterVertexToOutEdges.next()) != null) {
									if (currEdge.destinationVertex == leftBoundingEdges[0].originVertex) leftBoundingEdges.unshift(currEdge);
									if (currEdge.destinationVertex == rightBoundingEdges[rightBoundingEdges.length - 1].destinationVertex) rightBoundingEdges.push(currEdge.oppositeEdge);
								}

								newEdgeDownUp = new Edge();
								newEdgeUpDown = new Edge();
								newEdgeDownUp.setDatas(vertexDown, newEdgeUpDown, null, null, true, true);
								newEdgeUpDown.setDatas(currVertex, newEdgeDownUp, null, null, true, true);
								leftBoundingEdges.push(newEdgeDownUp);
								rightBoundingEdges.push(newEdgeUpDown);
								this.insertNewConstrainedEdge(segment, newEdgeDownUp, intersectedEdges, leftBoundingEdges, rightBoundingEdges);
								intersectedEdges.splice(0, intersectedEdges.length);
								leftBoundingEdges.splice(0, leftBoundingEdges.length);
								rightBoundingEdges.splice(0, rightBoundingEdges.length);
								vertexDown = currVertex;
								tempEdgeDownUp.originVertex = vertexDown;
								currObjet = vertexDown;
							} else {
								//trace("edge is not constrained");
								intersectedEdges.push(edgeLeft);
								leftBoundingEdges.unshift(edgeLeft.nextLeftEdge);
								currEdge = edgeLeft.oppositeEdge; // we keep the edge from left to right

								currObjet = currEdge;
							}
						} else {
							//trace("2nd left edge intersected");
							edgeLeft = edgeLeft.nextLeftEdge;
							Geom2D.intersections2edges(edgeLeft, tempEdgeDownUp, pIntersect);

							if (edgeLeft.isConstrained) {
								//trace("edge is constrained");
								currVertex = this.splitEdge(edgeLeft, pIntersect.x, pIntersect.y);
								iterVertexToOutEdges.fromVertex = currVertex;
								/*while ( (currEdge = iterVertexToOutEdges.next()) != null ){
										if (currEdge.destinationVertex == leftBoundingEdges[0].originVertex) leftBoundingEdges.unshift(currEdge);
										if (currEdge.destinationVertex == rightBoundingEdges[rightBoundingEdges.length-1].destinationVertex) rightBoundingEdges.push(currEdge.oppositeEdge);
								}*/

								while ((currEdge = iterVertexToOutEdges.next()) != null) {
									if (currEdge.destinationVertex.id === leftBoundingEdges[0].originVertex.id) leftBoundingEdges.unshift(currEdge);
									if (currEdge.destinationVertex.id === rightBoundingEdges[rightBoundingEdges.length - 1].destinationVertex.id) rightBoundingEdges.push(currEdge.oppositeEdge);
								}

								newEdgeDownUp = new Edge();
								newEdgeUpDown = new Edge();
								newEdgeDownUp.setDatas(vertexDown, newEdgeUpDown, null, null, true, true);
								newEdgeUpDown.setDatas(currVertex, newEdgeDownUp, null, null, true, true);
								leftBoundingEdges.push(newEdgeDownUp);
								rightBoundingEdges.push(newEdgeUpDown);
								this.insertNewConstrainedEdge(segment, newEdgeDownUp, intersectedEdges, leftBoundingEdges, rightBoundingEdges);
								intersectedEdges.splice(0, intersectedEdges.length);
								leftBoundingEdges.splice(0, leftBoundingEdges.length);
								rightBoundingEdges.splice(0, rightBoundingEdges.length);
								vertexDown = currVertex;
								tempEdgeDownUp.originVertex = vertexDown;
								currObjet = vertexDown;
							} else {
								//trace("edge is not constrained");
								intersectedEdges.push(edgeLeft);
								rightBoundingEdges.push(edgeLeft.prevLeftEdge);
								currEdge = edgeLeft.oppositeEdge; // we keep the edge from left to right

								currObjet = currEdge;
							}
						}
					}
				} else {
					Log('not finding');
					return null;
				}
			} //return segment;

		} // fromSegment, edgeDownUp, intersectedEdges, leftBoundingEdges, rightBoundingEdges


		insertNewConstrainedEdge(seg, edge, iEdge, lEdge, rEdge) {
			this._edges.push(edge);

			this._edges.push(edge.oppositeEdge);

			edge.addFromConstraintSegment(seg);
			edge.oppositeEdge.fromConstraintSegments = edge.fromConstraintSegments;
			seg.addEdge(edge);
			edge.originVertex.addFromConstraintSegment(seg);
			edge.destinationVertex.addFromConstraintSegment(seg);
			this.untriangulate(iEdge);
			this.triangulate(lEdge, true);
			this.triangulate(rEdge, true);
		}

		deleteConstraintSegment(segment) {
			let vertexToDelete = [];
			let edge = null;
			let vertex;
			let l = segment.edges.length,
					i = 0;

			while (i < l) {
				edge = segment.edges[i];
				edge.removeFromConstraintSegment(segment);

				if (edge.fromConstraintSegments.length == 0) {
					edge.isConstrained = false;
					edge.oppositeEdge.isConstrained = false;
				}

				vertex = edge.originVertex;
				vertex.removeFromConstraintSegment(segment);
				vertexToDelete.push(vertex);
				i++;
			}

			vertex = edge.destinationVertex;
			vertex.removeFromConstraintSegment(segment);
			vertexToDelete.push(vertex);
			l = vertexToDelete.length;
			i = 0;

			while (i < l) {
				this.deleteVertex(vertexToDelete[i]);
				i++;
			}

			segment.dispose();
		}

		check() {
			let l = this._edges.length,
					i = 0;

			while (i < l) {
				if (this._edges[i].nextLeftEdge == null) {
					Log("!!! missing nextLeftEdge");
					return;
				}

				i++;
			}

			Log("check OK");
		}

		insertVertex(x, y) {
			if (x < 0 || y < 0 || x > this.width || y > this.height) return null;

			this.__edgesToCheck.splice(0, this.__edgesToCheck.length);

			let inObject = Geom2D.locatePosition(new Point(x, y), this);
			let newVertex = null;

			switch (inObject.type) {
				case 0:
					let vertex = inObject;
					newVertex = vertex;
					break;

				case 1:
					let edge = inObject;
					newVertex = this.splitEdge(edge, x, y);
					break;

				case 2:
					let face = inObject;
					newVertex = this.splitFace(face, x, y);
					break;
			}

			this.restoreAsDelaunay();
			return newVertex;
		}

		flipEdge(edge) {
			let eBot_Top = edge;
			let eTop_Bot = edge.oppositeEdge;
			let eLeft_Right = new Edge();
			let eRight_Left = new Edge();
			let eTop_Left = eBot_Top.nextLeftEdge;
			let eLeft_Bot = eTop_Left.nextLeftEdge;
			let eBot_Right = eTop_Bot.nextLeftEdge;
			let eRight_Top = eBot_Right.nextLeftEdge;
			let vBot = eBot_Top.originVertex;
			let vTop = eTop_Bot.originVertex;
			let vLeft = eLeft_Bot.originVertex;
			let vRight = eRight_Top.originVertex;
			let fLeft = eBot_Top.leftFace;
			let fRight = eTop_Bot.leftFace;
			let fBot = new Face();
			let fTop = new Face(); // add the new edges

			this._edges.push(eLeft_Right);

			this._edges.push(eRight_Left); // add the new faces


			this._faces.push(fTop);

			this._faces.push(fBot); // set vertex, edge and face references for the new LEFT_RIGHT and RIGHT-LEFT edges


			eLeft_Right.setDatas(vLeft, eRight_Left, eRight_Top, fTop, edge.isReal, edge.isConstrained);
			eRight_Left.setDatas(vRight, eLeft_Right, eLeft_Bot, fBot, edge.isReal, edge.isConstrained); // set edge references for the new TOP and BOTTOM faces

			fTop.setDatas(eLeft_Right);
			fBot.setDatas(eRight_Left); // check the edge references of TOP and BOTTOM vertice
			//if(vTop.edge === eTop_Bot) vTop.setDatas(eTop_Left);
			//if(vBot.edge === eBot_Top) vBot.setDatas(eBot_Right);

			if (vTop.edge.id === eTop_Bot.id) vTop.setDatas(eTop_Left);
			if (vBot.edge.id === eBot_Top.id) vBot.setDatas(eBot_Right); // set the new edge and face references for the 4 bouding edges

			eTop_Left.nextLeftEdge = eLeft_Right;
			eTop_Left.leftFace = fTop;
			eLeft_Bot.nextLeftEdge = eBot_Right;
			eLeft_Bot.leftFace = fBot;
			eBot_Right.nextLeftEdge = eRight_Left;
			eBot_Right.leftFace = fBot;
			eRight_Top.nextLeftEdge = eTop_Left;
			eRight_Top.leftFace = fTop; // remove the old TOP-BOTTOM and BOTTOM-TOP edges

			this._edges.splice(this._edges.indexOf(eBot_Top), 1);

			this._edges.splice(this._edges.indexOf(eTop_Bot), 1);

			eBot_Top.dispose();
			eTop_Bot.dispose(); // remove the old LEFT and RIGHT faces				

			this._faces.splice(this._faces.indexOf(fLeft), 1);

			this._faces.splice(this._faces.indexOf(fRight), 1);

			fLeft.dispose();
			fRight.dispose();
			return eRight_Left;
		}

		splitEdge(edge, x, y) {
			this.__edgesToCheck.splice(0, this.__edgesToCheck.length);

			let eLeft_Right = edge;
			let eRight_Left = eLeft_Right.oppositeEdge;
			let eRight_Top = eLeft_Right.nextLeftEdge;
			let eTop_Left = eRight_Top.nextLeftEdge;
			let eLeft_Bot = eRight_Left.nextLeftEdge;
			let eBot_Right = eLeft_Bot.nextLeftEdge;
			let vTop = eTop_Left.originVertex;
			let vLeft = eLeft_Right.originVertex;
			let vBot = eBot_Right.originVertex;
			let vRight = eRight_Left.originVertex;
			let fTop = eLeft_Right.leftFace;
			let fBot = eRight_Left.leftFace; // check distance from the position to edge end points

			if ((vLeft.pos.x - x) * (vLeft.pos.x - x) + (vLeft.pos.y - y) * (vLeft.pos.y - y) <= EPSILON_SQUARED) return vLeft;
			if ((vRight.pos.x - x) * (vRight.pos.x - x) + (vRight.pos.y - y) * (vRight.pos.y - y) <= EPSILON_SQUARED) return vRight; // create new objects

			let vCenter = new Vertex();
			let eTop_Center = new Edge();
			let eCenter_Top = new Edge();
			let eBot_Center = new Edge();
			let eCenter_Bot = new Edge();
			let eLeft_Center = new Edge();
			let eCenter_Left = new Edge();
			let eRight_Center = new Edge();
			let eCenter_Right = new Edge();
			let fTopLeft = new Face();
			let fBotLeft = new Face();
			let fBotRight = new Face();
			let fTopRight = new Face(); // add the new vertex

			this._vertices.push(vCenter); // add the new edges


			this._edges.push(eCenter_Top);

			this._edges.push(eTop_Center);

			this._edges.push(eCenter_Left);

			this._edges.push(eLeft_Center);

			this._edges.push(eCenter_Bot);

			this._edges.push(eBot_Center);

			this._edges.push(eCenter_Right);

			this._edges.push(eRight_Center); // add the new faces


			this._faces.push(fTopRight);

			this._faces.push(fBotRight);

			this._faces.push(fBotLeft);

			this._faces.push(fTopLeft); // set pos and edge reference for the new CENTER vertex


			vCenter.setDatas(fTop.isReal ? eCenter_Top : eCenter_Bot);
			vCenter.pos.x = x;
			vCenter.pos.y = y;
			Geom2D.projectOrthogonaly(vCenter.pos, eLeft_Right); // set the new vertex, edge and face references for the new 8 center crossing edges

			eCenter_Top.setDatas(vCenter, eTop_Center, eTop_Left, fTopLeft, fTop.isReal);
			eTop_Center.setDatas(vTop, eCenter_Top, eCenter_Right, fTopRight, fTop.isReal);
			eCenter_Left.setDatas(vCenter, eLeft_Center, eLeft_Bot, fBotLeft, edge.isReal, edge.isConstrained);
			eLeft_Center.setDatas(vLeft, eCenter_Left, eCenter_Top, fTopLeft, edge.isReal, edge.isConstrained);
			eCenter_Bot.setDatas(vCenter, eBot_Center, eBot_Right, fBotRight, fBot.isReal);
			eBot_Center.setDatas(vBot, eCenter_Bot, eCenter_Left, fBotLeft, fBot.isReal);
			eCenter_Right.setDatas(vCenter, eRight_Center, eRight_Top, fTopRight, edge.isReal, edge.isConstrained);
			eRight_Center.setDatas(vRight, eCenter_Right, eCenter_Bot, fBotRight, edge.isReal, edge.isConstrained); // set the new edge references for the new 4 faces

			fTopLeft.setDatas(eCenter_Top, fTop.isReal);
			fBotLeft.setDatas(eCenter_Left, fBot.isReal);
			fBotRight.setDatas(eCenter_Bot, fBot.isReal);
			fTopRight.setDatas(eCenter_Right, fTop.isReal); // check the edge references of LEFT and RIGHT vertices
			//if(vLeft.edge === eLeft_Right) vLeft.setDatas(eLeft_Center);
			//if(vRight.edge === eRight_Left) vRight.setDatas(eRight_Center);

			if (vLeft.edge.id === eLeft_Right.id) vLeft.setDatas(eLeft_Center);
			if (vRight.edge.id === eRight_Left.id) vRight.setDatas(eRight_Center); // set the new edge and face references for the 4 bounding edges

			eTop_Left.nextLeftEdge = eLeft_Center;
			eTop_Left.leftFace = fTopLeft;
			eLeft_Bot.nextLeftEdge = eBot_Center;
			eLeft_Bot.leftFace = fBotLeft;
			eBot_Right.nextLeftEdge = eRight_Center;
			eBot_Right.leftFace = fBotRight;
			eRight_Top.nextLeftEdge = eTop_Center;
			eRight_Top.leftFace = fTopRight; // if the edge was constrained, we must:
			// - add the segments the edge is from to the 2 new
			// - update the segments the edge is from by deleting the old edge and inserting the 2 new
			// - add the segments the edge is from to the new vertex

			if (eLeft_Right.isConstrained) {
				let fromSegments = eLeft_Right.fromConstraintSegments;
				eLeft_Center.fromConstraintSegments = fromSegments.slice(0);
				eCenter_Left.fromConstraintSegments = eLeft_Center.fromConstraintSegments;
				eCenter_Right.fromConstraintSegments = fromSegments.slice(0);
				eRight_Center.fromConstraintSegments = eCenter_Right.fromConstraintSegments;
				let edges;
				let index; //let n = 0;

				let l = eLeft_Right.fromConstraintSegments.length,
						i = 0;

				while (i < l) {
					//i = n++;
					edges = eLeft_Right.fromConstraintSegments[i].edges;
					index = edges.indexOf(eLeft_Right);

					if (index != -1) {
						edges.splice(index, 1, eLeft_Center, eCenter_Right);
					} else {
						edges.splice(edges.indexOf(eRight_Left), 1, eRight_Center, eCenter_Left);
					}

					i++;
				}

				vCenter.fromConstraintSegments = fromSegments.slice(0);
			} // remove the old LEFT-RIGHT and RIGHT-LEFT edges				


			this._edges.splice(this._edges.indexOf(eLeft_Right), 1);

			this._edges.splice(this._edges.indexOf(eRight_Left), 1);

			eLeft_Right.dispose();
			eRight_Left.dispose(); // remove the old TOP and BOTTOM faces

			this._faces.splice(this._faces.indexOf(fTop), 1);

			this._faces.splice(this._faces.indexOf(fBot), 1);

			fTop.dispose();
			fBot.dispose(); // add new bounds references for Delaunay restoring

			this.__centerVertex = vCenter;

			this.__edgesToCheck.push(eTop_Left);

			this.__edgesToCheck.push(eLeft_Bot);

			this.__edgesToCheck.push(eBot_Right);

			this.__edgesToCheck.push(eRight_Top);

			return vCenter;
		}

		splitFace(face, x, y) {
			this.__edgesToCheck.splice(0, this.__edgesToCheck.length);

			let eTop_Left = face.edge;
			let eLeft_Right = eTop_Left.nextLeftEdge;
			let eRight_Top = eLeft_Right.nextLeftEdge;
			let vTop = eTop_Left.originVertex;
			let vLeft = eLeft_Right.originVertex;
			let vRight = eRight_Top.originVertex; // create new objects

			let vCenter = new Vertex();
			let eTop_Center = new Edge();
			let eCenter_Top = new Edge();
			let eLeft_Center = new Edge();
			let eCenter_Left = new Edge();
			let eRight_Center = new Edge();
			let eCenter_Right = new Edge();
			let fTopLeft = new Face();
			let fBot = new Face();
			let fTopRight = new Face(); // add the new vertex

			this._vertices.push(vCenter); // add the new edges


			this._edges.push(eTop_Center);

			this._edges.push(eCenter_Top);

			this._edges.push(eLeft_Center);

			this._edges.push(eCenter_Left);

			this._edges.push(eRight_Center);

			this._edges.push(eCenter_Right); // add the new faces


			this._faces.push(fTopLeft);

			this._faces.push(fBot);

			this._faces.push(fTopRight); // set pos and edge reference for the new CENTER vertex


			vCenter.setDatas(eCenter_Top);
			vCenter.pos.x = x;
			vCenter.pos.y = y; // set the new vertex, edge and face references for the new 6 center crossing edges

			eTop_Center.setDatas(vTop, eCenter_Top, eCenter_Right, fTopRight);
			eCenter_Top.setDatas(vCenter, eTop_Center, eTop_Left, fTopLeft);
			eLeft_Center.setDatas(vLeft, eCenter_Left, eCenter_Top, fTopLeft);
			eCenter_Left.setDatas(vCenter, eLeft_Center, eLeft_Right, fBot);
			eRight_Center.setDatas(vRight, eCenter_Right, eCenter_Left, fBot);
			eCenter_Right.setDatas(vCenter, eRight_Center, eRight_Top, fTopRight); // set the new edge references for the new 3 faces

			fTopLeft.setDatas(eCenter_Top);
			fBot.setDatas(eCenter_Left);
			fTopRight.setDatas(eCenter_Right); // set the new edge and face references for the 3 bounding edges

			eTop_Left.nextLeftEdge = eLeft_Center;
			eTop_Left.leftFace = fTopLeft;
			eLeft_Right.nextLeftEdge = eRight_Center;
			eLeft_Right.leftFace = fBot;
			eRight_Top.nextLeftEdge = eTop_Center;
			eRight_Top.leftFace = fTopRight; // we remove the old face

			this._faces.splice(this._faces.indexOf(face), 1);

			face.dispose(); // add new bounds references for Delaunay restoring

			this.__centerVertex = vCenter;

			this.__edgesToCheck.push(eTop_Left);

			this.__edgesToCheck.push(eLeft_Right);

			this.__edgesToCheck.push(eRight_Top);

			return vCenter;
		}

		restoreAsDelaunay() {
			let edge;

			while (this.__edgesToCheck.length > 0) {
				edge = this.__edgesToCheck.shift();

				if (edge.isReal && !edge.isConstrained && !Geom2D.isDelaunay(edge)) {
					//if(edge.nextLeftEdge.destinationVertex == this.__centerVertex) {
					if (edge.nextLeftEdge.destinationVertex.id === this.__centerVertex.id) {
						this.__edgesToCheck.push(edge.nextRightEdge);

						this.__edgesToCheck.push(edge.prevRightEdge);
					} else {
						this.__edgesToCheck.push(edge.nextLeftEdge);

						this.__edgesToCheck.push(edge.prevLeftEdge);
					}

					this.flipEdge(edge);
				}
			}
		} // Delete a vertex IF POSSIBLE and then fill the hole with a new triangulation.
		// A vertex can be deleted if:
		// - it is free of constraint segment (no adjacency to any constrained edge)
		// - it is adjacent to exactly 2 contrained edges and is not an end point of any constraint segment


		deleteVertex(vertex) {
			let freeOfConstraint;
			let iterEdges = new FromVertexToOutgoingEdges();
			iterEdges.fromVertex = vertex;
			iterEdges.realEdgesOnly = false;
			let edge;
			let outgoingEdges = [];
			freeOfConstraint = vertex.fromConstraintSegments.length == 0 ? true : false;
			let bound = [];
			let realA = false;
			let realB = false;
			let boundA = [];
			let boundB = [];

			if (freeOfConstraint) {
				//while(edge = iterEdges.next()) {
				while ((edge = iterEdges.next()) != null) {
					outgoingEdges.push(edge);
					bound.push(edge.nextLeftEdge);
				}
			} else {
				// we check if the vertex is an end point of a constraint segment
				let edges;
				let _g1 = 0;
				let _g = vertex.fromConstraintSegments.length;

				while (_g1 < _g) {
					let i1 = _g1++;
					edges = vertex.fromConstraintSegments[i1].edges; //if(edges[0].originVertex == vertex || edges[edges.length - 1].destinationVertex == vertex) return false;

					if (edges[0].originVertex.id === vertex.id || edges[edges.length - 1].destinationVertex.id === vertex.id) return false;
				} // we check the count of adjacent constrained edges


				let count = 0; //while(edge = iterEdges.next()) {

				while ((edge = iterEdges.next()) != null) {
					outgoingEdges.push(edge);

					if (edge.isConstrained) {
						count++;
						if (count > 2) return false;
					}
				} // if not disqualified, then we can process


				boundA = [];
				boundB = [];
				let constrainedEdgeA = null;
				let constrainedEdgeB = null;
				let edgeA = new Edge();
				let edgeB = new Edge();

				this._edges.push(edgeA);

				this._edges.push(edgeB);

				let _g11 = 0;
				let _g2 = outgoingEdges.length;

				while (_g11 < _g2) {
					let i2 = _g11++;
					edge = outgoingEdges[i2];

					if (edge.isConstrained) {
						if (constrainedEdgeA == null) {
							edgeB.setDatas(edge.destinationVertex, edgeA, null, null, true, true);
							boundA.push(edgeA);
							boundA.push(edge.nextLeftEdge);
							boundB.push(edgeB);
							constrainedEdgeA = edge;
						} else if (constrainedEdgeB == null) {
							edgeA.setDatas(edge.destinationVertex, edgeB, null, null, true, true);
							boundB.push(edge.nextLeftEdge);
							constrainedEdgeB = edge;
						}
					} else if (constrainedEdgeA == null) boundB.push(edge.nextLeftEdge);else if (constrainedEdgeB == null) boundA.push(edge.nextLeftEdge);else boundB.push(edge.nextLeftEdge);
				} // keep infos about reality


				realA = constrainedEdgeA.leftFace.isReal;
				realB = constrainedEdgeB.leftFace.isReal; // we update the segments infos

				edgeA.fromConstraintSegments = constrainedEdgeA.fromConstraintSegments.slice(0);
				edgeB.fromConstraintSegments = edgeA.fromConstraintSegments;
				let index;
				let _g12 = 0;
				let _g3 = vertex.fromConstraintSegments.length;

				while (_g12 < _g3) {
					let i3 = _g12++;
					edges = vertex.fromConstraintSegments[i3].edges;
					index = edges.indexOf(constrainedEdgeA);

					if (index != -1) {
						edges.splice(index - 1, 2, edgeA); //edges.splice(index - 1,2);
						//edges.splice(index - 1,0,edgeA);
					} else {
						edges.splice(edges.indexOf(constrainedEdgeB) - 1, 2, edgeB); //let index2 = edges.indexOf(constrainedEdgeB) - 1;
						//edges.splice(index2,2);
						//edges.splice(index2,0,edgeB);
					}
				}
			} // Deletion of old faces and edges


			let faceToDelete;
			let _g13 = 0;
			let _g4 = outgoingEdges.length;

			while (_g13 < _g4) {
				let i4 = _g13++;
				edge = outgoingEdges[i4];
				faceToDelete = edge.leftFace;

				this._faces.splice(this._faces.indexOf(faceToDelete), 1);

				faceToDelete.dispose();
				edge.destinationVertex.edge = edge.nextLeftEdge;

				this._edges.splice(this._edges.indexOf(edge.oppositeEdge), 1);

				edge.oppositeEdge.dispose();

				this._edges.splice(this._edges.indexOf(edge), 1);

				edge.dispose();
			}

			this._vertices.splice(this._vertices.indexOf(vertex), 1);

			vertex.dispose(); // finally we triangulate

			if (freeOfConstraint) this.triangulate(bound, true);else {
				this.triangulate(boundA, realA);
				this.triangulate(boundB, realB);
			}
			return true;
		} // untriangulate is usually used while a new edge insertion in order to delete the intersected edges
		// edgesList is a list of chained edges oriented from right to left


		untriangulate(edgesList) {
			let verticesCleaned = new Dictionary(1);
			let currEdge;
			let _g1 = 0;
			let _g = edgesList.length;

			while (_g1 < _g) {
				let i1 = _g1++;
				currEdge = edgesList[i1];

				if (verticesCleaned.get(currEdge.originVertex) == null) {
					currEdge.originVertex.edge = currEdge.prevLeftEdge.oppositeEdge;
					verticesCleaned.set(currEdge.originVertex, true);
				}

				if (verticesCleaned.get(currEdge.destinationVertex) == null) {
					currEdge.destinationVertex.edge = currEdge.nextLeftEdge;
					verticesCleaned.set(currEdge.destinationVertex, true);
				}

				this._faces.splice(this._faces.indexOf(currEdge.leftFace), 1);

				currEdge.leftFace.dispose();

				if (i1 == edgesList.length - 1) {
					this._faces.splice(this._faces.indexOf(currEdge.rightFace), 1);

					currEdge.rightFace.dispose();
				}
			}

			verticesCleaned.dispose(); // finally we delete the intersected edges

			let _g11 = 0;
			let _g2 = edgesList.length;

			while (_g11 < _g2) {
				let i2 = _g11++;
				currEdge = edgesList[i2];

				this._edges.splice(this._edges.indexOf(currEdge.oppositeEdge), 1);

				this._edges.splice(this._edges.indexOf(currEdge), 1);

				currEdge.oppositeEdge.dispose();
				currEdge.dispose();
			}
		} // triangulate is usually used to fill the hole after deletion of a vertex from mesh or after untriangulation
		// - bounds is the list of edges in CCW bounding the surface to retriangulate,


		triangulate(bound, isReal) {
			if (bound.length < 2) {
				Log("BREAK ! the hole has less than 2 edges");
				return; // if the hole is a 2 edges polygon, we have a big problem
			} else if (bound.length === 2) {
				Log("BREAK ! the hole has only 2 edges"); // DDLS.Debug.trace("	- edge0: " + bound[0].originVertex.id + " -> " + bound[0].destinationVertex.id,{ fileName : "Mesh.hx", lineNumber : 1404, className : "DDLS.Mesh", methodName : "triangulate"});
				// DDLS.Debug.trace("	- edge1: " + bound[1].originVertex.id + " -> " + bound[1].destinationVertex.id,{ fileName : "Mesh.hx", lineNumber : 1405, className : "DDLS.Mesh", methodName : "triangulate"});

				return; // if the hole is a 3 edges polygon:
			} else if (bound.length === 3) {
				let f = new Face();
				f.setDatas(bound[0], isReal);

				this._faces.push(f);

				bound[0].leftFace = f;
				bound[1].leftFace = f;
				bound[2].leftFace = f;
				bound[0].nextLeftEdge = bound[1];
				bound[1].nextLeftEdge = bound[2];
				bound[2].nextLeftEdge = bound[0]; // if more than 3 edges, we process recursively:
			} else {
				let baseEdge = bound[0];
				let vertexA = baseEdge.originVertex;
				let vertexB = baseEdge.destinationVertex;
				let vertexC;
				let vertexCheck;
				let circumcenter = new Point();
				let radiusSquared = 0;
				let distanceSquared = 0;
				let isDelaunay = false;
				let index = 0;
				let _g1 = 2;
				let _g = bound.length;

				while (_g1 < _g) {
					let i1 = _g1++;
					vertexC = bound[i1].originVertex;

					if (Geom2D.getRelativePosition2(vertexC.pos, baseEdge) == 1) {
						index = i1;
						isDelaunay = true; //DDLS.Geom2D.getCircumcenter(vertexA.pos.x,vertexA.pos.y,vertexB.pos.x,vertexB.pos.y,vertexC.pos.x,vertexC.pos.y,circumcenter);

						Geom2D.getCircumcenter(vertexA.pos, vertexB.pos, vertexC.pos, circumcenter);
						radiusSquared = Squared(vertexA.pos.x - circumcenter.x, vertexA.pos.y - circumcenter.y); // for perfect regular n-sides polygons, checking strict delaunay circumcircle condition is not possible, so we substract EPSILON to circumcircle radius:

						radiusSquared -= EPSILON_SQUARED;
						let _g3 = 2;
						let _g2 = bound.length;

						while (_g3 < _g2) {
							let j = _g3++;

							if (j != i1) {
								vertexCheck = bound[j].originVertex;
								distanceSquared = Squared(vertexCheck.pos.x - circumcenter.x, vertexCheck.pos.y - circumcenter.y);

								if (distanceSquared < radiusSquared) {
									isDelaunay = false;
									break;
								}
							}
						}

						if (isDelaunay) break;
					}
				}

				if (!isDelaunay) {
					// for perfect regular n-sides polygons, checking delaunay circumcircle condition is not possible
					Log("NO DELAUNAY FOUND");
					/*let s = "";
					let _g11 = 0;
					let _g4 = bound.length;
					while(_g11 < _g4) {
							let i2 = _g11++;
							s += bound[i2].originVertex.pos.x + " , ";
							s += bound[i2].originVertex.pos.y + " , ";
							s += bound[i2].destinationVertex.pos.x + " , ";
							s += bound[i2].destinationVertex.pos.y + " , ";
					}*/

					index = 2;
				}

				let edgeA,
						edgeAopp,
						edgeB,
						edgeBopp,
						boundA,
						boundB,
						boundM = [];

				if (index < bound.length - 1) {
					edgeA = new Edge();
					edgeAopp = new Edge();

					this._edges.push(edgeA, edgeAopp); //this._edges.push(edgeAopp);


					edgeA.setDatas(vertexA, edgeAopp, null, null, isReal, false);
					edgeAopp.setDatas(bound[index].originVertex, edgeA, null, null, isReal, false);
					boundA = bound.slice(index);
					boundA.push(edgeA);
					this.triangulate(boundA, isReal);
				}

				if (index > 2) {
					edgeB = new Edge();
					edgeBopp = new Edge();

					this._edges.push(edgeB, edgeBopp); //this._edges.push(edgeBopp);


					edgeB.setDatas(bound[1].originVertex, edgeBopp, null, null, isReal, false);
					edgeBopp.setDatas(bound[index].originVertex, edgeB, null, null, isReal, false);
					boundB = bound.slice(1, index);
					boundB.push(edgeBopp);
					this.triangulate(boundB, isReal);
				}

				if (index === 2) boundM.push(baseEdge, bound[1], edgeAopp);else if (index === bound.length - 1) boundM.push(baseEdge, edgeB, bound[index]);else boundM.push(baseEdge, edgeB, edgeAopp);
				this.triangulate(boundM, isReal);
			} // test
			//this.deDuplicEdge();

		}

		findPositionFromBounds(x, y) {
			if (x <= 0) {
				if (y <= 0) return 1;else if (y >= this.height) return 7;else return 8;
			} else if (x >= this.width) {
				if (y <= 0) return 3;else if (y >= this.height) return 5;else return 4;
			} else if (y <= 0) return 2;else if (y >= this.height) return 6;else return 0;
		} // for drawing


		compute_Data() {
			this.AR_vertex = [];
			this.AR_edge = []; //let data_vertex = [];
			//let data_edges = [];

			let vertex;
			let edge;
			let iterVertices = new FromMeshToVertices();
			iterVertices.fromMesh = this;
			let iterEdges = new FromVertexToIncomingEdges();
			let dictVerticesDone = new Dictionary(1);

			while ((vertex = iterVertices.next()) != null) {
				dictVerticesDone.set(vertex, true);
				if (!this.vertexIsInsideAABB(vertex, this)) continue;
				this.AR_vertex.push(vertex.pos.x, vertex.pos.y);
				iterEdges.fromVertex = vertex;

				while ((edge = iterEdges.next()) != null) {
					if (!dictVerticesDone.get(edge.originVertex)) {
						this.AR_edge = this.AR_edge.concat(edge.getDatas());
					}
				}
			}

			dictVerticesDone.dispose();
			/*this.AR_vertex = new ARRAY( data_vertex );
			this.AR_edge = new ARRAY( data_edges );
				data_vertex = null;
			data_edges = null;*/
		}

		vertexIsInsideAABB(vertex, mesh) {
			return !(vertex.pos.x < 0 || vertex.pos.x > mesh.width || vertex.pos.y < 0 || vertex.pos.y > mesh.height);
		}

	}

	class RectMesh extends Mesh2D {
		constructor(w = 10, h = 10) {
			super(w, h);
			this.w = w;
			this.h = h; //	v0 x---x v1
			//		 |	/|
			//		 | / |
			//		 |/	|
			//	v3 x---x v2

			const v = [];
			const e = [];
			const f = [];
			const s = [];
			let i = 4;

			while (i--) {
				f.push(new Face());
				v.push(new Vertex());
				s.push(new Segment());
				e.push(new Edge(), new Edge(), new Edge());
			}

			const boundShape = new Shape();
			const offset = 10;
			v[0].pos.set(0 - offset, 0 - offset);
			v[1].pos.set(w + offset, 0 - offset);
			v[2].pos.set(w + offset, h + offset);
			v[3].pos.set(0 - offset, h + offset);
			v[0].setDatas(e[0]);
			v[1].setDatas(e[2]);
			v[2].setDatas(e[4]);
			v[3].setDatas(e[6]);
			e[0].setDatas(v[0], e[1], e[2], f[3], true, true); // v0--v1

			e[1].setDatas(v[1], e[0], e[7], f[0], true, true); // v1--v0

			e[2].setDatas(v[1], e[3], e[11], f[3], true, true); // v1--v2

			e[3].setDatas(v[2], e[2], e[8], f[1], true, true); // v2--v1

			e[4].setDatas(v[2], e[5], e[6], f[2], true, true); // v2--v3

			e[5].setDatas(v[3], e[4], e[3], f[1], true, true); // v3--v2

			e[6].setDatas(v[3], e[7], e[10], f[2], true, true); // v3--v0

			e[7].setDatas(v[0], e[6], e[9], f[0], true, true); // v0--v3

			e[8].setDatas(v[1], e[9], e[5], f[1], true, false); // v1--v3 diagonal edge

			e[9].setDatas(v[3], e[8], e[1], f[0], true, false); // v3--v1 diagonal edge

			e[10].setDatas(v[0], e[11], e[4], f[2], false, false); // v0--v2 imaginary edge

			e[11].setDatas(v[2], e[10], e[0], f[3], false, false); // v2--v0 imaginary edge

			f[0].setDatas(e[9], true); // v0-v3-v1

			f[1].setDatas(e[8], true); // v1-v3-v2

			f[2].setDatas(e[4], false); // v0-v2-v3

			f[3].setDatas(e[2], false); // v0-v1-v2
			// constraint relations datas

			v[0].fromConstraintSegments.push(s[0], s[3]);
			v[1].fromConstraintSegments.push(s[0], s[1]);
			v[2].fromConstraintSegments.push(s[1], s[2]);
			v[3].fromConstraintSegments.push(s[2], s[3]);
			e[0].fromConstraintSegments.push(s[0]);
			e[1].fromConstraintSegments.push(s[0]);
			e[2].fromConstraintSegments.push(s[1]);
			e[3].fromConstraintSegments.push(s[1]);
			e[4].fromConstraintSegments.push(s[2]);
			e[5].fromConstraintSegments.push(s[2]);
			e[6].fromConstraintSegments.push(s[3]);
			e[7].fromConstraintSegments.push(s[3]);
			s[0].edges.push(e[0]); // top

			s[1].edges.push(e[2]); // right

			s[2].edges.push(e[4]); // bottom

			s[3].edges.push(e[6]); // left

			s[0].fromShape = boundShape;
			s[1].fromShape = boundShape;
			s[2].fromShape = boundShape;
			s[3].fromShape = boundShape;
			boundShape.segments.push(s[0], s[1], s[2], s[3]);
			this.boundShape = boundShape;
			this._vertices = v;
			this._edges = e;
			this._faces = f;
			this.build();
			/*
			this._constraintShapes.push( his.boundShape );
			this.clipping = false;
			this.insertConstraintShape( [ 0,0,w,0,	w,0,w,h,	w,h,0,h,	0,h,0,0 ] );
			this.clipping = true;
			*/
		}

		build() {
			this._constraintShapes.push(this.boundShape);

			this.clipping = false;
			this.insertConstraintShape([0, 0, this.w, 0, this.w, 0, this.w, this.h, this.w, this.h, 0, this.h, 0, this.h, 0, 0]);
			this.clipping = true;
		}

	}

	class Graph {
		constructor() {
			this.id = IDX.get('graph');
			this.edge = null;
			this.node = null;
		}

		dispose() {
			while (this.node !== null) this.deleteNode(this.node);
		}

		insertNode() {
			let node = new GraphNode();

			if (this.node != null) {
				node.next = this.node;
				this.node.prev = node;
			}

			this.node = node;
			return node;
		}

		deleteNode(node) {
			while (node.outgoingEdge != null) {
				if (node.outgoingEdge.oppositeEdge != null) this.deleteEdge(node.outgoingEdge.oppositeEdge);
				this.deleteEdge(node.outgoingEdge);
			}

			let otherNode = this.node;
			let incomingEdge;

			while (otherNode != null) {
				incomingEdge = otherNode.successorNodes.get(node);
				if (incomingEdge != null) this.deleteEdge(incomingEdge);
				otherNode = otherNode.next;
			}

			if (this.node == node) {
				if (node.next != null) {
					node.next.prev = null;
					this.node = node.next;
				} else this.node = null;
			} else if (node.next != null) {
				node.prev.next = node.next;
				node.next.prev = node.prev;
			} else node.prev.next = null;

			node.dispose();
		}

		insertEdge(fromNode, toNode) {
			if (fromNode.successorNodes.get(toNode) != null) return null;
			let edge = new GraphEdge();

			if (this.edge != null) {
				this.edge.prev = edge;
				edge.next = this.edge;
			}

			this.edge = edge;
			edge.sourceNode = fromNode;
			edge.destinationNode = toNode;
			fromNode.successorNodes.set(toNode, edge);

			if (fromNode.outgoingEdge != null) {
				fromNode.outgoingEdge.rotPrevEdge = edge;
				edge.rotNextEdge = fromNode.outgoingEdge;
				fromNode.outgoingEdge = edge;
			} else fromNode.outgoingEdge = edge;

			let oppositeEdge = toNode.successorNodes.get(fromNode);

			if (oppositeEdge !== null) {
				edge.oppositeEdge = oppositeEdge;
				oppositeEdge.oppositeEdge = edge;
			}

			return edge;
		}

		deleteEdge(edge) {
			if (this.edge == edge) {
				if (edge.next != null) {
					edge.next.prev = null;
					this.edge = edge.next;
				} else this.edge = null;
			} else if (edge.next != null) {
				edge.prev.next = edge.next;
				edge.next.prev = edge.prev;
			} else edge.prev.next = null;

			if (edge.sourceNode.outgoingEdge == edge) {
				if (edge.rotNextEdge != null) {
					edge.rotNextEdge.rotPrevEdge = null;
					edge.sourceNode.outgoingEdge = edge.rotNextEdge;
				} else edge.sourceNode.outgoingEdge = null;
			} else if (edge.rotNextEdge != null) {
				edge.rotPrevEdge.rotNextEdge = edge.rotNextEdge;
				edge.rotNextEdge.rotPrevEdge = edge.rotPrevEdge;
			} else edge.rotPrevEdge.rotNextEdge = null;

			edge.dispose();
		}
		/*insertNode () {
					let node = new GraphNode()
				if( this.node !== null ) {
						node.next = this.node
						this.node.prev = node
				}
				this.node = node
				return node
			}
			deleteNode ( node ) {
					while( node.outgoingEdge != null ) {
						if(node.outgoingEdge.oppositeEdge != null) this.deleteEdge(node.outgoingEdge.oppositeEdge);
						this.deleteEdge(node.outgoingEdge);
				}
				let otherNode = this.node;
				let incomingEdge;
				while( otherNode !== null ) {
						incomingEdge = otherNode.successorNodes.get(node)
						if(incomingEdge !== null) this.deleteEdge( incomingEdge )
						otherNode = otherNode.next
				}
					if( this.node === node ) {
						if( node.next !== null ) {
								node.next.prev = null
								this.node = node.next
						} else {
								this.node = null
						}
				} else {
						if( node.next !== null ) {
								node.prev.next = node.next
								node.next.prev = node.prev
						} else {
								node.prev.next = null
						}
				}
				node.dispose();
			}
			insertEdge ( fromNode, toNode ) {
					if( fromNode.successorNodes.get( toNode ) != null ) return null;
					let edge = new GraphEdge();
					if( this.edge !== null ) {
						this.edge.prev = edge
						edge.next = this.edge
				}
					this.edge = edge;
				edge.sourceNode = fromNode
				edge.destinationNode = toNode
				fromNode.successorNodes.set( toNode, edge )
					if( fromNode.outgoingEdge !== null ) {
						fromNode.outgoingEdge.rotPrevEdge = edge
						edge.rotNextEdge = fromNode.outgoingEdge
						fromNode.outgoingEdge = edge
				} else {
						fromNode.outgoingEdge = edge
				}
				
				let oppositeEdge = toNode.successorNodes.get( fromNode )
				if( oppositeEdge !== null ) {
						edge.oppositeEdge = oppositeEdge
						oppositeEdge.oppositeEdge = edge
				}
					return edge
			}
		
		deleteEdge ( edge ) {
					if( this.edge === edge ) {
						if( edge.next !== null ) {
								edge.next.prev = null;
								this.edge = edge.next;
						} else {
								this.edge = null;
						}
				} else {
						if( edge.next !== null ) {
								edge.prev.next = edge.next
								edge.next.prev = edge.prev
						} else {
								edge.prev.next = null
						}
				}
					if( edge.sourceNode.outgoingEdge === edge ) {
						if( edge.rotNextEdge !== null ) {
								edge.rotNextEdge.rotPrevEdge = null
								edge.sourceNode.outgoingEdge = edge.rotNextEdge
						} else {
								edge.sourceNode.outgoingEdge = null
						}
				} else {
						if( edge.rotNextEdge !== null ) {
								edge.rotPrevEdge.rotNextEdge = edge.rotNextEdge
								edge.rotNextEdge.rotPrevEdge = edge.rotPrevEdge
						} else {
								edge.rotPrevEdge.rotNextEdge = null
						}
				}
					edge.dispose()
			}*/


	} // EDGE

	class GraphEdge {
		constructor() {
			this.id = IDX.get('graphEdge');
			this.next = null;
			this.prev = null;
			this.rotPrevEdge = null;
			this.rotNextEdge = null;
			this.oppositeEdge = null;
			this.sourceNode = null;
			this.destinationNode = null;
			this.data = null;
		}

		dispose() {
			this.next = null;
			this.prev = null;
			this.rotPrevEdge = null;
			this.rotNextEdge = null;
			this.oppositeEdge = null;
			this.sourceNode = null;
			this.destinationNode = null;
			this.data = null;
		}

	} // NODE

	class GraphNode {
		constructor() {
			this.id = IDX.get('graphNode');
			this.successorNodes = new Dictionary(1);
			this.prev = null;
			this.next = null;
			this.outgoingEdge = null;
			this.data = null;
		}

		dispose() {
			this.successorNodes.dispose();
			this.prev = null;
			this.next = null;
			this.outgoingEdge = null;
			this.successorNodes = null;
			this.data = null;
		}

	}

	function EdgeData() {}

	function NodeData() {}
	const Potrace = {
		color: {
			r: 255,
			g: 255,
			b: 255
		},
		nearly: 50,
		maxDistance: 1,
		setColor: function (color) {
			Potrace.color = color;
		},
		setNearly: function (n) {
			Potrace.nearly = n;
		},
		buildShapes: function (bmpData) {
			let shapes = [];
			let dictPixelsDone = new Dictionary(2);
			let r = bmpData.height - 1;
			let c = bmpData.width - 1;

			for (let row = 1; row < r; row++) {
				for (let col = 0; col < c; col++) {
					if (Potrace.getWhite(bmpData, col, row) && !Potrace.getWhite(bmpData, col + 1, row)) {
						if (!dictPixelsDone.get(col + 1 + "_" + row)) shapes.push(Potrace.buildShape(bmpData, row, col + 1, dictPixelsDone));
					}
				}
			}

			dictPixelsDone.dispose();
			return shapes;
		},
		getWhite: function (bmpData, col, row) {
			let valide = false;
			let bytes = bmpData.bytes;
			let w = bmpData.width;
			let mask = Potrace.color;
			let nearly = Potrace.nearly;
			let id = col + row * w << 2; // * 4;

			if (mask.r !== undefined) {
				if (nearEqual(bytes[id], mask.r, nearly)) valide = true;
			}

			if (mask.g !== undefined) {
				if (nearEqual(bytes[id + 1], mask.g, nearly)) valide = true;
			}

			if (mask.b !== undefined) {
				if (nearEqual(bytes[id + 2], mask.b, nearly)) valide = true;
			}

			if (mask.a !== undefined) {
				if (nearEqual(bytes[id + 3], mask.a, nearly)) valide = true;
			}

			return valide;
		},
		buildShape: function (bmpData, fromPixelRow, fromPixelCol, dictPixelsDone) {
			let newX = fromPixelCol;
			let newY = fromPixelRow;
			let path = [newX, newY];
			dictPixelsDone.set(newX + "_" + newY, true);
			bmpData.width;
			bmpData.height;
			let curDir = new Point(0, 1);
			let newDir = new Point();
			let newPixelRow;
			let newPixelCol;
			let count = -1;

			while (true) {
				// take the pixel at right
				newPixelRow = fromPixelRow + curDir.x + curDir.y; // | 0;

				newPixelCol = fromPixelCol + curDir.x - curDir.y; // | 0;
				// if the pixel is not white

				if (!Potrace.getWhite(bmpData, newPixelCol, newPixelRow)) {
					//if( DDLS.getPixel( bmpData, newPixelCol, newPixelRow ) < 0xFFFFFF ){
					// turn the direction right
					newDir.x = -curDir.y;
					newDir.y = curDir.x;
				} else {
					// if the pixel is white
					// take the pixel straight
					newPixelRow = fromPixelRow + curDir.y; // | 0;

					newPixelCol = fromPixelCol + curDir.x; // | 0;
					// if the pixel is not white

					if (!Potrace.getWhite(bmpData, newPixelCol, newPixelRow)) {
						// the direction stays the same
						newDir.x = curDir.x;
						newDir.y = curDir.y;
					} else {
						// if the pixel is white
						// pixel stays the same
						newPixelRow = fromPixelRow;
						newPixelCol = fromPixelCol; // turn the direction left

						newDir.x = curDir.y;
						newDir.y = -curDir.x;
					}
				}

				newX = newX + curDir.x;
				newY = newY + curDir.y;

				if (newX === path[0] && newY === path[1]) {
					break;
				} else {
					path.push(newX);
					path.push(newY);
					dictPixelsDone.set(newX + "_" + newY, true);
					fromPixelRow = newPixelRow;
					fromPixelCol = newPixelCol;
					curDir.x = newDir.x;
					curDir.y = newDir.y;
				}

				count--;
				if (count === 0) break;
			}

			return path;
		},
		buildGraph: function (shape) {
			let i = 0;
			let graph = new Graph();
			let node;

			while (i < shape.length) {
				node = graph.insertNode();
				node.data = new NodeData();
				node.data.index = i;
				node.data.point = new Point(shape[i], shape[i + 1]);
				i += 2;
			}

			let node1;
			let node2;
			let subNode;
			let distSqrd;
			let sumDistSqrd;
			let count;
			let isValid = false;
			let edge;
			let edgeData;
			node1 = graph.node;

			while (node1 != null) {
				if (node1.next != null) node2 = node1.next;else node2 = graph.node;

				while (node2 != node1) {
					isValid = true; //subNode = node1.next ? node1.next : graph.node;

					if (node1.next != null) subNode = node1.next;else subNode = graph.node;
					count = 2;
					sumDistSqrd = 0;

					while (subNode != node2) {
						distSqrd = Geom2D.distanceSquaredPointToSegment(subNode.data.point, node1.data.point, node2.data.point);
						if (distSqrd < 0) distSqrd = 0;

						if (distSqrd >= Potrace.maxDistance) {
							isValid = false;
							break;
						}

						count++;
						sumDistSqrd += distSqrd;
						if (subNode.next != null) subNode = subNode.next;else subNode = graph.node;
					}

					if (!isValid) break;
					edge = graph.insertEdge(node1, node2);
					edgeData = new EdgeData();
					edgeData.sumDistancesSquared = sumDistSqrd;
					edgeData.length = node1.data.point.distanceTo(node2.data.point);
					edgeData.nodesCount = count;
					edge.data = edgeData;
					if (node2.next != null) node2 = node2.next;else node2 = graph.node;
				}

				node1 = node1.next;
			} //console.log('graph done');


			return graph;
		},
		buildPolygon: function (graph) {
			let polygon = [],
					p1,
					p2,
					p3;
			let minNodeIndex = 2147483647;
			let edge;
			let score;
			let higherScore;
			let lowerScoreEdge = null;
			let currNode = graph.node;

			while (currNode.data.index < minNodeIndex) {
				minNodeIndex = currNode.data.index;
				polygon.push(currNode.data.point.x);
				polygon.push(currNode.data.point.y);
				higherScore = 0;
				edge = currNode.outgoingEdge;

				while (edge != null) {
					score = edge.data.nodesCount - edge.data.length * Math.sqrt(edge.data.sumDistancesSquared / edge.data.nodesCount);

					if (score > higherScore) {
						higherScore = score;
						lowerScoreEdge = edge;
					}

					edge = edge.rotNextEdge;
				}

				currNode = lowerScoreEdge.destinationNode;
			}

			p1 = new Point(polygon[polygon.length - 2], polygon[polygon.length - 1]);
			p2 = new Point(polygon[0], polygon[1]);
			p3 = new Point(polygon[2], polygon[3]);

			if (Geom2D.getDirection(p1, p2, p3) === 0) {
				polygon.shift();
				polygon.shift();
			}

			return polygon;
		}
	};

	const ShapeSimplifier = (coords, epsilon = 1) => {
		epsilon = epsilon || 1;
		let len = coords.length; //DDLS.Debug.assertFalse((len & 1) != 0,"Wrong size",{ fileName : "ShapeSimplifier.hx", lineNumber : 18, className : "DDLS.ShapeSimplifier", methodName : "simplify"});

		if (len <= 4) return [].concat(coords);
		let firstPointX = coords[0];
		let firstPointY = coords[1];
		let lastPointX = coords[len - 2];
		let lastPointY = coords[len - 1];
		let index = -1;
		let dist = 0.;
		let _g1 = 1;

		let _g = len >> 1;

		while (_g1 < _g) {
			let i = _g1++;
			let currDist = Geom2D.distanceSquaredPointToSegment(new Point(coords[i << 1], coords[(i << 1) + 1]), new Point(firstPointX, firstPointY), new Point(lastPointX, lastPointY)); //let currDist = DDLS.Geom2D.distanceSquaredPointToSegment(coords[i << 1],coords[(i << 1) + 1],firstPointX,firstPointY,lastPointX,lastPointY);

			if (currDist > dist) {
				dist = currDist;
				index = i;
			}
		}

		if (dist > epsilon * epsilon) {
			let l1 = coords.slice(0, (index << 1) + 2);
			let l2 = coords.slice(index << 1);
			let r1 = ShapeSimplifier(l1, epsilon);
			let r2 = ShapeSimplifier(l2, epsilon);
			let rs = r1.slice(0, r1.length - 2).concat(r2);
			return rs;
		} else return [firstPointX, firstPointY, lastPointX, lastPointY];
	};

	class BitmapMesh {
		static buildFromBmpData(pixel, precision = 1, color) {
			if (color !== undefined) Potrace.setColor(color);
			precision = precision || 1;
			let optimised = precision >= 1; // OUTLINES STEP-LIKE SHAPES GENERATION

			const shapes = Potrace.buildShapes(pixel); // OPTIMIZED POLYGONS GENERATION FROM GRAPH OF POTENTIAL SEGMENTS GENERATION
			// MESH GENERATION

			let i = shapes.length,
					j,
					poly,
					n = 0,
					n2 = 0;
			const mesh = new RectMesh(pixel.width, pixel.height);

			while (i--) {
				if (optimised) shapes[n] = ShapeSimplifier(shapes[n], precision);
				poly = Potrace.buildPolygon(Potrace.buildGraph(shapes[n]));
				j = (poly.length - 2) * 0.5;
				n2 = 0;

				while (j--) {
					mesh.insertConstraintSegment(poly[n2], poly[n2 + 1], poly[n2 + 2], poly[n2 + 3]);
					n2 += 2;
				}

				mesh.insertConstraintSegment(poly[0], poly[1], poly[n2], poly[n2 + 1]);
				/*
				lng = poly.length - 2;
				for ( j = 0; j < lng; j += 2 ) mesh.insertConstraintSegment( poly[j], poly[j+1], poly[j+2], poly[j+3] )
				mesh.insertConstraintSegment( poly[0], poly[1], poly[j], poly[j+1] )
				*/

				n++;
			}

			return mesh;
		}

	}

	class AStar {
		constructor() {
			this.fromFace = null;
			this.toFace = null;
			this.curFace = null;
			this.iterEdge = new FromFaceToInnerEdges();
			this.mesh = null;
			this._radius = 0;
			this.radiusSquared = 0;
			this.diameter = 0;
			this.diameterSquared = 0;
		}

		get radius() {
			return this._radius;
		}

		set radius(value) {
			this._radius = value;
			this.radiusSquared = this._radius * this._radius;
			this.diameter = this._radius * 2;
			this.diameterSquared = this.diameter * this.diameter;
		}

		dispose() {
			this.mesh = null;
			this.closedFaces.dispose();
			this.openedFaces.dispose();
			this.entryEdges.dispose();
			this.predecessor.dispose();
			this.entryX.dispose();
			this.entryY.dispose();
			this.scoreF.dispose();
			this.scoreG.dispose();
			this.scoreH.dispose();
			this.sortedOpenedFaces = null;
			this.closedFaces = null;
			this.openedFaces = null;
			this.entryEdges = null;
			this.entryX = null;
			this.entryY = null;
			this.scoreF = null;
			this.scoreG = null;
			this.scoreH = null;
			this.predecessor = null;
		}

		findPath(from, target, resultListFaces, resultListEdges) {
			this.sortedOpenedFaces = [];
			this.closedFaces = new Dictionary(1);
			this.openedFaces = new Dictionary(1);
			this.entryEdges = new Dictionary(1);
			this.predecessor = new Dictionary(1);
			this.entryX = new Dictionary(1);
			this.entryY = new Dictionary(1);
			this.scoreF = new Dictionary(1);
			this.scoreG = new Dictionary(1);
			this.scoreH = new Dictionary(1);
			let loc;
			loc = Geom2D.locatePosition(from, this.mesh);

			if (loc.type === 0) {
				// vertex are always in constraint, so we abort
				return;
			} else if (loc.type === 1) {
				// if the vertex lies on a constrained edge, we abort
				if (loc.isConstrained) return;
				this.fromFace = loc.leftFace;
			} else if (loc.type === 2) {
				this.fromFace = loc;
			} //


			loc = Geom2D.locatePosition(target, this.mesh);

			if (loc.type === 0) {
				this.toFace = loc.edge.leftFace;
			} else if (loc.type === 1) {
				//locEdge = loc;
				this.toFace = loc.leftFace;
			} else if (loc.type === 2) {
				this.toFace = loc;
			}

			this.sortedOpenedFaces.push(this.fromFace);
			this.entryEdges.set(this.fromFace, null);
			this.entryX.set(this.fromFace, from.x);
			this.entryY.set(this.fromFace, from.y);
			this.scoreG.set(this.fromFace, 0);
			const dist = SquaredSqrt(target.x - from.x, target.y - from.y);
			this.scoreH.set(this.fromFace, dist);
			this.scoreF.set(this.fromFace, dist);
			let innerEdge, neighbourFace, f, g, h;
			const fromPoint = new Point();
			const entryPoint = new Point();
			const distancePoint = new Point();
			let fillDatas = false;

			while (true) {
				if (this.sortedOpenedFaces.length == 0) {
					Log("NO PATH FOUND (AStar)");
					this.curFace = null;
					break;
				}

				this.curFace = this.sortedOpenedFaces.pop();
				if (this.curFace == this.toFace) break;
				this.iterEdge.fromFace = this.curFace;

				while ((innerEdge = this.iterEdge.next()) != null) {
					if (innerEdge.isConstrained) continue;
					neighbourFace = innerEdge.rightFace;

					if (!this.closedFaces.get(neighbourFace)) {
						if (this.curFace != this.fromFace && this._radius > 0 && !this.isWalkableByRadius(this.entryEdges.get(this.curFace), this.curFace, innerEdge)) continue;
						fromPoint.set(this.entryX.get(this.curFace), this.entryY.get(this.curFace));
						entryPoint.set((innerEdge.originVertex.pos.x + innerEdge.destinationVertex.pos.x) * 0.5, (innerEdge.originVertex.pos.y + innerEdge.destinationVertex.pos.y) * 0.5); // entryPoint will be the direct point of intersection between fromPoint and toXY if the edge innerEdge
						// intersects it
						//https://github.com/hxDaedalus/hxDaedalus/commit/f51504bd0fa822148d5e4bdeb7326809ecdbc731

						/*const vw1 = innerEdge.originVertex.pos;
						const vw2 = innerEdge.destinationVertex.pos;
						if (!Geom2D.intersections2segments(fromPoint, target, vw1, vw2, entryPoint)) {
								// Recycle the entryPoint variable to create a Point2D(toX, toY)
								entryPoint.copy(target)
								const vst = vw1.distanceSquaredTo(fromPoint) + vw1.distanceSquaredTo(entryPoint);
								const wst = vw2.distanceSquaredTo(fromPoint) + vw2.distanceSquaredTo(entryPoint);
								entryPoint.x = vst <= wst ? vw1.x : vw2.x;
								entryPoint.y = vst <= wst ? vw1.y : vw2.y;
						}*/

						distancePoint.copy(entryPoint).sub(target);
						h = distancePoint.length();
						distancePoint.copy(fromPoint).sub(entryPoint);
						g = this.scoreG.get(this.curFace) + distancePoint.length();
						f = h + g;
						fillDatas = false;

						if (this.openedFaces.get(neighbourFace) == null || !this.openedFaces.get(neighbourFace)) {
							this.sortedOpenedFaces.push(neighbourFace);
							this.openedFaces.set(neighbourFace, true); //true;

							fillDatas = true;
						} else if (this.scoreF.get(neighbourFace) > f) fillDatas = true;

						if (fillDatas) {
							this.entryEdges.set(neighbourFace, innerEdge);
							this.entryX.set(neighbourFace, entryPoint.x);
							this.entryY.set(neighbourFace, entryPoint.y);
							this.scoreF.set(neighbourFace, f);
							this.scoreG.set(neighbourFace, g);
							this.scoreH.set(neighbourFace, h);
							this.predecessor.set(neighbourFace, this.curFace);
						}
					}
				}

				this.openedFaces.set(this.curFace, false);
				this.closedFaces.set(this.curFace, true);
				this.sortedOpenedFaces.sort(function (a, b) {
					if (this.scoreF.get(a) == this.scoreF.get(b)) return 0;else if (this.scoreF.get(a) < this.scoreF.get(b)) return 1;else return -1;
				}.bind(this));
			}

			if (this.curFace == null) return;
			resultListFaces.push(this.curFace);

			while (this.curFace != this.fromFace) {
				resultListEdges.unshift(this.entryEdges.get(this.curFace));
				this.curFace = this.predecessor.get(this.curFace);
				resultListFaces.unshift(this.curFace);
			}
		}
		/*sortingFaces(a,b) {
				if(this.scoreF.get(a) == this.scoreF.get(b)) return 0; 
				else if(this.scoreF.get(a) < this.scoreF.get(b)) return 1; 
				else return -1;
		}*/


		isWalkableByRadius(fromEdge, throughFace, toEdge) {
			let vA = null; // the vertex on fromEdge not on toEdge

			let vB = null; // the vertex on toEdge not on fromEdge

			let vC = null; // the common vertex of the 2 edges (pivot)
			// we identify the points

			if (fromEdge.originVertex == toEdge.originVertex) {
				vA = fromEdge.destinationVertex;
				vB = toEdge.destinationVertex;
				vC = fromEdge.originVertex;
			} else if (fromEdge.destinationVertex == toEdge.destinationVertex) {
				vA = fromEdge.originVertex;
				vB = toEdge.originVertex;
				vC = fromEdge.destinationVertex;
			} else if (fromEdge.originVertex == toEdge.destinationVertex) {
				vA = fromEdge.destinationVertex;
				vB = toEdge.originVertex;
				vC = fromEdge.originVertex;
			} else if (fromEdge.destinationVertex == toEdge.originVertex) {
				vA = fromEdge.originVertex;
				vB = toEdge.destinationVertex;
				vC = fromEdge.destinationVertex;
			}

			let dot, distSquared, adjEdge; // if we have a right or obtuse angle on CAB

			dot = (vC.pos.x - vA.pos.x) * (vB.pos.x - vA.pos.x) + (vC.pos.y - vA.pos.y) * (vB.pos.y - vA.pos.y);

			if (dot <= 0) {
				// we compare length of AC with radius
				distSquared = Squared(vC.pos.x - vA.pos.x, vC.pos.y - vA.pos.y);
				if (distSquared >= this.diameterSquared) return true;else return false;
			} // if we have a right or obtuse angle on CBA


			dot = (vC.pos.x - vB.pos.x) * (vA.pos.x - vB.pos.x) + (vC.pos.y - vB.pos.y) * (vA.pos.y - vB.pos.y);

			if (dot <= 0) {
				// we compare length of BC with radius
				distSquared = Squared(vC.pos.x - vB.pos.x, vC.pos.y - vB.pos.y);
				if (distSquared >= this.diameterSquared) return true;else return false;
			} // we identify the adjacent edge (facing pivot vertex)


			if (throughFace.edge != fromEdge && throughFace.edge.oppositeEdge != fromEdge && throughFace.edge != toEdge && throughFace.edge.oppositeEdge != toEdge) adjEdge = throughFace.edge;else if (throughFace.edge.nextLeftEdge != fromEdge && throughFace.edge.nextLeftEdge.oppositeEdge != fromEdge && throughFace.edge.nextLeftEdge != toEdge && throughFace.edge.nextLeftEdge.oppositeEdge != toEdge) adjEdge = throughFace.edge.nextLeftEdge;else adjEdge = throughFace.edge.prevLeftEdge; // if the adjacent edge is constrained, we check the distance of orthognaly projected

			if (adjEdge.isConstrained) {
				var proj = new Point(vC.pos.x, vC.pos.y);
				Geom2D.projectOrthogonaly(proj, adjEdge);
				distSquared = Squared(proj.x - vC.pos.x, proj.y - vC.pos.y);
				if (distSquared >= this.diameterSquared) return true;else return false;
			} else {
				// if the adjacent is not constrained
				let distSquaredA = Squared(vC.pos.x - vA.pos.x, vC.pos.y - vA.pos.y);
				let distSquaredB = Squared(vC.pos.x - vB.pos.x, vC.pos.y - vB.pos.y);
				if (distSquaredA < this.diameterSquared || distSquaredB < this.diameterSquared) return false;else {
					let vFaceToCheck = [];
					let vFaceIsFromEdge = [];
					let facesDone = new Dictionary(1);
					vFaceIsFromEdge.push(adjEdge);

					if (adjEdge.leftFace == throughFace) {
						vFaceToCheck.push(adjEdge.rightFace);
						let k = adjEdge.rightFace;
						facesDone.set(k, true);
					} else {
						vFaceToCheck.push(adjEdge.leftFace);
						let k1 = adjEdge.leftFace;
						facesDone.set(k1, true);
					}

					let currFace, faceFromEdge, currEdgeA, nextFaceA, currEdgeB, nextFaceB;

					while (vFaceToCheck.length > 0) {
						currFace = vFaceToCheck.shift();
						faceFromEdge = vFaceIsFromEdge.shift(); // we identify the 2 edges to evaluate

						if (currFace.edge == faceFromEdge || currFace.edge == faceFromEdge.oppositeEdge) {
							currEdgeA = currFace.edge.nextLeftEdge;
							currEdgeB = currFace.edge.nextLeftEdge.nextLeftEdge;
						} else if (currFace.edge.nextLeftEdge == faceFromEdge || currFace.edge.nextLeftEdge == faceFromEdge.oppositeEdge) {
							currEdgeA = currFace.edge;
							currEdgeB = currFace.edge.nextLeftEdge.nextLeftEdge;
						} else {
							currEdgeA = currFace.edge;
							currEdgeB = currFace.edge.nextLeftEdge;
						} // we identify the faces related to the 2 edges


						if (currEdgeA.leftFace == currFace) nextFaceA = currEdgeA.rightFace;else nextFaceA = currEdgeA.leftFace;
						if (currEdgeB.leftFace == currFace) nextFaceB = currEdgeB.rightFace;else nextFaceB = currEdgeB.leftFace; // we check if the next face is not already in pipe
						// and if the edge A is close to pivot vertex

						if (!facesDone.get(nextFaceA) && Geom2D.distanceSquaredVertexToEdge(vC, currEdgeA) < this.diameterSquared) {
							// if the edge is constrained
							if (currEdgeA.isConstrained) return false; // so it is not walkable
							else {
								// if the edge is not constrained, we continue the search
								vFaceToCheck.push(nextFaceA);
								vFaceIsFromEdge.push(currEdgeA);
								facesDone.set(nextFaceA, true);
							}
						} // we check if the next face is not already in pipe
						// and if the edge B is close to pivot vertex


						if (!facesDone.get(nextFaceB) && Geom2D.distanceSquaredVertexToEdge(vC, currEdgeB) < this.diameterSquared) {
							// if the edge is constrained
							if (currEdgeB.isConstrained) return false; // so it is not walkable
							else {
								// if the edge is not constrained, we continue the search
								vFaceToCheck.push(nextFaceB);
								vFaceIsFromEdge.push(currEdgeB);
								facesDone.set(nextFaceB, true);
							}
						}
					} // if we didn't previously meet a constrained edge


					facesDone.dispose();
					return true;
				}
			} //?\\return true;

		}

	}

	class Funnel {
		constructor() {
			this._currPoolPointsIndex = 0;
			this._poolPointsSize = 3000;
			this._numSamplesCircle = 16;
			this._radiusSquared = 0;
			this._radius = 0;
			this._poolPoints = [];
			let l = this._poolPointsSize,
					n = 0;

			while (n < l) {
				n++;

				this._poolPoints.push(new Point());
			}
		}

		get radius() {
			return this._radius;
		}

		set radius(value) {
			this._radius = Math.max(0, value);
			this._radiusSquared = this._radius * this._radius;
			this._sampleCircle = [];
			if (this._radius == 0) return;
			let l = this._numSamplesCircle,
					n = 0,
					r;

			while (n < l) {
				let i = n++;
				r = -TwoPI * i / this._numSamplesCircle;

				this._sampleCircle.push(new Point(this._radius * Math.cos(r), this._radius * Math.sin(r)));
			}

			this._sampleCircleDistanceSquared = Squared(this._sampleCircle[0].x - this._sampleCircle[1].x, this._sampleCircle[0].y - this._sampleCircle[1].y);
		}

		dispose() {
			this._sampleCircle = null;
		}

		getPoint(x, y) {
			y = y || 0;
			x = x || 0;
			this.__point = this._poolPoints[this._currPoolPointsIndex];

			this.__point.set(x, y);

			this._currPoolPointsIndex++;

			if (this._currPoolPointsIndex == this._poolPointsSize) {
				this._poolPoints.push(new Point());

				this._poolPointsSize++;
			}

			return this.__point;
		}

		getCopyPoint(pointToCopy) {
			return this.getPoint(pointToCopy.x, pointToCopy.y);
		}

		findPath(from, target, listFaces, listEdges, resultPath) {
			let p_from = from;
			let p_to = target;
			let rad = this._radius * 1.01;
			this._currPoolPointsIndex = 0;

			if (this._radius > 0) {
				let checkFace = listFaces[0];
				let distanceSquared, distance, p1, p2, p3;
				p1 = checkFace.edge.originVertex.pos;
				p2 = checkFace.edge.destinationVertex.pos;
				p3 = checkFace.edge.nextLeftEdge.destinationVertex.pos;
				distanceSquared = Squared(p1.x - p_from.x, p1.y - p_from.y);

				if (distanceSquared <= this._radiusSquared) {
					distance = Math.sqrt(distanceSquared);
					p_from.sub(p1).div(distance).mul(rad).add(p1); //p_from.x = this._radius * 1.01 * ((p_from.x - p1.x) / distance) + p1.x;
					//p_from.y = this._radius * 1.01 * ((p_from.y - p1.y) / distance) + p1.y;
				} else {
					distanceSquared = Squared(p2.x - p_from.x, p2.y - p_from.y);

					if (distanceSquared <= this._radiusSquared) {
						distance = Math.sqrt(distanceSquared);
						p_from.sub(p2).div(distance).mul(rad).add(p2); //p_from.x = this._radius * 1.01 * ((p_from.X - p2.x) / distance) + p2.x;
						//p_from.y = this._radius * 1.01 * ((p_from.y - p2.y) / distance) + p2.y;
					} else {
						distanceSquared = Squared(p3.x - p_from.x, p3.y - p_from.y);

						if (distanceSquared <= this._radiusSquared) {
							distance = Math.sqrt(distanceSquared);
							p_from.sub(p3).div(distance).mul(rad).add(p3); //p_from.x = this._radius * 1.01 * ((p_from.x - p3.x) / distance) + p3.x;
							//p_from.y = this._radius * 1.01 * ((p_from.y - p3.y) / distance) + p3.y;
						}
					}
				}

				checkFace = listFaces[listFaces.length - 1];
				p1 = checkFace.edge.originVertex.pos;
				p2 = checkFace.edge.destinationVertex.pos;
				p3 = checkFace.edge.nextLeftEdge.destinationVertex.pos;
				distanceSquared = Squared(p1.x - p_to.x, p1.y - p_to.y);

				if (distanceSquared <= this._radiusSquared) {
					distance = Math.sqrt(distanceSquared);
					p_to.sub(p1).div(distance).mul(rad).add(p1); //p_to.x = this._radius * 1.01 * ((p_to.x - p1.x) / distance) + p1.x;
					//p_to.y = this._radius * 1.01 * ((p_to.y - p1.y) / distance) + p1.y;
				} else {
					distanceSquared = Squared(p2.x - p_to.x, p2.y - p_to.y);

					if (distanceSquared <= this._radiusSquared) {
						distance = Math.sqrt(distanceSquared);
						p_to.sub(p2).div(distance).mul(rad).add(p2); //p_to.x = this._radius * 1.01 * ((p_to.x - p2.x) / distance) + p2.x;
						//p_to.y = this._radius * 1.01 * ((p_to.y - p2.y) / distance) + p2.y;
					} else {
						distanceSquared = Squared(p3.x - p_to.x, p3.y - p_to.y);

						if (distanceSquared <= this._radiusSquared) {
							distance = Math.sqrt(distanceSquared);
							p_to.sub(p3).div(distance).mul(rad).add(p3); //p_to.x = this._radius * 1.01 * ((p_to.x - p3.x) / distance) + p3.x;
							//p_to.y = this._radius * 1.01 * ((p_to.y - p3.y) / distance) + p3.y;
						}
					}
				}
			} // we build starting and ending points


			let startPoint, endPoint;
			startPoint = p_from.clone(); //new Point(fromX,fromY);

			endPoint = p_to.clone(); //new Point(toX,toY);

			if (listFaces.length == 1) {
				resultPath.push(fix(startPoint.x));
				resultPath.push(fix(startPoint.y));
				resultPath.push(fix(endPoint.x));
				resultPath.push(fix(endPoint.y));
				return;
			}

			let i, j, l, n;
			let currEdge = null;
			let currVertex = null;
			let direction; // first we skip the first face and first edge if the starting point lies on the first interior edge:

			let edgeTmp = Geom2D.isInFace(p_from, listFaces[0]);

			if (edgeTmp.type === EDGE) {
				if (listEdges[0] === edgeTmp) {
					if (listEdges.length > 1) listEdges.shift();
					if (listFaces.length > 1) listFaces.shift(); //if(listEdges === undefined ) listEdges = [];

					Log('!! isShift');
				}
			} //{

			/* let _g = Geom2D.isInFacePrime(fromX,fromY,listFaces[0]);
			 let _g = Geom2D.isInFace(fromX,fromY,listFaces[0]);
			 switch(_g[1]) {
			 case 1:
					 let edge = _g[2];
					 if(listEdges[0] == edge) {
							 listEdges.shift();
							 listFaces.shift();
					 }
					 break;
			 default:
			 }*/
			//}
			// our funnels, inited with starting point	


			let funnelLeft = [];
			let funnelRight = [];
			funnelLeft.push(startPoint);
			funnelRight.push(startPoint);
			let verticesDoneSide = new Dictionary(1);
			let pointsList = [];
			let pointSides = new Dictionary(0);
			let pointSuccessor = new Dictionary(0);
			pointSides.set(startPoint, 0); //0;

			currEdge = listEdges[0];
			let relativPos = Geom2D.getRelativePosition2(p_from, currEdge);
			let prevPoint;
			let newPointA;
			let newPointB;
			newPointA = this.getCopyPoint(currEdge.destinationVertex.pos);
			newPointB = this.getCopyPoint(currEdge.originVertex.pos);
			pointsList.push(newPointA);
			pointsList.push(newPointB);
			pointSuccessor.set(startPoint, newPointA);
			pointSuccessor.set(newPointA, newPointB);
			prevPoint = newPointB;

			if (relativPos == 1) {
				pointSides.set(newPointA, 1);
				pointSides.set(newPointB, -1);
				verticesDoneSide.set(currEdge.destinationVertex, 1);
				verticesDoneSide.set(currEdge.originVertex, -1);
			} else if (relativPos == -1) {
				pointSides.set(newPointA, -1);
				pointSides.set(newPointB, 1);
				verticesDoneSide.set(currEdge.destinationVertex, -1);
				verticesDoneSide.set(currEdge.originVertex, 1);
			}

			let fromVertex = listEdges[0].originVertex;
			let fromFromVertex = listEdges[0].destinationVertex;
			let _g1 = 1;
			let _g2 = listEdges.length;

			while (_g1 < _g2) {
				let i1 = _g1++;
				currEdge = listEdges[i1];
				if (currEdge.originVertex == fromVertex) currVertex = currEdge.destinationVertex;else if (currEdge.destinationVertex == fromVertex) currVertex = currEdge.originVertex;else if (currEdge.originVertex == fromFromVertex) {
					currVertex = currEdge.destinationVertex;
					fromVertex = fromFromVertex;
				} else if (currEdge.destinationVertex == fromFromVertex) {
					currVertex = currEdge.originVertex;
					fromVertex = fromFromVertex;
				} else Log("IMPOSSIBLE TO IDENTIFY THE VERTEX !!!");
				newPointA = this.getCopyPoint(currVertex.pos);
				pointsList.push(newPointA);
				direction = -verticesDoneSide.get(fromVertex);
				pointSides.set(newPointA, direction);
				pointSuccessor.set(prevPoint, newPointA);
				verticesDoneSide.set(currVertex, direction);
				prevPoint = newPointA;
				fromFromVertex = fromVertex;
				fromVertex = currVertex;
			} // we then we add the end point


			pointSuccessor.set(prevPoint, endPoint);
			pointSides.set(endPoint, 0);
			let pathPoints = [];
			let pathSides = new Dictionary(1);
			pathPoints.push(startPoint);
			pathSides.set(startPoint, 0); //0;

			let currPos;
			let _g11 = 0;
			let _g3 = pointsList.length;

			while (_g11 < _g3) {
				let i2 = _g11++;
				currPos = pointsList[i2];

				if (pointSides.get(currPos) == -1) {
					j = funnelLeft.length - 2;

					while (j >= 0) {
						direction = Geom2D.getDirection(funnelLeft[j], funnelLeft[j + 1], currPos);

						if (direction != -1) {
							funnelLeft.shift();
							let _g21 = 0;

							while (_g21 < j) {
								_g21++;
								pathPoints.push(funnelLeft[0]);
								pathSides.set(funnelLeft[0], 1);
								funnelLeft.shift();
							}

							pathPoints.push(funnelLeft[0]);
							pathSides.set(funnelLeft[0], 1);
							funnelRight.splice(0, funnelRight.length);
							funnelRight.push(funnelLeft[0]);
							funnelRight.push(currPos);
							break;
						}

						j--;
					}

					funnelRight.push(currPos);
					j = funnelRight.length - 3;

					while (j >= 0) {
						direction = Geom2D.getDirection(funnelRight[j], funnelRight[j + 1], currPos);
						if (direction == -1) break;else funnelRight.splice(j + 1, 1);
						j--;
					}
				} else {
					j = funnelRight.length - 2;

					while (j >= 0) {
						direction = Geom2D.getDirection(funnelRight[j], funnelRight[j + 1], currPos);

						if (direction != 1) {
							funnelRight.shift();
							let _g22 = 0;

							while (_g22 < j) {
								_g22++;
								pathPoints.push(funnelRight[0]);
								pathSides.set(funnelRight[0], -1);
								funnelRight.shift();
							}

							pathPoints.push(funnelRight[0]);
							pathSides.set(funnelRight[0], -1);
							funnelLeft.splice(0, funnelLeft.length);
							funnelLeft.push(funnelRight[0]);
							funnelLeft.push(currPos);
							break;
						}

						j--;
					}

					funnelLeft.push(currPos);
					j = funnelLeft.length - 3;

					while (j >= 0) {
						direction = Geom2D.getDirection(funnelLeft[j], funnelLeft[j + 1], currPos);
						if (direction == 1) break;else funnelLeft.splice(j + 1, 1);
						j--;
					}
				}
			}

			let blocked = false;
			j = funnelRight.length - 2;

			while (j >= 0) {
				direction = Geom2D.getDirection(funnelRight[j], funnelRight[j + 1], p_to);

				if (direction != 1) {
					funnelRight.shift();
					let _g12 = 0;

					let _g4 = j + 1;

					while (_g12 < _g4) {
						_g12++;
						pathPoints.push(funnelRight[0]);
						pathSides.set(funnelRight[0], -1);
						funnelRight.shift();
					}

					pathPoints.push(endPoint);
					pathSides.set(endPoint, 0);
					blocked = true;
					break;
				}

				j--;
			}

			if (!blocked) {
				j = funnelLeft.length - 2;

				while (j >= 0) {
					direction = Geom2D.getDirection(funnelLeft[j], funnelLeft[j + 1], p_to);

					if (direction != -1) {
						funnelLeft.shift();
						let _g13 = 0;

						let _g5 = j + 1;

						while (_g13 < _g5) {
							_g13++;
							pathPoints.push(funnelLeft[0]);
							pathSides.set(funnelLeft[0], 1);
							funnelLeft.shift();
						}

						pathPoints.push(endPoint);
						pathSides.set(endPoint, 0);
						blocked = true;
						break;
					}

					j--;
				}
			}

			if (!blocked) {
				pathPoints.push(endPoint);
				pathSides.set(endPoint, 0);
				blocked = true;
			}

			let adjustedPoints = [];

			if (this._radius > 0) {
				let newPath = [];
				if (pathPoints.length == 2) this.adjustWithTangents(pathPoints[0], false, pathPoints[1], false, pointSides, pointSuccessor, newPath, adjustedPoints);else if (pathPoints.length > 2) {
					this.adjustWithTangents(pathPoints[0], false, pathPoints[1], true, pointSides, pointSuccessor, newPath, adjustedPoints);

					if (pathPoints.length > 3) {
						let _g14 = 1;

						let _g6 = pathPoints.length - 3 + 1;

						while (_g14 < _g6) {
							let i3 = _g14++;
							this.adjustWithTangents(pathPoints[i3], true, pathPoints[i3 + 1], true, pointSides, pointSuccessor, newPath, adjustedPoints);
						}
					}

					let pathLength = pathPoints.length;
					this.adjustWithTangents(pathPoints[pathLength - 2], true, pathPoints[pathLength - 1], false, pointSides, pointSuccessor, newPath, adjustedPoints);
				}
				newPath.push(endPoint);
				this.checkAdjustedPath(newPath, adjustedPoints, pointSides);
				let smoothPoints = [];
				i = newPath.length - 2;

				while (i >= 1) {
					this.smoothAngle(adjustedPoints[i * 2 - 1], newPath[i], adjustedPoints[i * 2], pointSides.get(newPath[i]), smoothPoints);

					while (smoothPoints.length != 0) {
						adjustedPoints.splice(i * 2, 0, smoothPoints.pop());
					}

					i--;
				}
			} else adjustedPoints = pathPoints;

			n = 0;
			l = adjustedPoints.length;

			while (n < l) {
				i = n++;
				resultPath.push(fix(adjustedPoints[i].x));
				resultPath.push(fix(adjustedPoints[i].y));
			}
		}

		adjustWithTangents(p1, applyRadiusToP1, p2, applyRadiusToP2, pointSides, pointSuccessor, newPath, adjustedPoints) {
			let tangentsResult = [];
			let side1 = pointSides.get(p1);
			let side2 = pointSides.get(p2);
			let pTangent1 = null;
			let pTangent2 = null;

			if (!applyRadiusToP1 && !applyRadiusToP2) {
				pTangent1 = p1;
				pTangent2 = p2;
			} else if (!applyRadiusToP1) {
				if (Geom2D.tangentsPointToCircle(p1, p2, this._radius, tangentsResult)) {
					if (side2 == 1) {
						pTangent1 = p1;
						pTangent2 = this.getPoint(tangentsResult[2], tangentsResult[3]);
					} else {
						pTangent1 = p1;
						pTangent2 = this.getPoint(tangentsResult[0], tangentsResult[1]);
					}
				} else {
					Log("NO TANGENT");
					return;
				}
			} else if (!applyRadiusToP2) {
				if (Geom2D.tangentsPointToCircle(p2, p1, this._radius, tangentsResult)) {
					if (tangentsResult.length > 0) {
						if (side1 == 1) {
							pTangent1 = this.getPoint(tangentsResult[0], tangentsResult[1]);
							pTangent2 = p2;
						} else {
							pTangent1 = this.getPoint(tangentsResult[2], tangentsResult[3]);
							pTangent2 = p2;
						}
					}
				} else {
					Log("NO TANGENT");
					return;
				}
			} else if (side1 == 1 && side2 == 1) {
				Geom2D.tangentsParalCircleToCircle(this._radius, p1, p2, tangentsResult);
				pTangent1 = this.getPoint(tangentsResult[2], tangentsResult[3]);
				pTangent2 = this.getPoint(tangentsResult[4], tangentsResult[5]);
			} else if (side1 == -1 && side2 == -1) {
				Geom2D.tangentsParalCircleToCircle(this._radius, p1, p2, tangentsResult);
				pTangent1 = this.getPoint(tangentsResult[0], tangentsResult[1]);
				pTangent2 = this.getPoint(tangentsResult[6], tangentsResult[7]);
			} else if (side1 == 1 && side2 == -1) {
				if (Geom2D.tangentsCrossCircleToCircle(this._radius, p1, p2, tangentsResult)) {
					pTangent1 = this.getPoint(tangentsResult[2], tangentsResult[3]);
					pTangent2 = this.getPoint(tangentsResult[6], tangentsResult[7]);
				} else {
					Log("NO TANGENT, points are too close for radius");
					return;
				}
			} else if (Geom2D.tangentsCrossCircleToCircle(this._radius, p1, p2, tangentsResult)) {
				pTangent1 = this.getPoint(tangentsResult[0], tangentsResult[1]);
				pTangent2 = this.getPoint(tangentsResult[4], tangentsResult[5]);
			} else {
				Log("NO TANGENT, points are too close for radius");
				return;
			}

			let successor = pointSuccessor.get(p1);
			let distance;

			while (successor != p2) {
				distance = Geom2D.distanceSquaredPointToSegment(successor, pTangent1, pTangent2);

				if (distance < this._radiusSquared) {
					this.adjustWithTangents(p1, applyRadiusToP1, successor, true, pointSides, pointSuccessor, newPath, adjustedPoints);
					this.adjustWithTangents(successor, true, p2, applyRadiusToP2, pointSides, pointSuccessor, newPath, adjustedPoints);
					return;
				} else successor = pointSuccessor.get(successor);
			}

			adjustedPoints.push(pTangent1);
			adjustedPoints.push(pTangent2);
			newPath.push(p1);
		}

		checkAdjustedPath(newPath, adjustedPoints, pointSides) {
			let needCheck = true;
			let point0;
			let point0Side;
			let point1;
			let point1Side;
			let point2;
			let point2Side;
			let pt1;
			let pt2;
			let pt3;
			let dot;
			let tangentsResult = [];
			let pTangent1 = null;
			let pTangent2 = null;

			while (needCheck) {
				needCheck = false;
				let i = 2;

				while (i < newPath.length) {
					point2 = newPath[i];
					point2Side = pointSides.get(point2);
					point1 = newPath[i - 1];
					point1Side = pointSides.get(point1);
					point0 = newPath[i - 2];
					point0Side = pointSides.get(point0);

					if (point1Side == point2Side) {
						pt1 = adjustedPoints[(i - 2) * 2];
						pt2 = adjustedPoints[(i - 1) * 2 - 1];
						pt3 = adjustedPoints[(i - 1) * 2];
						dot = (pt1.x - pt2.x) * (pt3.x - pt2.x) + (pt1.y - pt2.y) * (pt3.y - pt2.y);

						if (dot > 0) {
							if (i == 2) {
								Geom2D.tangentsPointToCircle(point0, point2, this._radius, tangentsResult);

								if (point2Side == 1) {
									pTangent1 = point0;
									pTangent2 = this.getPoint(tangentsResult[2], tangentsResult[3]);
								} else {
									pTangent1 = point0;
									pTangent2 = this.getPoint(tangentsResult[0], tangentsResult[1]);
								}
							} else if (i == newPath.length - 1) {
								Geom2D.tangentsPointToCircle(point2, point0, this._radius, tangentsResult);

								if (point0Side == 1) {
									pTangent1 = this.getPoint(tangentsResult[0], tangentsResult[1]);
									pTangent2 = point2;
								} else {
									pTangent1 = this.getPoint(tangentsResult[2], tangentsResult[3]);
									pTangent2 = point2;
								}
							} else if (point0Side == 1 && point2Side == -1) {
								Geom2D.tangentsCrossCircleToCircle(this._radius, point0, point2, tangentsResult);
								pTangent1 = this.getPoint(tangentsResult[2], tangentsResult[3]);
								pTangent2 = this.getPoint(tangentsResult[6], tangentsResult[7]);
							} else if (point0Side == -1 && point2Side == 1) {
								Geom2D.tangentsCrossCircleToCircle(this._radius, point0, point2, tangentsResult);
								pTangent1 = this.getPoint(tangentsResult[0], tangentsResult[1]);
								pTangent2 = this.getPoint(tangentsResult[4], tangentsResult[5]);
							} else if (point0Side == 1 && point2Side == 1) {
								Geom2D.tangentsParalCircleToCircle(this._radius, point0, point2, tangentsResult);
								pTangent1 = this.getPoint(tangentsResult[2], tangentsResult[3]);
								pTangent2 = this.getPoint(tangentsResult[4], tangentsResult[5]);
							} else if (point0Side == -1 && point2Side == -1) {
								Geom2D.tangentsParalCircleToCircle(this._radius, point0, point2, tangentsResult);
								pTangent1 = this.getPoint(tangentsResult[0], tangentsResult[1]);
								pTangent2 = this.getPoint(tangentsResult[6], tangentsResult[7]);
							}

							adjustedPoints.splice((i - 2) * 2, 1, pTangent1);
							adjustedPoints.splice(i * 2 - 1, 1, pTangent2); // delete useless point

							newPath.splice(i - 1, 1);
							adjustedPoints.splice((i - 1) * 2 - 1, 2);
							tangentsResult.splice(0, tangentsResult.length);
							/*let temp = (i - 2) * 2;
							adjustedPoints.splice(temp,1);
							adjustedPoints.splice(temp,0,pTangent1);
							temp = i * 2 - 1;
							adjustedPoints.splice(temp,1);
							adjustedPoints.splice(temp,0,pTangent2);
							newPath.splice(i - 1,1);
							adjustedPoints.splice((i - 1) * 2 - 1,2);
							tangentsResult.splice(0,tangentsResult.length);*/

							i--;
						}
					}

					i++;
				}
			}
		}

		smoothAngle(prevPoint, pointToSmooth, nextPoint, side, encirclePoints) {
			let angleType = Geom2D.getDirection(prevPoint, pointToSmooth, nextPoint);
			let distanceSquared = Squared(prevPoint.x - nextPoint.x, prevPoint.y - nextPoint.y);
			if (distanceSquared <= this._sampleCircleDistanceSquared) return;
			let index = 0;
			let side1;
			let side2;
			let pointInArea;
			let p_toCheck; //let xToCheck;
			//let yToCheck;

			let _g1 = 0;
			let _g = this._numSamplesCircle;

			while (_g1 < _g) {
				let i = _g1++;
				pointInArea = false;
				p_toCheck = pointToSmooth.clone().add(this._sampleCircle[i]); //p_toCheck = new Point(pointToSmooth.x + this._sampleCircle[i].x, pointToSmooth.y + this._sampleCircle[i].y);
				//xToCheck = pointToSmooth.x + this._sampleCircle[i].x;
				//yToCheck = pointToSmooth.y + this._sampleCircle[i].y;

				side1 = Geom2D.getDirection(prevPoint, pointToSmooth, p_toCheck);
				side2 = Geom2D.getDirection(pointToSmooth, nextPoint, p_toCheck);

				if (side == 1) {
					if (angleType == -1) {
						if (side1 == -1 && side2 == -1) pointInArea = true;
					} else if (side1 == -1 || side2 == -1) pointInArea = true;
				} else if (angleType == 1) {
					if (side1 == 1 && side2 == 1) pointInArea = true;
				} else if (side1 == 1 || side2 == 1) pointInArea = true;

				if (pointInArea) {
					encirclePoints.splice(index, 0, p_toCheck); //encirclePoints.splice(index, 0, new Point(xToCheck, yToCheck));
					//encirclePoints.splice(index,0);
					//let x = new Point(xToCheck,yToCheck);
					//encirclePoints.splice(index,0,x);

					index++;
				} else index = 0;
			}

			if (side == -1) encirclePoints.reverse();
		}

	}

	class PathFinder {
		constructor() {
			this.astar = new AStar();
			this.funnel = new Funnel();
			this.listFaces = [];
			this.listEdges = [];
			this._mesh = null;
			this.entity = null;
		}

		get mesh() {
			return this._mesh;
		}

		set mesh(value) {
			this._mesh = value;
			this.astar.mesh = value;
		}

		dispose() {
			this._mesh = null;
			this.astar.dispose();
			this.astar = null;
			this.funnel.dispose();
			this.funnel = null;
			this.listEdges = null;
			this.listFaces = null;
		}

		findPath(target, resultPath) {
			//resultPath = [];
			resultPath.splice(0, resultPath.length); //DDLS.Debug.assertFalse(this._mesh == null,"Mesh missing",{ fileName : "PathFinder.hx", lineNumber : 51, className : "DDLS.PathFinder", methodName : "findPath"});
			//DDLS.Debug.assertFalse(this.entity == null,"Entity missing",{ fileName : "PathFinder.hx", lineNumber : 52, className : "DDLS.PathFinder", methodName : "findPath"});

			if (Geom2D.isCircleIntersectingAnyConstraint(target, this.entity.radius, this._mesh)) return;
			this.astar.radius = this.entity.radius;
			this.funnel.radius = this.entity.radius;
			this.listFaces.splice(0, this.listFaces.length);
			this.listEdges.splice(0, this.listEdges.length); //this.listFaces = [];
			//this.listEdges = [];

			let start = this.entity.position;
			this.astar.findPath(start, target, this.listFaces, this.listEdges);

			if (this.listFaces.length == 0) {
				Log("PATH LENGTH = 0 (PathFinder)"); //Log("PathFinder listFaces.length == 0");

				return;
			}

			this.funnel.findPath(start, target, this.listFaces, this.listEdges, resultPath);
		}

	}

	class Object2D {
		constructor() {
			this.id = IDX.get('object2D');
			this._pivot = new Point();
			this._position = new Point();
			this._scale = new Point(1, 1);
			this._matrix = new Matrix2D();
			this._rotation = 0;
			this._constraintShape = null;
			this._coordinates = [];
			this.hasChanged = false;
		}

		get rotation() {
			return this._rotation;
		}

		set rotation(value) {
			if (this._rotation !== value) {
				this._rotation = value;
				this.hasChanged = true;
			}
		}

		get matrix() {
			return this._matrix;
		}

		set matrix(value) {
			if (this._rotation !== value) {
				this._rotation = value;
				this.hasChanged = true;
			}
		}

		get coordinates() {
			return this._coordinates;
		}

		set coordinates(value) {
			this._coordinates = value;
			this.hasChanged = true;
		}

		get constraintShape() {
			return this._constraintShape;
		}

		set constraintShape(value) {
			this._constraintShape = value;
			this.hasChanged = true;
		}

		get edges() {
			let res = [];
			let seg = this._constraintShape.segments;
			let l = seg.length,
					l2,
					n = 0,
					n2 = 0,
					i = 0,
					j = 0;

			while (n < l) {
				i = n++;
				n2 = 0;
				l2 = seg[i].edges.length;

				while (n2 < l2) {
					j = n2++;
					res.push(seg[i].edges[j]);
				}
			}

			return res;
		}

		position(x, y) {
			this._position.set(x, y);

			this.hasChanged = true;
		}

		scale(w, h) {
			this._scale.set(w, h);

			this.hasChanged = true;
		}

		pivot(x, y) {
			this._pivot.set(x, y);

			this.hasChanged = true;
		}

		dispose() {
			this._matrix = null;
			this._coordinates = null;
			this._constraintShape = null;
		}

		updateValuesFromMatrix() {}

		updateMatrixFromValues() {
			this._matrix.identity().translate(this._pivot.negate()).scale(this._scale).rotate(this._rotation).translate(this._position);
		}

	}

	class FieldOfView {
		constructor(entity, world) {
			this.entity = entity || null;
			this.world = world || null; //this._debug = false;
		}

		isInField(targetEntity) {
			if (!this.world) return; //throw new Error("Mesh missing");

			if (!this.entity) return; //throw new Error("From entity missing");

			this.mesh = this.world.getMesh();
			let pos = this.entity.position;
			let direction = this.entity.direction;
			let target = targetEntity.position;
			let radius = this.entity.radiusFOV;
			let angle = this.entity.angleFOV; //let targetX = targetEntity.x;
			//let targetY = targetEntity.y;

			let targetRadius = targetEntity.radius;
			let distSquared = Squared(pos.x - target.x, pos.y - target.y); //(posX-targetX)*(posX-targetX) + (posY-targetY)*(posY-targetY);
			// if target is completely outside field radius

			if (distSquared >= (radius + targetRadius) * (radius + targetRadius)) {
				//trace("target is completely outside field radius");
				return false;
			}
			/*if (distSquared < targetRadius * targetRadius ){
					//trace("degenerate case if the field center is inside the target");
					return true;
			}*/
			//let leftTargetX, leftTargetY, rightTargetX, rightTargetY, leftTargetInField, rightTargetInField;


			let leftTarget = new Point();
			let rightTarget = new Point();
			let leftTargetInField, rightTargetInField; // we consider the 2 cicrles intersections

			let result = [];

			if (Geom2D.intersections2Circles(pos, radius, target, targetRadius, result)) {
				leftTarget.set(result[0], result[1]);
				rightTarget.set(result[2], result[3]);
			}

			let mid = pos.clone().add(target).mul(0.5);

			if (result.length == 0 || Squared(mid.x - target.x, mid.y - target.y) < Squared(mid.x - leftTarget.x, mid.y - leftTarget.y)) {
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


			let dotProdMin = Math.cos(this.entity.angleFOV * 0.5); // we compare the dots for the left point

			let left = leftTarget.clone().sub(pos);
			let lengthLeft = Math.sqrt(left.x * left.x + left.y * left.y);
			let dotLeft = left.x / lengthLeft * direction.x + left.y / lengthLeft * direction.y; // if the left point is in field

			if (dotLeft > dotProdMin) leftTargetInField = true;else leftTargetInField = false; // we compare the dots for the right point

			let right = rightTarget.clone().sub(pos);
			let lengthRight = Math.sqrt(right.x * right.x + right.y * right.y);
			let dotRight = right.x / lengthRight * direction.x + right.y / lengthRight * direction.y; // if the right point is in field

			if (dotRight > dotProdMin) rightTargetInField = true;else rightTargetInField = false; // if the left and right points are outside field

			if (!leftTargetInField && !rightTargetInField) {
				let pdir = pos.clone().add(direction); // we must check if the Left/right points are on 2 different sides

				if (Geom2D.getDirection(pos, pdir, leftTarget) === 1 && Geom2D.getDirection(pos, pdir, rightTarget) === -1) ; else {
					// we abort : target is not in field
					return false;
				}
			} // we init the window


			if (!leftTargetInField || !rightTargetInField) {
				let p = new Point();
				let dirAngle;
				dirAngle = Math.atan2(direction.y, direction.x);

				if (!leftTargetInField) {
					let leftField = new Point(Math.cos(dirAngle - angle * 0.5), Math.sin(dirAngle - angle * 0.5)).add(pos);
					Geom2D.intersections2segments(pos, leftField, leftTarget, rightTarget, p, null, true);
					leftTarget = p.clone();
				}

				if (!rightTargetInField) {
					let rightField = new Point(Math.cos(dirAngle + angle * 0.5), Math.sin(dirAngle + angle * 0.5)).add(pos);
					Geom2D.intersections2segments(pos, rightField, leftTarget, rightTarget, p, null, true);
					rightTarget = p.clone();
				}
			} // now we have a triangle called the window defined by: posX, posY, rightTargetX, rightTargetY, leftTargetX, leftTargetY
			// we set a dictionnary of faces done


			let facesDone = new Dictionary(0); // we set a dictionnary of edges done

			let edgesDone = new Dictionary(0); // we set the window wall

			let wall = []; // we localize the field center

			let startObj = Geom2D.locatePosition(pos, this.mesh);
			let startFace;
			if (startObj.type == 2) startFace = startObj;else if (startObj.type == 1) startFace = startObj.leftFace;else if (startObj.type == 0) startFace = startObj.edge.leftFace; // we put the face where the field center is lying in open list

			let openFacesList = [];
			let openFaces = new Dictionary(0);
			openFacesList.push(startFace);
			openFaces[startFace] = true;
			let currentFace, currentEdge, s1, s2;
			let p1 = new Point();
			let p2 = new Point();
			let param1, param2, i, index1, index2;
			let params = [];
			let edges = []; // we iterate as long as we have new open facess

			while (openFacesList.length > 0) {
				// we pop the 1st open face: current face
				currentFace = openFacesList.shift();
				openFaces.set(currentFace, null);
				facesDone.set(currentFace, true); // for each non-done edges from the current face

				currentEdge = currentFace.edge;

				if (!edgesDone.get(currentEdge) && !edgesDone.get(currentEdge.oppositeEdge)) {
					edges.push(currentEdge);
					edgesDone.set(currentEdge, true);
				}

				currentEdge = currentEdge.nextLeftEdge;

				if (!edgesDone.get(currentEdge) && !edgesDone.get(currentEdge.oppositeEdge)) {
					edges.push(currentEdge);
					edgesDone.set(currentEdge, true);
				}

				currentEdge = currentEdge.nextLeftEdge;

				if (!edgesDone.get(currentEdge) && !edgesDone.get(currentEdge.oppositeEdge)) {
					edges.push(currentEdge);
					edgesDone.set(currentEdge, true);
				}

				while (edges.length > 0) {
					currentEdge = edges.pop(); // if the edge overlap (interects or lies inside) the window

					s1 = currentEdge.originVertex.pos;
					s2 = currentEdge.destinationVertex.pos; //if ( Geom2D.clipSegmentByTriangle(s1.x, s1.y, s2.x, s2.y, pos.x, pos.y, rightTarget.x, rightTarget.y, leftTarget.x, leftTarget.y, p1, p2) ){

					if (Geom2D.clipSegmentByTriangle(s1, s2, pos, rightTarget, leftTarget, p1, p2)) {
						// if the edge if constrained
						if (currentEdge.isConstrained) {
							// we project the constrained edge on the wall
							params.splice(0, params.length);
							Geom2D.intersections2segments(pos, p1, leftTarget, rightTarget, null, params, true);
							Geom2D.intersections2segments(pos, p2, leftTarget, rightTarget, null, params, true);
							param1 = params[1];
							param2 = params[3];

							if (param2 < param1) {
								param1 = param2;
								param2 = params[1];
							} // we sum it to the window wall


							for (i = wall.length - 1; i >= 0; i--) {
								if (param2 >= wall[i]) break;
							}

							index2 = i + 1;
							if (index2 % 2 == 0) wall.splice(index2, 0, param2);

							for (i = 0; i < wall.length; i++) {
								if (param1 <= wall[i]) break;
							}

							index1 = i;

							if (index1 % 2 == 0) {
								wall.splice(index1, 0, param1);
								index2++;
							} else {
								index1--;
							}

							wall.splice(index1 + 1, index2 - index1 - 1); // if the window is totally covered, we stop and return false

							if (wall.length == 2 && -EPSILON_NORMAL < wall[0] && wall[0] < EPSILON_NORMAL && 1 - EPSILON_NORMAL < wall[1] && wall[1] < 1 + EPSILON_NORMAL) return false;
						} // if the adjacent face is neither in open list nor in faces done dictionnary


						currentFace = currentEdge.rightFace;

						if (!openFaces.get(currentFace) && !facesDone.get(currentFace)) {
							// we add it in open list
							openFacesList.push(currentFace);
							openFaces.set(currentFace, true);
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

	class LinearPathSampler {
		constructor() {
			this.entity = null;
			this._path = null;
			this._samplingDistanceSquared = 1;
			this._samplingDistance = 1;
			this._preCompX = [];
			this._preCompY = [];
			this.pos = new Point();
			this.hasPrev = false;
			this.hasNext = false;
			this._count = 0;
			/*Object.defineProperty(this, 'x', {
					get: function() { return this.pos.x; }
			});
				Object.defineProperty(this, 'y', {
					get: function() { return this.pos.y; }
			});
				Object.defineProperty(this, 'countMax', {
					get: function() { return this._preCompX.length-1; }
			});
				Object.defineProperty(this, 'count', {
					get: function() { return this._count; },
					set: function(value) { 
							this._count = value;
							if(this._count < 0) this._count = 0;
							if(this._count > this.countMax - 1) this._count = this.countMax - 1;
							if(this._count == 0) this.hasPrev = false; else this.hasPrev = true;
							if(this._count == this.countMax - 1) this.hasNext = false; else this.hasNext = true;
							//this.pos.x = this._preCompX[this._count];
							//this.pos.y = this._preCompY[this._count];
							this.applyLast();
							this.updateEntity();
					}
			});
				Object.defineProperty(this, 'samplingDistance', {
					get: function() { return this._samplingDistance; },
					set: function(value) { 
							this._samplingDistance = value;
							this._samplingDistanceSquared = this._samplingDistance * this._samplingDistance;
					}
			});
				Object.defineProperty(this, 'path', {
					get: function() { return this._path; },
					set: function(value) { 
							this._path = value;
							this._preComputed = false;
							this.reset();
					}
			});*/
		}

		get x() {
			return this.pos.x;
		}

		get y() {
			return this.pos.y;
		}

		get countMax() {
			return this._preCompX.length - 1;
		}

		get count() {
			return this._count;
		}

		set count(value) {
			this._count = value;
			if (this._count < 0) this._count = 0;
			if (this._count > this.countMax - 1) this._count = this.countMax - 1;
			if (this._count == 0) this.hasPrev = false;else this.hasPrev = true;
			if (this._count == this.countMax - 1) this.hasNext = false;else this.hasNext = true; //this.pos.x = this._preCompX[this._count];
			//this.pos.y = this._preCompY[this._count];

			this.applyLast();
			this.updateEntity();
		}

		get samplingDistance() {
			return this._samplingDistance;
		}

		set samplingDistance(value) {
			this._samplingDistance = value;
			this._samplingDistanceSquared = this._samplingDistance * this._samplingDistance;
		}

		get path() {
			return this._path;
		}

		set path(value) {
			this._path = value;
			this._preComputed = false;
			this.reset();
		} //////


		dispose() {
			this.entity = null;
			this._path = null;
			this._preCompX = null;
			this._preCompY = null;
		}

		reset() {
			if (this._path.length > 0) {
				this.pos.x = this._path[0];
				this.pos.y = this._path[1];
				this._iPrev = 0;
				this._iNext = 2;
				this.hasPrev = false;
				this.hasNext = true;
				this._count = 0;
				this.updateEntity();
			} else {
				this.hasPrev = false;
				this.hasNext = false;
				this._count = 0; //this._path = [];
			}
		}

		preCompute() {
			this._preCompX.splice(0, this._preCompX.length);

			this._preCompY.splice(0, this._preCompY.length);

			this._count = 0;

			this._preCompX.push(this.pos.x);

			this._preCompY.push(this.pos.y);

			this._preComputed = false;

			while (this.next()) {
				this._preCompX.push(this.pos.x);

				this._preCompY.push(this.pos.y);
			}

			this.reset();
			this._preComputed = true;
		}

		prev() {
			if (!this.hasPrev) return false;
			this.hasNext = true;

			if (this._preComputed) {
				this._count--;
				if (this._count == 0) this.hasPrev = false; //this.pos.x = this._preCompX[this._count];
				//this.pos.y = this._preCompY[this._count];

				this.applyLast();
				this.updateEntity();
				return true;
			}

			let remainingDist;
			let dist;
			remainingDist = this._samplingDistance;

			while (true) {
				let pathPrev = this._path[this._iPrev];
				let pathPrev1 = this._path[this._iPrev + 1];
				dist = SquaredSqrt(this.pos.x - pathPrev, this.pos.y - pathPrev1);

				if (dist < remainingDist) {
					remainingDist -= dist;
					this._iPrev -= 2;
					this._iNext -= 2;
					if (this._iNext == 0) break;
				} else break;
			}

			if (this._iNext == 0) {
				this.pos.x = this._path[0];
				this.pos.y = this._path[1];
				this.hasPrev = false;
				this._iNext = 2;
				this._iPrev = 0;
				this.updateEntity();
				return true;
			} else {
				this.pos.x = this.pos.x + (this._path[this._iPrev] - this.pos.x) * remainingDist / dist;
				this.pos.y = this.pos.y + (this._path[this._iPrev + 1] - this.pos.y) * remainingDist / dist;
				this.updateEntity();
				return true;
			}
		}

		next() {
			if (!this.hasNext) return false;
			this.hasPrev = true;

			if (this._preComputed) {
				this._count++;
				if (this._count == this._preCompX.length - 1) this.hasNext = false; //this.pos.x = this._preCompX[this._count];
				//this.pos.y = this._preCompY[this._count];

				this.applyLast();
				this.updateEntity();
				return true;
			}

			let remainingDist;
			let dist;
			remainingDist = this._samplingDistance;

			while (true) {
				let pathNext = this._path[this._iNext];
				let pathNext1 = this._path[this._iNext + 1];
				dist = SquaredSqrt(this.pos.x - pathNext, this.pos.y - pathNext1);

				if (dist < remainingDist) {
					remainingDist -= dist;
					this.pos.x = this._path[this._iNext];
					this.pos.y = this._path[this._iNext + 1];
					this._iPrev += 2;
					this._iNext += 2;
					if (this._iNext == this._path.length) break;
				} else break;
			}

			if (this._iNext == this._path.length) {
				this.pos.x = this._path[this._iPrev];
				this.pos.y = this._path[this._iPrev + 1];
				this.hasNext = false;
				this._iNext = this._path.length - 2;
				this._iPrev = this._iNext - 2;
				this.updateEntity();
				return true;
			} else {
				this.pos.x = this.pos.x + (this._path[this._iNext] - this.pos.x) * remainingDist / dist;
				this.pos.y = this.pos.y + (this._path[this._iNext + 1] - this.pos.y) * remainingDist / dist;
				this.updateEntity();
				return true;
			}
		}

		applyLast() {
			this.pos.set(this._preCompX[this._count], this._preCompY[this._count]);
		}

		updateEntity() {
			if (this.entity === null) return; //this.entity.angle = Math.atan2( this.pos.y - this.entity.position.y, this.pos.x - this.entity.position.x );//*_Math.todeg;

			this.entity.distance = this.entity.position.distanceTo(this.pos); //console.log(this.entity.distance)

			if (!this.entity.needTurn) this.entity.angle = this.entity.position.angleTo(this.pos);
			this.entity.direction.angular(this.entity.angle).mul(this.entity.distance);
			this.entity.position.copy(this.pos); //this.entity.angle = this.entity.position.angle()
			//console.log(this.entity.direction)
			//this.entity.x = this.pos.x;
			//this.entity.y = this.pos.y;
		}

	} //export { LinearPathSampler };

	class Entity {
		constructor(s = {}, world) {
			this.isSee = false;
			this.isWalking = false;
			this.isSelected = false;
			this.isMove = false;
			this.isTurn = false;
			this.isActive = false;
			this.world = world;
			this.turnSpeed = s.turn || 0;
			this.turnStep = 0;
			this.needTurn = false;
			this.step = 0;
			this.color = {
				r: 255,
				g: 255,
				b: 255,
				a: 0.75
			};
			this.color2 = {
				r: 0,
				g: 0,
				b: 255,
				a: 0.75
			};
			this.position = new Point(s.x || 0, s.y || 0);
			this.direction = new Point(1, 0);
			this.distance = 0;
			this.radius = s.r || 10;
			this.angle = s.angle || 0;
			this.angleNext = 0;
			this.angleFOV = (s.fov || 120) * torad;
			this.radiusFOV = s.distance || 200;
			this.testSee = s.see || false;
			this.angledelta = 0;
			this.turnStep = 0;
			this.needTurn = false;
			this.path = [];
			this.tmppath = [];
			this.target = new Point();
			this.newPath = false;
			this.mesh = null;
			this.fov = new FieldOfView(this, this.world);
			this.pathSampler = new LinearPathSampler();
			this.pathSampler.entity = this;
			this.pathSampler.path = this.tmppath;
			this.pathSampler.samplingDistance = s.speed || 10; // compatibility issue
			//this.entity = this;
		}

		clearTarget() {
			if (this.pathSampler.hasNext) {
				//this.path = []
				//this.tmppath = []
				//this.pathSampler.reset()
				this.pathSampler.hasPrev = false;
				this.pathSampler.hasNext = false;
				this.pathSampler._count = 0;
			}

			this.isActive = false;
		}

		setAngle(a) {
			this.angle = unwrap(a);
		}

		setTarget(x, y, a) {
			this.path = [];
			this.target.set(x, y);
			this.world.pathFinder.entity = this;
			this.world.pathFinder.findPath(this.target, this.path);
			return this.testPath(a);
		}

		testPath(a) {
			if (!this.path) return false;

			if (this.path.length > 0) {
				const startAngle = a !== undefined ? unwrap(a) : this.angle;
				if (this.turnSpeed !== 0) this.needTurn = true;
				this.pathSampler.reset();
				this.tmppath = [...this.path];
				this.pathSampler.path = this.tmppath;
				this.newPath = true;
				this.step = 0;
				this.turnStep = 0; // auto turn 

				if (this.turnSpeed !== 0 && this.tmppath.length >= 4) {
					this.angleNext = this.position.angleTo({
						x: this.tmppath[2],
						y: this.tmppath[3]
					});
					let diff = this.getNear(this.angleNext, startAngle);
					this.turnStep = Math.floor(Math.abs(Math.round(diff * todeg)) / this.turnSpeed);
					this.angledelta = diff / this.turnStep;
					this.needTurn = true;
					this.step = 0;

					if (this.angledelta === Infinity || this.angledelta === -Infinity || isNaN(this.angledelta)) {
						this.angledelta = 0;
						this.turnStep = 0;
						this.needTurn = false;
					} //console.log( this.angledelta, this.turnStep	)

				}

				return true;
			}
		}

		getNear(s1, s2) {
			let r = Math.atan2(Math.sin(s1 - s2), Math.cos(s1 - s2));
			return r;
		}

		getPos() {
			return {
				x: this.position.x,
				y: this.position.y,
				r: -this.angle
			};
		}

		update() {
			var p;

			if (this.pathSampler.hasNext) {
				if (this.needTurn) {
					this.isTurn = true;
					this.step++;
					this.angle += this.angledelta;
					if (this.step === this.turnStep) this.needTurn = false;
				} else {
					this.newPath = false;
					this.isMove = true;
					this.isTurn = false;
					this.pathSampler.next();
				}
			} else {
				this.isMove = false;
				this.isTurn = false;
				this.tmppath = [];
			}

			this.isActive = this.isMove || this.isTurn ? true : false;
			if (this.isMove && !this.isWalking) this.isWalking = true;
			if (!this.isMove && this.isWalking) this.isWalking = false;

			if (this.mesh !== null) {
				p = this.getPos();
				this.mesh.position.set(p.x, 0, p.y);
				this.mesh.rotation.y = p.r - Math.PI * 0.5;
			}
		}

	}

	class World {
		constructor(w = 512, h = 512) {
			IDX.reset();
			this.heroes = [];
			this.shapes = [];
			this.segments = [];
			this.objects = [];
			this.w = w;
			this.h = h;
			this.mesh = new RectMesh(this.w, this.h);
			this.pathFinder = new PathFinder();
			this.pathFinder.mesh = this.mesh;
		}

		getMesh() {
			return this.mesh;
		}

		update() {
			let lng = this.heroes.length;
			let i = lng,
					j,
					h;

			while (i--) {
				h = this.heroes[i];
				h.update();

				if (h.testSee) {
					j = lng;

					while (j--) {
						if (i !== j) {
							//this.heroes[i].entity.isSee = this.heroes[i].fov.isInField( this.heroes[j].entity );
							this.heroes[i].isSee = this.heroes[i].fov.isInField(this.heroes[j]);
						}
					}
				}
			}
		}

		updateMesh() {
			this.mesh.updateObjects();
		}

		updateAll() {
			this.mesh.updateAll();
		}

		add(o) {
			this.mesh.insertObject(o);
			this.objects.push(o);
		}

		addHeroe(s) {
			let h = new Entity(s, this);
			this.heroes.push(h);
			return h;
		}

		addObject(o = {}) {
			let ob = new Object2D();
			ob.coordinates = o.coord || [-1, -1, 1, -1, 1, -1, 1, 1, 1, 1, -1, 1, -1, 1, -1, -1];
			ob.position(o.x || 1, o.y || 1);
			ob.scale(o.w || 1, o.h || 1);
			ob.pivot(o.px || 0, o.py || 0); //ob.pivot( o.x || 1, o.y || 1 )

			ob.rotation = o.r * torad || 0;
			this.mesh.insertObject(ob);
			this.objects.push(ob);
			return ob;
		}

		reset(w, h) {
			this.mesh.dispose();
			if (w) this.w = w;
			if (h) this.h = h;
			this.mesh = new RectMesh(this.w, this.h);
			this.pathFinder.mesh = this.mesh;
		}

		rebuild(mesh) {
			this.mesh.clear(true);
			if (mesh !== undefined) this.mesh = mesh;else this.mesh = new RectMesh(this.w, this.h);
			this.pathFinder.mesh = this.mesh; //this.mesh._objects = [];

			let i = this.objects.length,
					n = 0;

			while (i--) {
				this.objects[n]._constraintShape = null;
				this.mesh.insertObject(this.objects[n]);
				n++;
			}
		}

		addBitmapZone(o = {}) {
			if (o.url) {
				// by image url
				let img = document.createElement('img');

				img.onload = function () {
					o.pixel = fromImageData(img);
					this.updateBitmapZone(o);
				}.bind(this);

				img.src = o.url;
			}

			if (o.canvas) {
				// by canvas 
				let w = o.canvas.width;
				let h = o.canvas.height;
				o.pixel = fromImageData(null, o.canvas.getContext('2d').getImageData(0, 0, w, h), w, h);
				this.updateBitmapZone(o);
			}

			if (o.img) {
				// by direct image
				o.pixel = fromImageData(o.img);
				this.updateBitmapZone(o);
			}
		}

		updateBitmapZone(o = {}) {
			this.mesh.dispose();
			this.mesh = BitmapMesh.buildFromBmpData(o.pixel, o.precision, o.color);
			this.pathFinder.mesh = this.mesh;
			/*
			let obj = BitmapObject.buildFromBmpData( o.pixel, o.precision, o.color );
			obj._constraintShape = null;
			this.reset( o.w, o.h );
			this.mesh.insertObject( obj );
			//this.add( obj );
			*/

			let view = Main.get();
			if (view) view.drawMesh(this.mesh);
		}

	}

	function Cell(col, row) {
		this.visited = false;
		this.col = col;
		this.row = row;
		let _g = [];
		let _g2 = 0;
		let _g1 = 4;

		while (_g2 < _g1) {
			_g2++;

			_g.push([]);
		}

		this.walls = _g;
	}
	class GridMaze {
		constructor(width, height, cols, rows) {
			this.generate(width, height, cols, rows);
		}

		generate(width, height, cols, rows) {
			this.tileWidth = width / cols | 0;
			this.tileHeight = height / rows | 0;
			this.cols = cols;
			this.rows = rows;
			this.rng = new RandGenerator(randInt(1234, 7259));
			this.makeGrid();
			this.traverseGrid();
			this.populateObject();
		}

		makeGrid() {
			this.grid = [];
			let _g1 = 0;
			let _g = this.cols;

			while (_g1 < _g) {
				let c = _g1++;
				this.grid[c] = [];
				let _g3 = 0;
				let _g2 = this.rows;

				while (_g3 < _g2) {
					let r = _g3++;
					let cell = new Cell(c, r);
					this.grid[c][r] = cell;
					let topLeft = [c * this.tileWidth, r * this.tileHeight];
					let topRight = [(c + 1) * this.tileWidth, r * this.tileHeight];
					let bottomLeft = [c * this.tileWidth, (r + 1) * this.tileHeight];
					let bottomRight = [(c + 1) * this.tileWidth, (r + 1) * this.tileHeight];
					cell.walls[0] = topLeft.concat(topRight);
					cell.walls[1] = topRight.concat(bottomRight);
					cell.walls[2] = bottomLeft.concat(bottomRight);
					if (r != 0 || c != 0) cell.walls[3] = topLeft.concat(bottomLeft);
				}
			}
		}

		traverseGrid() {
			let DX = [0, 1, 0, -1];
			let DY = [-1, 0, 1, 0];
			let REVERSED_DIR = [2, 3, 0, 1];
			let c = this.rng.nextInRange(0, this.cols - 1);
			let r = this.rng.nextInRange(0, this.rows - 1);
			let cells = [this.grid[c][r]];

			while (cells.length > 0) {
				let idx = cells.length - 1;
				let currCell = cells[idx];
				currCell.visited = true;
				let dirs = [0, 1, 2, 3];
				this.rng.shuffle(dirs);
				let _g = 0;

				while (_g < dirs.length) {
					let dir = dirs[_g];
					++_g;
					let c1 = currCell.col + DX[dir];
					let r1 = currCell.row + DY[dir];

					if (c1 >= 0 && c1 < this.cols && r1 >= 0 && r1 < this.rows && !this.grid[c1][r1].visited) {
						let chosenCell = this.grid[c1][r1];
						currCell.walls[dir] = [];
						chosenCell.walls[REVERSED_DIR[dir]] = [];
						chosenCell.visited = true;
						cells.push(chosenCell);
						idx = -1;
						break;
					}
				}

				if (idx >= 0) cells.splice(idx, 1);
			}
		}

		populateObject() {
			this.object = new Object2D();
			let coords = [];
			let _g1 = 0;
			let _g = this.cols;

			while (_g1 < _g) {
				let c = _g1++;
				let _g3 = 0;
				let _g2 = this.rows;

				while (_g3 < _g2) {
					let r = _g3++;
					let cell = this.grid[c][r];
					let _g4 = 0;
					let _g5 = cell.walls;

					while (_g4 < _g5.length) {
						let wall = _g5[_g4];
						++_g4;
						let _g6 = 0;

						while (_g6 < wall.length) {
							let coord = wall[_g6];
							++_g6;
							coords.push(coord);
						}
					}
				}
			}

			this.object.coordinates = coords;
		}

	}

	class BitmapObject {
		static buildFromBmpData(pixel, precision = 1, color) {
			if (color !== undefined) Potrace.setColor(color);
			precision = precision || 1;
			let optimised = precision >= 1; // OUTLINES STEP-LIKE SHAPES GENERATION

			const shapes = Potrace.buildShapes(pixel); // OPTIMIZED POLYGONS GENERATION FROM GRAPH OF POTENTIAL SEGMENTS GENERATION
			// OBJECT GENERATION

			let i = shapes.length,
					j,
					poly,
					n = 0,
					n2 = 0;
			const obj = new Object2D();

			while (i--) {
				if (optimised) shapes[n] = ShapeSimplifier(shapes[n], precision);
				poly = Potrace.buildPolygon(Potrace.buildGraph(shapes[n]));
				j = (poly.length - 2) * 0.5;
				n2 = 0;

				while (j--) {
					obj.coordinates.push(poly[n2], poly[n2 + 1], poly[n2 + 2], poly[n2 + 3]);
					n2 += 2;
				}

				obj.coordinates.push(poly[0], poly[1], poly[n2], poly[n2 + 1]);
				/*
				lng = poly.length - 2;
				for ( j = 0; j < lng; j += 2 ) obj.coordinates.push( poly[j], poly[j+1], poly[j+2], poly[j+3] )
				obj.coordinates.push( poly[0], poly[1], poly[j], poly[j+1] )
				*/

				n++;
			}

			return obj;
		}

	}

	class Dungeon {
		constructor(w, h, min, max) {
			this.generate(w, h, min, max);
		}

		generate(w, h, min, max) {
			this.w = w / 10;
			this.h = h / 10;
			this.rooms = [];
			this.map = [];
			let i, x, y;

			for (x = 0; x < this.w; x++) {
				this.map[x] = [];

				for (y = 0; y < this.h; y++) {
					this.map[x][y] = 0;
				}
			}

			let room_count = randInt(10, 20);
			let min_size = min || 5;
			let max_size = max || 15;

			for (i = 0; i < room_count; i++) {
				let room = {};
				room.x = randInt(1, this.w - max_size - 1);
				room.y = randInt(1, this.h - max_size - 1);
				room.w = randInt(min_size, max_size);
				room.h = randInt(min_size, max_size);

				if (this.DoesCollide(room)) {
					i--;
					continue;
				}

				room.w--;
				room.h--;
				this.rooms.push(room);
			}

			this.SquashRooms();

			for (i = 0; i < room_count; i++) {
				let roomA = this.rooms[i];
				let roomB = this.FindClosestRoom(roomA);
				let pointA = {
					x: randInt(roomA.x, roomA.x + roomA.w),
					y: randInt(roomA.y, roomA.y + roomA.h)
				};
				let pointB = {
					x: randInt(roomB.x, roomB.x + roomB.w),
					y: randInt(roomB.y, roomB.y + roomB.h)
				};

				while (pointB.x != pointA.x || pointB.y != pointA.y) {
					if (pointB.x != pointA.x) {
						if (pointB.x > pointA.x) pointB.x--;else pointB.x++;
					} else if (pointB.y != pointA.y) {
						if (pointB.y > pointA.y) pointB.y--;else pointB.y++;
					}

					this.map[pointB.x][pointB.y] = 1;
				}
			}

			for (i = 0; i < room_count; i++) {
				let room = this.rooms[i];

				for (let x = room.x; x < room.x + room.w; x++) {
					for (let y = room.y; y < room.y + room.h; y++) {
						this.map[x][y] = 1;
					}
				}
			}

			for (x = 0; x < this.w; x++) {
				for (y = 0; y < this.h; y++) {
					if (this.map[x][y] == 1) {
						for (let xx = x - 1; xx <= x + 1; xx++) {
							for (let yy = y - 1; yy <= y + 1; yy++) {
								if (this.map[xx][yy] == 0) this.map[xx][yy] = 2;
							}
						}
					}
				}
			}

			this.populateObject();
		}

		FindClosestRoom(room) {
			let mid = {
				x: room.x + room.w / 2,
				y: room.y + room.h / 2
			};
			let closest = null;
			let closest_distance = 1000;

			for (let i = 0; i < this.rooms.length; i++) {
				let check = this.rooms[i];
				if (check == room) continue;
				let check_mid = {
					x: check.x + check.w / 2,
					y: check.y + check.h / 2
				};
				let distance = Math.min(Math.abs(mid.x - check_mid.x) - room.w / 2 - check.w / 2, Math.abs(mid.y - check_mid.y) - room.h / 2 - check.h / 2);

				if (distance < closest_distance) {
					closest_distance = distance;
					closest = check;
				}
			}

			return closest;
		}

		SquashRooms() {
			for (let i = 0; i < 10; i++) {
				for (let j = 0; j < this.rooms.length; j++) {
					let room = this.rooms[j];

					while (true) {
						let old_position = {
							x: room.x,
							y: room.y
						};
						if (room.x > 1) room.x--;
						if (room.y > 1) room.y--;
						if (room.x == 1 && room.y == 1) break;

						if (this.DoesCollide(room, j)) {
							room.x = old_position.x;
							room.y = old_position.y;
							break;
						}
					}
				}
			}
		}

		DoesCollide(room, ignore) {
			for (let i = 0; i < this.rooms.length; i++) {
				if (i == ignore) continue;
				let check = this.rooms[i];
				if (!(room.x + room.w < check.x || room.x > check.x + check.w || room.y + room.h < check.y || room.y > check.y + check.h)) return true;
			}

			return false;
		}

		populateObject() {
			let canvas = document.createElement('canvas');
			canvas.width = this.w * 10;
			canvas.height = this.h * 10;
			let scale = 10; //canvas.width / this.w;

			let ctx = canvas.getContext('2d');
			ctx.fillStyle = '#FFF';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			for (let y = 0; y < this.h; y++) {
				for (let x = 0; x < this.w; x++) {
					let tile = this.map[x][y]; //console.log(tile)

					if (tile === 0) ctx.fillStyle = '#000000';else if (tile === 1) ctx.fillStyle = '#FFFFFF';else ctx.fillStyle = '#000000';
					ctx.fillRect(x * scale, y * scale, scale, scale);
				}
			}

			let pixels = fromImageData(null, ctx.getImageData(0, 0, this.w * 10, this.h * 10), this.w * 10, this.h * 10);
			this.object = BitmapObject.buildFromBmpData(pixels, 1.8);
		}

	}

	class SimpleView {
		constructor(world, target, css) {
			//this.w = w || 512;
			//this.h = h || 512;
			this.g0 = new BasicCanvas(world.w, world.h, target, css);
			this.g = new BasicCanvas(world.w, world.h, target, css);
			this.g.canvas.style.pointerEvents = 'none';
			this.g0.canvas.style.pointerEvents = 'auto';
			this.entitiesWidth = 2;
			this.entitiesColor = {
				r: 0,
				g: 0,
				b: 255,
				a: 0.75
			};
			this.entitiesColor2 = {
				r: 255,
				g: 255,
				b: 255,
				a: 0.75
			};
			this.entitiesField = {
				r: 0,
				g: 0,
				b: 255,
				a: 0.1
			};
			this.entitiesField2 = {
				r: 255,
				g: 255,
				b: 255,
				a: 0.1
			};
			this.pathsWidth = 2;
			this.pathsColor = {
				r: 255,
				g: 255,
				b: 0,
				a: 0.75
			};
			this.verticesRadius = 1;
			this.verticesColor = {
				r: 255,
				g: 120,
				b: 0,
				a: 0.5
			};
			this.constraintsWidth = 2;
			this.constraintsColor = {
				r: 0,
				g: 255,
				b: 0,
				a: 1
			};
			this.edgesWidth = 1;
			this.edgesColor = {
				r: 190,
				g: 190,
				b: 190,
				a: 0.25
			};
			this.edgesColor2 = {
				r: 0,
				g: 190,
				b: 0,
				a: 0.25
			}; //this.graphics = new DDLS.DrawContext( canvas );
			//this.g = this.graphics.g;

			this.mesh_data = null;
			this.domElement = this.g0.canvas;

			this.extraEdge = function (p1, p2) {};

			Main.set(this);
		}

		drawImage(img, w, h) {
			this.g0.drawImage(img, w, h);
		}

		drawMesh(mesh, clean) {
			let g = this.g0;
			let c = clean === undefined ? false : clean;
			if (c) this.g0.clear();
			mesh.compute_Data();
			let edge = mesh.AR_edge;
			let vertex = mesh.AR_vertex;
			let i = edge.length;
			let n = 0;

			while (i--) {
				n = i * 5;

				if (edge[n + 4]) {
					g.lineStyle(this.constraintsWidth, this.constraintsColor);
					this.extraEdge([edge[n], edge[n + 1]], [edge[n + 2], edge[n + 3]]);
				} else {
					//if( edge[n+4] ) this.g.lineStyle( this.edgesWidth, this.edgesColor2 );
					//else 
					g.lineStyle(this.edgesWidth, this.edgesColor);
				}

				g.moveTo(edge[n], edge[n + 1]);
				g.lineTo(edge[n + 2], edge[n + 3]);
				g.stroke();
				g.closePath();
			}

			g.lineStyle(this.verticesRadius, this.verticesColor);
			i = vertex.length;

			while (i--) {
				n = i * 2;
				g.beginFill(this.verticesColor, this.verticesAlpha);
				g.drawCircle(vertex[n], vertex[n + 1], this.verticesRadius);
				g.endFill();
			}
		}

		drawEntity(entity, clean) {
			let g = this.g;
			let see = entity.isSee;
			let c = clean === undefined ? false : clean;
			if (c) g.clear();
			if (see) g.beginFill(this.entitiesField);else g.beginFill(this.entitiesField2);
			g.moveTo(entity.position.x, entity.position.y);
			g.drawCircle(entity.position.x, entity.position.y, entity.radiusFOV, entity.angle - entity.angleFOV * 0.5, entity.angle + entity.angleFOV * 0.5);
			g.lineTo(entity.position.x, entity.position.y);
			g.endFill();
			g.beginFill(see ? entity.color2 : entity.color);
			g.lineStyle(this.entitiesWidth, this.entitiesColor2); // g.stroke();
			// if( see ) 
			//else g.beginFill(this.entitiesColor2);

			g.drawCircle(entity.position.x, entity.position.y, entity.radius); //console.log(entity.direction)

			g.stroke();
			g.endFill(); //
		}
		/*drawEntities: function( vEntities, clean ) {
					let c = clean === undefined ? false : clean;
				if(c) this.g.clear();
					let _g1 = 0;
				let _g = vEntities.length;
				while(_g1 < _g) {
						let i = _g1++;
						this.drawEntity( vEntities[i], false );
				}
		},*/


		drawPath(path, clean) {
			let g = this.g;
			let c = clean === undefined ? false : clean;
			if (c) this.g.clear();
			if (path.length === 0) return;
			g.lineStyle(this.pathsWidth, this.pathsColor);
			g.moveTo(path[0], path[1]);
			let i = 2;

			while (i < path.length) {
				g.lineTo(path[i], path[i + 1]); //g.moveTo(path[i],path[i + 1]);

				i += 2;
			}

			g.stroke();
		}

		clear() {
			this.g.clear();
		}

	} // CANVAS

	class BasicCanvas {
		constructor(w, h, target, css) {
			this.w = w || 200;
			this.h = h || 200;
			this.canvas = document.createElement("canvas");
			this.canvas.width = this.w;
			this.canvas.height = this.h;
			this.ctx = this.canvas.getContext("2d");
			this.canvas.style.cssText = css || 'position:absolute; left:50%; top:50%; margin-left:' + -this.w * 0.5 + 'px; margin-top:' + -this.h * 0.5 + 'px;';
			if (target === undefined) target = document.body;
			target.appendChild(this.canvas);
		}

		clear() {
			this.ctx.clearRect(0, 0, this.w, this.h);
		}

		drawImage(img, w, h) {
			this.ctx.drawImage(img, 0, 0, w || this.w, h || this.h);
		}

		drawCircle(x, y, radius, s, e) {
			s = s || 0;
			e = e || TwoPI;
			this.ctx.beginPath();
			this.ctx.arc(x, y, radius, s, e, false); //this.ctx.stroke();
			//this.ctx.closePath();
		}

		drawRect(x, y, width, height) {
			this.ctx.beginPath();
			this.ctx.moveTo(x, y);
			this.ctx.lineTo(x + width, y);
			this.ctx.lineTo(x + width, y + height);
			this.ctx.lineTo(x, y + height);
			this.ctx.stroke();
			this.ctx.closePath();
		}

		lineStyle(wid, c) {
			this.ctx.lineWidth = wid;
			this.ctx.strokeStyle = "rgba(" + c.r + "," + c.g + "," + c.b + "," + c.a + ")";
		}

		moveTo(x, y) {
			this.ctx.beginPath();
			this.ctx.moveTo(x, y);
		}

		lineTo(x, y) {
			this.ctx.lineTo(x, y); //this.ctx.stroke();
			// this.ctx.closePath();
		}

		stroke() {
			this.ctx.stroke(); //this.ctx.stroke();
			// this.ctx.closePath();
		}

		closePath() {
			this.ctx.closePath(); //this.ctx.stroke();
			// this.ctx.closePath();
		}

		beginFill(c) {
			this.ctx.fillStyle = "rgba(" + c.r + "," + c.g + "," + c.b + "," + c.a + ")";
			this.ctx.beginPath();
		}

		endFill() {
			//this.ctx.stroke();
			this.ctx.closePath();
			this.ctx.fill();
		}

	} // DRAW CONTEXT

	/*
	function DrawContext(g) {
			this.g = g;
	};

	DrawContext.prototype = {
			clear: function() { this.g.clear(); },
			lineStyle: function(thickness,c) { this.g.lineStyle(thickness,c); },
			beginFill: function(c) { this.g.beginFill(c);},
			endFill: function() { this.g.endFill(); },
			moveTo: function(x,y) { this.g.moveTo(x,y); },
			lineTo: function(x,y) { this.g.lineTo(x,y);},
			drawCircle: function(cx,cy,r) { this.g.drawCircle(cx,cy,r); },
			drawRect: function(x,y,w,h) { this.g.drawRect(x,y,w,h); }
	};*/

	function ThreeView(scene, world, THREE) {
		let TH = THREE;
		this.world = world;
		this.maxVertices = 30000;
		this.currentVertex = 0;
		let geometry = new TH.BufferGeometry();
		geometry.addAttribute('position', new TH.BufferAttribute(new Float32Array(this.maxVertices * 3), 3));
		geometry.addAttribute('color', new TH.BufferAttribute(new Float32Array(this.maxVertices * 3), 3));
		this.positions = geometry.attributes.position.array;
		this.colors = geometry.attributes.color.array;
		geometry.computeBoundingSphere();
		this.buffer = new TH.LineSegments(geometry, new TH.LineBasicMaterial({
			vertexColors: true
		}));
		this.buffer.frustumCulled = false;
		scene.add(this.buffer); // PATH

		this.maxPathVertices = 1000;
		this.currentPathVertex = 0;
		let geometryPath = new TH.BufferGeometry();
		geometryPath.addAttribute('position', new TH.BufferAttribute(new Float32Array(this.maxPathVertices * 3), 3));
		geometryPath.addAttribute('color', new TH.BufferAttribute(new Float32Array(this.maxPathVertices * 3), 3));
		this.positionsPath = geometryPath.attributes.position.array;
		this.colorsPath = geometryPath.attributes.color.array;
		geometry.computeBoundingSphere();
		this.bufferPath = new TH.LineSegments(geometryPath, new TH.LineBasicMaterial({
			vertexColors: true
		}));
		this.bufferPath.frustumCulled = false;
		scene.add(this.bufferPath);
		Main.set(this);
	}

	ThreeView.prototype = {
		constructor: ThreeView,
		drawMesh: function (mesh, clean) {},
		collapseBuffer: function () {
			let i = this.maxVertices;
			let min = this.currentVertex;
			let n = 0;

			while (i >= min) {
				n = i * 3;
				this.positions[n] = 0;
				this.positions[n + 1] = 0;
				this.positions[n + 2] = 0;
				this.colors[n] = 0;
				this.colors[n + 1] = 0;
				this.colors[n + 2] = 0;
				i--;
			}
		},
		collapsePathBuffer: function () {
			let i = this.maxPathVertices;
			let min = this.currentPathVertex;
			let n = 0;

			while (i >= min) {
				n = i * 3;
				this.positionsPath[n] = 0;
				this.positionsPath[n + 1] = 0;
				this.positionsPath[n + 2] = 0;
				this.colorsPath[n] = 0;
				this.colorsPath[n + 1] = 0;
				this.colorsPath[n + 2] = 0;
				i--;
			}
		},
		update: function () {
			//
			//let redraw = this.world.mesh.updateObjects();
			//if(redraw){
			if (this.world.mesh.isRedraw) {
				this.currentVertex = 0;
				this.world.mesh.draw();
				this.collapseBuffer();
				this.buffer.geometry.attributes.position.needsUpdate = true;
				this.buffer.geometry.attributes.color.needsUpdate = true;
			}

			this.world.update();
			let i = this.world.heroes.length,
					h;

			while (i--) {
				h = this.world.heroes[i]; //this.world.heroes[i].update();

				if (h.isSelected && h.tmppath.length > 0) {
					this.currentPathVertex = 0;
					let p = this.world.heroes[i].tmppath; //if( p.length === 0 ) return;

					let prevX = p[0];
					let prevY = p[1];
					let j = 2;

					while (j < p.length) {
						this.insertPath(prevX, prevY, p[j], p[j + 1], 1, 0, 0);
						prevX = p[j];
						prevY = p[j + 1];
						j += 2;
					}
					/*let j = p.length*0.25, n;
					while(j--){
							n = j*4;
							this.insertPath(p[n], p[n+1], p[n+2], p[n+3], 1,0,0);
					}*/


					this.collapsePathBuffer();
					this.bufferPath.geometry.attributes.position.needsUpdate = true;
					this.bufferPath.geometry.attributes.color.needsUpdate = true;
				}
			}
		},
		insertLine: function (x1, y1, x2, y2, r, g, b) {
			let i = this.currentVertex;
			let n = i * 3;
			this.positions[n] = x1;
			this.positions[n + 1] = 0;
			this.positions[n + 2] = y1;
			this.colors[n] = r;
			this.colors[n + 1] = g;
			this.colors[n + 2] = b;
			i++;
			n = i * 3;
			this.positions[n] = x2;
			this.positions[n + 1] = 0;
			this.positions[n + 2] = y2;
			this.colors[n] = r;
			this.colors[n + 1] = g;
			this.colors[n + 2] = b;
			this.currentVertex += 2;
		},
		insertPath: function (x1, y1, x2, y2, r, g, b) {
			let i = this.currentPathVertex;
			let n = i * 3;
			this.positionsPath[n] = x1;
			this.positionsPath[n + 1] = 0;
			this.positionsPath[n + 2] = y1;
			this.colorsPath[n] = r;
			this.colorsPath[n + 1] = g;
			this.colorsPath[n + 2] = b;
			i++;
			n = i * 3;
			this.positionsPath[n] = x2;
			this.positionsPath[n + 1] = 0;
			this.positionsPath[n + 2] = y2;
			this.colorsPath[n] = r;
			this.colorsPath[n + 1] = g;
			this.colorsPath[n + 2] = b;
			this.currentPathVertex += 2;
		}
	};

	Mesh2D.prototype.draw = function () {
		//console.log('meshdraw')
		this.compute_Data();
		let view = Main.get();
		let edge = this.AR_edge;
		let i = edge.length;
		let n = 0;

		while (i--) {
			n = i * 5;

			if (edge[n + 4]) {
				view.insertLine(edge[n], edge[n + 1], edge[n + 2], edge[n + 3], 0, 0, 0);
			} else {
				view.insertLine(edge[n], edge[n + 1], edge[n + 2], edge[n + 3], 0.4, 0.4, 0.4);
			}
		}

		this.isRedraw = false;
	};
	/*Entity.prototype.draw = function(){

	}*/

	exports.Debug = Debug;
	exports.Dungeon = Dungeon;
	exports.GridMaze = GridMaze;
	exports.Point = Point;
	exports.REVISION = REVISION;
	exports.SimpleView = SimpleView;
	exports.ThreeView = ThreeView;
	exports.TwoPI = TwoPI;
	exports.World = World;
	exports.rand = rand;
	exports.randInt = randInt;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
