// Get Canvas Element For Use With Javascript (assign to any variable name you want; but short names are generally better as you will be typing it alot).
const c = document.getElementById("canvas").getContext("2d");
let img = new Image();
img.src = "sprites0.png";
let proverbs=[];


const zone_1_end = 50;
const zone_2_end = 70;
function col_to_zone(col) {
  if (col <= zone_1_end) return 1;
  if (col <= zone_2_end) return 2;
  return 3;
}

function say(text){
  if(proverbs.length>1){
    if(proverbs[proverbs.length-1].txt==text){
      proverbs[proverbs.length-1].time=tick;
      return false;
    }
  }

    proverbs.push(  
    {
      txt:text,
      time:tick
    });

}

function drawDebug(x, y) {
  return false;
  // Define a new Path:
  c.beginPath();
  c.fillStyle = "black";

  c.moveTo(x - viewport_x, y - 25);
  c.lineTo(x - viewport_x, y + 25);
  c.stroke();

  c.moveTo(x - viewport_x - 25, y);
  c.lineTo(x - viewport_x + 25, y);
  c.stroke();

}
let viewport_x = 0;
let tick = 0;
let killtick = 0;
let winner = false;
let grow = false;

// Object to hold user key presses
let keysDown = {};
// Will hold Current Level data
let currentLevel;

let sparkles = [];
let sparkling = false;
let monstrum = [];
let clouds = [];
let craters = [];
let droplets = [];
let decorations = [];
let chillicount = 1;
let chilli = false;
let king = false;
let angel = false;
let devil = false;
let horse = false;
let gondor = false;

let water_on = true;
let water_level = (16 - 3) * 32;


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
  heightHalf: 11,
  height: 22,
  // Gravitational Potential Energy (for use with jumping)
  gpe: 0,
  // Kinetic Energy on the Y axis (for use with jumping)
  yke: 0,
  // Player's mass (for use with jumping)
  mass: 64,  // Player's Speed (pixels)
  speed: 1,
  health: 7,
  gold: 1,
  mushroom: 0,
  direction: 0,
  baloon: false
}

function initClouds(size) {
  let cnt = 20 + Math.random() * 10;
  for (let cldg = 0; cldg < cnt; cldg++) {
    let cloud = {
      "x": Math.floor(Math.random() * size),
      "y": Math.floor(Math.random() * 16 * 32) - 100,
      "speed": (Math.random() * 1.7),
      "typ": (Math.floor(Math.random() * 3.99))
    }
    clouds.unshift(cloud);
  }

}

function randtile(tilefather, x, y) {
  const random = Math.random(x + 10 * y);
  const ak = tilefather.length;
  console.log(ak);
  const ab = parseInt(1 + (random * ak));
  if (ab < 10) {
    console.log("small");
    const addr = "0" + ab;
  } else {

    const addr = "" + ab;
  }

  return tilefather[addr];

}


function main() {
  // Check for Input
  input();
  // Do gravity of player
  if (!player.baloon) {
    gravity(player);
  } else {
    player.y -= 2;
    if (player.y < -50) {
      player.baloon = false;
      player.x += 32;
      player.y = -player.height;
    }
  }
  monstrum_animate();

  // Draw Stuff
  draw();
  // Allow HTML to render stuff + loop main function
  requestAnimationFrame(main);
}

// Takes object as parameter for future extensibility
function gravity(obj) {
  if (obj.yke > 30) { obj.yke = 30; }
  if (obj.yke < -30) { obj.yke = -30; }

  if (obj.yke > 0) {
    // Minus object Y value by object Y Kinetic Energy
    obj.y -= obj.yke;
  } else if (!isWall(getTile(obj.x - obj.widthHalf, (obj.y + obj.heightHalf))) && !isWall(getTile(obj.x + obj.widthHalf, (obj.y + obj.heightHalf)))) {
    //mohu padat
    obj.y -= obj.yke;
  }

  // Minus object's Y Kinetic Energy by object's Gravitational Potential Energy
  obj.yke -= obj.gpe;
  if (obj.yke < -6) {
    obj.yke = -6;
  }
  // Recalculate Gravitational Potential Energy
  obj.gpe = calcGPE(obj);
  //console.log(obj.gpe);
  // If tile at object's head location is a wall
  if (isWall(getTile(obj.x - obj.widthHalf, obj.y - obj.heightHalf)) || isWall(getTile(obj.x + obj.widthHalf, obj.y - obj.heightHalf))) {
    // If object is jumping
    if (obj.yke > 0) {
      if (!devil || isWall(getTile(obj.x - obj.widthHalf, obj.y - obj.heightHalf - 32)) || isWall(getTile(obj.x + obj.widthHalf, obj.y - obj.heightHalf - 32))) {
        // Set Y Kinetic Energy to -0.5
        obj.yke = -0.1;
        // Add 1 to Object Y (To Avoid Collision Error)
        obj.y += 1; //todo asi musím zaokrouhlit
      } else {

        console.log("object devil jump");

      }
    }
  } else {
    // If Tile at object's feet location is a wall
    if (isWall(getTile(obj.x - obj.widthHalf, (obj.y + obj.heightHalf))) || isWall(getTile(obj.x + obj.widthHalf, (obj.y + obj.heightHalf)))) {
      if (getTile(obj.x, (obj.y + obj.heightHalf)).startsWith("ball") || getTile(obj.x, (obj.y + obj.heightHalf)).startsWith("win")) {
        if (obj.yke < 0) {
          // na míčích se skáče
          obj.yke = -obj.yke;
          return true;
        }


      }
      // If player is falling
      if (obj.yke < 0) {
        // Set Y Kinetic Energy to 0
        obj.yke = 0;
        // Minus object's Y value so it sits directly on the floor 
        obj.y -= ((obj.y + obj.heightHalf) % 32);
        obj.y = Math.floor(obj.y);

      }
    }
  }


}


