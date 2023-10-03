// Get Canvas Element For Use With Javascript (assign to any variable name you want; but short names are generally better as you will be typing it alot).
const c = document.getElementById("canvas").getContext("2d");
const i = {
    "floor":{
        "01": document.getElementById("floor01"),
        "02": document.getElementById("floor02"),
        "03": document.getElementById("floor03"),
        "04": document.getElementById("floor04")
    },
    "bed":{
      "01": document.getElementById("bed01")
    }



};

// Object to hold user key presses
let keysDown = {};
// Will hold Current Level data
let currentLevel;

// The Player Object:
const player = {
  // Player's X Position
  x: 256,
  // Player's Y Position
  y: 0,
  // Width of Player (when drawn)
  width: 32,
  // Height of Player (when drawn)
  height: 32,
  // Gravitational Potential Energy (for use with jumping)
  gpe: 0,
  // Kinetic Energy on the Y axis (for use with jumping)
  yke: 0,
  // Player's mass (for use with jumping)
  mass: 64,
  // Player's Speed (pixels)
  speed: 3
}

// Raw Level Data (Each character is a 32px x 32px tile)
const level = `0000000000000000
0000000000000000
0010000000000000
0000000000001111
0000111000000000
0000000000011111
0000000000000000
0000000000111111
0000000000011000
1110000000000000
0000000010000110
0001111111100000
0000000000000000
0000000000000000
0000000001111110
0000000000000000`;

const startlevel = `wall
floor
floor
floor
bed
floor
air
f+
f+
floor
floor
endbed
floor
floor
wall
`;


function randtile(tilefather,x,y){
    const random = Math.random(x+10*y);    
    const ak=tilefather.length;
    console.log(ak);
    const ab=parseInt(1 + ( random*ak));
    if (ab<10){
        console.log("small");
        const addr="0"+ab;
    }else{
        
        const addr=""+ab;
    }
    
    return tilefather[addr];


}


function main() {
  // Check for Input
  input();
  // Do gravity of player
  gravity(player);
  // Draw Stuff
  draw();
  // Allow HTML to render stuff + loop main function
  requestAnimationFrame(main);
}

// Takes object as parameter for future extensibility
function gravity(obj) {
  // Minus object Y value by object Y Kinetic Energy
  obj.y -= obj.yke;
  // Minus object's Y Kinetic Energy by object's Gravitational Potential Energy
  obj.yke -= obj.gpe;
  // Recalculate Gravitational Potential Energy
  obj.gpe = calcGPE(obj);

  // If tile at object's head location is a wall
  if (getTile(obj.x, obj.y) !== "0" || getTile(obj.x + 32, obj.y) !== "0") {
    // If object is jumping
    if (obj.yke >= 0){
      // Set Y Kinetic Energy to -0.5
    obj.yke = -0.5;
    // Add 1 to Object Y (To Avoid Collision Error)
    obj.y += 1;
    }
  } else {
    // If Tile at object's feet location is a wall
    if (getTile(obj.x + 32, (obj.y + 32)) !== "0" || getTile(obj.x, (obj.y + 32)) !== "0") {
      // If player is falling
      if (obj.yke <= 0){
        // Set Y Kinetic Energy to 0
        obj.yke = 0;
        // Minus object's Y value so it sits directly on the floor 
        obj.y -= (obj.y % 32);
      }
    }
  }
}

function draw() {
  // Erase Everything on Canvas
  c.clearRect(0, 0, canvas.width, canvas.height);
  // Set the fill colour to red
  c.fillStyle = "red";
  // Draw a rectangle at player's position with size of player's size
  c.fillRect(player.x, player.y, player.width, player.height);
  // Set the fill colour to black
  c.fillStyle = "black";
  // Loop through level lines
  for (let row = 0; row < currentLevel.length; row++) {
    // Loop through each character in line
    for (let col = 0; col < currentLevel[0].length; col++) {
      // If character is 1 (a wall) 
      if (currentLevel[row][col] === "1") {       
        c.drawImage(i["floor"]["01"] ,col * 32, row * 32);
      }
      if (currentLevel[row][col] === "2") {       
        c.drawImage(i["floor"]["02"] ,col * 32, row * 32);
      }
      if (currentLevel[row][col] === "3") {       
        c.drawImage(i["floor"]["03"] ,col * 32, row * 32);
      }
      if (currentLevel[row][col] === "4") {       
        c.drawImage(i["floor"]["04"] ,col * 32, row * 32);
      }
      if (currentLevel[row][col] === "b") {       
        c.drawImage(i["bed"]["01"] ,col * 32, row * 32);
      }

    }
  }
}

function parseLevel(lvl) {
  // Split level data into lines
  const toRows = lvl.split("\n");
  // Splits each line into characters
  const toColumns = toRows.map(r => r.split(""));
  // Returns data
  return toColumns;
}

// 87 -> W, 65 -> A, 83 -> S, 68 -> D
function input() {
  // If A is Down
  if (65 in keysDown) {
    // Check if tile at player location after move is colliding with a wall
    if (getTile((player.x - player.speed) + 1, player.y + 16) !== "1" && player.x > 1) {
      // Move player left by player speed
      player.x -= player.speed;
    }
  }

  // If D is Down
  if (68 in keysDown) {
    // Check if tile at player location after move is colliding with a wall
    if (getTile(((player.x + player.width) + player.speed) - 1, player.y + 16) !== "1" && player.x + player.width < canvas.width) {
      // Move player right by player speed
      player.x += player.speed;
    }
  }

  // If W is Down and Player's kinetic energy (in Y Axis) is 0
  if (87 in keysDown && player.yke === 0) {
    // Checks if tile directly above player is a wall
    if (getTile(player.x,player.y - 1) !== "1" && getTile(player.x + 32,player.y - 1) !== "1"){
    // Increase player's y axis kinetic energy by 8 (jump)
    player.yke += 3;
    }
  }
}

// Gets the tile value at an X and Y value
function getTile(x, y) {
  // Checks if X or Y value is out of bounds
  if (x < currentLevel.length * 32 && x > 0 && y < currentLevel[0].length * 32 && y > 0) {
    // Returns Value
    return currentLevel[Math.floor(y / 32)][Math.floor(x / 32)];
  }
}

function randomLevel(){
  let l = [];
  const noise = 0.8;
  for (let i = 0; i < 16; i++){
    l.push([]);
    l[i].push(...("0".repeat(16).split("")));
    for (let j = 0; j < 16; j++){
      const random = Math.random();
      if (random > noise) {
        l[i][j] = "1";
      }
      if (random > noise+0.15) {
        l[i][j] = "2";
      }
    }
  }
  for (let j = 0; j < 16; j++){
      l[j][0] = "4";   
      l[j][15] = "4";
      l[15][j] = "4";
  }

  

  l[7][5]="4";
  l[15][5]="3";
  l[14][14]="b";
  return l;
}

// Calculates the Gravitational Potential Energy of an object
function calcGPE(obj) {
  return obj.mass * (9.8 / 1000000) * ((512 - obj.height) - (obj.y / 32));
}

// When A Key Is Pressed Add It To keysDown
addEventListener("keydown", function (event) {
  keysDown[event.keyCode] = true;
});
// When A Key Is Let Go Remove It From keysDown
addEventListener("keyup", function (event) {
  delete keysDown[event.keyCode];
});

// Called When Page is Loaded
window.onload = function () {
  console.log(i["floor"].length);
  // Prepare Level
  // currentLevel = parseLevel(level);
  currentLevel = randomLevel();
  // Start Platformer
  main();
}