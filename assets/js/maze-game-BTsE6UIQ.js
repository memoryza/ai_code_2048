import{r,u as I,j as f}from"./vendor-react-BnsUgT_O.js";import"./vendor-deps-z3IJcbrk.js";const o=15,l=20,v=20,X=40,G=()=>{const[y,W]=r.useState({board:[],player:{x:1,y:1},exit:{x:o-2,y:l-2},gameWon:!1}),[E,p]=r.useState(null),m=r.useRef(null),M=r.useRef(null),[C,A]=r.useState(window.innerHeight>window.innerWidth),R=I(),k=r.useCallback(()=>{if(!M.current)return v;const e=M.current,n=window.innerWidth,a=window.innerHeight,i=Math.min(n-40,e.clientWidth-40),s=a-200,t=Math.floor(i/o),u=Math.floor(s/l),x=Math.min(t,u,X);return Math.max(x,v)},[]),[c,j]=r.useState(v),g=r.useCallback(()=>{const e=m.current,n=e==null?void 0:e.getContext("2d");!e||!n||(n.clearRect(0,0,e.width,e.height),y.board.forEach((a,i)=>{a.forEach((s,t)=>{n.fillStyle=s==="wall"?"#333":s==="exit"?"#4CAF50":"#fff",n.fillRect(t*c,i*c,c,c),n.strokeStyle="#666",n.strokeRect(t*c,i*c,c,c)})}),n.fillStyle="#2196F3",n.beginPath(),n.arc(y.player.x*c+c/2,y.player.y*c+c/2,c/3,0,Math.PI*2),n.fill())},[y,c]);r.useEffect(()=>{const e=()=>{A(window.innerHeight>window.innerWidth)};return window.addEventListener("resize",e),()=>window.removeEventListener("resize",e)},[]),r.useEffect(()=>{const e=()=>{const n=k();j(n);const a=m.current;a&&(a.width=o*n,a.height=l*n,requestAnimationFrame(g))};return e(),window.addEventListener("resize",e),()=>window.removeEventListener("resize",e)},[k,g]);const z=(e,n,a)=>{const i=Array(l).fill(0).map(()=>Array(o).fill(!1)),s=[n];for(i[n.y][n.x]=!0;s.length>0;){const t=s.shift();if(t.x===a.x&&t.y===a.y)return!0;const u=[{dx:0,dy:-1},{dx:1,dy:0},{dx:0,dy:1},{dx:-1,dy:0}];for(const x of u){const d=t.x+x.dx,h=t.y+x.dy;d>=0&&d<o&&h>=0&&h<l&&!i[h][d]&&e[h][d]!=="wall"&&(s.push({x:d,y:h}),i[h][d]=!0)}}return!1},L=()=>{let e,n=!1;for(;!n;){e=Array(l).fill(0).map(()=>Array(o).fill("wall"));const a=[],i={x:1,y:1};for(e[i.y][i.x]="path",a.push(i);a.length>0;){const t=a[a.length-1],u=[{x:t.x+2,y:t.y,between:{x:t.x+1,y:t.y}},{x:t.x-2,y:t.y,between:{x:t.x-1,y:t.y}},{x:t.x,y:t.y+2,between:{x:t.x,y:t.y+1}},{x:t.x,y:t.y-2,between:{x:t.x,y:t.y-1}}].filter(x=>x.x>0&&x.x<o-1&&x.y>0&&x.y<l-1&&e[x.y][x.x]==="wall");if(u.length>0){if(u.sort(()=>{const h=Math.random(),P=(1-(Math.abs(o-2-t.x)+Math.abs(l-2-t.y))/(o+l))*.3,D=h*.7;return P+D-.5}),Math.random()<.2&&u.length>1){const h=u[1];e[h.y][h.x]="path",e[h.between.y][h.between.x]="path"}const d=u[0];e[d.y][d.x]="path",e[d.between.y][d.between.x]="path",a.push(d)}else a.pop()}const s={x:o-2,y:l-2};if(e[s.y][s.x]="exit",n=z(e,{x:1,y:1},s),!n){let t={x:s.x-1,y:s.y};for(;t.x>1||t.y>1;)e[t.y][t.x]="path",Math.random()<.5?t.x>1?(t.x--,Math.random()<.3&&t.y>2&&(e[t.y-1][t.x]="path")):t.y>1&&t.y--:t.y>1?(t.y--,Math.random()<.3&&t.x>2&&(e[t.y][t.x-1]="path")):t.x>1&&t.x--;e[1][2]="path",e[2][1]="path",e[s.y-1][s.x]="path",e[s.y][s.x-1]="path",n=z(e,{x:1,y:1},s)}}return e},b=r.useCallback(()=>{const e=L();W({board:e,player:{x:1,y:1},exit:{x:o-2,y:l-2},gameWon:!1})},[]),w=r.useCallback((e,n)=>{W(a=>{const i=a.player.x+e,s=a.player.y+n;if(i<0||i>=o||s<0||s>=l||a.board[s][i]==="wall")return a;const t=i===a.exit.x&&s===a.exit.y;return{...a,player:{x:i,y:s},gameWon:t}})},[]),S=r.useCallback(e=>{if(!y.gameWon)switch(e.key){case"ArrowUp":case"w":case"W":w(0,-1);break;case"ArrowDown":case"s":case"S":w(0,1);break;case"ArrowLeft":case"a":case"A":w(-1,0);break;case"ArrowRight":case"d":case"D":w(1,0);break}},[y.gameWon,w]),T=e=>{if(y.gameWon)return;const n=e.touches[0];p({x:n.clientX,y:n.clientY})},H=e=>{if(!E||y.gameWon)return;const n=e.touches[0],a=n.clientX-E.x,i=n.clientY-E.y,s=30;(Math.abs(a)>s||Math.abs(i)>s)&&(Math.abs(a)>Math.abs(i)?w(a>0?1:-1,0):w(0,i>0?1:-1),p({x:n.clientX,y:n.clientY}))},N=()=>{p(null)};return r.useEffect(()=>{b()},[b]),r.useEffect(()=>(window.addEventListener("keydown",S),()=>window.removeEventListener("keydown",S)),[S]),r.useEffect(()=>{const e=m.current;e&&(e.width=o*c,e.height=l*c,g())},[g]),f.jsxs("div",{className:"maze-container",ref:M,children:[f.jsxs("div",{className:`game-area ${C?"portrait":"landscape"}`,children:[f.jsx("canvas",{ref:m,className:"game-canvas",width:o*c,height:l*c,onTouchStart:T,onTouchMove:H,onTouchEnd:N}),y.gameWon&&f.jsxs("div",{className:"game-won",children:[f.jsx("h2",{children:"恭喜你赢了！"}),f.jsx("button",{onClick:b,children:"再玩一次"})]})]}),f.jsxs("div",{className:"game-controls",children:[f.jsx("button",{onClick:b,children:"重新开始"}),f.jsx("button",{onClick:()=>R("/"),children:"返回首页"})]})]})};export{G as default};
//# sourceMappingURL=maze-game-BTsE6UIQ.js.map
