import { randInt } from '../core/Tools.js';
import { fromImageData } from '../core/Tools.js';
import { BitmapObject } from '../factories/BitmapObject.js';


export class Dungeon {

    constructor ( w, h, min, max ) {

        this.generate( w, h, min, max);
        
    }

    generate ( w, h, min, max ) {

        this.w = w/10;
        this.h = h/10;
        this.rooms = [];
        this.map = [];

        let i, x, y

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

    FindClosestRoom (room) {
        let mid = {
            x: room.x + (room.w / 2),
            y: room.y + (room.h / 2)
        };
        let closest = null;
        let closest_distance = 1000;
        for (let i = 0; i < this.rooms.length; i++) {
            let check = this.rooms[i];
            if (check == room) continue;
            let check_mid = {
                x: check.x + (check.w / 2),
                y: check.y + (check.h / 2)
            };
            let distance = Math.min(Math.abs(mid.x - check_mid.x) - (room.w / 2) - (check.w / 2), Math.abs(mid.y - check_mid.y) - (room.h / 2) - (check.h / 2));
            if (distance < closest_distance) {
                closest_distance = distance;
                closest = check;
            }
        }
        return closest;
    }

    SquashRooms () {
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
                    if ((room.x == 1) && (room.y == 1)) break;
                    if (this.DoesCollide(room, j)) {
                        room.x = old_position.x;
                        room.y = old_position.y;
                        break;
                    }
                }
            }
        }
    }

    DoesCollide (room, ignore) {
        for (let i = 0; i < this.rooms.length; i++) {
            if (i == ignore) continue;
            let check = this.rooms[i];
            if (!((room.x + room.w < check.x) || (room.x > check.x + check.w) || (room.y + room.h < check.y) || (room.y > check.y + check.h))) return true;
        }

        return false;
    }

    populateObject () {
        
        let canvas = document.createElement('canvas');
        canvas.width = this.w * 10;
        canvas.height = this.h * 10;

        let scale = 10;//canvas.width / this.w;
        let ctx = canvas.getContext('2d')
        ctx.fillStyle = '#FFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let y = 0; y < this.h; y++) {
            for (let x = 0; x < this.w; x++) {
                let tile = this.map[x][y];
                //console.log(tile)
                if (tile === 0) ctx.fillStyle = '#000000';
                else if (tile === 1) ctx.fillStyle = '#FFFFFF';
                else ctx.fillStyle = '#000000';
                ctx.fillRect(x * scale, y * scale, scale, scale);
            }
        }



        let pixels = fromImageData(null, ctx.getImageData(0,0,this.w* 10,this.h* 10), this.w* 10, this.h* 10 )
        this.object = BitmapObject.buildFromBmpData( pixels, 1.8 )

    }
}