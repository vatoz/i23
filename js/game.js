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
    },
    "spider":{
      "netlu01":document.getElementById("netlu01"),
      "netru01":document.getElementById("netru01"),
      "spider":document.getElementById("spider01")

    },
    "back":{
      "cloud01":document.getElementById("cloud01"),
      "cloud02":document.getElementById("cloud02")
    }



};

let viewport_x=0;

let tick=0;

// Object to hold user key presses
let keysDown = {};
// Will hold Current Level data
let currentLevel;
let clouds=[];





// The Player Object:
const player = {
  // Player's X Position
  x: 256,
  // Player's Y Position
  y: 0,
  // Width of Player (when drawn)
  width: 16,
  // Height of Player (when drawn)
  height: 16,
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


function initClouds(size){
  let cnt=2+ Math.random()*10;
  for(let cldg=0;cldg<cnt;cldg++){
    let cloud = {
      "x": Math.floor( Math.random() * size),
      "y": Math.floor(Math.random()*16*32)-100,
      "speed":(Math.random()*1.2),
      "typ":(Math.floor(Math.random()*1.9)+1)
    }
    clouds.unshift(cloud);
  }

}

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
  let vWidth=currentLevel[0].length *32;
  for(let cloud_id=0;cloud_id<clouds.length;cloud_id++){
    var imga=i["back"]["cloud01"];
    let cloud = clouds[cloud_id];
    //todo use type

    let pos=(cloud.x + cloud.speed*tick)% vWidth;
    
    if(cloud.typ>1){
      var imga=i["back"]["cloud02"];
      console.log(cloud)

    }
    c.drawImage( imga,pos- viewport_x, cloud.y);
    c.drawImage(imga ,pos-vWidth- viewport_x, cloud.y);
    c.drawImage(imga ,pos+vWidth- viewport_x, cloud.y);



  }





  // Set the fill colour to black
  c.fillStyle = "black";
  // Loop through level lines
  for (let row = 0; row < currentLevel.length; row++) {
    // Loop through each character in line
    for (let col = 0; col < currentLevel[0].length; col++) {
      // If character is 1 (a wall) 
      if (currentLevel[row][col] === "1") {       
        c.drawImage(i["floor"]["01"] ,col * 32 - viewport_x, row * 32);
      }
      if (currentLevel[row][col] === "2") {       
        c.drawImage(i["floor"]["02"] ,col * 32 - viewport_x, row * 32);
      }
      if (currentLevel[row][col] === "3") {       
        c.drawImage(i["floor"]["03"] ,col * 32 - viewport_x, row * 32);
      }
      if (currentLevel[row][col] === "4") {       
        c.drawImage(i["floor"]["04"] ,col * 32- viewport_x, row * 32);
      }
      
      if (currentLevel[row][col] === "n") {       
        c.drawImage(i["spider"]["netlu01"] ,col * 32- viewport_x, row * 32);
      }
      if (currentLevel[row][col] === "r") {       
        c.drawImage(i["spider"]["netru01"] ,col * 32- viewport_x, row * 32);
      }

    }
  }

  c.fillStyle = "red";
  // Draw a rectangle at player's position with size of player's size
  c.fillRect(player.x- viewport_x, player.y, player.width, player.height);

  for (let row = 0; row < currentLevel.length; row++) {
    // Loop through each character in line
    for (let col = 0; col < currentLevel[0].length; col++) {
            
      if (currentLevel[row][col] === "b") {       
        c.drawImage(i["bed"]["01"] ,col * 32- viewport_x, row * 32);
      }

      if (currentLevel[row][col] === "s") {       
        let freespace=0;
        let cycler=row+1;
        while (cycler<currentLevel.length && currentLevel[cycler][col]=="0"){
          freespace++;cycler++;        
        }

        let len_sp=10 + freespace*32;
        //modulo
        let offset = (tick + 20*col)  % (1+ (len_sp*2));
        if (offset >len_sp) {
          offset=2*len_sp -offset;
        }

        
        c.beginPath();
        c.lineWidth = 1;
        c.moveTo(col * 32  +15 - viewport_x, row * 32  );
        c.lineTo(col * 32  +15 - viewport_x, row * 32 + offset +10);
        c.stroke();

        
        c.drawImage(i["spider"]["spider"] ,col * 32 - viewport_x  , row * 32 + offset -10);
      }


    }
  }



  tick++;
}
function isWall(a){
  if(a=="1") return true;
  if(a=="2") return true;
  if(a=="3") return true;
  if(a=="4") return true;
  return false;
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
    if (getTile((player.x - player.speed) + 1, player.y + player.width/2) !== "1" && player.x > 1) {
      // Move player left by player speed
      player.x -= player.speed;
    }
  }

  // If D is Down
  if (68 in keysDown) {
    // Check if tile at player location after move is colliding with a wall
    if (getTile(((player.x + player.width) + player.speed) - 1, player.y + player.width/2) !== "1" && player.x + player.width < currentLevel[0].length * 32 ) {
      // Move player right by player speed
      player.x += player.speed;
    }
  }

  // If W is Down and Player's kinetic energy (in Y Axis) is 0
  if (87 in keysDown && player.yke === 0) {
    // Checks if tile directly above player is a wall
    if (getTile(player.x,player.y - 1) !== "1" && getTile(player.x + 32,player.y - 1) !== "1"){
    // Increase player's y axis kinetic energy by 8 (jump)
    player.yke += 8;
    }
  }

  if(player.x>320){
    viewport_x=player.x-320;
  }else{
    viewport_x=0;
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

function randomLevel(l_height,l_width){
  let l = [];
  const noise = 0.8;
  for (let i = 0; i < l_height; i++){
    l.push([]);
    l[i].push(...("0".repeat(l_width).split("")));
    for (let j = 0; j < l_width; j++){
      const random = Math.random();
      if (random > noise) {
        l[i][j] = "1";
      }
      if (random > noise+0.15) {
        l[i][j] = "2";
      }
    }
  }

  for (let i = 0; i < l_height; i++){
    l[i][0] = "4";   
    l[i][l_width-1] = "4";    
  }
  
  for (let j = 0; j < l_width; j++){
    l[l_height-1][j] = "4";    
  }


  l[0][1] = "4";   
  l[0][2] = "3";   
  l[1][1] = "0";   


  for (let i = 1; i < l_height-1; i++){
    for (let j = 1; j < l_width -1; j++){
           
        if(isWall(l[i-1][j])){
          if(isWall(l[i][j-1])){            
            if(!isWall(l[i][j])){
              if(isWall(l[i-1][j+1])){
                if(isWall(l[i+1][j-1])){
                  if(!isWall(l[i+1][j])){
                    if(!isWall(l[i][j+1])){   
                  l[i][j]="n";
                  const random = Math.random();
                  if(random>0.4){
                    l[i][j+1]="s";
                  }
                    }
                  }
                }
              }
            }
          }
        }       

        if(isWall(l[i-1][j])){
          if(isWall(l[i-1][j-1])){            
            if(!isWall(l[i][j])){
              if(isWall(l[i][j+1])){
                if(isWall(l[i+1][j+1])){
                  if(!isWall(l[i+1][j])){
                    if(!isWall(l[i-1][j+1])){   
                      l[i][j-1]="r";                      
                    }
                  }
                }
              }
            }
          }
        }       





          
    }
  }


  

  l[7][5]="4";
  l[l_height-1][5]="3";
  l[l_height-2][l_width-2]="0";
  l[l_height-3][l_width-2]="0";
  l[l_height-2][l_width-2]="b";
  
  l[1][4]="0";
  l[2][4]="0";

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
  
  // Prepare Level
  // currentLevel = parseLevel(level);
  currentLevel = randomLevel(16, 100 );
  initClouds(100*32);
  // Start Platformer
  main();
}