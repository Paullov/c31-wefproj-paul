/* Global value  */
const unitLength = 10;
let boxColor = "#6750a4";
const strokeColor = "#eaddff";
let frameRateNum = 10;
let columns; /* To be determined by window width */
let rows; /* To be determined by window height */
let currentBoard;
let nextBoard;

let gameRule = "normal";
let gameStart = true;
let lifeForm = "usual";

//pattern//
const pattern = `
..........OO...............
.....OOO..OOO..............
.......O..OO.O.O....O......
.....OO.....OOO......O.....
.OO..O..OOO.O...OOOO.O....O
OO.OO.....O....OO...OOO.O.O
.O...O.........O........O.O
OO...O.....................
.O...O.........O........O.O
OO.OO.....O....OO...OOO.O.O
.OO..O..OOO.O...OOOO.O....O
.....OO.....OOO......O.....
.......O..OO.O.O....O......
.....OOO..OOO..............
..........OO...............`;

const pattern2 = `........OO........
......O....O......
..OO..........OO..
..O..O......O..O..
...OOO.OOOO.OOO...
......O....O......
...OOO......OOO...
..O............O..
...OOOOO..OOOOO...
........OO........
.....OO....OO.....
....O.O....O.O....
....OO......OO....
..................
..................
......OO..OO......
.....O..OO..O.....
...O.O.OOOO.O.O...
.OOO.O.O..O.O.OOO.
O...OO.OOOO.OO...O
.OO...O....O...OO.
...OO..O..O..OO...
...O.OO....OO.O...`;

const pattern3 = `........................O
......................O.O
............OO......OO............OO
...........O...O....OO............OO
OO........O.....O...OO
OO........O...O.OO....O.O
..........O.....O.......O
...........O...O
............OO`;

function patternConvert(pattern) {
  const patternArray = pattern.split("\n");

  let patternConvertedArray = [];
  for (let array of patternArray) {
    let convertedItem = [];
    for (let item of array) {
      if (item === ".") convertedItem.push(0);
      if (item === "O") convertedItem.push(1);
    }
    patternConvertedArray.push(convertedItem);
  }

  return patternConvertedArray;
}

/* set up  */
function setup() {
  document.addEventListener("click", (event) => {
    if (event.target.matches(".reset_btn")) {
      console.log("click the reset ");
      for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
          /*      currentBoard[i][j] = random() > 0.8 ? 1 : 0; */
          currentBoard[i][j] = [0];
          nextBoard[i][j] = [0];
        }
      }
      noLoop();
    }
  });

  // add onchange eventlistener //
  document.addEventListener("change", (event) => {
    if (event.target.matches(".slider")) {
      console.log("slider is clicked");
      frameRateNum = event.target.value;
      console.log(frameRateNum);
      frameRate(Number(event.target.value));
      console.log(frameRateNum);
    }
    if (event.target.matches("#life_pattern")) {
      console.log("life form selected");
      lifeForm = event.target.value;
      console.log(lifeForm);
    }
    if (event.target.matches("#player_choice")) {
      console.log("player change the game rule");
      gameRule = event.target.value;
      console.log(gameRule);
    }
  });

  document.addEventListener("click", (event) => {
    if (event.target.matches(".start_stop_btn") && gameStart === true) {
      noLoop();
      gameStart = false;
    } else if (event.target.matches(".random_btn")) {
      for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
          currentBoard[i][j] = random() > 0.9 ? [1, boxColor] : [0];
        }
      }
    } else if (event.target.matches(".start_stop_btn") && gameStart === false) {
      loop();
      gameStart = true;
    }
  });

  const colorPicker = document.querySelector("#color-picker");
  colorPicker.addEventListener(
    "change",
    (event) => {
      boxColor = event.target.value;
    },
    true
  );

  const darkModeButton = document.querySelector(".night_btn");
  darkModeButton.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark-theme");
    console.log(document.documentElement.classList[0]);
    if (document.documentElement.classList[0] === "dark-theme") {
      darkModeButton.innerHTML = "Light Mode";
    } else if (document.documentElement.classList[0] !== "dark-theme")
      darkModeButton.innerHTML = "Night Mode";
  });

  /* Set the canvas to be under the element #canvas*/
  const canvas = createCanvas(windowWidth, windowHeight - 380);
  canvas.parent(document.querySelector("#canvas"));

  /*Calculate the number of columns and rows */
  columns = floor(width / unitLength);
  rows = floor(height / unitLength);

  /*Making both currentBoard and nextBoard 2-dimensional matrix that has (columns * rows) boxes. */
  currentBoard = [];
  nextBoard = [];
  for (let i = 0; i < columns; i++) {
    currentBoard[i] = [];
    nextBoard[i] = [];
  }
  // Now both currentBoard and nextBoard are array of array of undefined values.
  initiate(); // Set the initial values of the currentBoard and nextBoard
}

