import { randInt } from '../core/Tools';
import { RandGenerator } from '../math/RandGenerator';
import { Object2D } from '../core/Object2D';


function Cell ( col, row ) {

    this.visited = false;
    this.col = col;
    this.row = row;
    var _g = [];
    var _g2 = 0;
    var _g1 = 4;
    while(_g2 < _g1) {
        var i = _g2++;
        _g.push([]);
    }
    this.walls = _g;

};

function GridMaze ( width, height, cols, rows ) {

    this.generate(width,height,cols,rows);

};

GridMaze.prototype = {

    constructor: GridMaze,

    generate: function( width, height, cols, rows ) {

        this.tileWidth = width / cols | 0;
        this.tileHeight = height / rows | 0;
        this.cols = cols;
        this.rows = rows;
        this.rng = new RandGenerator( randInt( 1234, 7259 ) );
        this.makeGrid();
        this.traverseGrid();
        this.populateObject();

    },

    makeGrid: function () {

        this.grid = [];
        var _g1 = 0;
        var _g = this.cols;
        while(_g1 < _g) {
            var c = _g1++;
            this.grid[c] = [];
            var _g3 = 0;
            var _g2 = this.rows;
            while(_g3 < _g2) {
                var r = _g3++;
                var cell = new Cell(c,r);
                this.grid[c][r] = cell;
                var topLeft = [c * this.tileWidth,r * this.tileHeight];
                var topRight = [(c + 1) * this.tileWidth,r * this.tileHeight];
                var bottomLeft = [c * this.tileWidth,(r + 1) * this.tileHeight];
                var bottomRight = [(c + 1) * this.tileWidth,(r + 1) * this.tileHeight];
                cell.walls[0] = topLeft.concat(topRight);
                cell.walls[1] = topRight.concat(bottomRight);
                cell.walls[2] = bottomLeft.concat(bottomRight);
                if(r != 0 || c != 0) cell.walls[3] = topLeft.concat(bottomLeft);
            }
        }

    },

    traverseGrid: function () {

        var DX = [0,1,0,-1];
        var DY = [-1,0,1,0];
        var REVERSED_DIR = [2,3,0,1];
        var c = this.rng.nextInRange( 0, this.cols - 1 );
        var r = this.rng.nextInRange( 0, this.rows - 1 );
        var cells = [this.grid[c][r]];
        while(cells.length > 0) {
            var idx = cells.length - 1;
            var currCell = cells[idx];
            currCell.visited = true;
            var dirs = [0,1,2,3];
            this.rng.shuffle( dirs );
            var _g = 0;
            while(_g < dirs.length) {
                var dir = dirs[_g];
                ++_g;
                var c1 = currCell.col + DX[dir];
                var r1 = currCell.row + DY[dir];
                if(c1 >= 0 && c1 < this.cols && r1 >= 0 && r1 < this.rows && !this.grid[c1][r1].visited) {
                    var chosenCell = this.grid[c1][r1];
                    currCell.walls[dir] = [];
                    chosenCell.walls[REVERSED_DIR[dir]] = [];
                    chosenCell.visited = true;
                    cells.push(chosenCell);
                    idx = -1;
                    break;
                }
            }
            if(idx >= 0) cells.splice(idx,1);
        }
    },

    populateObject: function () {

        this.object = new Object2D();
        var coords = [];
        var _g1 = 0;
        var _g = this.cols;
        while(_g1 < _g) {
            var c = _g1++;
            var _g3 = 0;
            var _g2 = this.rows;
            while(_g3 < _g2) {
                var r = _g3++;
                var cell = this.grid[c][r];
                var _g4 = 0;
                var _g5 = cell.walls;
                while(_g4 < _g5.length) {
                    var wall = _g5[_g4];
                    ++_g4;
                    var _g6 = 0;
                    while(_g6 < wall.length) {
                        var coord = wall[_g6];
                        ++_g6;
                        coords.push(coord);
                    }
                }
            }
        }
        this.object.coordinates = coords;

    }
}

export { GridMaze };