function sprite_draw(spritename, x, y) {
  let nx = Math.floor(x);
  let ny = Math.floor(y);
  if (sprites[spritename]) {
    c.drawImage(img, sprites[spritename].x, sprites[spritename].y, sprites[spritename].w, sprites[spritename].h, nx, ny, sprites[spritename].w, sprites[spritename].h);
  } else {
    console.log("Missing sprite:" + spritename);
  }
}

function sprite_draw_scale(spritename, x, y, scale) {
  let nx = Math.floor(x);
  let ny = Math.floor(y);
  if (sprites[spritename]) {
    console.log("scale:" + scale);
    c.drawImage(img, sprites[spritename].x, sprites[spritename].y, sprites[spritename].w, sprites[spritename].h, nx, ny, scale, scale);
  } else {
    console.log("Missing sprite:" + spritename);
  }
}



function draw_clouds(level) {
  var lbound = Math.floor((level - 1) / 4 * clouds.length);
  var rbound = (level) / 4 * clouds.length;

  for (let cloud_id = lbound; cloud_id < rbound; cloud_id++) {

    let cloud = clouds[cloud_id];
    var imga = "cloud_" + cloud.typ;
    let pos = (cloud.x + cloud.speed * tick) % (currentLevel[0].length * 32);
    //sprite_draw("grass_3",- (viewport_x -256)/(vWidth-512 )*(580-512),512-32-156);  
    sprite_draw(imga, pos - viewport_x, cloud.y);
    sprite_draw(imga, pos - (currentLevel[0].length * 32) - viewport_x, cloud.y);
    sprite_draw(imga, pos + (currentLevel[0].length * 32) - viewport_x, cloud.y);
  }
}