function initiate() {
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      /*      currentBoard[i][j] = random() > 0.8 ? 1 : 0; */
      currentBoard[i][j] = [0];
      nextBoard[i][j] = [0];
    }
  }
}

/* draw */
function draw() {
  background(255);

  frameRate(frameRateNum);

  generate();
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      if (currentBoard[i][j][0] === 1) {
        fill(currentBoard[i][j][1]);
        if (nextBoard[i][j][0] === 1)
          fill(tinycolor(currentBoard[i][j][1]).darken(10).toString());
      } else if (currentBoard[i][j][0] === 0) {
        fill(255);
      }
      stroke(strokeColor);
      rect(i * unitLength, j * unitLength, unitLength, unitLength);
    }
  }
  const temp = currentBoard;
  passBoard = temp;
}

function generate() {
  //Loop over every single box on the board
  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      // Count all living members in the Moore neighborhood(8 boxes surrounding)
      let neighbors = 0;
      for (let i of [-1, 0, 1]) {
        for (let j of [-1, 0, 1]) {
          if (i == 0 && j == 0) {
            // the cell itself is not its own neighbor
            continue;
          }
          // The modulo operator is crucial for wrapping on the edge
          neighbors +=
            currentBoard[(x + i + columns) % columns][(y + j + rows) % rows][0];
        }
      }

      // Rules of Life
      if (gameRule === "normal") {
        if (currentBoard[x][y][0] == 1 && neighbors < 2) {
          // Die of Loneliness
          nextBoard[x][y] = [0];
        } else if (currentBoard[x][y][0] == 1 && neighbors > 3) {
          // Die of Overpopulation
          nextBoard[x][y] = [0];
        } else if (currentBoard[x][y][0] == 0 && neighbors == 3) {
          // New life due to Reproduction
          // New life color based on his neigbour color form (from left to right from top to bttom)
          /*     nextBoard[x][y] = [1, boxColor]; */
          if (currentBoard?.[x - 1]?.[y - 1]?.[0] === 1) {
            nextBoard[x][y] = [1, currentBoard[x - 1][y - 1][1]];
          } else if (currentBoard?.[x]?.[y - 1]?.[0] === 1) {
            nextBoard[x][y] = [1, currentBoard[x][y - 1][1]];
          } else if (currentBoard?.[x + 1]?.[y - 1]?.[0] === 1) {
            nextBoard[x][y] = [1, currentBoard[x + 1][y - 1][1]];
          } else if (currentBoard?.[x - 1]?.[y]?.[0] === 1) {
            nextBoard[x][y] = [1, currentBoard[x - 1][y][1]];
          } else if (currentBoard?.[x + 1]?.[y + 1]?.[0] === 1) {
            nextBoard[x][y] = [1, currentBoard[x + 1][y + 1][1]];
          } else if (currentBoard?.[x - 1]?.[y - 1]?.[0] === 1) {
            nextBoard[x][y] = [1, currentBoard[x - 1][y - 1][1]];
          } else if (currentBoard?.[x]?.[y + 1]?.[0] === 1) {
            nextBoard[x][y] = [1, currentBoard[x][y + 1][1]];
          } else if (currentBoard?.[x + 1]?.[y + 1]?.[0] === 1) {
            nextBoard[x][y] = [1, currentBoard[x + 1][y + 1][1]];
          }
        } else {
          // Stasis
          /*   if (currentBoard[x][y][0] === 1) nextBoard[x][y][1] = "#808080"; */
          nextBoard[x][y] = currentBoard[x][y];
        }
      }
      if (gameRule === "tough") {
        if (currentBoard[x][y][0] == 1 && neighbors < 2) {
          // Die of Loneliness
          nextBoard[x][y] = [0];
        } else if (currentBoard[x][y][0] == 1 && neighbors > 4) {
          // Die of Overpopulation
          nextBoard[x][y] = [0];
        } else if (currentBoard[x][y][0] == 0 && neighbors >= 2) {
          // New life due to Reproduction
          // New life color based on his neigbour color form (from left to right from top to bttom)
          if (currentBoard?.[x - 1]?.[y - 1]?.[0] === 1) {
            nextBoard[x][y] = [1, currentBoard[x - 1][y - 1][1]];
          } else if (currentBoard?.[x]?.[y - 1]?.[0] === 1) {
            nextBoard[x][y] = [1, currentBoard[x][y - 1][1]];
          } else if (currentBoard?.[x + 1]?.[y - 1]?.[0] === 1) {
            nextBoard[x][y] = [1, currentBoard[x + 1][y - 1][1]];
          } else if (currentBoard?.[x - 1]?.[y]?.[0] === 1) {
            nextBoard[x][y] = [1, currentBoard[x - 1][y][1]];
          } else if (currentBoard?.[x + 1]?.[y + 1]?.[0] === 1) {
            nextBoard[x][y] = [1, currentBoard[x + 1][y + 1][1]];
          } else if (currentBoard?.[x - 1]?.[y - 1]?.[0] === 1) {
            nextBoard[x][y] = [1, currentBoard[x - 1][y - 1][1]];
          } else if (currentBoard?.[x]?.[y + 1]?.[0] === 1) {
            nextBoard[x][y] = [1, currentBoard[x][y + 1][1]];
          } else if (currentBoard?.[x + 1]?.[y + 1]?.[0] === 1) {
            nextBoard[x][y] = [1, currentBoard[x + 1][y + 1][1]];
          }
        } else {
          // Stasis
          nextBoard[x][y] = currentBoard[x][y];
        }
      }

      if (gameRule === "fragile") {
        if (currentBoard[x][y][0] == 1 && neighbors < 3) {
          // Die of Loneliness
          nextBoard[x][y] = [0];
        } else if (currentBoard[x][y][0] == 1 && neighbors > 3) {
          // Die of Overpopulation
          nextBoard[x][y] = [0];
        } else if (currentBoard[x][y][0] == 0 && neighbors == 3) {
          // New life due to Reproduction
          // New life due to Reproduction
          // New life color based on his neigbour color form (from left to right from top to bttom)
          if (currentBoard?.[x - 1]?.[y - 1]?.[0] === 1) {
            nextBoard[x][y] = [1, currentBoard[x - 1][y - 1][1]];
          } else if (currentBoard?.[x]?.[y - 1]?.[0] === 1) {
            nextBoard[x][y] = [1, currentBoard[x][y - 1][1]];
          } else if (currentBoard?.[x + 1]?.[y - 1]?.[0] === 1) {
            nextBoard[x][y] = [1, currentBoard[x + 1][y - 1][1]];
          } else if (currentBoard?.[x - 1]?.[y]?.[0] === 1) {
            nextBoard[x][y] = [1, currentBoard[x - 1][y][1]];
          } else if (currentBoard?.[x + 1]?.[y + 1]?.[0] === 1) {
            nextBoard[x][y] = [1, currentBoard[x + 1][y + 1][1]];
          } else if (currentBoard?.[x - 1]?.[y - 1]?.[0] === 1) {
            nextBoard[x][y] = [1, currentBoard[x - 1][y - 1][1]];
          } else if (currentBoard?.[x]?.[y + 1]?.[0] === 1) {
            nextBoard[x][y] = [1, currentBoard[x][y + 1][1]];
          } else if (currentBoard?.[x + 1]?.[y + 1]?.[0] === 1) {
            nextBoard[x][y] = [1, currentBoard[x + 1][y + 1][1]];
          }
        } else {
          // Stasis
          nextBoard[x][y] = currentBoard[x][y];
        }
      }
    }
  }

  //compare nextboard with passboard

  /*   for (let i = 0; i < currentBoard.length; i++) {
    for (let j = 0; i < currentBoard[i].length; j++) {
      if (nextBoard[i][j][0] === 1 && passBoard[i][j][0] === 1)
        nextBoard[i][j] = [1, "#808080"];
    }
  } */

  // Swap the nextBoard to be the current Board
  [currentBoard, nextBoard] = [nextBoard, currentBoard];
}

