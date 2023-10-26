// Get Canvas Element For Use With Javascript (assign to any variable name you want; but short names are generally better as you will be typing it alot).
const c = document.getElementById("canvas").getContext("2d");
let img = new Image();
img.src= "sprites0.png";

const debug=false;
function drawDebug(x,y){ 
  // Define a new Path:
    c.beginPath();
    c.fillStyle = "black";

    c.moveTo(x-viewport_x, y-5);
    c.lineTo(x-viewport_x, y+5);
    c.stroke();
    
    c.moveTo(x-viewport_x-5, y);
    c.lineTo(x-viewport_x+5, y);
    c.stroke();
  
}
let viewport_x=0;

let tick=0;

// Object to hold user key presses
let keysDown = {};
// Will hold Current Level data
let currentLevel;

let clouds=[];
let craters=[];
let droplets=[];
let decorations=[];
let chilli =false;




// The Player Object:
const player = {
  // Player's X Position
  x: 256,
  // Player's Y Position
  y: 0,
  // Width of Player (when drawn)
  widthHalf: 7,
  width: 14,
  // Height of Player (when drawn)
  heightHalf:11,
  height: 22,
  // Gravitational Potential Energy (for use with jumping)
  gpe: 0,
  // Kinetic Energy on the Y axis (for use with jumping)
  yke: 0,
  // Player's mass (for use with jumping)
  mass: 64,  // Player's Speed (pixels)
  speed: 1,
  health:7,
  gold:1, 
  direction:0

}

