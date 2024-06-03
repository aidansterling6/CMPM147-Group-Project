class overworld{
    static GetHeight(i, j){
        let base = (noise(i/7 + 325567, j/7 + 467353) +  noise(i/7 + 543363, j/7 - 35346))/2;
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


        let height = overworld.GetHeight(i, j);
        let c1 = color(0);
        let c2 = color(0);
        let c3 = color(0);
        if(height > 0.1){
            c1 = color(246,215,176);
            c2 = color(246*0.8,215*0.8,176*0.8);
            c3 = color(246*0.9,215*0.9,176*0.9);
        } else {
            c1 = color(0, 0, 255);
            c2 = color(0, 0, 255*0.8);
            c3 = color(0, 0, 255*0.9);
        }
        noStroke();
        simpleIsoTile(height*100, WorldHeight, tw, th, c1, c2, c3);
        //simpleIsoTile(0, WorldHeight, tw, th, c1, c2, c3);
        //textSize(6);
        //text(height, 0, -height*100);
    }
}