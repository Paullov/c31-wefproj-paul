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
let lifeForm = "normal";

//pattern//
const pattern = `.......O.......O.......OO.............
.......OOO.....OOO.....OO.............
..........O.......O...................
.........OO......OO................OO.
..............................OO..O..O
..............................O.O..OO.
.................................OO...
.....O............................O...
.....OOO..........................O.OO
........O......................OO.O..O
.......OO......................OO.OO..
......................................
......................................
.................O....................
..OO.OO.........O.O..........OO.......
O..O.OO........O...O.........O........
OO.O...........O...O..........OOO.....
...O...........O...O............O.....
...OO...........O.O...................
.OO..O.O.........O....................
O..O..OO..............................
.OO................OO.................
...................O..................
.............OO.....OOO...............
.............OO.......O...............`;

function patternConvert(pattern) {
  const patternArray = pattern.split("\n");
  console.log(patternArray);

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

// Simple example, see optional options for more configuration.

//picker//
const pickr = Pickr.create({
  el: ".color-picker",
  theme: "classic", // or 'monolith', or 'nano'
  default: "#6750a4",

  swatches: [
    /*    "rgba(244, 67, 54, 1)", */
    /*     "rgba(233, 30, 99, 0.95)",
    "rgba(156, 39, 176, 0.9)",
    "rgba(103, 58, 183, 0.85)",
    "rgba(63, 81, 181, 0.8)",
    "rgba(33, 150, 243, 0.75)",
    "rgba(3, 169, 244, 0.7)",
    "rgba(0, 188, 212, 0.7)",
    "rgba(0, 150, 136, 0.75)",
    "rgba(76, 175, 80, 0.8)",
    "rgba(139, 195, 74, 0.85)",
    "rgba(205, 220, 57, 0.9)",
    "rgba(255, 235, 59, 0.95)",
    "rgba(255, 193, 7, 1)", */
  ],

  components: {
    // Main components
    preview: true,
    /*   opacity: true, */
    hue: true,

    // Input / output Options
    interaction: {
      hex: true,
      rgba: true,
      /*       hsla: true,
      hsva: true,
      cmyk: true, */
      input: true,
      /*    clear: true, */
      save: true,
    },
  },
});

pickr.on("save", (color, source, instance) => {
  const rgbaColor = color.toRGBA().map((col) => Math.round(col));
  const formatColor = `rgba(${rgbaColor.join(",")})`;
  console.log(formatColor);
  boxColor = formatColor;
});

/* set up  */
function setup() {
  document.addEventListener("click", (event) => {
    if (event.target.matches(".reset_btn")) {
      console.log("click the reset ");
      for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
          /*      currentBoard[i][j] = random() > 0.8 ? 1 : 0; */
          currentBoard[i][j] = 0;
          nextBoard[i][j] = 0;
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
    } else if (event.target.matches(".start_stop_btn") && gameStart === false) {
      loop();
      gameStart = true;
    }
  });

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
      currentBoard[i][j] = 0;
      nextBoard[i][j] = 0;
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
      if (currentBoard[i][j] === 1) {
        fill(boxColor);
      } else {
        fill(255);
      }
      stroke(strokeColor);
      rect(i * unitLength, j * unitLength, unitLength, unitLength);
    }
  }
}

