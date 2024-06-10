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

function simpleIsoTile(
  height,
  baseHeight,
  tw,
  th,
  c1,
  c2,
  c3,
  ore = false,
  ore_color = "green"
) {
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
  if (ore) {
    let s = 0.1; // scaling factor
    let noiseScale = 120; // adjust this value to control the noise granularity
    let numShapes = 5; // number of shapes to draw
    let offsetX2 = 15;
    for (let i = 0; i < numShapes; i++) {
      fill(ore_color);
      let offsetX = noise(i * noiseScale) * tw * 2 - tw; // generate x position using noise
      let offsetY = noise(i * noiseScale + 100) * th * 2 - th; // generate y position using noise

      beginShape();
      vertex(-tw * s + offsetX - offsetX2, 0 + offsetY - height - baseHeight);
      vertex(0 + offsetX - offsetX2, th * s + offsetY - height - baseHeight);
      vertex(tw * s + offsetX - offsetX2, 0 + offsetY - height - baseHeight);
      vertex(0 + offsetX - offsetX2, -th * s + offsetY - height - baseHeight);
      endShape(CLOSE);
    }
  }
}

function simpleIsoTileImage(height, baseHeight, tw, th, c1, c2, c3, ore = false,
  ore_color = "green") {
  let out = createGraphics(tw * 2, height + 2 * th);
  out.translate(tw, th + baseHeight + height);
  out.strokeWeight(1);
  out.fill(c1);
  out.stroke(c1);
  //top
  out.beginShape();
  out.vertex(-tw, 0 - height - baseHeight);
  out.vertex(0, th - height - baseHeight);
  out.vertex(tw, 0 - height - baseHeight);
  out.vertex(0, -th - height - baseHeight);
  out.endShape(CLOSE);
  out.fill(c2);
  out.stroke(c2);
  //left
  out.beginShape();
  out.vertex(-tw, 0 - height - baseHeight);
  out.vertex(-tw, 0 - baseHeight);
  out.vertex(0, th - baseHeight);
  out.vertex(0, th - height - baseHeight);
  out.endShape(CLOSE);
  out.fill(c3);
  out.stroke(c3);
  //right
  out.beginShape();
  out.vertex(tw, 0 - height - baseHeight);
  out.vertex(tw, 0 - baseHeight);
  out.vertex(0, th - baseHeight);
  out.vertex(0, th - height - baseHeight);
  out.endShape(CLOSE);
  if (ore) {
    let s = 0.1; // scaling factor
    let noiseScale = 120; // adjust this value to control the noise granularity
    let numShapes = 5; // number of shapes to draw
    let offsetX2 = 15;
    for (let i = 0; i < numShapes; i++) {
      out.fill(ore_color);
      let offsetX = noise(i * noiseScale) * tw * 2 - tw; // generate x position using noise
      let offsetY = noise(i * noiseScale + 100) * th * 2 - th; // generate y position using noise

      out.beginShape();
      out.vertex(-tw * s + offsetX - offsetX2, 0 + offsetY - height - baseHeight);
      out.vertex(0 + offsetX - offsetX2, th * s + offsetY - height - baseHeight);
      out.vertex(tw * s + offsetX - offsetX2, 0 + offsetY - height - baseHeight);
      out.vertex(0 + offsetX - offsetX2, -th * s + offsetY - height - baseHeight);
      out.endShape(CLOSE);
    }
  }
  return out;
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

function p3_drawOverworldTile(i, j, x1, y1, x2, y2, screen_x, screen_y, c) {
  noStroke();

  if (XXH.h32("tile:" + [i, j], worldSeed) % 4 == 0) {
    fill(240, 200);
  } else {
    fill(255, 200);
  }

  push();

  if (screen_y < 400 + 16 * 8) {
    stroke(c);
    overworld.drawTile(i, j, -ShiftY + 500);
  }

  let n = clicks[[i, j]] | 0;
  if (n % 2 == 1) {
    fill(0, 0, 0, 32);
    ellipse(0, 10, 10, 5);
    translate(0, -10);
    fill(255, 255, 100, 128);
    ellipse(0, -10, 10, 10);
  }

  pop();
}

function p3_drawUnderworldTile(i, j, x1, y1, x2, y2, screen_x, screen_y, c) {
  noStroke();

  if (XXH.h32("tile:" + [i, j], worldSeed) % 4 == 0) {
    fill(240, 200);
  } else {
    fill(255, 200);
  }

  push();

  underworld.drawTile(i, j, -ShiftY);

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
  //text("tile " + [i, j], 0, 0);
  // let s = 0.1; // scaling factor
  // let noiseScale = 120; // adjust this value to control the noise granularity
  // let numShapes = 10; // number of shapes to draw
  // fill("green");
  // let offsetX = 25; // generate x position using noise
  // let offsetY = 0; // generate y position using noise
  // for (let i = 0; i < numShapes; i++) {
  //   let offsetX = noise(i * noiseScale) * tw * 2 - tw; // generate x position using noise
  //   let offsetY = noise(i * noiseScale + 100) * th * 2 - th; // generate y position using noise

  //   beginShape();
  //   vertex(-tw * s + offsetX, 0 + offsetY);
  //   vertex(0 + offsetX, th * s + offsetY);
  //   vertex(tw * s + offsetX, 0 + offsetY);
  //   vertex(0 + offsetX, -th * s + offsetY);
  //   endShape(CLOSE);
  // }

  // beginShape();
  // vertex(-tw * s + offsetX, 0);
  // vertex(0 + offsetX, th * s);
  // vertex(tw * s + offsetX, 0);
  // vertex(0 + offsetX, -th * s);
  // endShape(CLOSE);
}

function p3_drawAfter() {
  //text(keyCode, 200, 200)
  if (level === 0) {
    if (abs(ShiftY - 500) < speed) {
      ShiftY = 500;
    } else if (ShiftY > 500) {
      ShiftY -= speed;
    } else if (ShiftY < 500) {
      ShiftY += speed;
    }
  }
  if (level === 1) {
    if (abs(ShiftY - caveLevel) < speed) {
      ShiftY = caveLevel;
    } else if (ShiftY > caveLevel) {
      ShiftY -= speed;
    } else if (ShiftY < caveLevel) {
      ShiftY += speed;
    }
  }
}
