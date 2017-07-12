
import { _Math } from '../math/Math';
import { fromImageData } from '../core/Tools';
import { BitmapObject } from '../factories/BitmapObject';

function Dungeon( w, h, min, max ) {
    //this.callback  = callback;
    this.generate( w, h, min, max);
    

};

Dungeon.prototype = {

    constructor: Dungeon,

    generate: function ( w, h, min, max ) {

        this.w = w/10;
        this.h = h/10;
        this.rooms = [];
        this.map = [];

        
        for (var x = 0; x < this.w; x++) {
            this.map[x] = [];
            for (var y = 0; y < this.h; y++) {
                this.map[x][y] = 0;
            }
        }

        var room_count = _Math.randInt(10, 20);
        var min_size = min || 5;
        var max_size = max || 15;

        for (var i = 0; i < room_count; i++) {
            var room = {};

            room.x = _Math.randInt(1, this.w - max_size - 1);
            room.y = _Math.randInt(1, this.h - max_size - 1);
            room.w = _Math.randInt(min_size, max_size);
            room.h = _Math.randInt(min_size, max_size);

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
            var roomA = this.rooms[i];
            var roomB = this.FindClosestRoom(roomA);

            var pointA = {
                x: _Math.randInt(roomA.x, roomA.x + roomA.w),
                y: _Math.randInt(roomA.y, roomA.y + roomA.h)
            };
            var pointB = {
                x: _Math.randInt(roomB.x, roomB.x + roomB.w),
                y: _Math.randInt(roomB.y, roomB.y + roomB.h)
            };

            while ((pointB.x != pointA.x) || (pointB.y != pointA.y)) {
                if (pointB.x != pointA.x) {
                    if (pointB.x > pointA.x) pointB.x--;
                    else pointB.x++;
                } else if (pointB.y != pointA.y) {
                    if (pointB.y > pointA.y) pointB.y--;
                    else pointB.y++;
                }

                this.map[pointB.x][pointB.y] = 1;
            }
        }

        for (i = 0; i < room_count; i++) {
            var room = this.rooms[i];
            for (var x = room.x; x < room.x + room.w; x++) {
                for (var y = room.y; y < room.y + room.h; y++) {
                    this.map[x][y] = 1;
                }
            }
        }

        for (var x = 0; x < this.w; x++) {
            for (var y = 0; y < this.h; y++) {
                if (this.map[x][y] == 1) {
                    for (var xx = x - 1; xx <= x + 1; xx++) {
                        for (var yy = y - 1; yy <= y + 1; yy++) {
                            if (this.map[xx][yy] == 0) this.map[xx][yy] = 2;
                        }
                    }
                }
            }
        }

        this.populateObject();
    },
    FindClosestRoom: function (room) {
        var mid = {
            x: room.x + (room.w / 2),
            y: room.y + (room.h / 2)
        };
        var closest = null;
        var closest_distance = 1000;
        for (var i = 0; i < this.rooms.length; i++) {
            var check = this.rooms[i];
            if (check == room) continue;
            var check_mid = {
                x: check.x + (check.w / 2),
                y: check.y + (check.h / 2)
            };
            var distance = Math.min(Math.abs(mid.x - check_mid.x) - (room.w / 2) - (check.w / 2), Math.abs(mid.y - check_mid.y) - (room.h / 2) - (check.h / 2));
            if (distance < closest_distance) {
                closest_distance = distance;
                closest = check;
            }
        }
        return closest;
    },
    SquashRooms: function () {
        for (var i = 0; i < 10; i++) {
            for (var j = 0; j < this.rooms.length; j++) {
                var room = this.rooms[j];
                while (true) {
                    var old_position = {
                        x: room.x,
                        y: room.y
                    };
                    if (room.x > 1) room.x--;
                    if (room.y > 1) room.y--;
                    if ((room.x == 1) && (room.y == 1)) break;
                    if (this.DoesCollide(room, j)) {
                        room.x = old_position.x;
                        room.y = old_position.y;
                        break;
                    }
                }
            }
        }
    },
    DoesCollide: function (room, ignore) {
        for (var i = 0; i < this.rooms.length; i++) {
            if (i == ignore) continue;
            var check = this.rooms[i];
            if (!((room.x + room.w < check.x) || (room.x > check.x + check.w) || (room.y + room.h < check.y) || (room.y > check.y + check.h))) return true;
        }

        return false;
    },
    populateObject : function() {

        
        //this.object = new DDLS.Object();
        //var coords = [];
        var canvas = document.createElement('canvas');
        canvas.width = this.w * 10;
        canvas.height = this.h * 10;

        var scale = 10;//canvas.width / this.w;
        var ctx = canvas.getContext('2d')
        ctx.fillStyle = '#FFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (var y = 0; y < this.h; y++) {
            for (var x = 0; x < this.w; x++) {
                var tile = this.map[x][y];
                //console.log(tile)
                if (tile === 0) ctx.fillStyle = '#000000';
                else if (tile === 1) ctx.fillStyle = '#FFFFFF';
                else ctx.fillStyle = '#000000';
                ctx.fillRect(x * scale, y * scale, scale, scale);
            }
        }



        var pixels = fromImageData(null, ctx.getImageData(0,0,this.w* 10,this.h* 10));
        this.object = BitmapObject.buildFromBmpData( pixels, 1.8 );

        //this.callback( this.object );
//console.log('creat', this.map )
        //canvas.style.cssText = 'position:absolute; left:0 top:0;';
        //document.body.appendChild( canvas );

    }
}

export { Dungeon };