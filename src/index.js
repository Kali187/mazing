import { P5 } from './p5wrapper';
import { Maze } from './maze';

const viewport = {
  w: window.innerWidth * .9,
  h: window.innerHeight * .8
}

const cellSize = 12;
const maze = new Maze( cellSize, viewport.w, viewport.h );

let reminderH = viewport.w % cellSize;
let reminderV = viewport.h % cellSize;

let saveButton = document.createElement('button');
saveButton.innerHTML = 'SAVE IMAGE';
saveButton.disabled = true;
document.body.append(saveButton);
saveButton.addEventListener('click', e => {
  P5.save('maze.png');
});

P5.setup = () => {
  P5.createCanvas(viewport.w,viewport.h);
  P5.fill(255);
  P5.stroke(255);
  P5.background(128);
  P5.translate( reminderH / 2, reminderV / 2 );
  maze.show();
}

P5.draw = () => {
  P5.translate( reminderH / 2, reminderV / 2 );
  if ( !maze.isDone() ) {
    maze.update();
  } else {
    saveButton.disabled = false;
    P5.noLoop();
  }
}