function draw() {

  // Erase Everything on Canvas
  c.clearRect(0, 0, canvas.width, canvas.height);
  let vWidth = currentLevel[0].length * 32;

  //.sky-gradient-14 { background: linear-gradient(to bottom, #2d91c2 0%,#1e528e 100%); }
  //#9be2fe 0%,#67d1fb 100%
  // Create gradient

  const grd = c.createLinearGradient(0, 0, 0, 512);
  grd.addColorStop(0, "#9be2fe");
  grd.addColorStop(1, "#67d1fb");

  // Fill with gradient
  c.fillStyle = grd;
  c.fillRect(0, 0, 512, 512);

  //sprite_draw("moon", 180,250+ Math.sin( (player.x/4000) -3)*150);
  c.drawImage(img, sprites["moon"].x + 1, sprites["moon"].y + 1, sprites["moon"].w - 2, sprites["moon"].h - 2, 180, 250 + Math.sin((tick / 23000) - 3) * 150, sprites["moon"].w - 2, sprites["moon"].h - 2);


  draw_clouds(4);
  if(gondor){
    sprite_draw("grass_4", - (viewport_x - 256) / (vWidth - 512) * (580 - 512), 512 - 32 - 156);
  }else{
    sprite_draw("grass_3", - (viewport_x - 256) / (vWidth - 512) * (580 - 512), 512 - 32 - 156);
  }
  
  draw_clouds(3);
  sprite_draw("grass_2", - (viewport_x - 256) / (vWidth - 512) * (630 - 512), 512 - 32 - 120);
  draw_clouds(2);
  sprite_draw("grass_1", - (viewport_x - 256) / (vWidth - 512) * (800 - 512), 512 - 32 - 80);
  draw_clouds(1);
  sprite_draw("grass_0", - (viewport_x - 256) / (vWidth - 512) * (1024 - 512), 512 - 32 - 32);


  for (let decor_id = 0; decor_id < decorations.length; decor_id++) {
    sprite_draw(decorations[decor_id].decor, decorations[decor_id].x - viewport_x, decorations[decor_id].y);
  }




  // Set the fill colour to black
  c.fillStyle = "black";
  const basic_tiles = [
    "floor_",
    "castle_floor_", "grave", "cimburi",
    "castle_wall_",
    "castle_wborder_",
    "castle_decoration_",
    "castle_err_",
    "castle_upper_", "angel", "portal",
    "ball_",
    "frost_", "water_o", "switch_", "castle_coin", "castle_safe", "crush",
    "winner", "mushroom", "poison"

  ];
  // Loop through level lines
  for (let row = 0; row < currentLevel.length; row++) {
    // Loop through each character in line
    for (let col = 0; col < currentLevel[0].length; col++) {
      // If character is 1 (a wall) 
      for (let ind = 0; ind < basic_tiles.length; ind++) {
        if (currentLevel[row][col].startsWith(basic_tiles[ind])) {
          sprite_draw(currentLevel[row][col], col * 32 - viewport_x, row * 32);
        }
      }

      if (tick % 15 == 1) {
        if (currentLevel[row][col].startsWith("crush")) {
          for (let crushind = 10; crushind > 0; crushind--) {
            if (currentLevel[row][col] == "crush_" + crushind) {
              currentLevel[row][col] = "crush_" + (crushind + 1);
              if (crushind == 10) {
                currentLevel[row][col] = "crushed";
              }
            }
          }
        }

      }
      if (currentLevel[row][col] === "water") {
        animate_water(col, row, 150);
      }
      if (currentLevel[row][col] === "water_frog") {       //to samé, ale už bylo vylepšeno
        animate_water(col, row, 150);
      }

      if (col_to_zone(col) == 2) {
        if (row >= currentLevel.length - 3 && col < zone_2_end - 1) {
          if (!(currentLevel[row][col].startsWith("castle_floor"))) {
            if (water_level >= row * 32 && water_level < (row + 1) * 32) {
              c.fillStyle = "blue";
              c.fillRect(col * 32 - viewport_x, water_level, 32, ((row + 1) * 32 - water_level));
            } else if (water_level < row * 32) {
              c.fillStyle = "blue";
              c.fillRect(col * 32 - viewport_x, row * 32, 32, 32);
            }

          }



        }
      }

    }
  }



  if (sparkling && Math.random() > 0.7) {
    sparkles.push(
      {
        x: player.x + Math.floor((Math.random() - 0.5) * player.width),
        y: player.y + Math.floor((Math.random() - 0.5) * player.height),
        vx: 3 * (Math.random() - 0.5),
        vy: 3 * (Math.random() - 0.5)
      }
    );
  }

  if (sparkling && sparkles.length > 64) {
    while (sparkles.length > 10 && sparkles[0].y > 512) {
      sparkles.shift();
    }
  }

  if (sparkling) {
    for (let sparkle_ind = 0; sparkle_ind < sparkles.length; sparkle_ind++) {
      sprite_draw("sparkle_" + Math.floor(Math.random() * 4),
        sparkles[sparkle_ind].x - viewport_x, sparkles[sparkle_ind].y
      );

      sparkles[sparkle_ind].y += sparkles[sparkle_ind].vy;
      sparkles[sparkle_ind].x += sparkles[sparkle_ind].vx;
      sparkles[sparkle_ind].vy += 0.01;
      //sparkles[sparkle_ind].vx= sparkles[sparkle_ind].vx*.09;
    }
  }


  if (!player.baloon) {
    var p_sprite = "human";
    if (player.direction > 0) {
      p_sprite = "human_r_" + Math.floor((player.direction / 2) % 8);
    } else if (player.direction < 0) {
      p_sprite = "human_l_" + Math.floor((-player.direction / 2) % 8);;
    } else {
      p_sprite = "human";
    }

    if (horse) {
      if (player.direction > 0) {
        p_sprite = "horse_" + Math.floor((tick / 10) % 10);
      } else {
        p_sprite = "horse_11";
      }

    }

    if (king && !horse) sprite_draw("king", player.x - 16 - viewport_x, player.y - 32 + (player.height / 2));
    if (!grow) {
      sprite_draw(p_sprite, player.x - 16 - viewport_x, player.y - 32 + (player.height / 2));
    } else {
      spritesize = Math.floor(32 * player.height / 22);
      sprite_draw_scale(p_sprite, player.x - (spritesize / 2) - viewport_x, player.y - spritesize + (player.height / 2), spritesize, spritesize);
      drawDebug(player.x, player.y);
    }
  }

  if (player.baloon) {
    sprite_draw("baloon_0", player.x - viewport_x - 32, player.y - 64 + player.heightHalf); //nestandartni velikost
  }


  drawDebug(player.x - player.widthHalf, player.y + player.heightHalf);
  drawDebug(player.x + player.widthHalf, player.y - player.heightHalf);
  drawDebug(player.x - player.widthHalf, player.y - player.heightHalf);
  drawDebug(player.x + player.widthHalf, player.y + player.heightHalf);

  const front_tiles = ["bed", "crater", "chilli", "heal", "gold", "safe", "stone", "stone_sword"];
  for (let row = 0; row < currentLevel.length; row++) {
    // Loop through each character in line
    for (let col = 0; col < currentLevel[0].length; col++) {
      for (let ind = 0; ind < front_tiles.length; ind++) {
        if (currentLevel[row][col] === front_tiles[ind]) {
          sprite_draw(front_tiles[ind], col * 32 - viewport_x, row * 32);
        }
      }

      if (currentLevel[row][col] === "bouncer1") {
        sprite_draw("bouncer_1", col * 32 - viewport_x, row * 32);
        player.yke = 10 + 2 * Math.random();
        currentLevel[row][col] = "bouncer0";
      }

      if (currentLevel[row][col] === "bouncer0") {
        sprite_draw("bouncer_0", col * 32 - viewport_x, row * 32);
        if (Math.floor(player.x / 32) == col) {
          if (Math.floor((player.y + player.heightHalf) / 32) == row) {
            if (player.yke < 0) {
              if ((player.y + player.heightHalf) % 32 > 16) {
                currentLevel[row][col] = "bouncer1";
                sprite_draw("bouncer_1", col * 32 - viewport_x, row * 32);
              }
            }
          }
        }
      }

      if (currentLevel[row][col] === "baloon") {
        sprite_draw("baloon_0", (col * 32 - viewport_x) - 16, row * 32 - 32); //nestandartni velikost
        if (touch_player(col * 32 + 15, row * 32 + 15, 3)) {
          currentLevel[row][col] = "0";
          say("Proletím se!");
          player.baloon = true;
        }
      }

      if (currentLevel[row][col] === "spider") {
        let freespace = 0;
        let cycler = row + 1;
        while (cycler < currentLevel.length && currentLevel[cycler][col] == "0") {
          freespace++; cycler++;
        }

        let len_sp = 10 + freespace * 32;
        //modulo
        let offset = (tick + 20 * col) % (1 + (len_sp * 2));
        if (offset > len_sp) {
          offset = 2 * len_sp - offset;
        }


        c.beginPath();
        c.lineWidth = 1;
        c.moveTo(col * 32 + 15 - viewport_x, row * 32);
        c.lineTo(col * 32 + 15 - viewport_x, row * 32 + offset + 10);
        c.stroke();
        if (touch_player(col * 32 + 15, row * 32 + offset + 10, 10)) {
          player_kill(1, "Au, pavouku nech mě.");
        }

        sprite_draw("spider", col * 32 - viewport_x, row * 32 + offset - 10);
      }
    }
  }

  for (let crater_id = 0; crater_id < craters.length; crater_id++) {
    var crater = craters[crater_id];
    var crater_ticks = (crater.x * 370 + tick) % (crater.y)
    var y = -31 + crater_ticks * 3;

    if (y < crater.y) {
      sprite_draw("meteor", crater.x - viewport_x, y);
    }
    if (touch_player(crater.x + 16, y + 16, 10)) {
      player_kill(1, "Au, meteorit. Ještě že nejsem dinosaur.");
    }

    if (y < crater.y + 10) {
      if (tick % 3 == 0) {
        sprite_draw("meteor_fire_0", crater.x - viewport_x, y - 3);
      } else if (tick % 3 == 1) {
        sprite_draw("meteor_fire_1", crater.x - viewport_x, y - 3);
      } else if (tick % 3 == 2) {
        sprite_draw("meteor_fire_2", crater.x - viewport_x, y - 3);
      } else {
        sprite_draw("meteor_fire_0", crater.x - viewport_x, y - 3);

      }

    }

  }

  if (touch_player(monstrum[0].x, monstrum[0].y, 25)) {
    player_kill(1,"Obludo, fuj je to!");
  }
  monstrum_draw();

  var tt = getTile(player.x, player.y + player.heightHalf + 1);
  if (tt == "crush_0") {
    say("Hrad se celý rozpadá");
    currentLevel[Math.floor((player.y + player.heightHalf + 1) / 32)][Math.floor(player.x / 32)] = "crush_1";
  }



  //ui
  for (let h = 0; h < player.health; h++) {
    sprite_draw("heart", h * 16, 0);
  }
  if (chilli) {
    sprite_draw("chilli", 16 + player.health * 16, 0);
  }
  if (king) {
    sprite_draw("crown", 16 + 16 + player.health * 16, 0);
  }
  if (angel) {
    sprite_draw("angel", 16 + 16 + 16 + player.health * 16, 0);
  }
  if (devil) {
    sprite_draw("devil", 16 + 16 + 16 + 16 + player.health * 16, 0);
  }

  if (!winner) {
    for (let h = 0; h < player.gold % 5; h++) {
      sprite_draw("gold", 512 - 32 - (h * 16), 0);
    }
    if (player.gold > 5) {
      for (let h = 0; h < ((player.gold - (player.gold % 5)) / 5); h++) {
        sprite_draw("money", 512 - 32 - ((h + (player.gold % 5)) * 16), 0);
      }
    }
  } else {
    for (let h = 0; h < player.mushroom; h++) {
      sprite_draw("mushroom_3", 512 - 32 - (h * 16), 0);
    }

  }

  c.font = "16px serif";
  
  if(proverbs.length>0) {
    if (proverbs[0].time + 30*25<tick){
      proverbs.shift();
    }
  }
  c.fillStyle = "black";
  for( let message_index=0; message_index<proverbs.length;message_index++){
    c.fillText(proverbs[message_index].txt, 5,40+ (18*(proverbs.length  - message_index)));    
  }


  tick++;
  if (!water_on && water_level < (15 * 32 - 2)) {
    if (tick % 20 == 1) {
      water_level++;
    }
  }

}

