"use strict";
class underworld {
  static multiplier = 200;
  //static BaseTile = null;
  static StoneTiles = [];
  static GreenOreTiles = [];
  static RedOreTiles = [];
  static BlueOreTiles = [];
  static GenerateTileImages() {
    for(let i = 0; i < 100; i++){
        underworld.StoneTiles.push({w:tw*2, h: i + 2*th, img: simpleIsoTileImage(i, 0, tw, th, color(150), color(150*0.8), color(150*0.9))});
    }
    for(let i = 0; i < 100; i++){
        underworld.GreenOreTiles.push({w:tw*2, h: i + 2*th, img: simpleIsoTileImage(i, 0, tw, th, color(150), color(150*0.8), color(150*0.9), true, "green")});
    }
    for(let i = 0; i < 100; i++){
        underworld.RedOreTiles.push({w:tw*2, h: i + 2*th, img: simpleIsoTileImage(i, 0, tw, th, color(150), color(150*0.8), color(150*0.9), true, "red")});
    }
    for(let i = 0; i < 100; i++){
        underworld.BlueOreTiles.push({w:tw*2, h: i + 2*th, img: simpleIsoTileImage(i, 0, tw, th, color(150), color(150*0.8), color(150*0.9), true, "blue")});
    }
    //overworld.BaseTile = {w:tw*2, h: 50 + 2*th, img: simpleIsoTileImage(50, 0, tw, th, color(0, 0), color(100*0.8), color(100*0.9))};
  }
  static GetHeight(i, j) {
    let base =
      (noise(i / 7 + 3453, j / 7 - 56433) +
        noise(i / 7 - 353433, j / 7 + 76556)) /
      2;
    let height = base;
    if (height > 0.5) {
      height -= 0.4;
    } else {
      height = 0.1;
    }
    return height;
  }
  static GetDrawHeight(height) {
    return height * underworld.multiplier;
  }
  static drawTile(i, j, WorldHeight) {
    //stroke(75);
    //simpleIsoTile(50, WorldHeight - 50, tw, th, color(0, 0), color(100*0.8), color(100*0.9));

    let height = underworld.GetHeight(i, j);

    let c1 = color(0);
    let c2 = color(0);
    let c3 = color(0);
    if (height > 0.1) {
      c1 = color(150);
      c2 = color(150 * 0.8);
      c3 = color(150 * 0.9);
    } else {
      c1 = color(150);
      c2 = color(150 * 0.8);
      c3 = color(150 * 0.9);
    }
    // console.log(
    //   XXH.h32("tile:" + [i, j], worldSeed) % 4 == 0 &&
    //     XXH.h32("tile:" + [i, j] + 24, worldSeed) % 6 != 0
    // );
    let h = round(underworld.GetDrawHeight(height));
    let ore = XXH.h32("tile:" + [i, j], worldSeed) % 4 == 0 && height == 0.1;
    let ore_color = "green";
    if(ore){
        switch (XXH.h32("tile:" + [i, j] + 24, worldSeed) % 6) {
        case 0:
            ore_color = "green";
            if(round(h) in underworld.GreenOreTiles){
                let tmpTile = underworld.GreenOreTiles[round(h)];
                image(tmpTile.img, -tmpTile.w/2, (-WorldHeight) -  tmpTile.h + th , tmpTile.w, tmpTile.h);
            }
            break;
        case 1:
            ore_color = "red";
            if(round(h) in underworld.RedOreTiles){
                let tmpTile = underworld.RedOreTiles[round(h)];
                image(tmpTile.img, -tmpTile.w/2, (-WorldHeight) -  tmpTile.h + th , tmpTile.w, tmpTile.h);
            }
            break;
        case 2:
            ore_color = "blue";
            if(round(h) in underworld.BlueOreTiles){
                let tmpTile = underworld.BlueOreTiles[round(h)];
                image(tmpTile.img, -tmpTile.w/2, (-WorldHeight) -  tmpTile.h + th , tmpTile.w, tmpTile.h);
            }
            break;
            default:
                if(round(h) in underworld.StoneTiles){
                    let tmpTile = underworld.StoneTiles[round(h)];
                    image(tmpTile.img, -tmpTile.w/2, (-WorldHeight) -  tmpTile.h + th , tmpTile.w, tmpTile.h);
                }
            break;
        }
    }
    else{
        if(round(h) in underworld.StoneTiles){
            let tmpTile = underworld.StoneTiles[round(h)];
            image(tmpTile.img, -tmpTile.w/2, (-WorldHeight) -  tmpTile.h + th , tmpTile.w, tmpTile.h);
        }
    }
    /*simpleIsoTile(
      underworld.GetDrawHeight(height),
      WorldHeight,
      tw,
      th,
      c1,
      c2,
      c3,
      ore,
      ore_color
    );*/
    //textSize(6);
    //text(height, 0, -height*100);
  }
}
