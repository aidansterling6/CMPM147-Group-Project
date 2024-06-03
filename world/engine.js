"use strict";

/* global p5 */
/* exported preload, setup, draw, mouseClicked */

// Project base code provided by {amsmith,ikarth}@ucsc.edu


let tile_width_step_main; // A width step is half a tile's width
let tile_height_step_main; // A height step is half a tile's height

// Global variables. These will mostly be overwritten in setup().
let tile_rows, tile_columns;
let camera_offset;
let camera_velocity;

let level = 0;
let keyTime = 0;
let ShiftY = 500;
let speed = 5;
let caveLevel = -30;

/////////////////////////////
// Transforms between coordinate systems
// These are actually slightly weirder than in full 3d...
/////////////////////////////
function worldToScreen([world_x, world_y], [camera_x, camera_y]) {
  let i = (world_x - world_y) * tile_width_step_main;
  let j = (world_x + world_y) * tile_height_step_main;
  return [i + camera_x, j + camera_y];
}

function worldToCamera([world_x, world_y], [camera_x, camera_y]) {
  let i = (world_x - world_y) * tile_width_step_main;
  let j = (world_x + world_y) * tile_height_step_main;
  return [i, j];
}

function tileRenderingOrder(offset) {
  return [offset[1] - offset[0], offset[0] + offset[1]];
}

function screenToWorld([screen_x, screen_y], [camera_x, camera_y]) {
  screen_x -= camera_x;
  screen_y -= camera_y;
  screen_x /= tile_width_step_main * 2;
  screen_y /= tile_height_step_main * 2;
  screen_y += 0.5;
  return [Math.floor(screen_y + screen_x), Math.floor(screen_y - screen_x)];
}

function cameraToWorldOffset([camera_x, camera_y]) {
  let world_x = camera_x / (tile_width_step_main * 2);
  let world_y = camera_y / (tile_height_step_main * 2);
  return { x: Math.round(world_x), y: Math.round(world_y) };
}

function worldOffsetToCamera([world_x, world_y]) {
  let camera_x = world_x * (tile_width_step_main * 2);
  let camera_y = world_y * (tile_height_step_main * 2);
  return new p5.Vector(camera_x, camera_y);
}

class Character{
  static characters = [];
  static CurrentID = 0;
  constructor(x, y, width, height){
      this.ID = Character.CurrentID;
      Character.CurrentID++;
      this.x = x;
      this.y = y;
      this.farValue = [Infinity, Infinity];
      this.yValue = Infinity;
      this.width = width;
      this.height = height;
      this.baseHeight = 0.1;
      Character.characters.push(this);
  }
  getHeight(world_offset, camera_offset){
    let [world_x, world_y] = [this.x, this.y];
    let [camera_x, camera_y] = [camera_offset.x, camera_offset.y];
    let [screen_x, screen_y] = worldToScreen(
        [world_x, world_y],
        [camera_x, camera_y]
    );
    return [screen_x, screen_y];
  }
  draw(world_offset, camera_offset){
      let [screen_x, screen_y] = this.getHeight(world_offset, camera_offset);
      push();
          translate(0 - screen_x, screen_y);
          simpleIsoTile(20, /*overworld.GetHeight(i, j)*100*/this.baseHeight*100-ShiftY + 500, tw*this.width, th*this.height, color(255, 0, 0), color(255, 0, 0), color(255, 0, 0));
          fill(0);
          textSize(5);
          //text(this.yValue, -5, this.baseHeight*100-ShiftY + 500 - 25);
          pop();
      //console.log([this.x, this.y]);
  }
}

let player1 = new Character(0, 0, 1/3, 1/3);
let player2 = new Character(0, 0, 1/3, 1/3);

function preload() {
  if (window.p3_preload) {
    window.p3_preload();
  }
}

function setup() {
  let canvas = createCanvas(800, 400);
  canvas.parent("container");

  camera_offset = new p5.Vector(-width / 2, height / 2);
  camera_velocity = new p5.Vector(0, 0);

  if (window.p3_setup) {
    window.p3_setup();
  }

  let label = createP();
  label.html("World key: ");
  label.parent("container");

  let input = createInput("xyzzy");
  input.parent(label);
  input.input(() => {
    rebuildWorld(input.value());
  });

  createP("Arrow keys scroll. Press e to toggle world.").parent("container");

  rebuildWorld(input.value());
}