//EVENT HANDLE//
function mouseDragged() {
  /**
   * If the mouse coordinate is outside the board
   */
  /*  if (mouseX > unitLength * columns || mouseY > unitLength * rows) */
  if (mouseX > width || mouseY > height) {
    return;
  }

  const x = Math.floor(mouseX / unitLength);
  const y = Math.floor(mouseY / unitLength);

  if (lifeForm === "usual") {
    currentBoard[x][y] = [1, boxColor];
    fill(boxColor);
    stroke(strokeColor);
    rect(x * unitLength, y * unitLength, unitLength, unitLength);
  } else if (lifeForm === "gun") {
    const gun = patternConvert(pattern3);
    console.log(gun);
    for (let row in gun) {
      for (let column in gun[row]) {
        if (gun[row][column] === 1) {
          currentBoard[(x + Number(column) + columns) % columns][
            (y + Number(row) + rows) % rows
          ] = [1, boxColor];
          /*       if (currentBoard.max() > windowWidth / unitLength) {
            console.log(currentBoard.max());
          } */

          fill(boxColor);
          stroke(strokeColor);
          rect(
            (x + column) * unitLength,
            (y + row) * unitLength,
            unitLength,
            unitLength
          );
        }
      }
    }
  } else if (lifeForm === "spider") {
    const spider = patternConvert(pattern2);
    console.log(spider);
    for (let row in spider) {
      for (let column in spider[row]) {
        if (spider[row][column] === 1) {
          currentBoard[(x + Number(column) + columns) % columns][
            (y + Number(row) + rows) % rows
          ] = [1, boxColor];
          fill(boxColor);
          stroke(strokeColor);
          rect(
            (x + column) * unitLength,
            (y + row) * unitLength,
            unitLength,
            unitLength
          );
        }
      }
    }
  } else if (lifeForm === "wall") {
    const wall = patternConvert(pattern);

    for (let row in wall) {
      for (let column in wall[row]) {
        if (wall[row][column] === 1) {
          console.log("x+column", x + column, "y+row", y + row);
          currentBoard[(x + Number(column) + columns) % columns][
            (y + Number(row) + rows) % rows
          ] = [1, boxColor];
          fill(boxColor);
          stroke(strokeColor);
          rect(
            (x + column) * unitLength,
            (y + row) * unitLength,
            unitLength,
            unitLength
          );
        }
      }
    }
  }
}

function mousePressed() {
  noLoop();
  mouseDragged();
}

/**
 * When mouse is released
 */
function mouseReleased() {
  loop();
}
