"use strict";

/* global XXH */
/* exported --
    p3_preload
    p3_setup
    p3_worldKeyChanged
    p3_tileWidth
    p3_tileHeight
    p3_tileClicked
    p3_drawBefore
    p3_drawTile
    p3_drawSelectedTile
    p3_drawAfter
*/

function simpleIsoTile(height, baseHeight, c1, c2, c3){
    strokeWeight(1);
    fill(c1);
    stroke(c1);
    //top
    beginShape();
    vertex(-tw, 0 - height - baseHeight);
    vertex(0, th - height - baseHeight);
    vertex(tw, 0 - height - baseHeight);
    vertex(0, -th - height - baseHeight);
    endShape(CLOSE);
    fill(c2);
    stroke(c2);
    //left
    beginShape();
    vertex(-tw, 0 - height - baseHeight);
    vertex(-tw, 0 - baseHeight);
    vertex(0, th - baseHeight);
    vertex(0, th - height - baseHeight);
    endShape(CLOSE);
    fill(c3);
    stroke(c3);
    //right
    beginShape();
    vertex(tw, 0 - height - baseHeight);
    vertex(tw, 0 - baseHeight);
    vertex(0, th - baseHeight);
    vertex(0, th - height - baseHeight);
    endShape(CLOSE);
}

function p3_preload() {}

function p3_setup() {}

let worldSeed;

function p3_worldKeyChanged(key) {
  worldSeed = XXH.h32(key, 0);
  noiseSeed(worldSeed);
  randomSeed(worldSeed);
}

function p3_tileWidth() {
  return 32;
}
function p3_tileHeight() {
  return 16;
}

let [tw, th] = [p3_tileWidth(), p3_tileHeight()];

let clicks = {};

function p3_tileClicked(i, j) {
  let key = [i, j];
  clicks[key] = 1 + (clicks[key] | 0);
}

function p3_drawBefore() {}

function p3_drawTile(i, j) {
  noStroke();

  if (XXH.h32("tile:" + [i, j], worldSeed) % 4 == 0) {
    fill(240, 200);
  } else {
    fill(255, 200);
  }

  push();

  overworld.drawTile(i, j, -mouseY + 500);

  caveworld.drawTile(i, j, -mouseY);

  //beginShape();
  //vertex(-tw, 0);
  //vertex(0, th);
  //vertex(tw, 0);
  //vertex(0, -th);
  //endShape(CLOSE);
    // let height = noise(i/7, j/7);
    // if(height > 0.5){
    //     stroke(0);
    //     fill(240);
    // } else {
    //     height = 0.3;
    //     noStroke();
    //     fill(0, 0, 255);
    // }
    // simpleIsoTile(height*40);

  let n = clicks[[i, j]] | 0;
  if (n % 2 == 1) {
    //fill(0, 0, 0, 32);
    //ellipse(0, 0, 10, 5);
    //translate(0, -10);
    //fill(255, 255, 100, 128);
    //ellipse(0, 0, 10, 10);
  }

  pop();
}

function p3_drawSelectedTile(i, j) {
  noFill();
  stroke(0, 255, 0, 128);

  beginShape();
  vertex(-tw, 0);
  vertex(0, th);
  vertex(tw, 0);
  vertex(0, -th);
  endShape(CLOSE);

  noStroke();
  fill(0);
  text("tile " + [i, j], 0, 0);
}

function p3_drawAfter() {}
