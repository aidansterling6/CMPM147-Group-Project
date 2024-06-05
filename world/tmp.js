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
          //simpleIsoTile(20, /*underworld.GetHeight(i, j)*100*/-ShiftY + 500, tw/3, th/3, color(255, 0, 0), color(255, 0, 0), color(255, 0, 0));
          Entity.underworldEntities[index].InWorld = true;
          let tmpHeight = underworld.GetHeight(i, j);
          if(tmpHeight > Entity.underworldEntities[index].baseHeight){
            Entity.underworldEntities[index].baseHeight = tmpHeight;
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
          //simpleIsoTile(20, /*underworld.GetHeight(i, j)*100*/-ShiftY + 500, tw/3, th/3, color(255, 0, 0), color(255, 0, 0), color(255, 0, 0));
          Entity.underworldEntities[index].InWorld = true;
          let tmpHeight = underworld.GetHeight(i, j);
          if(tmpHeight > Entity.underworldEntities[index].baseHeight){
            Entity.underworldEntities[index].baseHeight = tmpHeight;
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
                minij = Entity.underworldEntities[index].farValue;
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
              minij = Entity.underworldEntities[index].farValue;
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
          drawTile(
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
          drawTile(
            tmpTile.ij,
            tmpTile.camxy
            , tmpTile.x1, tmpTile.y1, tmpTile.x2, tmpTile.y2, color(0, 0, 0, 0));
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
  if(mouseIsPressed){
    console.log(tmpArr);
    for(let o = 0; o < tmpArr.length; o++){
      console.log(true && tmpArr[o].lastTile);
    }
  }
}