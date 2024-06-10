"use strict";
let Random = function(min, max){
    return Math.random()*(max-min) + min;
  }
let drawPalmLeaf = function(x, y, angle, out){
    let dx = cos(angle-90)*4/1.5;
    let dy = sin(angle-90)*3/1.5;
    out.noStroke();
    let Rand = Random(0, 1000);
    for(let i = 0; i < 30; i++){
        let tmp = Random(-20,0);
        out.fill(0 + tmp,157 + tmp,79 + tmp);
        x += dx;
        y += dy;
        dy += 0.15/1.5;
        let n = noise(Rand + i/7)*2;
        //ellipse(x, y, 30*(1-i/40), 30*(1-i/40));
        out.strokeWeight(3);
        out.stroke(0 + tmp,157 + tmp,79 + tmp);
        for(let t = 0; t < 5; t++){
        let a = Random(-45, 45);
        out.line(x, y, x + (dx + Random(-0.6, 0.6))*15, y + (dy + Random(-0.6, 0.6))*15);
        }
    }
};
let drawPalmTree = function(){
    let x = 300;
    let y = 600;
    let out = createGraphics(600, 600);
    let angle = Random(-2, 2);
    let deltaAngle = -angle * Random(0, 1);
    out.noStroke();
    let s = 10;
    for(let i = 0; i < 40; i++){
        s = 10*(1-i/30) + 20;
        let tmp =  + Random(-20,0);
        out.fill(185 + tmp,157 + tmp,79 + tmp);
        out.ellipse(x, y, s, s*(2/3));
        if(i + 1 < 40){
        x += cos(angle-90)*s/3;
        y += sin(angle-90)*s/3;
        angle += deltaAngle;
        }
    }
    let tmp = Random(-20,0);
    out.fill(0 + tmp,157 + tmp,79 + tmp);
    out.ellipse(x, y, s, s*(2/3));
    for(let i = 0; i < 10; i++){
        drawPalmLeaf(x, y, Random(0,360), out);
    }
    return out;
};


class overworld{
    static multiplier = 300;
    static BaseTile = null;
    static SandTiles = [];
    static StoneTiles = [];
    static WaterTile = null;
    static PalmTrees = [];
    static GetHeight(i, j){
        let base = noise(i/7 + 325567, j/7 + 467353)*0.75  +  noise(i/7 + 543363, j/7 - 35346)*0.25;
        let height = base;
        return height;
    }
    static GetDrawHeight(height){
        if(height < 0.5){
            height = 0.49;
        }
        height -= 0.4;
        return height * overworld.multiplier;
    }
    static GenerateTileImages(){
        overworld.BaseTile = {w:tw*2, h: 50 + 2*th, img: simpleIsoTileImage(50, 0, tw, th, color(0, 0), color(100*0.8), color(100*0.9))};

        for(let i = 0; i < 100; i++){
            overworld.SandTiles.push({w:tw*2, h: i + 2*th, img: simpleIsoTileImage(i, 0, tw, th, color(246,215,176), color(246*0.8,215*0.8,176*0.8), color(246*0.9,215*0.9,176*0.9))});
        }
        for(let i = 0; i < 100; i++){
            overworld.StoneTiles.push({w:tw*2, h: i + 2*th, img: simpleIsoTileImage(i, 0, tw, th, color(150), color(150*0.8), color(150*0.9))});
        }
        overworld.WaterTile = {w:tw*2, h: overworld.GetDrawHeight(0.4) + 2*th, img: simpleIsoTileImage(overworld.GetDrawHeight(0.4), 0, tw, th, color(0, 0, 255), color(0, 0, 255), color(0, 0, 255))};

        for(let i = 0; i < 30; i++){
            overworld.PalmTrees.push(drawPalmTree());
        }
    }
    static drawTile(i, j, WorldHeight){
        //stroke(75);
        if(overworld.BaseTile){
            image(overworld.BaseTile.img, -overworld.BaseTile.w/2, (-WorldHeight + 50) -  overworld.BaseTile.h + th , overworld.BaseTile.w, overworld.BaseTile.h);
        }
        //simpleIsoTile(50, WorldHeight - 50, tw, th, color(0, 0), color(100*0.8), color(100*0.9));


        let height = overworld.GetHeight(i, j);

        let base = noise(i/7 - 4836, j/7 + 324637)*0.75 +  noise(i/7 - 3468543, j/7 - 35346)*0.25;

        let c1 = color(0);
        let c2 = color(0);
        let c3 = color(0);
        let h = round(overworld.GetDrawHeight(height));
        
        if(height > 0.5){
            if(base > 0.4){
                c1 = color(246,215,176);
                c2 = color(246,215,176);
                c3 = color(246,215,176);
                if(round(h) in overworld.SandTiles){
                    let tmpTile = overworld.SandTiles[round(h)];
                    image(tmpTile.img, -tmpTile.w/2, (-WorldHeight) -  tmpTile.h + th , tmpTile.w, tmpTile.h);
                }
            } else{
                c1 = color(150);
                c2 = color(150*0.8);
                c3 = color(150*0.9);
                if(round(h) in overworld.StoneTiles){
                    let tmpTile = overworld.StoneTiles[round(h)];
                    image(tmpTile.img, -tmpTile.w/2, (-WorldHeight) -  tmpTile.h + th , tmpTile.w, tmpTile.h);
                }
            }
        } else {
            c1 = color(0, 0, 255);
            c2 = color(0, 0, 255);
            c3 = color(0, 0, 255);
            if(overworld.WaterTile){
                image(overworld.WaterTile.img, -overworld.WaterTile.w/2, (-WorldHeight) -  overworld.WaterTile.h + th , overworld.WaterTile.w, overworld.WaterTile.h);
            }
        }

        c2 = color(red(c2)*0.8, green(c2)*0.8, blue(c2)*0.8);

        c3 = color(red(c3)*0.9, green(c3)*0.9, blue(c3)*0.9);
        noStroke();
        //simpleIsoTile(overworld.GetDrawHeight(height), WorldHeight, tw, th, c1, c2, c3);
        //simpleIsoTile(0, WorldHeight, tw, th, c1, c2, c3);
        //textSize(6);
        //text(height, 0, -height*100);
    }
}