function downAngle(angle) {//to rad
  return ((.5 - (angle / 180)) * Math.PI);
}

function nohag(x, y, delka, azimut) {
  console.log(azimut);
  return {
    x: x, y: y, ex: x + Math.sin(azimut) * delka, ey: y + Math.cos(azimut) * delka, l: delka, angle: azimut,
    bx: x, by: y
  };
}

function monstrum_init() {
  let telo = { x: 150, y: 160, by: 200 };
  monstrum.push(telo);
  monstrum.push(nohag(10, 28, 60, downAngle(110)));
  monstrum.push(nohag(-10, 28, 60, downAngle(-110)));

  monstrum.push(nohag(15, 25, 55, downAngle(120)));
  monstrum.push(nohag(-15, 25, 55, downAngle(-120)));

  monstrum.push(nohag(22, 17, 50, downAngle(130)));
  monstrum.push(nohag(-22, 17, 50, downAngle(-130)));


  monstrum.push(nohag(10, 30, 70, downAngle(45)));
  monstrum.push(nohag(-10, 30, 70, downAngle(-45)));

  monstrum.push(nohag(15, 25, 60, downAngle(45)));
  monstrum.push(nohag(-15, 25, 60, downAngle(-45)));

  monstrum.push(nohag(22, 17, 50, downAngle(45)));
  monstrum.push(nohag(-22, 17, 50, downAngle(-45)));
}

function monstrum_draw() {


  for (let i = 1; i < 7; i++) {
    c.fillStyle = "gray";
    c.moveTo(monstrum[i].x - viewport_x, monstrum[i].y - 2);
    c.lineTo(monstrum[i].ex - viewport_x, monstrum[i].ey - 1);
    c.stroke();

    sprite_draw("kloub_" + (i - 1), monstrum[i].ex - 4 - viewport_x, monstrum[i].ey - 4);

  }

  for (let i = 7; i < 13; i++) {
    c.fillStyle = "gray";
    c.moveTo(monstrum[i].x - viewport_x, monstrum[i].y);
    c.lineTo(monstrum[i].ex - viewport_x, monstrum[i].ey);
    c.stroke();
  }
  if (!winner) {
    sprite_draw("evil_0", monstrum[0].x - 32 - viewport_x, monstrum[0].y - 32);
  } else {
    sprite_draw("evil_1", monstrum[0].x - 32 - viewport_x, monstrum[0].y - 32);
  }

}




function recalc_noha(noha, fighting, reset) {

  var tX = monstrum[noha].x + (Math.cos(monstrum[noha].angle) * monstrum[noha].l);
  var tY = monstrum[noha].y + (Math.sin(monstrum[noha].angle) * monstrum[noha].l);

  if (reset) {
    monstrum[noha].ex = tX;
    monstrum[noha].ey = tY;
  }

  if (noha == 7 || noha == 10) {
    tY -= (tY % 32);
    tX -= (tX % 32);
    //console.log(tX/32);
  }




  monstrum[noha].ex += (tX - monstrum[noha].ex) / 10;
  monstrum[noha].ey += (tY - monstrum[noha].ey) / 10;



  //  monstrum[noha].ex=monstrum[noha].x + Math.cos(rad)*oldelka;
  //  monstrum[noha].ey=monstrum[noha].y + Math.sin(rad)*oldelka;



}