function rebuildWorld(key) {
  if (window.p3_worldKeyChanged) {
    window.p3_worldKeyChanged(key);
  }
  tile_width_step_main = window.p3_tileWidth ? window.p3_tileWidth() : 32;
  tile_height_step_main = window.p3_tileHeight ? window.p3_tileHeight() : 14.5;
  tile_columns = Math.ceil(width / (tile_width_step_main * 2));
  tile_rows = Math.ceil(height / (tile_height_step_main * 2) + 2);
}

function mouseClicked() {
  let world_pos = screenToWorld(
    [0 - mouseX, mouseY],
    [camera_offset.x, camera_offset.y]
  );

  if (window.p3_tileClicked) {
    window.p3_tileClicked(world_pos[0], world_pos[1]);
  }
  return false;
}

function draw() {

  if(keyIsDown(69) && keyTime <= 0){
    if(level === 0){
      level = 1;
    } else {
      level = 0;
    }
    keyTime = 30;
  }
  keyTime--;
  if(ShiftY === 500 || ShiftY === caveLevel){
    // Keyboard controls!
    // if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
    //   camera_velocity.x -= 1;
    // }
    // if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
    //   camera_velocity.x += 1;
    // }
    // if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
    //   camera_velocity.y -= 1;
    // }
    // if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
    //   camera_velocity.y += 1;
    // }
    if (keyIsDown(65)) {
      player1.x += 0.05;
      player1.y -= 0.05;
    }
    if (keyIsDown(68)) {
      player1.x -= 0.05;
      player1.y += 0.05;
    }
    if (keyIsDown(83)) {
      player1.x += 0.05;
      player1.y += 0.05;
    }
    if (keyIsDown(87)) {
      player1.x -= 0.05;
      player1.y -= 0.05;
    }


    if (keyIsDown(LEFT_ARROW)) {
      player2.x += 0.05;
      player2.y -= 0.05;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      player2.x -= 0.05;
      player2.y += 0.05;
    }
    if (keyIsDown(DOWN_ARROW)) {
      player2.x += 0.05;
      player2.y += 0.05;
    }
    if (keyIsDown(UP_ARROW)) {
      player2.x -= 0.05;
      player2.y -= 0.05;
    }
  }

  let camera_delta = new p5.Vector(0, 0);
  camera_velocity.add(camera_delta);
  if(ShiftY === 500 || ShiftY === caveLevel){
  camera_offset.add(camera_velocity);
  }
  camera_velocity.mult(0.95); // cheap easing
  if (camera_velocity.mag() < 0.01) {
    camera_velocity.setMag(0);
  }

  let world_pos = screenToWorld(
    [0 - mouseX, mouseY],
    [camera_offset.x, camera_offset.y]
  );
  let world_offset = cameraToWorldOffset([camera_offset.x, camera_offset.y]);

  background(100);

  if (window.p3_drawBefore) {
    window.p3_drawBefore();
  }

  let overdraw = 0.1;

  let y0 = Math.floor((0 - overdraw) * tile_rows);
  let y1 = Math.floor((1 + overdraw) * tile_rows);
  let x0 = Math.floor((0 - overdraw) * tile_columns);
  let x1 = Math.floor((1 + overdraw) * tile_columns);

  let centerx = round((x0 + x1)/2);
  let centery = round((y0 + y1)/2);
  //player.baseHeight = -Infinity;

  let VPasses = {};
  VPasses[-1] = {
    yValue: Infinity,
    tiles: [],
    lastTile: null,
    character: -1
  };



  // for (let y = y0; y < y1; y++) {
  //   for (let x = x0; x < x1; x++) {
  //     let [i, j] = tileRenderingOrder([
  //       x + world_offset.x,
  //       y - world_offset.y
  //     ]);
  //     if(i - 1 + 0.5 - 1/32 <= player.x + player.width/2 && j - 1 + 0.5 - 1/32 <= player.y + player.height/2 && i + 0.5 - 1/32 >= player.x - player.width/2 && j + 0.5 - 1/32 >= player.y - player.height/2){
  //       simpleIsoTile(20, /*overworld.GetHeight(i, j)*100*/-ShiftY + 500, tw/3, th/3, color(255, 0, 0), color(255, 0, 0), color(255, 0, 0));
  //       let tmpHeight = overworld.GetHeight(i, j);
  //       if(tmpHeight > player.baseHeight){
  //        player.baseHeight = tmpHeight;
  //       }
  //     }
  //   }
  //   for (let x = x0; x < x1; x++) {
  //     let [i, j] = tileRenderingOrder([
  //       x + 0.5 + world_offset.x,
  //       y + 0.5 - world_offset.y
  //     ]);
  //     if(i - 1 + 0.5 - 1/32 <= player.x + player.width/2 && j - 1 + 0.5 - 1/32 <= player.y + player.height/2 && i + 0.5 - 1/32 >= player.x - player.width/2 && j + 0.5 - 1/32 >= player.y - player.height/2){
  //       simpleIsoTile(20, /*overworld.GetHeight(i, j)*100*/-ShiftY + 500, tw/3, th/3, color(255, 0, 0), color(255, 0, 0), color(255, 0, 0));
  //       let tmpHeight = overworld.GetHeight(i, j);
  //       if(tmpHeight > player.baseHeight){
  //        player.baseHeight = tmpHeight;
  //       }
  //     }
  //   }
  // }

  for(let i = 0; i < Character.characters.length; i++){
    let tmpChar = Character.characters[i];
    let tmpHeight = tmpChar.getHeight(world_offset, camera_offset);
    tmpChar.baseHeight = -Infinity;
    tmpChar.yValue = -Infinity;
    tmpChar.farValue = [-Infinity, -Infinity];
    if(!VPasses[tmpChar.ID]){
      VPasses[tmpChar.ID] = {
        yValue: -Infinity,
        tiles: [],
        lastTile: null,
        character: i
      };
    }
  }


  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      let [i, j] = tileRenderingOrder([
        x + world_offset.x,
        y - world_offset.y
      ]);
      let miny = Infinity;
      let minChar = -1;
      for(let index = 0; index < Character.characters.length; index++){
        if(i - 1 + 0.5 - 1/32 <= Character.characters[index].x + Character.characters[index].width/2 && j - 1 + 0.5 - 1/32 <= Character.characters[index].y + Character.characters[index].height/2 && i + 0.5 - 1/32 >= Character.characters[index].x - Character.characters[index].width/2 && j + 0.5 - 1/32 >= Character.characters[index].y - Character.characters[index].height/2){
          simpleIsoTile(20, /*overworld.GetHeight(i, j)*100*/-ShiftY + 500, tw/3, th/3, color(255, 0, 0), color(255, 0, 0), color(255, 0, 0));
          let tmpHeight = overworld.GetHeight(i, j);
          if(tmpHeight > Character.characters[index].baseHeight){
            Character.characters[index].baseHeight = tmpHeight;
          }
          if(i + j > Character.characters[index].farValue[0] + Character.characters[index].farValue[1]){
            Character.characters[index].farValue = [i, j];
            Character.characters[index].yValue = i + j;
          }
        }
      }
    }
    for (let x = x0; x < x1; x++) {
      let [i, j] = tileRenderingOrder([
        x + 0.5 + world_offset.x,
        y + 0.5 - world_offset.y
      ]);
      let miny = Infinity;
      let minChar = -1;
      for(let index = 0; index < Character.characters.length; index++){
        if(i - 1 + 0.5 - 1/32 <= Character.characters[index].x + Character.characters[index].width/2 && j - 1 + 0.5 - 1/32 <= Character.characters[index].y + Character.characters[index].height/2 && i + 0.5 - 1/32 >= Character.characters[index].x - Character.characters[index].width/2 && j + 0.5 - 1/32 >= Character.characters[index].y - Character.characters[index].height/2){
          simpleIsoTile(20, /*overworld.GetHeight(i, j)*100*/-ShiftY + 500, tw/3, th/3, color(255, 0, 0), color(255, 0, 0), color(255, 0, 0));
          let tmpHeight = overworld.GetHeight(i, j);
          if(tmpHeight > Character.characters[index].baseHeight){
            Character.characters[index].baseHeight = tmpHeight;
          }
          if(i + j > Character.characters[index].farValue[0] + Character.characters[index].farValue[1]){
            Character.characters[index].farValue = [i, j];
            Character.characters[index].yValue = i + j;
          }
        }
      }
    }
  }

  function ijLess(i1, j1, i2, j2){
    //if(i1 + j1 < i2 + j2 || (i1 + j1 === i2 + j2 && ))
  }
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      let [i, j] = tileRenderingOrder([
        x + world_offset.x,
        y - world_offset.y
      ]);
      let miny = Infinity;
      let minij = [Infinity, Infinity];
      let minChar = -1;
      for(let index = 0; index < Character.characters.length; index++){
        if(i - 1 + 0.5 - 1/32 <= Character.characters[index].x + Character.characters[index].width/2 && j - 1 + 0.5 - 1/32 <= Character.characters[index].y + Character.characters[index].height/2){
          // if(Character.characters[index].yValue < miny){
          //   miny = Character.characters[index].yValue;
          //   minChar = index;
          // }
          if(/*minChar !== -2 && */Character.characters[index].farValue[0] + Character.characters[index].farValue[1] < minij[0] + minij[1]/* && !(Character.characters[index].farValue[0] === i && Character.characters[index].farValue[1] === j)*/){
            minij = Character.characters[index].farValue;
            minChar = index;
          }
          if(Character.characters[index].farValue[0] === i && Character.characters[index].farValue[1] === j){
            //minChar = -2;
          }
          // drawTile(
          //   [i, j],
          //   [camera_offset.x,camera_offset.y], 
          //   round(x), round(y), round(centerx), round(centery)); // odd row
          }
        }
      if(minChar >= 0){
        let tmpChar = Character.characters[minChar];
        VPasses[tmpChar.ID].tiles.push(
          {
            ij: [i, j],
            camxy: [camera_offset.x,camera_offset.y],
            x1: round(x),
            y1: round(y),
            x2: round(centerx),
            y2: round(centery)
          }
        );
      }
      else if(minChar === -1) {
        VPasses[-1].tiles.push(
          {
            ij: [i, j],
            camxy: [camera_offset.x,camera_offset.y],
            x1: round(x),
            y1: round(y),
            x2: round(centerx),
            y2: round(centery)
          }
        );
      }
      // else {
      //   VPasses[-1].tiles.push(
      //     {
      //       ij: [i, j],
      //       camxy: [camera_offset.x,camera_offset.y],
      //       x1: round(x),
      //       y1: round(y),
      //       x2: round(centerx),
      //       y2: round(centery)
      //     }
      //   );
      // }
    }
    for (let x = x0; x < x1; x++) {
      let [i, j] = tileRenderingOrder([
        x + 0.5 + world_offset.x,
        y + 0.5 - world_offset.y
      ]);
      let minij = [Infinity, Infinity];
      let minChar = -1;
      for(let index = 0; index < Character.characters.length; index++){
        if(i - 1 + 0.5 - 1/32 <= Character.characters[index].x + Character.characters[index].width/2 && j - 1 + 0.5 - 1/32 <= Character.characters[index].y + Character.characters[index].height/2){
          if(/*minChar !== -2 && */Character.characters[index].farValue[0] + Character.characters[index].farValue[1] < minij[0] + minij[1]/* && !(Character.characters[index].farValue[0] === i && Character.characters[index].farValue[1] === j)*/){
            minij = Character.characters[index].farValue;
            minChar = index;
          }
          if(Character.characters[index].farValue[0] === i && Character.characters[index].farValue[1] === j){
            //minChar = -2;
          }
          // drawTile(
          //   [i, j],
          //   [camera_offset.x, camera_offset.y]
          //   , 0, 0, 1, 1); // even rows are offset horizontally
        }
      }
      if(minChar >= 0){
        let tmpChar = Character.characters[minChar];
        VPasses[tmpChar.ID].tiles.push(
          {
            ij: [i, j],
            camxy: [camera_offset.x,camera_offset.y],
            x1: 0,
            y1: 0,
            x2: 1,
            y2: 1
          }
        );
      }
      else if(minChar === -1) {
        VPasses[-1].tiles.push(
          {
            ij: [i, j],
            camxy: [camera_offset.x,camera_offset.y],
            x1: 0,
            y1: 0,
            x2: 1,
            y2: 1
          }
        );
      }
      else {
        // VPasses[-1].tiles.push(
        //   {
        //     ij: [i, j],
        //     camxy: [camera_offset.x,camera_offset.y],
        //     x1: 0,
        //     y1: 0,
        //     x2: 1,
        //     y2: 1
        //   }
        // );
      }
    }
  }
  //player.draw(world_offset, camera_offset);

  function compareFn(a, b) {
    if (a.yValue < b.yValue) {
      return -1;
    } else if (a.yValue > b.yValue) {
      return 1;
    }
    // a must be equal to b
    return 0;
  }
  let tmpArr = [];
  for(let key in VPasses){
    VPasses[key].farValue = [Infinity, Infinity];
    if(VPasses[key].character !== -1){
      VPasses[key].farValue = Character.characters[VPasses[key].character].farValue;
      VPasses[key].yValue = Character.characters[VPasses[key].character].farValue[0] + Character.characters[VPasses[key].character].farValue[1];
    }
    tmpArr.push(VPasses[key]);

  }
  tmpArr.sort(compareFn);

  for(let i = 0; i < tmpArr.length; i++){
    for(let index = 0; index < tmpArr[i].tiles.length; index++){
      let tmp = tmpArr[i].tiles[index];
      // if(Character.characters[tmp.charactor]){
      //   Character.characters[tmp.charactor].draw(world_offset, camera_offset);
      // }
      drawTile(
        tmp.ij,
        tmp.camxy
        , tmp.x1, tmp.y1, tmp.x2, tmp.y2, tmpArr[i].character + ", " + (tmpArr[i].farValue[0] + tmpArr[i].farValue[1])); // even rows are offset horizontally
      //if(tmp.)
      //player.draw(world_offset, camera_offset);
    }
    if(tmpArr[i].character !== -1){
      Character.characters[tmpArr[i].character].draw(world_offset, camera_offset);
    }
  }
  // player.draw(world_offset, camera_offset);
  if(mouseIsPressed){
    console.log(tmpArr);
  }
  
  // for (let y = y0; y < y1; y++) {
  //   for (let x = x0; x < x1; x++) {
  //     let [i, j] = tileRenderingOrder([
  //       x + world_offset.x,
  //       y - world_offset.y
  //     ]);
  //     if(i - 1 + 0.5 - 1/32 > player.x + player.width/2 || j - 1 + 0.5 - 1/32 > player.y + player.height/2){
  //     drawTile(
  //       [i, j],
  //       [camera_offset.x,camera_offset.y], 
  //       round(x), round(y), round(centerx), round(centery)); // odd row
  //     }
  //   }
  //   for (let x = x0; x < x1; x++) {
  //     let [i, j] = tileRenderingOrder([
  //       x + 0.5 + world_offset.x,
  //       y + 0.5 - world_offset.y
  //     ]);
  //     if(i - 1 + 0.5 - 1/32 > player.x + player.width/2 || j - 1 + 0.5 - 1/32 > player.y + player.height/2){
  //     drawTile(
  //       [i, j],
  //       [camera_offset.x, camera_offset.y]
  //       , 0, 0, 1, 1); // even rows are offset horizontally
  //     }
  //   }
  // }
  
  // if(i - 1 + 0.5 - 1/32 > player.x + player.width/2 && j - 1 + 0.5 - 1/32 > player.y + player.height/2){
  //   simpleIsoTile(20, /*overworld.GetHeight(i, j)*100*/-ShiftY + 500, tw/3, th/3, color(255, 0, 0), color(255, 0, 0), color(255, 0, 0));
  // }
  describeMouseTile(world_pos, [camera_offset.x, camera_offset.y]);

  if (window.p3_drawAfter) {
    window.p3_drawAfter();
  }
}

// Display a discription of the tile at world_x, world_y.
function describeMouseTile([world_x, world_y], [camera_x, camera_y]) {
  let [screen_x, screen_y] = worldToScreen(
    [world_x, world_y],
    [camera_x, camera_y]
  );
  drawTileDescription([world_x, world_y], [0 - screen_x, screen_y]);
}

function drawTileDescription([world_x, world_y], [screen_x, screen_y]) {
  push();
  translate(screen_x, screen_y);
  if (window.p3_drawSelectedTile) {
    window.p3_drawSelectedTile(world_x, world_y, screen_x, screen_y);
  }
  pop();
}

// Draw a tile, mostly by calling the user's drawing code.
function drawTile([world_x, world_y], [camera_x, camera_y], x1, y1, x2, y2, c) {
  let [screen_x, screen_y] = worldToScreen(
    [world_x, world_y],
    [camera_x, camera_y]
  );
  push();
  translate(0 - screen_x, screen_y);
  if (window.p3_drawTile) {
    window.p3_drawTile(world_x, world_y, x1, y1, x2, y2, screen_x, screen_y);
  }
  fill(0);
  textAlign(CENTER, CENTER);
  //text(c, 0, 0);
  pop();
}
