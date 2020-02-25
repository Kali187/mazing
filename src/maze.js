import { P5 } from './p5wrapper';

const wallWidth = 1;
const cellStack = [];
let grid = {
    cols: null,
    rows: null
};
let cellSize;
let allCells = 0;

const findNeighbours = (index, cells, g = grid) => {
    //console.log( 'top: ', getCoords( index - g.cols ).row );
    let ns = {
        t: (getCoords(index).row > 0) ? (index - g.cols) : false,
        r: (getCoords(index).col < g.cols - 1) ? (index + 1) : false,
        b: (getCoords(index).row < g.rows - 1) ? (index + g.cols) : false,
        l: (getCoords(index).col > 0) ? (index - 1) : false
    };
    //console.log({ns});
    ns.t = (ns.t && !cells[ns.t].visited) ? ns.t : false;
    ns.r = (ns.r && !cells[ns.r].visited) ? ns.r : false;
    ns.b = (ns.b && !cells[ns.b].visited) ? ns.b : false;
    ns.l = (ns.l && !cells[ns.l].visited) ? ns.l : false;
    //console.log({ns})
    return ns;
}

const getRandomNeighbour = (ns) => {
    let availableNs = [
        { type: 't', val: ns.t },
        { type: 'r', val: ns.r },
        { type: 'b', val: ns.b },
        { type: 'l', val: ns.l }
    ].filter(n => n.val);
    //console.log({availableNs});
    if (availableNs.length) {
        let next = Math.floor(Math.random() * availableNs.length);
        //console.log( 'next => ', next );
        return availableNs[next];
    } else {
        return false;
    }
}

const getIndex = (col, row, g = grid) => {
    return (col + row * g.cols)
};

const getCoords = (index, g = grid) => {
    return ({
        col: index % g.cols,
        row: Math.floor(index / g.cols)
    });
};

const setCurrent = (col, row, cells) => {
    let index = getIndex(col, row);
    cells.forEach(cell => { cell.current = false; });
    if (!cells[index].visited) {
        allCells++;
        cells[index].visited = true;
    }
    cells[index].current = true;
    cells[index].visits += 1;
    return index;
}

const breakWall = (wall, cell) => {
    //console.log( `breaking wall [${wall}] in  cell: ${cell} `);
    cell.wall[wall] = false;
    return cell;
}

const breakOppositeWall = (wall, cell) => {
    //console.log( `breaking wall opposite to [${wall}] in  cell: ${cell} `);
    switch (wall) {
        case 't':
            return breakWall('b', cell);
        case 'r':
            return breakWall('l', cell);
        case 'b':
            return breakWall('t', cell);
        case 'l':
            return breakWall('r', cell);
    };
}


const drawCell = (cell) => {
    // //console.log(`cell: [${cell.coords.col},${cell.coords.row}]`);
    if (cell.visited) {
        P5.fill(255);
    } else {
        P5.fill(0, 0, 0, 128);
    };

    P5.stroke(255, 128);
    P5.strokeWeight(0);
    P5.rect(
        cell.xy.minX,
        cell.xy.minY,
        cellSize,
        cellSize
    );

    // if ( cell.visits == 1 ) {
    //     P5.fill( 255, 128, 0, 64);
    //     P5.rect(
    //         cell.xy.minX,
    //         cell.xy.minY,
    //         cellSize,
    //         cellSize
    //     );
    // }

    if (cell.current) {
        P5.fill(0, 255, 0);
        P5.ellipse(
            cell.xy.minX + cellSize / 2,
            cell.xy.minY + cellSize / 2,
            cellSize / 2,
            cellSize / 2
        );
    };

    if (cell.wall.t) {
        P5.fill(0);
        P5.rect(
            cell.xy.minX,
            cell.xy.minY,
            cellSize,
            wallWidth
        );
    };
    if (cell.wall.r) {
        P5.fill(0);
        P5.rect(
            cell.xy.maxX - wallWidth,
            cell.xy.minY,
            wallWidth,
            cellSize
        );
    };
    if (cell.wall.b) {
        P5.fill(0);
        P5.rect(
            cell.xy.minX,
            cell.xy.maxY - wallWidth,
            cellSize,
            wallWidth
        );
    };
    if (cell.wall.l) {
        P5.fill(0);
        P5.rect(
            cell.xy.minX,
            cell.xy.minY,
            wallWidth,
            cellSize
        );
    };


};

const drawCells = (cells) => {
    cells.forEach(cell => drawCell(cell))
};

const prepareCells = (cells) => {
    for (let i = 0; i < cells.length; i++) {
        let col = i % grid.cols;
        let row = Math.floor(i / grid.cols);

        cells[i] = {
            xy: {
                minX: col * cellSize,
                minY: row * cellSize,
                maxX: col * cellSize + cellSize,
                maxY: row * cellSize + cellSize
            },
            wall: {
                t: true,
                r: true,
                b: true,
                l: true
            },
            current: false,
            visited: false,
            visits: 0,
            coords: {
                col: col,
                row: row
            }
        }
    }
};

export class Maze {

    constructor(cSize, width, height) {
        cellSize = cSize;
        grid.cols = Math.floor(width / cellSize);
        grid.rows = Math.floor(height / cellSize);

        this.cells = new Array(grid.cols * grid.rows);
        this.generated = false;

        prepareCells(this.cells);
        // this.drawCells( this.cells );
        this.current = setCurrent(0, 0, this.cells);
        this.currentNeighbours = findNeighbours(this.current, this.cells);
        this.next = getRandomNeighbour(this.currentNeighbours);
        //console.log(`newNeighbour:`, this.next);

        console.log(`
        =================================================
        Maze created!
        ${this.cells.length} cells;
        grid: ( ${grid.cols} x ${grid.rows} );
        =================================================
        `);
        this.current = setCurrent(0, 0, this.cells);
        cellStack.push(this.current);
    };

    isDone() {
        let toVisit = this.cells.length - allCells;
        console.log(`cells to visit: ${ toVisit } of ${this.cells.length}`);
        return !(toVisit > 0);
    }

    update() {
        //console.log(`Updating! current: ${this.current}`);
        if (this.current >= 0) {
            this.currentNeighbours = findNeighbours(this.current, this.cells);
            this.nextN = getRandomNeighbour(this.currentNeighbours);
            if (this.nextN) {
                let direction = this.nextN.type;
                //console.log( `Direction:  ${direction}` );
                this.next = this.cells[this.nextN.val];
                //console.log('this.next: ', this.next )
                breakWall(direction, this.cells[this.current])
                breakOppositeWall(direction, this.cells[this.nextN.val])
                    // drawCell( cell );
                this.previous = this.current;
                this.current = setCurrent(
                    this.next.coords.col,
                    this.next.coords.row,
                    this.cells
                );
                cellStack.push(this.current);
                this.next = null;
            } else {
                //console.warn('No available neighbours!!!');

                if (cellStack.length) {
                    //console.warn('Attempting to pop!');
                    this.previous = this.current;
                    this.current = this.cells[cellStack.pop()];
                    //console.log('this.current: ', this.current );
                    //console.warn('Attempting to setCurrent!');
                    this.current = setCurrent(
                        this.current.coords.col,
                        this.current.coords.row,
                        this.cells
                    );
                } else {
                    //console.warn('DONE!!!');
                }
            }
            drawCell(this.cells[this.previous]);
            drawCell(this.cells[this.current]);
        };
    };

    show() {
        //console.log(`Drawing`);
        drawCells(this.cells);
    };

}