function monstrum_animate() {
  let fight = false;
  let tarx = player.x;
  let tary = player.y;

  if (winner) {
    tarx += Math.sin(tick / 50) * 200;
    tary += Math.cos(tick / 50) * 200;
  }



  if (Math.abs(tary - monstrum[0].by - 30) > 20) {
    if (tary > monstrum[0].by + 30) {
      monstrum[0].by += 0.8;
    } else {
      monstrum[0].by -= .4;
    }
  }

  monstrum[0].y = monstrum[0].by + Math.sin(tick / 64) * 4;



  if (tarx > monstrum[0].x) {
    if (monstrum[0].x + 50 < zone_1_end * 32 || winner) { monstrum[0].x += 0.22; }
  } else {
    monstrum[0].x -= 0.22;
  }

  if (Math.abs(tarx - monstrum[0].x) > 300) {
    if (monstrum[0].x + 50 < zone_1_end * 32 || winner) {
      if (tarx > monstrum[0].x) {
        if (monstrum[0].x + 50 < zone_1_end * 32) { monstrum[0].x += 5; }
      } else {
        monstrum[0].x -= 5;
      }
    }
  }


  let noha = 1 + (Math.floor(tick / 12) % 6);
  if (Math.abs(player.x - monstrum[0].x) < 100) {
    //if(player.x >monstrum[0].x){noha=1;} else{noha=4;}
    //let fight=true;

  }


  for (let i = 1; i < 7; i++) { //nohy musí růst z těla
    monstrum[i].x = monstrum[0].x + monstrum[i].bx;
    monstrum[i].y = monstrum[0].y + monstrum[i].by;
    if (tick < 2) recalc_noha(i, fight, true);
  }


  recalc_noha(noha, fight, false);

  for (let i = 7; i < 13; i++) { //spodní články z horních
    monstrum[i].x = monstrum[i - 6].ex;
    monstrum[i].y = monstrum[i - 6].ey;
    if (tick < 2) recalc_noha(i, fight, true);
  }

  recalc_noha(noha + 6, fight, false);








}


function player_kill(li, txt) {
  if (tick - killtick < 100) return false;
  if (winner) return false;

  say(txt);
  player.health -= li;
  if (player.health <= 0) {
    say("... ale tak to přeci neskončilo, viď?" );
    //todo GAME over
    if (0 < player.y < 512 && 0 < player.x < currentLevel[0].length * 32) {
      currentLevel[Math.floor(player.y / 32)][Math.floor(player.x / 32)] = "grave";
    }
    player.health = 7;
    player.x = 256;
    player.y = 0;
    chilli = false;
    devil = false;
    // king=false;
    //angel=false;
  } else {
    killtick = tick;

  }
}

function isWall(a) {
  if (a == "0") return false;
  const wall_tiles = [
    "floor_",
    "frost_",
    "castle_floor_",
    "grave",
    "ball_", "crush_1", "crush_2", "crush_3", "winner"
  ];

  for (let ind = 0; ind < wall_tiles.length; ind++) {
    if (a.startsWith(wall_tiles[ind])) return true;
  }
  return false;

}

