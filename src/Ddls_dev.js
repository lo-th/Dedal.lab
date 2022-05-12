//import './polyfills.js';

import { Debug, TwoPI, REVISION } from './constants.js';
//import { Point } from './math/Point.js';
//import { Matrix2D } from './math/Matrix2D.js';
//import { Geom2D } from './math/Geom2D.js';

import { rand, randInt } from './core/Tools.js';
/*import { Edge } from './core/Edge.js';
import { Face } from './core/Face.js';
import { Vertex } from './core/Vertex.js';
import { Shape } from './core/Shape.js';
import { Segment } from './core/Segment.js';
import { Object2D } from './core/Object2D.js';
import { Graph } from './core/Graph.js';
import { Potrace } from './core/Potrace.js';
import { Mesh2D } from './core/Mesh2D.js';*/

/*import { AStar } from './ai/AStar.js';
import { Funnel } from './ai/Funnel.js';
import { PathFinder } from './ai/PathFinder.js';
import { PathIterator } from './ai/PathIterator.js';
import { LinearPathSampler } from './ai/LinearPathSampler.js';
import { FieldOfView } from './ai/FieldOfView.js';*/
//import { Entity } from './ai/Entity.js';
import { World } from './ai/World.js'

/*import { RectMesh } from './factories/RectMesh.js';
import { CircleMesh } from './factories/CircleMesh.js';
import { BitmapObject } from './factories/BitmapObject.js';
import { BitmapMesh } from './factories/BitmapMesh.js';
*/
import { GridMaze } from './maze/GridMaze.js';
import { Dungeon } from './maze/Dungeon.js';

import { SimpleView } from './view/SimpleView.js';
import { ThreeView } from './view/ThreeView.js';


export const DDLS = {

	REVISION:REVISION,
	Debug:Debug,

	randInt:randInt,
	rand:rand,
	TwoPI:TwoPI,

	World:World,
	SimpleView:SimpleView,
	ThreeView:ThreeView,

	GridMaze:GridMaze,
	Dungeon:Dungeon

}