function initClouds(size){
  let cnt=20+ Math.random()*10;
  for(let cldg=0;cldg<cnt;cldg++){
    let cloud = {
      "x": Math.floor( Math.random() * size),
      "y": Math.floor(Math.random()*16*32)-100,
      "speed":(Math.random()*1.7  ),
      "typ":(Math.floor(Math.random()*3.99))
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
  if(obj.yke>30){obj.yke=30;}
  if(obj.yke<-30){obj.yke=-30;}
  
  if (obj.yke>0){ //skok
    // Minus object Y value by object Y Kinetic Energy
    obj.y -= obj.yke;
  }else if (!isWall(getTile(obj.x - obj.widthHalf, (obj.y + obj.heightHalf)))  && !isWall(getTile(obj.x +obj.widthHalf, (obj.y + obj.heightHalf)))) {
    //mohu padat
    obj.y -= obj.yke;
  }

  // Minus object's Y Kinetic Energy by object's Gravitational Potential Energy
  obj.yke -= obj.gpe;
  if (obj.yke<-6){
    obj.yke=-6;
  }
  // Recalculate Gravitational Potential Energy
  obj.gpe = calcGPE(obj);
  //console.log(obj.gpe);
  // If tile at object's head location is a wall
  if (isWall(getTile(obj.x-obj.widthHalf, obj.y-obj.heightHalf)) || isWall(getTile(obj.x+obj.widthHalf, obj.y-obj.heightHalf))) {
    // If object is jumping
    if (obj.yke > 0){

      // Set Y Kinetic Energy to -0.5
    obj.yke = -0.1;
    // Add 1 to Object Y (To Avoid Collision Error)
    obj.y += 1; //todo asi musím zaokrouhlit
    }
  } else {
    // If Tile at object's feet location is a wall
    if (isWall(getTile(obj.x - obj.widthHalf, (obj.y + obj.heightHalf)))  || isWall(getTile(obj.x +obj.widthHalf, (obj.y + obj.heightHalf)))) {
      // If player is falling
      if (obj.yke < 0){
        // Set Y Kinetic Energy to 0
        obj.yke = 0;
        // Minus object's Y value so it sits directly on the floor 
        obj.y -= (obj.y % 32)-obj.height;
        obj.y= Math.floor(obj.y);
      }
    }
  }


}


function sprite_draw(spritename,x,y){
  if(sprites[spritename]){
    c.drawImage(img,sprites[spritename].x,sprites[spritename].y,sprites[spritename].w,sprites[spritename].h,x,y,sprites[spritename].w,sprites[spritename].h    );
  }else{
    console.log ("Missing sprite:" + spritename);
  }    
}

function draw_clouds(level){
  var lbound=Math.floor((level-1)/4  * clouds.length);
  var rbound=(level)/4  * clouds.length;

  for(let cloud_id=lbound;cloud_id<rbound;cloud_id++){
    
    let cloud = clouds[cloud_id];
    var imga="cloud_"+cloud.typ;
    let pos=(cloud.x  + cloud.speed*tick)     %  (currentLevel[0].length *32)     ;
  //sprite_draw("grass_3",- (viewport_x -256)/(vWidth-512 )*(580-512),512-32-156);  
    sprite_draw(imga,pos- viewport_x, cloud.y);
    sprite_draw(imga ,pos-(currentLevel[0].length *32)- viewport_x, cloud.y);
    sprite_draw(imga ,pos+(currentLevel[0].length *32)- viewport_x, cloud.y);
  }


}

function draw() {
  
  // Erase Everything on Canvas
  c.clearRect(0, 0, canvas.width, canvas.height);
  let vWidth=currentLevel[0].length *32;
  

  draw_clouds(4);
  sprite_draw("grass_3",- (viewport_x -256)/(vWidth-512 )*(580-512),512-32-156);
  draw_clouds(3);
  sprite_draw("grass_2",- (viewport_x -256)/(vWidth-512 )*(630-512),512-32-120);
  draw_clouds(2);
  sprite_draw("grass_1",- (viewport_x -256)/(vWidth-512 )*(800-512),512-32-80);
  draw_clouds(1);
  sprite_draw("grass_0",- (viewport_x -256)/(vWidth-512 )*(1024-512),512-32-32);
  




  for(let decor_id=0;decor_id<decorations.length;decor_id++){
    sprite_draw(decorations[decor_id].decor,  decorations[decor_id].x-viewport_x,decorations[decor_id].y );
  }




  // Set the fill colour to black
  c.fillStyle = "black";
  // Loop through level lines
  for (let row = 0; row < currentLevel.length; row++) {
    // Loop through each character in line
    for (let col = 0; col < currentLevel[0].length; col++) {
      // If character is 1 (a wall) 
      if (currentLevel[row][col] === "1") {       
        sprite_draw("floor_0" ,col * 32 - viewport_x, row * 32);
      }
      if (currentLevel[row][col] === "2") {       
        sprite_draw("floor_1" ,col * 32 - viewport_x, row * 32);
      }
      if (currentLevel[row][col] === "3") {       
        sprite_draw("floor_2" ,col * 32 - viewport_x, row * 32);
      }
      if (currentLevel[row][col] === "4") {       
        sprite_draw("floor_3" ,col * 32 - viewport_x, row * 32);
      }      
      if (currentLevel[row][col] === "water") {       
        animate_water(col , row,150);
      }      
      if (currentLevel[row][col] === "water_frog") {       //to samé, ale už bylo vylepšeno
        animate_water(col , row,150);
      }      


    }
  }
var p_sprite="human";
  if(player.direction >0){
      p_sprite="human_r_"+ Math.floor(player.direction  % 2 );
  }else if(player.direction <0){
     p_sprite="human_l_"+  Math.floor((-player.direction)  % 2 );;
  }else{
     p_sprite="human";
  }
  sprite_draw(p_sprite ,player.x-16- viewport_x,player.y-32+(player.height/2));
  
  //drawDebug(player.x-player.widthHalf,player.y+player.heightHalf);
  //drawDebug(player.x+player.widthHalf,player.y-player.heightHalf);
  //drawDebug(player.x-player.widthHalf,player.y-player.heightHalf);
  //drawDebug(player.x+player.widthHalf,player.y+player.heightHalf);


  for (let row = 0; row < currentLevel.length; row++) {
    // Loop through each character in line
    for (let col = 0; col < currentLevel[0].length; col++) {
            
      if (currentLevel[row][col] === "bed") {       
        sprite_draw("bed" ,col * 32- viewport_x, row * 32);
      }
      if (currentLevel[row][col] === "crater") {       
        sprite_draw("crater" ,col * 32- viewport_x, row * 32);
      }
      if (currentLevel[row][col] === "chilli") {       
        sprite_draw("chilli" ,col * 32- viewport_x, row * 32);
      }
      if (currentLevel[row][col] === "heal") {       
        sprite_draw("heal" ,col * 32- viewport_x, row * 32);
      }
      if (currentLevel[row][col] === "gold") {       
        sprite_draw("gold" ,col * 32- viewport_x, row * 32);
      }
      if (currentLevel[row][col] === "safe") {       
        sprite_draw("safe" ,col * 32- viewport_x, row * 32);
      }
      if (currentLevel[row][col] === "bouncer1") {       
        sprite_draw("bouncer_1" ,col * 32- viewport_x, row * 32);
        player.yke=10 + 2*Math.random();
        currentLevel[row][col] = "bouncer0";
      }

      if (currentLevel[row][col] === "bouncer0") {       
        sprite_draw("bouncer_0" ,col * 32- viewport_x, row * 32);
        if(Math.floor(player.x/32)==col){
          if(Math.floor((player.y+player.heightHalf)/32)==row){            
            if(player.yke<0){                        
              if((player.y+player.heightHalf) % 32 >  16 ){                
                currentLevel[row][col] = "bouncer1";
                sprite_draw("bouncer_1" ,col * 32- viewport_x, row * 32);
              }
            }
          }
        }

      }
      



      if (currentLevel[row][col] === "spider") {       
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

        sprite_draw("spider" ,col * 32 - viewport_x  , row * 32 + offset -10);
      }


    }
  }

  for(let crater_id=0;crater_id<craters.length;crater_id++){
      var crater=craters[crater_id];          
        var crater_ticks= tick % ( crater.y/3    +40)   
        var y= -31+crater_ticks*3;

        if(y<crater.y){
          sprite_draw("meteor", crater.x- viewport_x  ,y);
        }
        if(y<crater.y+10){
          if(tick%3==0 ){
            sprite_draw("meteor_fire_0", crater.x- viewport_x  ,y-3);
          }else if(tick%3==1 ){
            sprite_draw("meteor_fire_1", crater.x- viewport_x  ,y-3);
          }else if(tick%3==2 ){
            sprite_draw("meteor_fire_2", crater.x- viewport_x  ,y-3);
          }else{
            sprite_draw("meteor_fire_0", crater.x- viewport_x  ,y-3);

          }
          
        }
        
        
        
    }
  

    //ui
  for(let h=0;h<player.health;h++){
    sprite_draw("heart", h*16 ,0);
  }
  if(chilli){
    sprite_draw("chilli", 16+player.health*16,0);
  }


  for(let h=0;h<player.gold %5;h++){
    sprite_draw("gold",512-32- (h*16) ,0);
  }
  if(player.gold>5){
    for(let h=0;h<((player.gold - (player.gold %5))/5);h++){
      sprite_draw("money",512-32- ((h+(player.gold %5))*16) ,0);
   }
  }



  tick++;

}
function isWall(a){
  if(a=="0") return false;
  if(a=="1") return true;
  if(a=="2") return true;
  if(a=="3") return true;
  if(a=="4") return true;
  return false;
}

function animate_water(col,row, delay){
      
      let freespace=0;
      let cycler=row+1;
      while (cycler<currentLevel.length && currentLevel[cycler][col]=="0"){
        freespace++;cycler++;        
      }

      let len_wa=24 + freespace*32;

      var local_ticks=((tick)+ 2*delay) %( delay+80+freespace*32/2);
      
    //drop 8
    if (local_ticks<80){
      sprite_draw("drop_"+ Math.floor(local_ticks/10) ,col*32-viewport_x,row*32);
    }else if (local_ticks < (80) + len_wa/2 ){
      //freefall
      var spr=2;
      if (local_ticks <95) spr=1;
      if (local_ticks <88) spr=0;
      sprite_draw("drop_f_"+ spr ,col*32-viewport_x,(row*32)+ ((local_ticks-80)*2  ));
      sprite_draw("drop_0" ,col*32-viewport_x,row*32);
    }else{
      var base_t=local_ticks-80 - len_wa/2;
      if (base_t<20){ //
        sprite_draw("splash_"+ Math.floor(base_t/4) ,col*32-viewport_x,(row +freespace)*32);
      }else if(base_t==21)  {
        if(currentLevel[row][col]=="water"){
        if (Math.random() >0.97) {
          //zatím pokaždé
          const choices=["frog_0","frog_1","frog_2","flower"];
          let i=Math.floor(Math.random()*choices.length); 
          let decor={x:(col)*32,y:(row+freespace)*32,decor:choices[i]};
          decorations.unshift(decor);
          currentLevel[row][col]="water_frog";
          }
          }
        }
        sprite_draw("drop_0" ,col*32-viewport_x,row*32);
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
    if (!isWall(getTile((player.x - player.speed - player.widthHalf) + 1, player.y + player.heightHalf-2))  && player.x > 1&& !isWall(getTile((player.x - player.speed -player.widthHalf) + 1, player.y - player.heightHalf ))){
      // Move player left by player speed
      player.x -= player.speed;
      if(player.direction<0){player.direction--;}else{player.direction=-1;}
    }
  }else if(player.direction<0){player.direction=0;}

  // If D is Down
  if (68 in keysDown) {
    // Check if tile at player location after move is colliding with a wall
    if (!isWall(getTile(((player.x + player.widthHalf) + player.speed) - 1, player.y + player.heightHalf-2)) &&
     player.x + player.width < currentLevel[0].length * 32  &&
    !isWall(getTile(((player.x + player.widthHalf) + player.speed) - 1, player.y - player.heightHalf))
    ) {
      // Move player right by player speed
      player.x += player.speed;
      if(player.direction>0){player.direction++;}else{player.direction=1;}
      
    }
  }else if(player.direction>0){player.direction=0;} 

  // If W is Down and Player's kinetic energy (in Y Axis) is 0
  if (87 in keysDown && player.yke === 0) {
    // Checks if tile directly above player is a wall
    if (!isWall(getTile(player.x,player.y - 1) ) && getTile(player.x + 32,player.y - 1) !== "1"){
    // Increase player's y axis kinetic energy by 8 (jump)
     player.yke += 8;
     if(chilli){
      if(getTile(player.x,player.y - 1)=="0"){
        currentLevel[Math.floor(player.y / 32)][Math.floor(player.x / 32)]="chilli";
      }
     }
    }
    }

  if(player.x>256){
    viewport_x=player.x-256;
  }else{
    viewport_x=0;
  }
  if(viewport_x>currentLevel[0].length * 32  - 512){
    viewport_x=currentLevel[0].length * 32  - 512;
  }

  if(player.y>512){
    player.health--;
    player.y-=128;

  }


  var t=getTile(player.x,player.y - 1);
  if(t=="heal"){
    player.health++;
    currentLevel[Math.floor(player.y / 32)][Math.floor(player.x / 32)]="0";
  }
  if(t=="gold"){
    player.gold++;
    currentLevel[Math.floor(player.y / 32)][Math.floor(player.x / 32)]="0";
  }
  if(t=="safe"){
    player.gold+=15;
    currentLevel[Math.floor(player.y / 32)][Math.floor(player.x / 32)]="0";
  }
  if(t=="chilli"){
    chilli=true;
  }



  //todo zvladat nepadat
  //umrit na pavoukovi
  //lepeni na vlakne
  //umreni na meteorit
  //vitezstvi na posteli

}

// Gets the tile value at an X and Y value
function getTile(x, y) {
  var nx= Math.floor(x/32);
  var ny= Math.floor(y/32);
    // Checks if X or Y value is out of bounds
  if (ny < currentLevel.length  && nx >= 0 && nx < currentLevel[0].length  && ny > 0) {
    // Returns Value
    //console.log(nx+" " + ny);
    return currentLevel[ny][nx];
  }else {
    return "0";
    console.log("obo");
  }
}

function randomLevel(l_height,l_width){
  let safe=false;
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

  l[4][4] = "chilli";   


  for (let i = 1; i < l_height-1; i++){
    for (let j = 1; j < l_width -1; j++){
           
        if(isWall(l[i-1][j])){
          if(isWall(l[i][j-1])){            
            if(!isWall(l[i][j])){
              if(isWall(l[i-1][j+1])){
                if(isWall(l[i+1][j-1])){
                  if(!isWall(l[i+1][j])){
                    if(!isWall(l[i][j+1])){   
                      let decor={x:j*32,y:i*32,decor:"net_left_01"};
                      decorations.unshift(decor);                  
                      l[i][j]="0";
                  const random = Math.random();
                  if(random>0.04){
                    l[i][j+1]="spider";
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

                      let decor={x:(j-1)*32,y:i*32,decor:"net_right_01"};
                      decorations.unshift(decor);                  
                      l[i][j-1]="0";
                      l[i][j]="0";
                  const random = Math.random();
                  if(random>0.44){
                    l[i][j-1]="spider";
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
            if(random>.4 + (0.02*craters.length) ) {// todo zvětšit
              l[vyska][j]="crater";
              var crate={x:j*32,y:vyska*32}
              craters.unshift(crate);

            }
          }



        }

        
        if(l[i][j]=="0"){
          if(isWall(l[i+1][j])){
            //pozemni dekorace
            const random = Math.random();
            if(random>0.96){
              let decor={x:(j)*32,y:i*32,decor:"flower"};
              decorations.unshift(decor);               
            }else if(random>0.95){
              let decor={x:(j)*32,y:i*32,decor:"tree"};
              decorations.unshift(decor); 
            }else if(random>0.94){
              l[i][j]="heal";
            }else if(random>0.93){
              l[i][j]="gold";
            }else if(random>0.80){ 
            
            if(i>5){
              if(l[i-1][j]=="0"){
                if(l[i-2][j]=="0"){
                  l[i][j]="bouncer0";
                }
              }

            }
          }else if ( random > 0.78 && !safe){
            let safe=true;
            l[i][j]="safe";

          }

          }
        }   
      }
    }


        for (let j = 3; j < l_width -3; j++){
          for (let i = 1; i<5; i++){
            if(isWall(l[i][j])){
              var kontrol=i+1;
              
              while( !isWall(l[kontrol][j]) && l[kontrol][j]=="0" && kontrol<l_height-2  ){                
                kontrol++;
              }
              if(isWall(l[kontrol][j])&&kontrol>i+3){
                l[i+1][j]="water";
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