function animate_water(col, row, delay) {

  let freespace = 0;
  let cycler = row + 1;
  while (cycler < currentLevel.length && currentLevel[cycler][col] == "0") {
    freespace++; cycler++;
  }

  let len_wa = 24 + freespace * 32;

  var local_ticks = ((tick) + 2 * delay) % (delay + 80 + freespace * 32 / 2);

  //drop 8
  if (local_ticks < 80) {
    sprite_draw("drop_" + Math.floor(local_ticks / 10), col * 32 - viewport_x, row * 32);
  } else if (local_ticks < (80) + len_wa / 2) {
    //freefall
    var spr = 2;
    if (local_ticks < 95) spr = 1;
    if (local_ticks < 88) spr = 0;
    sprite_draw("drop_f_" + spr, col * 32 - viewport_x, (row * 32) + ((local_ticks - 80) * 2));
    sprite_draw("drop_0", col * 32 - viewport_x, row * 32);
  } else {
    var base_t = local_ticks - 80 - len_wa / 2;
    if (base_t < 20) { //
      sprite_draw("splash_" + Math.floor(base_t / 4), col * 32 - viewport_x, (row + freespace) * 32);
    } else if (base_t == 21) {
      if (currentLevel[row][col] == "water") {
        if (Math.random() > 0.97) {
          //zatím pokaždé
          const choices = ["frog_0", "frog_1", "frog_2", "flower"];
          let i = Math.floor(Math.random() * choices.length);
          let decor = { x: (col) * 32, y: (row + freespace) * 32, decor: choices[i] };
          decorations.unshift(decor);
          currentLevel[row][col] = "water_frog";
        }
      }
    }
    sprite_draw("drop_0", col * 32 - viewport_x, row * 32);
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
  if (player.baloon) return true;
  var frozen = false;
  if (getTile(player.x, player.y + player.heightHalf + 1).startsWith("frost")) {
    frozen = true;
  }



  // If A is Down
  if ((65 in keysDown || 37 in keysDown) && !horse) {
    // Check if tile at player location after move is colliding with a wall
    if (!isWall(getTile((player.x - player.speed - player.widthHalf) + 1, player.y + player.heightHalf - 2)) && player.x > 1 && !isWall(getTile((player.x - player.speed - player.widthHalf) + 1, player.y - player.heightHalf))) {
      // Move player left by player speed
      player.x -= player.speed;
      if (player.direction < 0) { player.direction--; } else { player.direction = -1; }
    }
  } else if (player.direction < 0 && !frozen) { player.direction = 0; }


  //s
  if (83 in keysDown || 40 in keysDown) {
    horse = false;
    player.speed = 2;
  }


  // If D is Down
  if (68 in keysDown || 39 in keysDown) {
    // Check if tile at player location after move is colliding with a wall
    if (!isWall(getTile(((player.x + player.widthHalf) + player.speed) - 1, player.y + player.heightHalf - 2)) &&
      player.x + player.width < currentLevel[0].length * 32 &&
      !isWall(getTile(((player.x + player.widthHalf) + player.speed) - 1, player.y - player.heightHalf))
    ) {
      // Move player right by player speed
      player.x += player.speed;
      if (player.direction > 0) { player.direction++; } else { player.direction = 1; }

    }
  } else if (player.direction > 0 && !frozen) { player.direction = 0; }



  // If W is Down and Player's kinetic energy (in Y Axis) is 0
  if ((87 in keysDown || 38 in keysDown) && player.yke === 0) {
    // Checks if tile directly above player is a wall
    if (!isWall(getTile(player.x - player.widthHalf, player.y - player.heightHalf)) && !isWall(getTile(player.x - player.widthHalf, player.y - player.heightHalf))) {
      // Increase player's y axis kinetic energy by 8 (jump)
      player.yke += 8;

      if (angel) player.yke += 5;

      if (chilli) {
        if (getTile(player.x, player.y - 1) == "0") {
          currentLevel[Math.floor(player.y / 32)][Math.floor(player.x / 32)] = "chilli";
          chillicount++;
          if (chillicount == 5) {
            say("To bylo vostrý čili!");
            devil = true;
          }
        }
      }
    }
  }

  if (frozen && player.direction !== 0) {
    if (player.direction > 0) {
      player.x += 1;

    } else if (player.direction < 0) {
      player.x -= 1;

    } else {

    }
  }

  if (player.x > 256) {
    viewport_x = player.x - 256;
  } else {
    viewport_x = 0;
    if(winner){
      gondor=true;
      proverbs=[];
      say("Tohle je konec hry!")
      say("Ale to už je jiný příběh.");

      say( "Majáky vzplály! Gondor volá o pomoc! ");

    }
  }
  if (viewport_x > currentLevel[0].length * 32 - 512) {
    viewport_x = currentLevel[0].length * 32 - 512;
  }

  if (player.y > 512) {
    player.health--;
    player.y -= 128;

  }


  var t = getTile(player.x, player.y - 1);
  if (col_to_zone(Math.floor(player.x / 32)) == 2) {
    if (player.y > water_level) {
      player.yke = 10;
      player.y -= player.heightHalf;
      player_kill(1,"Žbluňk, brr, ta voda je ale mokrá a studená.");
    } else {
      if (t == "castle_safe") {
        player.gold += 15;
        say("Poklad hradního pána, to si nechám líbit.");
        currentLevel[Math.floor(player.y / 32)][Math.floor(player.x / 32)] = "castle_wall_0";
      }
      if (t == "castle_coin") {
        say("Zlato hradního pána.");
        player.gold += 5;
        currentLevel[Math.floor(player.y / 32)][Math.floor(player.x / 32)] = "castle_wall_1";
      }

    }

  }


  if (t == "heal") {
    say("Hned je mi líp.");
    player.health++;
    currentLevel[Math.floor(player.y / 32)][Math.floor(player.x / 32)] = "0";
  }
  if (t == "gold") {
    say("Penízky!");
    player.gold++;
    currentLevel[Math.floor(player.y / 32)][Math.floor(player.x / 32)] = "0";
  }

  if (t == "bed") {
    say("Hurá, jsem vítěz. Projdu si mapu ještě jednou, třeba se něco změnilo.");

    winner = true;
    chilli = false;
    horse = false;
    player.speed = 2;
    player.health = 1;

    player.mushroom += player.gold;
    player.gold;

    let delka = currentLevel[0].length;
    let vyska = currentLevel.length;
    currentLevel[Math.floor(player.y / 32)][Math.floor(player.x / 32)] = "safe";

    currentLevel[vyska - 2][delka - 3] = "winner_3";
    currentLevel[vyska - 2][delka - 4] = "winner_0";
    currentLevel[vyska - 2][delka - 5] = "winner_2";
    currentLevel[vyska - 3][delka - 4] = "winner_1";

    currentLevel[vyska - 4][zone_1_end + 1] = "0";//pruchozi hrad


    player.x = (delka - 3.5) * 32;
    player.y = (vyska - 4) * 32;

    sparkling = true;

    for (let sparklec = 0; sparklec < 5; sparklec++) {
      let sx = player.x - Math.random() * 400;
      let sy = 100 + Math.random() * 400;
      let spd = .3 + Math.random();
      for (let sparkli = 0; sparkli < 150; sparkli++) {
        sparkles.push({
          x: sx,
          y: sy,
          vx: Math.sin(2 * Math.PI * sparkli / 150) * spd + 0.06 * (Math.random() - 0.5),
          vy: Math.cos(2 * Math.PI * sparkli / 150) * spd + 0.06 * (Math.random() - 0.5)
        })
      }
    }



    let hidetiles = ["portal", "chilli", "gold", "safe", "heal", "stone"];
    // Loop through level lines
    for (let row = 0; row < currentLevel.length - 1; row++) {
      // Loop through each character in line
      for (let col = 0; col < currentLevel[0].length; col++) {
        // If character is 1 (a wall) 
        for (let ind = 0; ind < hidetiles.length; ind++) {
          if (currentLevel[row][col] == hidetiles[ind]) {
            currentLevel[row][col] = "mushroom_" + Math.floor(Math.random() * 5);
          }
        }
        if (currentLevel[row][col] == "0" && isWall(currentLevel[row + 1][col]) && Math.random() > 0.93) {
          currentLevel[row][col] = "mushroom_" + Math.floor(Math.random() * 5);

        }
      }
    }
  }

  if (t == "switch_on" || t == "switch_pin") {
    if (king || winner) {
      say("Zkusím tohle přepnout.");
      currentLevel[Math.floor(player.y / 32)][Math.floor(player.x / 32)] = "switch_off";
      currentLevel[Math.floor(player.y / 32) + 2][Math.floor(player.x / 32)] = "water_off";
      water_on = false;
    } else {
      say("Nějak to nefunguje. Prý nejsem král.");
      currentLevel[Math.floor(player.y / 32)][Math.floor(player.x / 32)] = "switch_pin";
    }
  }

  if (t == "stone_sword") {
    say("Meč zabodnutý do kamene, ten se mi líbí. Beru!");
    king = true;
    currentLevel[Math.floor(player.y / 32)][Math.floor(player.x / 32)] = "stone";
  }

  if (t == "portal") {
    say("Hyjé koníčku. Šipka dolů nebo S mi pomůže slézt");
    horse = true;
    player.speed = 4;
    //angel=false;
    //devil=false;    
  }

  if (t == "safe") {
    say("To je peněz, budu boháč.");
    player.gold += 15;
    currentLevel[Math.floor(player.y / 32)][Math.floor(player.x / 32)] = "0";
  }

  if (t.startsWith("mushroom")) {    
    player.mushroom++;
    currentLevel[Math.floor(player.y / 32)][Math.floor(player.x / 32)] = "0";
    if (grow) {
      say("Ham. V břiše mi škrundá.");
      player.width += 2;
      player.widthHalf += 1;
      player.height += 2;
      player.heightHalf += 1;
      player.y -= 30;
    }else{
      say("Ham.");
    }
  }

  if (t == "chilli") {
    if (!chilli) {
      chilli = true;
      player_kill(1, "Pekelně pikantní.");
    }
  }
  if (t == "angel") {
    angel = true;
    say("Andělé nade mnou bdí.");
    //currentLevel[Math.floor(player.y / 32)][Math.floor(player.x / 32)]="0";
  }
  if (t == "poison") {
    if(!grow){
      say("Lahvička s nápisem VYPIJ MĚ! Ale jen mi po ní škrundá v břiše.");
      grow = true;
      
    }
  }

  //todo zvladat nepadat
  //lepeni na vlakne
  //vitezstvi na posteli
}

function touch_player(x, y, size) {
  drawDebug(x, y);
  let px = Math.abs(player.x - x);
  if (px > size + player.heightHalf) return false;
  let py = Math.abs(player.y - y);
  if (py > size + player.widthHalf) return false;


  let distance = Math.sqrt((player.x - x) * (player.x - x) + (player.y - y) * (player.y - y));
  return distance < size + player.heightHalf; // 

}


// Gets the tile value at an X and Y value
function getTile(x, y) {
  var nx = Math.floor(x / 32);
  var ny = Math.floor(y / 32);
  // Checks if X or Y value is out of bounds
  if (ny < currentLevel.length && nx >= 0 && nx < currentLevel[0].length && ny > 0) {
    // Returns Value
    //console.log(nx+" " + ny);
    return currentLevel[ny][nx];
  } else {
    return "0";
  }
}

function randomLevel(l_height, l_width) {
  var safe = false;
  let l = [];
  var sword = false;
  var haveangel = false;
  const noise = 0.8;
  for (let i = 0; i < l_height; i++) {
    l.push([]);
    l[i].push(...("0".repeat(l_width).split("")));
  }

  for (let i = 0; i < l_height; i++) {
    for (let j = 0; j < zone_1_end; j++) {
      const random = Math.random();
      const tile = Math.floor((Math.random() * 4.999));
      if (random > noise) {
        l[i][j] = "floor_" + tile;
      }
    }
  }

  l[(l_height - 2)][(zone_1_end)] = "baloon";



  l[0][zone_1_end + 1] = "cimburi";

  var last_hrad = 0;
  var cur_hrad = 0;
  for (let j = zone_1_end + 2; j < zone_2_end; j++) {
    const random = Math.random();
    cur_hrad = last_hrad;
    if (random > 0.95) {
      cur_hrad = Math.floor(Math.random() * l_height);
    } else if (cur_hrad < l_height - 3 && random > 0.7) {
      cur_hrad += 2;
    } else if (cur_hrad > 3 && random > 0.5) {
      cur_hrad--;
    }

    for (let horni = 1; horni < cur_hrad; horni++) {
      if (l[horni][j - 1].startsWith("castle_wall")) {
        l[horni][j - 1] = "castle_wborder_" + Math.floor(Math.random() * 4);
      }
      if (l[horni][j - 1].startsWith("castle_floor")) {
        l[horni][j - 1] = "castle_floor_3";
      }


    }

    if (cur_hrad < 3) {
      const random = Math.random();
      if (random > 0.2) {
        l[cur_hrad][j] = "cimburi";
      }
    }

    for (let i = cur_hrad + 1; i < l_height - 1; i++) {
      var tile = "castle_wall_" + Math.floor(Math.random() * 6);

      if (i == cur_hrad + 1) {
        if (Math.random() > 0.01) {
          var tile = "castle_upper_" + Math.floor(Math.random() * 6);
        }
      }
      if (i % 3 == 1) {
        if (Math.random() > 0.7) {
          var tile = "castle_decoration_" + Math.floor(Math.random() * 4);
        }
      }
      if (i % 3 == 2) {
        if (Math.random() > 0.45) {
          var tile = "castle_floor_" + Math.floor(Math.random() * 2);
        }
        if (Math.random() > 0.85) {
          var tile = "crush_0";
        }

      }
      if (Math.random() > 0.88) {
        var tile = "castle_err_" + Math.floor(Math.random() * 6);
      }

      l[i][j] = tile;
    }
    last_hrad = cur_hrad;
  }


  for (let i = 1; i < l_height; i++) {
    l[i][zone_1_end + 1] = "castle_floor_" + Math.floor(Math.random() * 2.3);
  }

  for (let i = 0; i < l_height; i++) {
    l[i][0] = "floor_" + Math.floor(Math.random() * 4);
    l[i][l_width - 1] = "castle_floor_" + Math.floor(Math.random() * 2.3);
  }

  for (let j = 0; j <= zone_1_end; j++) {
    l[l_height - 1][j] = "floor_" + Math.floor(Math.random() * 3);
  }

  for (let j = zone_1_end + 1; j <= zone_2_end; j++) {
    l[l_height - 1][j] = "castle_floor_" + Math.floor(Math.random() * 2.3);
  }

  l[l_height - 1][zone_2_end - 1] = "castle_floor_" + Math.floor(Math.random() * 2.3);
  l[l_height - 2][zone_2_end - 1] = "castle_floor_" + Math.floor(Math.random() * 2.3);
  l[l_height - 3][zone_2_end - 1] = "castle_floor_" + Math.floor(Math.random() * 2.3);
  l[l_height - 2][zone_2_end - 2] = "castle_floor_" + Math.floor(Math.random() * 2.3);

  l[l_height - 6][zone_2_end - 8] = "switch_on";
  l[l_height - 5][zone_2_end - 8] = "castle_floor_2";
  l[l_height - 4][zone_2_end - 8] = "water_on";


  l[l_height - 2][zone_1_end + 3] = "castle_safe";
  l[l_height - 2][zone_1_end + 4] = "castle_coin";
  l[l_height - 2][zone_1_end + 5] = "castle_coin";
  l[l_height - 2][zone_1_end + 6] = "castle_safe";


  for (let j = zone_2_end + 1; j <= l_width - 1; j++) {
    l[l_height - 1][j] = "floor_" + Math.floor(Math.random() * 3);
    if (j > zone_2_end + 5 && Math.random() > 0.88) {
      for (let i = j - 5; i <= j - 1; i++) {
        l[l_height - 1][i] = "frost_" + Math.floor(Math.random() * 3);

      }


    }

  }


  l[0][1] = "floor_4";
  l[0][2] = "floor_3";
  l[1][1] = "0";

  l[4][4] = "chilli";


  for (let i = 1; i < l_height - 1; i++) {
    for (let j = 1; j < l_width - 1; j++) {

      if (isWall(l[i - 1][j])) {
        if (isWall(l[i][j - 1])) {
          if (!isWall(l[i][j])) {
            if (isWall(l[i - 1][j + 1])) {
              if (isWall(l[i + 1][j - 1])) {
                if (!isWall(l[i + 1][j])) {
                  if (!isWall(l[i][j + 1])) {
                    let decor = { x: j * 32, y: i * 32, decor: "net_left_01" };
                    decorations.unshift(decor);
                    l[i][j] = "0";
                    const random = Math.random();
                    if (random > 0.04) {
                      l[i][j + 1] = "spider";
                    }
                  }
                }
              }
            }
          }
        }
      }

      if (isWall(l[i - 1][j])) {
        if (isWall(l[i - 1][j - 1])) {
          if (!isWall(l[i][j])) {
            if (isWall(l[i][j + 1])) {
              if (isWall(l[i + 1][j + 1])) {
                if (!isWall(l[i + 1][j])) {
                  if (!isWall(l[i - 1][j + 1])) {

                    let decor = { x: (j - 1) * 32, y: i * 32, decor: "net_right_01" };
                    decorations.unshift(decor);
                    l[i][j - 1] = "0";
                    l[i][j] = "0";
                    const random = Math.random();
                    if (random > 0.44) {
                      l[i][j - 1] = "spider";
                    }




                  }
                }
              }
            }
          }
        }
      }







      if (l[i][j] == "0") {
        if (isWall(l[i + 1][j])) {
          //pozemni dekorace
          const random = Math.random();
          if (random > 0.96) {
            let decor = { x: (j) * 32, y: i * 32, decor: "flower" };
            decorations.unshift(decor);
          } else if (random > 0.95) {
            let decor = { x: (j) * 32, y: i * 32, decor: "tree" };
            decorations.unshift(decor);
          } else if (random > 0.94) {
            l[i][j] = "heal";
          } else if (random > 0.93) {
            l[i][j] = "gold";
          } else if (random > 0.80) {

            if (i > 5) {
              if (l[i - 1][j] == "0") {
                if (l[i - 2][j] == "0") {
                  l[i][j] = "bouncer0";
                }
              }

            }
          } else if (random > 0.78 && !safe) {
            safe = true;
            l[i][j] = "safe";

          } else if (random > 0.78 && !sword) {
            l[i][j] = "stone_sword";
            sword = true;

          } else if (random > 0.78 && !haveangel) {
            l[i][j] = "angel";
            haveangel = true;
          } else if (random > 0.77 && isWall(l[i + 1][j])) {
            l[i][j] = "ball_" + Math.floor(Math.random() * 6);
          } else if (random > 0.4 && col_to_zone(j) == 2) {
            l[i][j] = "portal";
          } else if (random > 0.74) {
            l[i][j] = "mushroom_" + Math.floor(Math.random() * 5);
          }

        }
      }
    }
  }


  for (let j = 1; j < zone_2_end - 1; j++) {
    var vyska = 0;
    while (vyska < l_height - 2 && l[vyska][j] == "0") {
      vyska++;
    }

    if (vyska == l_height - 2) {
      const random = Math.random();
      if (random > .6 && l[vyska][j] == "0") {
        l[vyska][j] = "crater";
        var crate = { x: j * 32, y: vyska * 32 }
        craters.unshift(crate);

      }
      if (random < 0.3) {
        l[vyska][j] = "baloon";
      }
    }
  }



  for (let j = 3; j < l_width - 3; j++) {
    for (let i = 1; i < 5; i++) {
      if (isWall(l[i][j])) {
        var kontrol = i + 1;

        while (!isWall(l[kontrol][j]) && l[kontrol][j] == "0" && kontrol < l_height - 2) {
          kontrol++;
        }
        if (isWall(l[kontrol][j]) && kontrol > i + 3) {
          l[i + 1][j] = "water";
        }


      }
    }
  }



  l[7][5] = "floor_2";
  l[l_height - 1][5] = "floor_3";
  l[l_height - 2][l_width - 2] = "0";
  l[l_height - 3][l_width - 2] = "0";
  l[l_height - 2][l_width - 2] = "0";


  l[l_height - 4][l_width - 4] = "bed";
  l[l_height - 2][l_width - 2] = "poison";
  l[l_height - 2][l_width - 3] = "floor_3";
  l[l_height - 2][l_width - 4] = "floor_0";
  l[l_height - 2][l_width - 5] = "floor_2";
  l[l_height - 3][l_width - 4] = "floor_1";



  l[1][4] = "0";
  l[2][4] = "0";

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
  currentLevel = randomLevel(16, 100);
  initClouds(570);
  monstrum_init();
  // Start Platformer
  say("Blíží se noc, čas zalézt to postele.")
  main();
}