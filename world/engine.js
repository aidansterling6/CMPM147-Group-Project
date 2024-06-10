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
let speed = 15;
//let speed = 5000;

let ImageStash;
let OverworldCrabCount = 0;
let UnderworldCrabCount = 0;

let caveLevel = -100;
let entityHandlers = {};

/////////////////////////////
// Transforms between coordinate systems
// These are actually slightly weirder than in full 3d...
/////////////////////////////
function worldToScreen([world_x, world_y], [camera_x, camera_y]) {
  let i = (world_x - world_y) * tile_width_step_main;
  let j = (world_x + world_y) * tile_height_step_main;
  return [i + camera_x, j + camera_y];
}

function cameraToEntity(entity, amount){
  ////console.log(entity.baseHeight);
  let tmp = worldToScreen([entity.x, entity.y], [0, 0]);
  let tmpBase;
  let tmpShift;
    if(entity.world === 0){
      tmpBase = entity.drawHeight;
      tmpShift = ShiftY - 500;
    }
    if(entity.world === 1){
      tmpBase = entity.drawHeight;
      tmpShift = ShiftY;
    }
  let targetX = -tmp[0] - width/2;
  let targetY = -tmp[1] + height/2 + tmpBase-tmpShift;
  ////console.log(camera_offset.y);
  camera_offset.x = camera_offset.x*(1-amount) + targetX*amount;
  camera_offset.y = camera_offset.y*(1-amount) + targetY*amount;
}

