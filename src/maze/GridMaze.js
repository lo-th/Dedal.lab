import { randInt } from '../core/Tools.js';
import { RandGenerator } from '../math/RandGenerator.js';
import { Object2D } from '../core/Object2D.js';


function Cell ( col, row ) {

    this.visited = false;
    this.col = col;
    this.row = row;
    let _g = [];
    let _g2 = 0;
    let _g1 = 4;
    while(_g2 < _g1) {
        let i = _g2++;
        _g.push([]);
    }
    this.walls = _g;

};


export class GridMaze {

    constructor ( width, height, cols, rows ) {


        this.generate(width,height,cols,rows);

    }

    generate ( width, height, cols, rows ) {

        this.tileWidth = width / cols | 0;
        this.tileHeight = height / rows | 0;
        this.cols = cols;
        this.rows = rows;
        this.rng = new RandGenerator( randInt( 1234, 7259 ) );
        this.makeGrid();
        this.traverseGrid();
        this.populateObject();

    }

    makeGrid () {

        this.grid = [];
        let _g1 = 0;
        let _g = this.cols;
        while(_g1 < _g) {
            let c = _g1++;
            this.grid[c] = [];
            let _g3 = 0;
            let _g2 = this.rows;
            while(_g3 < _g2) {
                let r = _g3++;
                let cell = new Cell(c,r);
                this.grid[c][r] = cell;
                let topLeft = [c * this.tileWidth,r * this.tileHeight];
                let topRight = [(c + 1) * this.tileWidth,r * this.tileHeight];
                let bottomLeft = [c * this.tileWidth,(r + 1) * this.tileHeight];
                let bottomRight = [(c + 1) * this.tileWidth,(r + 1) * this.tileHeight];
                cell.walls[0] = topLeft.concat(topRight);
                cell.walls[1] = topRight.concat(bottomRight);
                cell.walls[2] = bottomLeft.concat(bottomRight);
                if(r != 0 || c != 0) cell.walls[3] = topLeft.concat(bottomLeft);
            }
        }

    }

    traverseGrid () {

        let DX = [0,1,0,-1];
        let DY = [-1,0,1,0];
        let REVERSED_DIR = [2,3,0,1];
        let c = this.rng.nextInRange( 0, this.cols - 1 );
        let r = this.rng.nextInRange( 0, this.rows - 1 );
        let cells = [this.grid[c][r]];
        while(cells.length > 0) {
            let idx = cells.length - 1;
            let currCell = cells[idx];
            currCell.visited = true;
            let dirs = [0,1,2,3];
            this.rng.shuffle( dirs );
            let _g = 0;
            while(_g < dirs.length) {
                let dir = dirs[_g];
                ++_g;
                let c1 = currCell.col + DX[dir];
                let r1 = currCell.row + DY[dir];
                if(c1 >= 0 && c1 < this.cols && r1 >= 0 && r1 < this.rows && !this.grid[c1][r1].visited) {
                    let chosenCell = this.grid[c1][r1];
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
    }

    populateObject () {

        this.object = new Object2D();
        let coords = [];
        let _g1 = 0;
        let _g = this.cols;
        while(_g1 < _g) {
            let c = _g1++;
            let _g3 = 0;
            let _g2 = this.rows;
            while(_g3 < _g2) {
                let r = _g3++;
                let cell = this.grid[c][r];
                let _g4 = 0;
                let _g5 = cell.walls;
                while(_g4 < _g5.length) {
                    let wall = _g5[_g4];
                    ++_g4;
                    let _g6 = 0;
                    while(_g6 < wall.length) {
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