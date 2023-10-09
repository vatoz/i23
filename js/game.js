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
    ,
  "meteor" :{
    "crater":document.getElementById("crater"),
    "meteor":document.getElementById("meteor"),
    "fire01":document.getElementById("fire01"),
    "fire02":document.getElementById("fire02"),
    "fire03":document.getElementById("fire03")


  },
  "ui":{
    "heal":document.getElementById("heal"),
    "heart":document.getElementById("heart")

  }


};

const debug=true;
function drawDebug(x,y){
  if(debug){
  // Define a new Path:
    c.beginPath();
    c.fillStyle = "black";

    c.moveTo(x-viewport_x, y-5);
    c.lineTo(x-viewport_x, y+5);
    
    c.moveTo(x-viewport_x-5, y);
    c.lineTo(x-viewport_x+5, y);
  }
}
let viewport_x=0;

let tick=0;

// Object to hold user key presses
let keysDown = {};
// Will hold Current Level data
let currentLevel;

let clouds=[];
let craters=[];
let decorations=[];





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
  mass: 64,  // Player's Speed (pixels)
  speed: 3,
  health:7

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
  if (!isWall(getTile(obj.x, obj.y)) || !isWall(getTile(obj.x + 32, obj.y))) {
    // If object is jumping
    if (obj.yke >= 0){
      // Set Y Kinetic Energy to -0.5
    obj.yke = -0.5;
    // Add 1 to Object Y (To Avoid Collision Error)
    obj.y += 1;
    }
  } else {
    // If Tile at object's feet location is a wall
    if (!isWall(getTile(obj.x + 32, (obj.y + 32)))  || isWall(getTile(obj.x, (obj.y + 32)))) {
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
    }
    c.drawImage( imga,pos- viewport_x, cloud.y);
    c.drawImage(imga ,pos-vWidth- viewport_x, cloud.y);
    c.drawImage(imga ,pos+vWidth- viewport_x, cloud.y);

  }

  for(let decor_id=0;decor_id<decorations.length;decor_id++){
    c.drawImage(decorations[decor_id].decor,  decorations[decor_id].x-viewport_x,decorations[decor_id].y );
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
      

    }
  }

  c.fillStyle = "red";
  // Draw a rectangle at player's position with size of player's size
  c.fillRect(player.x- viewport_x, player.y, player.width, player.height);
  drawDebug(player.x,player.y);

  for (let row = 0; row < currentLevel.length; row++) {
    // Loop through each character in line
    for (let col = 0; col < currentLevel[0].length; col++) {
            
      if (currentLevel[row][col] === "b") {       
        c.drawImage(i["bed"]["01"] ,col * 32- viewport_x, row * 32);
      }
      if (currentLevel[row][col] === "c") {       
        c.drawImage(i["meteor"]["crater"] ,col * 32- viewport_x, row * 32);
      }
      if (currentLevel[row][col] === "heal") {       
        c.drawImage(i["ui"]["heal"] ,col * 32- viewport_x, row * 32);
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

  for(let crater_id=0;crater_id<craters.length;crater_id++){
      var crater=craters[crater_id];          
        var crater_ticks= tick % ( crater.y/3    +40)   
        var y= -31+crater_ticks*3;

        if(y<crater.y){
          c.drawImage(i["meteor"]["meteor"], crater.x- viewport_x  ,y);
        }
        if(y<crater.y+10){
          if(crater_ticks*2%3==0 ){
            c.drawImage(i["meteor"]["fire01"], crater.x- viewport_x  ,y-3);
          }else if(crater_ticks*2%3==1 ){
            c.drawImage(i["meteor"]["fire02"], crater.x- viewport_x  ,y-3);
          }else if(crater_ticks*2 %3==2 ){
            c.drawImage(i["meteor"]["fire03"], crater.x- viewport_x  ,y-3);
          }
          
        }
        
        
        
    }
  

    //ui
  for(let h=0;h<player.health;h++){
    c.drawImage(i["ui"]["heart"], h*16 ,0);
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

  var t=getTile(player.x,player.y - 1);
  if(t=="heal"){
    player.health++;
    currentLevel[Math.floor(player.y / 32)][Math.floor(player.x / 32)]="brokenH";
  }

  //todo zvladat nepadat
  //umrit na pavoukovi
  //lepeni na vlakne
  //umreni na meteorit
  //vitezstvi na posteli

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
                      let decor={x:j*32,y:i*32,decor:document.getElementById("netlu01")};
                      decorations.unshift(decor);                  
                      l[i][j]="0";
                  const random = Math.random();
                  if(random>0.04){
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

                      let decor={x:(j-1)*32,y:i*32,decor:document.getElementById("netru01")};
                      decorations.unshift(decor);                  
                      l[i][j-1]="0";
                      l[i][j]="0";
                  const random = Math.random();
                  if(random>0.44){
                    l[i][j-1]="s";
                  }



                      
                    }
                  }
                }
              }
            }
          }
        }       

        for (let j = 1; j < l_width -1; j++){
          var vyska=0;
          while( vyska< l_height-2 && l[vyska][j]=="0"){
            vyska++;
          }
          if(vyska==l_height-2){
            const random = Math.random();
            if(random>0.0) {// todo zvětšit
              l[vyska][j]="c";
              var crate={x:j*32,y:vyska*32}
              craters.unshift(crate);

            }
          }



        }



        if(!isWall(l[i][j])){
          if(isWall(l[i+1][j])){
            //pozemni dekorace
            const random = Math.random();
            if(random>0.96){
              let decor={x:(j)*32,y:i*32,decor:document.getElementById("flower01")};
              decorations.unshift(decor);               
            }else if(random>0.95){
              let decor={x:(j)*32,y:i*32,decor:document.getElementById("tree01")};
              decorations.unshift(decor); 
            }else if(random>0.094){
              l[i][j]="heal";
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