function cameraToEntityUsing(entity, amount, level){
  ////console.log(entity.baseHeight);
  let tmp = worldToScreen([entity.x, entity.y], [0, 0]);
  let tmpBase;
  let tmpShift;
  let tmpShiftY;
  if(level === 0){
    tmpShiftY = caveLevel;
  }
  if(level === 1){
    tmpShiftY = 500;
  }


    if(entity.world === 0){
      tmpBase = entity.drawHeight;
      tmpShift = tmpShiftY - 500;
    }
    if(entity.world === 1){
      tmpBase = entity.drawHeight;
      tmpShift = tmpShiftY;
    }

  let targetX = -tmp[0] - width/2;
  let targetY = -tmp[1] + height/2 + tmpBase-tmpShift;
  ////console.log(camera_offset.y);
  camera_offset.x = camera_offset.x*(1-amount) + targetX*amount;
  camera_offset.y = camera_offset.y*(1-amount) + targetY*amount;
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

class Animal{
    static currentID = 0;
    static Animals = [];
    constructor(type, x, y, level){
        //console.log("animal");
        this.type = type;
        this.level = level;
        this.x = x;
        this.y = y;
        this.tx = x;
        this.ty = y;
        this.time = 0;
        this.ID = Animal.currentID;
        Animal.currentID++;
        this.HandlerID = "" + this.type + ", " + this.ID;
        entityHandlers[this.HandlerID] = 5;
        let tmpSize = 20;
        this.entity = new Entity(this.x, this.y, 1/3, 1/3, 10, level, color(255, 0, 255), type, {img: ImageStash.crab, x:-tmpSize*0.5, y:-tmpSize, w:tmpSize, h:tmpSize}, this.HandlerID);
        Animal.Animals.push(this);
    }
    static Count(camera_offset){

      for(let key in Animal.Animals){
        let animal = Animal.Animals[key];
        let [screen_x, screen_y] = animal.entity.getScreenPosition(animal.entity.farValue, camera_offset);
        //console.log(screen_y);
        if(animal.level === 0){
          if(screen_x < 0 + 16*3 &&  screen_x > -800 - 16*3 && screen_y < 400 + 16*3 && screen_y > 0 - 16*3){
            if(animal.type === "crab"){
              OverworldCrabCount++;
            }
        }
        }
  
          if(animal.level === 1){
            console.log(screen_y);
            if(screen_x < 0 + 16*3 &&  screen_x > -800 - 16*3 && screen_y < 400 + 16*3 + 100 && screen_y > 0 - 16*3 + 100){
              if(animal.type === "crab"){
                UnderworldCrabCount++;
              }
            }
          }
  
      }
  
  
    }
    static update(){
        for(let i in Animal.Animals){
            let animal = Animal.Animals[i];
            if(animal.type === "crab"){
              if(animal.level === 0){
                  if(animal.time <= 0){
                    let tmpDist = dist(animal.x, animal.y, animal.tx, animal.ty);
                    if(tmpDist > 0.8){
                      animal.time = 30;
                      animal.x -= ((animal.x - animal.tx)/tmpDist)*0.1;
                      animal.y -= ((animal.y - animal.ty)/tmpDist)*0.1;
                      continue;
                    }
                    let flag = false;
                    for(let d = 3; d < 15; d += 2){
                      for(let i = 0; i < 5; i++){
                          animal.tx = round(animal.x + (Math.random() - 0.5)*d) + (Math.random()-0.5)*0.8;
                          animal.ty = round(animal.y + (Math.random() - 0.5)*d) + (Math.random()-0.5)*0.8;
                          if(overworld.GetHeight(round(animal.tx), round(animal.ty)) > 0.5){
                              animal.time = 30;
                              flag = true;
                              break;
                          }
                      }
                      if(flag){
                        break;
                      }
                    }
                  }
                  else{
                  animal.time--;
                  let tmpDist = dist(animal.x, animal.y, animal.tx, animal.ty);
                  if(tmpDist !== 0 && tmpDist > 0.12){
                      animal.x -= ((animal.x - animal.tx)/tmpDist)*0.1;
                      animal.y -= ((animal.y - animal.ty)/tmpDist)*0.1;
                  }
              }
            }
            if(animal.level === 1){
              if(animal.time <= 0){
                let tmpDist = dist(animal.x, animal.y, animal.tx, animal.ty);
                if(tmpDist > 0.8){
                  animal.time = 30;
                  animal.x -= ((animal.x - animal.tx)/tmpDist)*0.1;
                  animal.y -= ((animal.y - animal.ty)/tmpDist)*0.1;
                  continue;
                }
                let flag = false;
                let jumps = 5;
                for(let d = 3; d < 15; d += 2){
                  for(let i = 0; i < 5; i++){
                      animal.tx = round(animal.x + (Math.random() - 0.5)*d) + (Math.random()-0.5)*0.8;
                      animal.ty = round(animal.y + (Math.random() - 0.5)*d) + (Math.random()-0.5)*0.8;
                      let height = underworld.GetHeight(round(animal.tx), round(animal.ty));
                      let ore = XXH.h32("tile:" + [round(animal.tx), round(animal.ty)], worldSeed) % 4 == 0 && height == 0.1;
                      if(ore){
                        animal.time = 30;
                          flag = true;
                          break;
                      }
                     else {
                          if(jumps > 0){
                            jumps--;
                          }
                          else{
                          animal.time = 30;
                          flag = true;
                          break;
                          }
                      }
                  }
                  if(flag){
                    break;
                  }
                }
              }
              else{
              animal.time--;
              let tmpDist = dist(animal.x, animal.y, animal.tx, animal.ty);
              if(tmpDist !== 0 && tmpDist > 0.12){
                  animal.x -= ((animal.x - animal.tx)/tmpDist)*0.1;
                  animal.y -= ((animal.y - animal.ty)/tmpDist)*0.1;
              }
          }
        }


            if(animal.entity){
                animal.entity.x = animal.x;
                animal.entity.y = animal.y;
            }
            //console.log("test");
          }
        }
    }
}


//Class for drawing off-grid objects
class Entity{
  static overworldEntities = [];
  static underworldEntities = [];
  static entities = [];
  static CurrentID = 0;
  constructor(x, y, width, height, tileHeight, world, Color, type, image, HandlerID){
      this.ID = Entity.CurrentID;
      Entity.CurrentID++;
      this.HandlerID = HandlerID;
      this.type = type;
      this.image = image;
      this.x = x;
      this.y = y;
      this.farValue = [Infinity, Infinity];
      this.yValue = Infinity;
      this.width = width;
      this.height = height;
      this.baseHeight = 0.1;
      this.drawHeight = 0;
      this.InWorld = false;
      this.world = world;
      this.color = Color;
      this.tileHeight = tileHeight;
      if(world === 0){
        Entity.overworldEntities.push(this);
      }
      if(world === 1){
        Entity.underworldEntities.push(this);
      }
  }

  getScreenPosition(world_offset, camera_offset){
    let [world_x, world_y] = [this.x, this.y];
    let [camera_x, camera_y] = [camera_offset.x, camera_offset.y];
    let [screen_x, screen_y] = worldToScreen(
        [world_x, world_y],
        [camera_x, camera_y]
    );
    return [screen_x, screen_y];
  }
  draw(world_offset, camera_offset){
      let [screen_x, screen_y] = this.getScreenPosition(world_offset, camera_offset);
      push();
          translate(0 - screen_x, screen_y);
          noStroke();
          if(this.world === 0){
          let tmpBase = this.drawHeight;
          let tmpShift = ShiftY - 500;
          if(screen_y < 400 + 16*8){
            if(this.type === "crab"){
              console.log(this.type);
              //OverworldCrabCount++;
            }
          if(this.image){
            image(this.image.img, this.image.x, this.image.y - tmpBase + tmpShift, this.image.w, this.image.h);
          }
          else{
            simpleIsoTile(this.tileHeight, tmpBase-tmpShift, tw*this.width, th*this.height, this.color, color(red(this.color) * 0.8, green(this.color) * 0.8, blue(this.color) * 0.8), color(red(this.color) * 0.9, green(this.color) * 0.9, blue(this.color) * 0.9));
          }
        }
        }

          if(this.world === 1){
            let tmpBase = this.drawHeight;
            let tmpShift = ShiftY;
            if(screen_y < 400 + 16*8){
              // console.log(this.type);
              if(this.type === "crab"){
                //UnderworldCrabCount++;
              }
            if(this.image){
              image(this.image.img, this.image.x, this.image.y - tmpBase + tmpShift, this.image.w, this.image.h);
            }
            else{
              simpleIsoTile(this.tileHeight, tmpBase-tmpShift, tw*this.width, th*this.height, this.color, color(red(this.color) * 0.8, green(this.color) * 0.8, blue(this.color) * 0.8), color(red(this.color) * 0.9, green(this.color) * 0.9, blue(this.color) * 0.9));
            }
          }
          }
          pop();
  }
}

let player1;
let player2;

// Audio Globals
let crabRave, crabRaveCave, overworld_ambience, underworld_ambience, osc, bird_sfx, bones_sfx;
let cave_reverb;

function preload() {
  if (window.p3_preload) {
    window.p3_preload();
  }

  ImageStash = {
    crab: loadImage("./images/crab.png")
  };

  // Audio preloads
  soundFormats('wav', 'mp3');
  crabRave = loadSound('../audio-assets/crab.mp3');
  crabRaveCave = loadSound('../audio-assets/crabCave.mp3');
  overworld_ambience = loadSound('../audio-assets/559095__vital_sounds__high-wind-1.wav');
  underworld_ambience = loadSound('../audio-assets/478812__ianstargem__ambience-4 (1).wav');
  bird_sfx = loadSound('../audio-assets/361470__jofae__crow-caw.mp3');
  bones_sfx = loadSound('../audio-assets/202102__spookymodem__rattling-bones.wav');
  osc = new p5.Oscillator('sine');
}
function removeCircular(obj) {
    if(obj){
    const seen = new Map();
  
    const recurse = obj => {
      seen.set(obj, true);
  
      Object.entries(obj).forEach(([k, v]) => {
        if (typeof v !== 'object') return;
        if (seen.has(v)) delete obj[k];
        else recurse(v);
      });
    };
  
    recurse(obj);
}
  }
function setup() {
  let canvas = createCanvas(800, 400);
  canvas.parent("container");

  angleMode(DEGREES);
  console.log("setup");

  player1 = new Entity(0, 0, 1/3, 1/3, 20, 0, color(255, 0, 0), "player", false);
  player2 = new Entity(0, 0, 1/3, 1/3, 20, 1, color(0, 0, 255), "player", null);

  //player3 = new Entity(0, 0, 1/3, 1/3, 20, 1, color(255, 0, 0));
  //player4 = new Entity(0, 0, 1/3, 1/3, 20, 1, color(0, 0, 255));

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


  rebuildWorld(input.value());

  //overworld.GenerateTileImages();
  //underworld.GenerateTileImages();
  GenerateOverworldTileImages();
  GenerateUnderworldTileImages();

//   // Audio Setup
  cave_reverb = new p5.Reverb();
  cave_reverb.process(bones_sfx);

  osc.freq(0.05);
  osc.start();
  osc.disconnect();

  crabRave.play();
  crabRave.setLoop(true);
  crabRave.setVolume(0);

  crabRaveCave.play();
  crabRaveCave.setLoop(true);
  crabRaveCave.setVolume(0);

  overworld_ambience.play();
  overworld_ambience.setLoop(true);
  overworld_ambience.setVolume(0);


  underworld_ambience.play();
  underworld_ambience.setLoop(true);
  underworld_ambience.setVolume(0);
}

function rebuildWorld(key) {
  if (window.p3_worldKeyChanged) {
    window.p3_worldKeyChanged(key);
  }
  tile_width_step_main = window.p3_tileWidth ? window.p3_tileWidth() : 32;
  tile_height_step_main = window.p3_tileHeight ? window.p3_tileHeight() : 14.5;
  tile_columns = Math.ceil(width / (tile_width_step_main * 2));
  tile_rows = Math.ceil(height / (tile_height_step_main * 2) + 10);
}

function mouseClicked() {
//   overworld_ambience.play();
//   overworld_ambience.setLoop(true);
//   underworld_ambience.play();
//   underworld_ambience.setLoop(true);
  let world_pos = screenToWorld(
    [0 - mouseX, mouseY],
    [camera_offset.x, camera_offset.y]
  );
  

  if (window.p3_tileClicked) {
    if(ShiftY === caveLevel){
      let tmpPos = screenToWorld(
        [0 - mouseX, mouseY + 120],
        [camera_offset.x, camera_offset.y]
      );
      window.p3_tileClicked(tmpPos[0], tmpPos[1]);
    }
    else{
      window.p3_tileClicked(world_pos[0], world_pos[1]);
    }
  }
  return false;
}
function cleanUpVPasses(VPasses) {
    for (let key in VPasses) {
      if (VPasses.hasOwnProperty(key)) {
        VPasses[key].tiles = null;
        VPasses[key].lastTile = null;
        VPasses[key].entities = null;
      }
    }
  }
  function stackSort(a, b) {
    let chara = Entity.overworldEntities[a.entity];
    let charb = Entity.overworldEntities[b.entity];
    if (chara.baseHeight < charb.baseHeight) {
      return -1;
    } else if (chara.baseHeight > charb.baseHeight) {
      return 1;
    }
    // a must be equal to b
    return 0;
  }
  function entitySort(a, b) {
    let chara = Entity.overworldEntities[a];
    let charb = Entity.overworldEntities[b];
    if (chara.x + chara.y < charb.x + charb.y) {
      return -1;
    } else if (chara.x + chara.y > charb.x + charb.y) {
      return 1;
    }
    // a must be equal to b
    return 0;
  }
  function compareFn(a, b) {
    if (a.yValue < b.yValue) {
      return -1;
    } else if (a.yValue > b.yValue) {
      return 1;
    }
    // a must be equal to b
    return 0;
  }
function drawOverworld(world_offset, x0, y0, x1, y1, centerx, centery){


  let PalmSize = 100;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      let [i, j] = tileRenderingOrder([
        x + world_offset.x,
        y - world_offset.y
      ]);
      if(!entityHandlers[i + ", " + j]){
        let rand = XXH.h32("tile: " + i + ", " + j, worldSeed) % 100;
        let randx = ((XXH.h32("tile: " + i + ", " + j, worldSeed) % 200)*0.01 - 1)*0.45;
        let randy = ((XXH.h32("tile: " + i + ", " + j, worldSeed) % 200)*0.01 - 1)*0.45;
        let tmpHeight = overworld.GetHeight(i, j);
        let base = noise(i/7 - 4836, j/7 + 324637)*0.75 +  noise(i/7 - 3468543, j/7 - 35346)*0.25;
        if(rand > 90 && tmpHeight > 0.5 && base > 0.4){
          let img = overworldImageStash.PalmTrees[floor(rand%overworldImageStash.PalmTrees.length)];
          entityHandlers[i + ", " + j] = 5;
          let tmp = new Entity(i + randx, j + randy, 1/6, 1/6, 50, 0, color(0, 0, 255), "dynamic", {img: img, x: -PalmSize/2, y: -PalmSize, w:PalmSize, h:PalmSize}, i + ", " + j);

        }
      }
      else{
        entityHandlers[i + ", " + j] = 5;
      }
    }
    for (let x = x0; x < x1; x++) {
      let [i, j] = tileRenderingOrder([
        x + 0.5 + world_offset.x,
        y + 0.5 - world_offset.y
      ]);
      if(!entityHandlers[i + ", " + j]){
        let rand = XXH.h32("tile: " + i + ", " + j, worldSeed) % 100;
        let randx = ((XXH.h32("tile: " + i + ", " + j, worldSeed) % 200)*0.01 - 1)*0.45;
        let randy = ((XXH.h32("tile: " + i + ", " + j, worldSeed) % 200)*0.01 - 1)*0.45;
        let tmpHeight = overworld.GetHeight(i, j);
        let base = noise(i/7 - 4836, j/7 + 324637)*0.75 +  noise(i/7 - 3468543, j/7 - 35346)*0.25;
        if(rand > 90 && tmpHeight > 0.5 && base > 0.4){
          let img = overworldImageStash.PalmTrees[floor(rand%overworldImageStash.PalmTrees.length)];
          entityHandlers[i + ", " + j] = 5;
          let tmp = new Entity(i + randx, j + randy, 1/6, 1/6, 50, 0, color(0, 0, 255), "dynamic", {img: img, x: -PalmSize/2, y: -PalmSize, w:PalmSize, h:PalmSize}, i + ", " + j);
        }
      }
      else{
        entityHandlers[i + ", " + j] = 5;
      }
    }
  }



  let VPasses = {};
  VPasses[-1] = {
    yValue: Infinity,
    tiles: [],
    lastTile: null,
    entity: -1,
    entities: null
  };

  for(let i = 0; i < Entity.overworldEntities.length; i++){
    let tmpChar = Entity.overworldEntities[i];
    let tmpHeight = tmpChar.getScreenPosition(world_offset, camera_offset);
    tmpChar.InWorld = false;
    tmpChar.baseHeight = -Infinity;
    tmpChar.yValue = -Infinity;
    tmpChar.farValue = [-Infinity, -Infinity];
    if(!VPasses[tmpChar.ID]){
      VPasses[tmpChar.ID] = {
        yValue: -Infinity,
        tiles: [],
        lastTile: null,
        entity: i,
        entities: [i]
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
      for(let index = 0; index < Entity.overworldEntities.length; index++){
        if(i - 1 + 0.5 - 1/32 <= Entity.overworldEntities[index].x + Entity.overworldEntities[index].width/2 && j - 1 + 0.5 - 1/32 <= Entity.overworldEntities[index].y + Entity.overworldEntities[index].height/2 && i + 0.5 - 1/32 >= Entity.overworldEntities[index].x - Entity.overworldEntities[index].width/2 && j + 0.5 - 1/32 >= Entity.overworldEntities[index].y - Entity.overworldEntities[index].height/2){
          //simpleIsoTile(20, /*overworld.GetHeight(i, j)*100*/-ShiftY + 500, tw/3, th/3, color(255, 0, 0), color(255, 0, 0), color(255, 0, 0));
          Entity.overworldEntities[index].InWorld = true;
          let tmpHeight = overworld.GetHeight(i, j);
          if(tmpHeight > Entity.overworldEntities[index].baseHeight){
            Entity.overworldEntities[index].baseHeight = tmpHeight;
            Entity.overworldEntities[index].drawHeight = overworld.GetDrawHeight(tmpHeight);
          }
          if(i + j > Entity.overworldEntities[index].farValue[0] + Entity.overworldEntities[index].farValue[1]){
            Entity.overworldEntities[index].farValue = [i, j];
            Entity.overworldEntities[index].yValue = i + j;
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
      for(let index = 0; index < Entity.overworldEntities.length; index++){
        if(i - 1 + 0.5 - 1/32 <= Entity.overworldEntities[index].x + Entity.overworldEntities[index].width/2 && j - 1 + 0.5 - 1/32 <= Entity.overworldEntities[index].y + Entity.overworldEntities[index].height/2 && i + 0.5 - 1/32 >= Entity.overworldEntities[index].x - Entity.overworldEntities[index].width/2 && j + 0.5 - 1/32 >= Entity.overworldEntities[index].y - Entity.overworldEntities[index].height/2){
          //simpleIsoTile(20, /*overworld.GetHeight(i, j)*100*/-ShiftY + 500, tw/3, th/3, color(255, 0, 0), color(255, 0, 0), color(255, 0, 0));
          Entity.overworldEntities[index].InWorld = true;
          let tmpHeight = overworld.GetHeight(i, j);
          if(tmpHeight > Entity.overworldEntities[index].baseHeight){
            Entity.overworldEntities[index].baseHeight = tmpHeight;
            Entity.overworldEntities[index].drawHeight = overworld.GetDrawHeight(tmpHeight);
          }
          if(i + j > Entity.overworldEntities[index].farValue[0] + Entity.overworldEntities[index].farValue[1]){
            Entity.overworldEntities[index].farValue = [i, j];
            Entity.overworldEntities[index].yValue = i + j;
          }
        }
      }
    }
  }

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      let [i, j] = tileRenderingOrder([
        x + world_offset.x,
        y - world_offset.y
      ]);
      let isVPoint = false;
      let miny = Infinity;
      let minij = [Infinity, Infinity];
      let minChar = -1;
        for(let index = 0; index < Entity.overworldEntities.length; index++){
          if(Entity.overworldEntities[index].InWorld){
            if(i - 1 + 0.5 - 1/32 <= Entity.overworldEntities[index].x + Entity.overworldEntities[index].width/2 && j - 1 + 0.5 - 1/32 <= Entity.overworldEntities[index].y + Entity.overworldEntities[index].height/2){
              if(Entity.overworldEntities[index].farValue[0] + Entity.overworldEntities[index].farValue[1] < minij[0] + minij[1]){
                minij = Entity.overworldEntities[index].farValue;
                minChar = index;
              }
              if(Entity.overworldEntities[index].farValue[0] === i && Entity.overworldEntities[index].farValue[1] === j){
                isVPoint = true;
              }
            }
          }
        }
      if(minChar >= 0 && !isVPoint){
        let tmpChar = Entity.overworldEntities[minChar];
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
      else if(!isVPoint) {
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
      else if(minChar >= 0 && isVPoint) {
        let tmpChar = Entity.overworldEntities[minChar];
        VPasses[tmpChar.ID].lastTile = 
          {
            ij: [i, j],
            camxy: [camera_offset.x,camera_offset.y],
            x1: round(x),
            y1: round(y),
            x2: round(centerx),
            y2: round(centery)
          };
      }
    }
    for (let x = x0; x < x1; x++) {
      let [i, j] = tileRenderingOrder([
        x + 0.5 + world_offset.x,
        y + 0.5 - world_offset.y
      ]);
      let isVPoint = false;
      let minij = [Infinity, Infinity];
      let minChar = -1;
      for(let index = 0; index < Entity.overworldEntities.length; index++){
        if(Entity.overworldEntities[index].InWorld){
          if(i - 1 + 0.5 - 1/32 <= Entity.overworldEntities[index].x + Entity.overworldEntities[index].width/2 && j - 1 + 0.5 - 1/32 <= Entity.overworldEntities[index].y + Entity.overworldEntities[index].height/2){
            if(Entity.overworldEntities[index].farValue[0] + Entity.overworldEntities[index].farValue[1] < minij[0] + minij[1]){
              minij = Entity.overworldEntities[index].farValue;
              minChar = index;
            }
            if(Entity.overworldEntities[index].farValue[0] === i && Entity.overworldEntities[index].farValue[1] === j){
              isVPoint = true;
            }
          }
        }
      }
      if(minChar >= 0 && !isVPoint){
        let tmpChar = Entity.overworldEntities[minChar];
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
      else if(!isVPoint) {
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
      else if(minChar >= 0 && isVPoint) {
        let tmpChar = Entity.overworldEntities[minChar];
        VPasses[tmpChar.ID].lastTile = 
          {
            ij: [i, j],
            camxy: [camera_offset.x,camera_offset.y],
            x1: round(x),
            y1: round(y),
            x2: round(centerx),
            y2: round(centery)
          };
      }
    }
  }

  let tmpArr = [];
  for(let key in VPasses){
    VPasses[key].farValue = [Infinity, Infinity];
    if(VPasses[key].entity !== -1){
      VPasses[key].farValue = Entity.overworldEntities[VPasses[key].entity].farValue;
      VPasses[key].yValue = Entity.overworldEntities[VPasses[key].entity].farValue[0] + Entity.overworldEntities[VPasses[key].entity].farValue[1];
    }
    tmpArr.push(VPasses[key]);

  }
  tmpArr.sort(compareFn);
  let stack = [];
  for(let i = 0; i < tmpArr.length; i++){
    stack.push(tmpArr[i]);
    if(i + 1 < tmpArr.length && tmpArr[i].yValue === tmpArr[i + 1].yValue){
      continue;
    }
    else{
      for(let o = 0; o < stack.length; o++){
        let tmp = stack[o];
        for(let index = 0; index < tmp.tiles.length; index++){
          let tmptiles = tmp.tiles[index];
          drawOverworldTile(
            tmptiles.ij,
            tmptiles.camxy
            , tmptiles.x1, tmptiles.y1, tmptiles.x2, tmptiles.y2, color(0, 0, 0, 0)); // even rows are offset horizontally
        }
      }
      for(let o = 0; o < stack.length; o++){
        if(!stack[o].lastTile && stack[o].entity !== -1 && Entity.overworldEntities[stack[o].entity].InWorld){
          for(let p = 0; p < stack.length; p++){
            if(o !== p && stack[p].lastTile && stack[p].lastTile.ij[0] === Entity.overworldEntities[stack[o].entity].farValue[0] && stack[p].lastTile.ij[1] === Entity.overworldEntities[stack[o].entity].farValue[1]){
              stack[p].entities.push(stack[o].entity);
            }
          }
        }
      }

      stack.sort(stackSort);
      for(let o = 0; o < stack.length; o++){
        let tmp = stack[o];
        if(tmp.lastTile){
          let tmpTile = tmp.lastTile;
          drawOverworldTile(
            tmpTile.ij,
            tmpTile.camxy
            , tmpTile.x1, tmpTile.y1, tmpTile.x2, tmpTile.y2, color(0, 0, 0, 0));
          if(tmp.entities){
            tmp.entities.sort(entitySort);
            for(let p = 0; p < tmp.entities.length; p++){
              Entity.overworldEntities[tmp.entities[p]].draw(world_offset, camera_offset);
            }
          }
        }
      }
      stack = [];
    }
  }
  for(let i = tmpArr.length - 1; i >= 0; i--){
    tmpArr.splice(i, 1);
  }
  cleanUpVPasses(VPasses);
  VPasses = null;
  for(let i = stack.length - 1; i >= 0; i--){
    stack.splice(i);
  }
//   for(let key in VPasses){
//     delete VPasses[key];
//   }
//   for(let key in stack){
//     delete stack[key];
//   }
  if(mouseIsPressed){
    //console.log(Entity.overworldEntities.length);
    //console.log(overworld.PalmTrees.length);
    ////console.log(tmpArr);
    for(let o = 0; o < tmpArr.length; o++){
      ////console.log(true && tmpArr[o].lastTile);
    }
  }
  //VPasses = null;
  //tmpArr = null;
  //stack = null;
  removeCircular(VPasses);
  removeCircular(tmpArr);
  removeCircular(stack);
  
  if(VPasses){
    for(let key in VPasses){
    delete VPasses[key];
    }
  }
}
function drawUnderworld(world_offset, x0, y0, x1, y1, centerx, centery){



  let VPasses = {};
  VPasses[-1] = {
    yValue: Infinity,
    tiles: [],
    lastTile: null,
    entity: -1,
    entities: null
  };

  for(let i = 0; i < Entity.underworldEntities.length; i++){
    let tmpChar = Entity.underworldEntities[i];
    let tmpHeight = tmpChar.getScreenPosition(world_offset, camera_offset);
    tmpChar.InWorld = false;
    tmpChar.baseHeight = -Infinity;
    tmpChar.yValue = -Infinity;
    tmpChar.farValue = [-Infinity, -Infinity];
    if(!VPasses[tmpChar.ID]){
      VPasses[tmpChar.ID] = {
        yValue: -Infinity,
        tiles: [],
        lastTile: null,
        entity: i,
        entities: [i]
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
      for(let index = 0; index < Entity.underworldEntities.length; index++){
        if(i - 1 + 0.5 - 1/32 <= Entity.underworldEntities[index].x + Entity.underworldEntities[index].width/2 && j - 1 + 0.5 - 1/32 <= Entity.underworldEntities[index].y + Entity.underworldEntities[index].height/2 && i + 0.5 - 1/32 >= Entity.underworldEntities[index].x - Entity.underworldEntities[index].width/2 && j + 0.5 - 1/32 >= Entity.underworldEntities[index].y - Entity.underworldEntities[index].height/2){
          simpleIsoTile(20, /*underworld.GetHeight(i, j)*100*/-ShiftY + 500, tw/3, th/3, color(255, 0, 0), color(255, 0, 0), color(255, 0, 0));
          Entity.underworldEntities[index].InWorld = true;
          let tmpHeight = underworld.GetHeight(i, j);
          if(tmpHeight > Entity.underworldEntities[index].baseHeight){
            Entity.underworldEntities[index].baseHeight = tmpHeight;
            Entity.underworldEntities[index].drawHeight = underworld.GetDrawHeight(tmpHeight);
          }
          if(i + j > Entity.underworldEntities[index].farValue[0] + Entity.underworldEntities[index].farValue[1]){
            Entity.underworldEntities[index].farValue = [i, j];
            Entity.underworldEntities[index].yValue = i + j;
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
      for(let index = 0; index < Entity.underworldEntities.length; index++){
        if(i - 1 + 0.5 - 1/32 <= Entity.underworldEntities[index].x + Entity.underworldEntities[index].width/2 && j - 1 + 0.5 - 1/32 <= Entity.underworldEntities[index].y + Entity.underworldEntities[index].height/2 && i + 0.5 - 1/32 >= Entity.underworldEntities[index].x - Entity.underworldEntities[index].width/2 && j + 0.5 - 1/32 >= Entity.underworldEntities[index].y - Entity.underworldEntities[index].height/2){
          simpleIsoTile(20, /*underworld.GetHeight(i, j)*100*/-ShiftY + 500, tw/3, th/3, color(255, 0, 0), color(255, 0, 0), color(255, 0, 0));
          Entity.underworldEntities[index].InWorld = true;
          let tmpHeight = underworld.GetHeight(i, j);
          if(tmpHeight > Entity.underworldEntities[index].baseHeight){
            Entity.underworldEntities[index].baseHeight = tmpHeight;
            Entity.underworldEntities[index].drawHeight = underworld.GetDrawHeight(tmpHeight);
          }
          if(i + j > Entity.underworldEntities[index].farValue[0] + Entity.underworldEntities[index].farValue[1]){
            Entity.underworldEntities[index].farValue = [i, j];
            Entity.underworldEntities[index].yValue = i + j;
          }
        }
      }
    }
  }

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      let [i, j] = tileRenderingOrder([
        x + world_offset.x,
        y - world_offset.y
      ]);
      let isVPoint = false;
      let miny = Infinity;
      let minij = [Infinity, Infinity];
      let minChar = -1;
        for(let index = 0; index < Entity.underworldEntities.length; index++){
          if(Entity.underworldEntities[index].InWorld){
            if(i - 1 + 0.5 - 1/32 <= Entity.underworldEntities[index].x + Entity.underworldEntities[index].width/2 && j - 1 + 0.5 - 1/32 <= Entity.underworldEntities[index].y + Entity.underworldEntities[index].height/2){
              if(Entity.underworldEntities[index].farValue[0] + Entity.underworldEntities[index].farValue[1] < minij[0] + minij[1]){
                minij = [Entity.underworldEntities[index].farValue[0], Entity.underworldEntities[index].farValue[1]];
                minChar = index;
              }
              if(Entity.underworldEntities[index].farValue[0] === i && Entity.underworldEntities[index].farValue[1] === j){
                isVPoint = true;
              }
            }
          }
        }
      if(minChar >= 0 && !isVPoint){
        let tmpChar = Entity.underworldEntities[minChar];
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
      else if(!isVPoint) {
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
      else if(minChar >= 0 && isVPoint) {
        let tmpChar = Entity.underworldEntities[minChar];
        VPasses[tmpChar.ID].lastTile = 
          {
            ij: [i, j],
            camxy: [camera_offset.x,camera_offset.y],
            x1: round(x),
            y1: round(y),
            x2: round(centerx),
            y2: round(centery)
          };
      }
    }
    for (let x = x0; x < x1; x++) {
      let [i, j] = tileRenderingOrder([
        x + 0.5 + world_offset.x,
        y + 0.5 - world_offset.y
      ]);
      let isVPoint = false;
      let minij = [Infinity, Infinity];
      let minChar = -1;
      for(let index = 0; index < Entity.underworldEntities.length; index++){
        if(Entity.underworldEntities[index].InWorld){
          if(i - 1 + 0.5 - 1/32 <= Entity.underworldEntities[index].x + Entity.underworldEntities[index].width/2 && j - 1 + 0.5 - 1/32 <= Entity.underworldEntities[index].y + Entity.underworldEntities[index].height/2){
            if(Entity.underworldEntities[index].farValue[0] + Entity.underworldEntities[index].farValue[1] < minij[0] + minij[1]){
              minij = [Entity.underworldEntities[index].farValue[0], Entity.underworldEntities[index].farValue[1]];
              minChar = index;
            }
            if(Entity.underworldEntities[index].farValue[0] === i && Entity.underworldEntities[index].farValue[1] === j){
              isVPoint = true;
            }
          }
        }
      }
      if(minChar >= 0 && !isVPoint){
        let tmpChar = Entity.underworldEntities[minChar];
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
      else if(!isVPoint) {
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
      else if(minChar >= 0 && isVPoint) {
        let tmpChar = Entity.underworldEntities[minChar];
        VPasses[tmpChar.ID].lastTile = 
          {
            ij: [i, j],
            camxy: [camera_offset.x,camera_offset.y],
            x1: round(x),
            y1: round(y),
            x2: round(centerx),
            y2: round(centery)
          };
      }
    }
  }

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
    if(VPasses[key].entity !== -1){
      VPasses[key].farValue = Entity.underworldEntities[VPasses[key].entity].farValue;
      VPasses[key].yValue = Entity.underworldEntities[VPasses[key].entity].farValue[0] + Entity.underworldEntities[VPasses[key].entity].farValue[1];
    }
    tmpArr.push(VPasses[key]);

  }
  tmpArr.sort(compareFn);
  let stack = [];
  for(let i = 0; i < tmpArr.length; i++){
    stack.push(tmpArr[i]);
    if(i + 1 < tmpArr.length && tmpArr[i].yValue === tmpArr[i + 1].yValue){
      continue;
    }
    else{
      for(let o = 0; o < stack.length; o++){
        let tmp = stack[o];
        for(let index = 0; index < tmp.tiles.length; index++){
          let tmptiles = tmp.tiles[index];
          drawUnderworldTile(
            tmptiles.ij,
            tmptiles.camxy
            , tmptiles.x1, tmptiles.y1, tmptiles.x2, tmptiles.y2, color(0, 0, 0, 0)); // even rows are offset horizontally
        }
      }
      for(let o = 0; o < stack.length; o++){
        if(!stack[o].lastTile && stack[o].entity !== -1 && Entity.underworldEntities[stack[o].entity].InWorld){
          for(let p = 0; p < stack.length; p++){
            if(o !== p && stack[p].lastTile && stack[p].lastTile.ij[0] === Entity.underworldEntities[stack[o].entity].farValue[0] && stack[p].lastTile.ij[1] === Entity.underworldEntities[stack[o].entity].farValue[1]){
              stack[p].entities.push(stack[o].entity);
            }
          }
        }
      }
      function stackSort(a, b) {
        let chara = Entity.underworldEntities[a.entity];
        let charb = Entity.underworldEntities[b.entity];
        if (chara.baseHeight < charb.baseHeight) {
          return -1;
        } else if (chara.baseHeight > charb.baseHeight) {
          return 1;
        }
        // a must be equal to b
        return 0;
      }
      function entitySort(a, b) {
        let chara = Entity.underworldEntities[a];
        let charb = Entity.underworldEntities[b];
        if (chara.x + chara.y < charb.x + charb.y) {
          return -1;
        } else if (chara.x + chara.y > charb.x + charb.y) {
          return 1;
        }
        // a must be equal to b
        return 0;
      }

      stack.sort(stackSort);
      for(let o = 0; o < stack.length; o++){
        let tmp = stack[o];
        if(tmp.lastTile){
          let tmpTile = tmp.lastTile;
          drawUnderworldTile(
            tmpTile.ij,
            tmpTile.camxy
            , tmpTile.x1, tmpTile.y1, tmpTile.x2, tmpTile.y2, color(0, 0, 0, 0), tmpTile.ij[0]);
          if(tmp.entities){
            tmp.entities.sort(entitySort);
            for(let p = 0; p < tmp.entities.length; p++){
              Entity.underworldEntities[tmp.entities[p]].draw(world_offset, camera_offset);
            }
          }
        }
      }
      stack = [];
    }
  }
}
let bjustMoved = true;
let disable = false;
function draw() {
    if(mouseIsPressed){
        disable = true;
    }

    background(255);

    Animal.update();

  let overworld_ambience_volume = map(ShiftY, caveLevel, 500, 0.0, 0.8);
  let underworld_ambience_volume = map(ShiftY, caveLevel, 500, 0.8, 0.0);

  let bird_rate = random(0, 1) * random(0, 1);
  if (bird_rate > 0.85 && !bird_sfx.isPlaying()) {
    //console.log("caw");
    bird_sfx.setVolume(min(overworld_ambience_volume, random(0.3, 0.7)));
    bird_sfx.play();
  }

  let bone_rate = noise(0.07 * frameCount);
  if (bone_rate > 0.75 && !bones_sfx.isPlaying()) {
    //console.log("rattle");
    bones_sfx.setVolume(min(underworld_ambience_volume, random(0.3, 0.7)));
    bones_sfx.play();
  }

  overworld_ambience.setVolume(overworld_ambience_volume);
  crabRave.setVolume(overworld_ambience_volume * (OverworldCrabCount/100));
  console.log(OverworldCrabCount);
  underworld_ambience.setVolume(underworld_ambience_volume);
  crabRaveCave.setVolume(underworld_ambience_volume * 10 * (UnderworldCrabCount/100));


  //let e = new Entity(Math.random(), Math.random(), 1/3, 1/3, 20, 0, color(0, 0, 255), "dynamic");




  let camera_delta = new p5.Vector(0, 0);

  if(keyIsDown(69) && keyTime <= 0){
    if(level === 0){
      level = 1;
    } else {
      level = 0;
    }
    keyTime = 10;
  }
  keyTime--;
  if(ShiftY === 500 || ShiftY === caveLevel){
    // Keyboard controls!
    //  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
    //   player1.x += 0.05;
    //   player1.y -= 0.05;
    //  }
    //  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
    // player1.x -= 0.05;
    //   player1.y += 0.05;
    //  }
    //  if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
    // player1.x += 0.05;
    //   player1.y += 0.05;
    //  }
    //  if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
    //   player1.x -= 0.05;
    //   player1.y -= 0.05;
    // }
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
      player1.x += 0.07;
      player1.y -= 0.07;
     }
     if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
    player1.x -= 0.07;
      player1.y += 0.07;
     }
     if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
    player1.x += 0.07;
      player1.y += 0.07;
     }
     if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
      player1.x -= 0.07;
      player1.y -= 0.07;
    }

    player2.x = player1.x;
    player2.y = player1.y;
    //move camera to player
    if(bjustMoved){
      bjustMoved = false;
      //if(level === 0){
      //  cameraToEntity(player1, 1);
      //} else {
      //   cameraToEntity(player2, 1);
      //}
    }
  }
  if(level === 0){
    cameraToEntityUsing(player1, 0.1, 1);
  } else {
     cameraToEntityUsing(player2, 0.1, 0);
  }
  //camera_velocity.add(camera_delta);
  if(ShiftY === 500 || ShiftY === caveLevel){
  //ecamera_offset.add(camera_velocity);
  }
  camera_velocity.mult(0.95); // cheap easinge
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


  drawUnderworld(world_offset, x0, y0, x1, y1, centerx, centery);
  drawOverworld(world_offset, x0, y0, x1, y1, centerx, centery);

  OverworldCrabCount = 0;
  UnderworldCrabCount = 0;
  Animal.Count(camera_offset);




  for(let key in entityHandlers){
    entityHandlers[key]--;
    if(entityHandlers[key] <= 0){
      delete entityHandlers[key];
    }
  }




  for(let i = 0; i < Entity.overworldEntities.length; i++){
    if(Entity.overworldEntities[i].type === "dynamic" && !entityHandlers[Entity.overworldEntities[i].HandlerID]){
      Entity.overworldEntities.splice(i, 1);
      //console.log("splice");
      i--;
    }
    if(i < 0){
      i = 0;
    }
  }
  for(let i = 0; i < Entity.underworldEntities.length; i++){
    if(Entity.underworldEntities[i].type === "dynamic" && !entityHandlers[Entity.overworldEntities[i].HandlerID]){
      Entity.underworldEntities.splice(i, 1);
      //console.log("splice");
      i--;
    }
    if(i < 0){
      i = 0;
    }



    if(mouseIsPressed){
        // console.log(Entity.underworldEntities.length);
        // console.log(Entity.overworldEntities.length);
        // console.log(overworld.PalmTrees.length);
        // console.log(underworld.BlueOreTiles.length);
        // console.log(overworld.StoneTiles.length);
        //console.log(entityHandlers.keys.length);
    }

  }



  if(ShiftY === caveLevel){
    let tmpPos = screenToWorld(
      [0 - mouseX, mouseY + 120],
      [camera_offset.x, camera_offset.y]
    );
    describeMouseTile(tmpPos, [camera_offset.x, camera_offset.y]);
  }
  else{
    describeMouseTile(world_pos, [camera_offset.x, camera_offset.y]);
  }

  if (window.p3_drawAfter) {
    window.p3_drawAfter();
  }
  //drawPalmTree(300, 300);
}

// Display a discription of the tile at world_x, world_y.
function describeMouseTile([world_x, world_y], [camera_x, camera_y]) {
  if(ShiftY === caveLevel){
    camera_y += 100;
  }
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
    window.p3_drawTile(world_x, world_y, x1, y1, x2, y2, screen_x, screen_y, c);
  }
  pop();
}

function drawOverworldTile([world_x, world_y], [camera_x, camera_y], x1, y1, x2, y2, c, i) {
    if(ShiftY !== 0){
        let [screen_x, screen_y] = worldToScreen(
            [world_x, world_y],
            [camera_x, camera_y]
        );
        push();
        translate(0 - screen_x, screen_y);
        if (window.p3_drawOverworldTile) {
            window.p3_drawOverworldTile(world_x, world_y, x1, y1, x2, y2, screen_x, screen_y, c);
        }
        pop();
    }
}

function drawUnderworldTile([world_x, world_y], [camera_x, camera_y], x1, y1, x2, y2, c, i) {
    if(ShiftY !== 500){
        let [screen_x, screen_y] = worldToScreen(
        [world_x, world_y],
        [camera_x, camera_y]
    );
    push();
    translate(0 - screen_x, screen_y);
    if (window.p3_drawUnderworldTile) {
        window.p3_drawUnderworldTile(world_x, world_y, x1, y1, x2, y2, screen_x, screen_y, c);
    }
    pop();
    }
}