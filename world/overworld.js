class overworld{
    static multiplier = 300;
    static BaseTile = null;
    static GenerateTileImages(){
        overworld.BaseTile = {w:tw*2, h: 50 + 2*th, img: simpleIsoTileImage(50, 0, tw, th, color(0, 0), color(100*0.8), color(100*0.9))};
    }
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
    static drawTile(i, j, WorldHeight){
        //stroke(75);
        if(overworld.BaseTile){
            image(overworld.BaseTile.img, -overworld.BaseTile.w/2, (-WorldHeight + 50) -  overworld.BaseTile.h + th , overworld.BaseTile.w, overworld.BaseTile.h);
        }
        //simpleIsoTile(50, WorldHeight - 50, tw, th, color(0, 0), color(100*0.8), color(100*0.9));


        let height = overworld.GetHeight(i, j);

        let base = (noise(i/7 - 4836, j/7 + 324637)*0.75 +  noise(i/7 - 3468543, j/7 - 35346))*0.25;

        let c1 = color(0);
        let c2 = color(0);
        let c3 = color(0);
        
        if(height > 0.5){
            if(base > 0.4){
                c1 = color(19,109,21);
                c2 = color(19,109,21);
                c3 = color(19,109,21);
            } else{
                c1 = color(150);
                c2 = color(150*0.8);
                c3 = color(150*0.9);
            }
        } else {
            c1 = color(0, 0, 255);
            c2 = color(0, 0, 255);
            c3 = color(0, 0, 255);
        }

        c2 = color(red(c2)*0.8, green(c2)*0.8, blue(c2)*0.8);

        c3 = color(red(c3)*0.8, green(c3)*0.8, blue(c3)*0.8);
        noStroke();
        simpleIsoTile(overworld.GetDrawHeight(height), WorldHeight, tw, th, c1, c2, c3);
        //simpleIsoTile(0, WorldHeight, tw, th, c1, c2, c3);
        //textSize(6);
        //text(height, 0, -height*100);
    }
}