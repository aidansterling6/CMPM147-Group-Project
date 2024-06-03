class caveworld{
    static GetHeight(i, j){
        let base = (noise(i/7 + 3453, j/7 - 56433) +  noise(i/7 - 353433, j/7 + 76556))/2;
        let height = base;
        if(height > 0.5){
            height -= 0.4;
        } else {
            height = 0.1;
        }
        return height;
    }
    static drawTile(i, j, WorldHeight){
        stroke(75);
        simpleIsoTile(50, WorldHeight - 50, tw, th, color(0, 0), color(100*0.8), color(100*0.9));


        let height = caveworld.GetHeight(i, j);
        let c1 = color(0);
        let c2 = color(0);
        let c3 = color(0);
        if(height > 0.1){
            c1 = color(150);
            c2 = color(150*0.8);
            c3 = color(150*0.9);
        } else {
            c1 = color(150);
            c2 = color(150*0.8);
            c3 = color(150*0.9);
        }
        simpleIsoTile(height*200, WorldHeight, tw, th, c1, c2, c3);
        //textSize(6);
        //text(height, 0, -height*100);
    }
}