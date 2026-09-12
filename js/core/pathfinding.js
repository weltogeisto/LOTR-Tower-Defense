/* Readable core module — Reiter der Riddermark TD (fan homage) */
function recomputeBlocked(){
  blocked = make2D(false);
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      blocked[r][c] = obstacles[r][c];
    }
  }
  towers.forEach(t => {
    blocked[t.row][t.col] = true;
  });
  // ensure spawn and goal are free
  blocked[spawn.row][spawn.col] = false;
  blocked[goal.row][goal.col] = false;
}

// BFS pathfinding
function findPath(from=spawn,to=goal){
  const Q=[];
  const seen = make2D(false);
  const prev = make2D(null);
  Q.push({row:from.row, col:from.col});
  seen[from.row][from.col] = true;
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  while(Q.length){
    const cur = Q.shift();
    if(cur.row===to.row && cur.col===to.col) break;
    for(const [dr,dc] of dirs){
      const nr=cur.row+dr, nc=cur.col+dc;
      if(nr<0||nr>=ROWS||nc<0||nc>=COLS) continue;
      if(seen[nr][nc] || blocked[nr][nc]) continue;
      seen[nr][nc] = true;
      prev[nr][nc] = cur;
      Q.push({row:nr,col:nc});
    }
  }
  if(!seen[to.row][to.col]) return null;
  const path=[];
  let cur={row:to.row,col:to.col};
  while(!(cur.row===from.row && cur.col===from.col)){
    path.push(cur);
    cur = prev[cur.row][cur.col];
  }
  path.push(from);
  path.reverse();
  return path;
}

// Convert cell to pixel center
function toPix(c,r){ return {x: c*tile + tile/2, y: r*tile + tile/2}; }