/* function windowResized() {
  resizeCanvas();
}
 */
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
            currentBoard[(x + i + columns) % columns][(y + j + rows) % rows];
        }
      }

      // Rules of Life
      if (gameRule === "normal") {
        if (currentBoard[x][y] == 1 && neighbors < 2) {
          // Die of Loneliness
          nextBoard[x][y] = 0;
        } else if (currentBoard[x][y] == 1 && neighbors > 3) {
          // Die of Overpopulation
          nextBoard[x][y] = 0;
        } else if (currentBoard[x][y] == 0 && neighbors == 3) {
          // New life due to Reproduction
          nextBoard[x][y] = 1;
        } else {
          // Stasis
          nextBoard[x][y] = currentBoard[x][y];
        }
      }
      if (gameRule === "tough") {
        if (currentBoard[x][y] == 1 && neighbors < 2) {
          // Die of Loneliness
          nextBoard[x][y] = 0;
        } else if (currentBoard[x][y] == 1 && neighbors > 4) {
          // Die of Overpopulation
          nextBoard[x][y] = 0;
        } else if (currentBoard[x][y] == 0 && neighbors >= 3) {
          // New life due to Reproduction
          nextBoard[x][y] = 1;
        } else {
          // Stasis
          nextBoard[x][y] = currentBoard[x][y];
        }
      }

      if (gameRule === "fragile") {
        if (currentBoard[x][y] == 1 && neighbors < 3) {
          // Die of Loneliness
          nextBoard[x][y] = 0;
        } else if (currentBoard[x][y] == 1 && neighbors > 3) {
          // Die of Overpopulation
          nextBoard[x][y] = 0;
        } else if (currentBoard[x][y] == 0 && neighbors == 3) {
          // New life due to Reproduction
          nextBoard[x][y] = 1;
        } else {
          // Stasis
          nextBoard[x][y] = currentBoard[x][y];
        }
      }
    }
  }

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

  if (lifeForm === "normal") {
    currentBoard[x][y] = 1;
    fill(boxColor);
    stroke(strokeColor);
    rect(x * unitLength, y * unitLength, unitLength, unitLength);
  } else if (lifeForm === "gun") {
    currentBoard[x + 6][y - 5] = 1;

    currentBoard[x + 4][y - 4] = 1;

    currentBoard[x + 6][y - 4] = 1;

    currentBoard[x - 6][y - 3] = 1;

    currentBoard[x - 5][y - 3] = 1;

    currentBoard[x + 2][y - 3] = 1;

    currentBoard[x + 3][y - 3] = 1;

    currentBoard[x - 7][y - 2] = 1;

    currentBoard[x - 3][y - 2] = 1;

    currentBoard[x + 2][y - 2] = 1;

    currentBoard[x + 3][y - 2] = 1;

    currentBoard[x - 8][y - 1] = 1;

    currentBoard[x - 2][y - 1] = 1;

    currentBoard[x + 2][y - 1] = 1;

    currentBoard[x + 3][y - 1] = 1;

    currentBoard[x - 8][y] = 1;

    currentBoard[x - 4][y] = 1;

    currentBoard[x - 2][y] = 1;

    currentBoard[x - 1][y] = 1;

    currentBoard[x + 4][y] = 1;

    currentBoard[x + 6][y] = 1;

    currentBoard[x - 8][y + 1] = 1;

    currentBoard[x - 2][y + 1] = 1;

    currentBoard[x + 6][y + 1] = 1;

    currentBoard[x - 7][y + 2] = 1;

    currentBoard[x - 3][y + 2] = 1;

    currentBoard[x - 6][y + 3] = 1;

    currentBoard[x - 5][y + 3] = 1;

    currentBoard[x + 5][y + 5] = 1;

    currentBoard[x + 6][y + 5] = 1;

    currentBoard[x + 5][y + 6] = 1;

    currentBoard[x + 6][y + 7] = 1;

    currentBoard[x + 7][y + 7] = 1;

    currentBoard[x + 8][y + 7] = 1;

    currentBoard[x + 8][y + 8] = 1;

    fill(boxColor);
    stroke(strokeColor);
    rect(x * unitLength, y * unitLength, unitLength, unitLength);
  } else if (lifeForm === "snowflake") {
    currentBoard[x][y - 3] = 1;
    currentBoard[x - 1][y - 2] = 1;
    currentBoard[x][y - 2] = 1;
    currentBoard[x + 1][y - 2] = 1;
    currentBoard[x - 2][y - 1] = 1;
    currentBoard[x][y - 1] = 1;
    currentBoard[x + 2][y - 1] = 1;
    currentBoard[x - 3][y] = 1;
    currentBoard[x - 2][y] = 1;
    currentBoard[x - 1][y] = 1;
    currentBoard[x + 1][y] = 1;
    currentBoard[x + 2][y] = 1;
    currentBoard[x + 3][y] = 1;
    currentBoard[x - 2][y - 1] = 1;
    currentBoard[x][y + 1] = 1;
    currentBoard[x + 2][y + 1] = 1;
    currentBoard[x - 1][y + 2] = 1;
    currentBoard[x][y + 2] = 1;
    currentBoard[x + 1][y + 2] = 1;
    currentBoard[x][y + 3] = 1;
    fill(boxColor);
    stroke(strokeColor);
    rect(x * unitLength, y * unitLength, unitLength, unitLength);
  } else if (lifeForm === "wall") {
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
