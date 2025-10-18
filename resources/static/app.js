const grid=document.getElementById('beat-grid');
const rows=4,cols=8;
let pattern=Array(rows).fill().map(()=>Array(cols).fill(false));
for(let r=0;r<rows;r++){
  const row=document.createElement('div'); row.className='row';
  for(let c=0;c<cols;c++){
    const cell=document.createElement('div'); cell.className='cell';
    cell.dataset.r=r; cell.dataset.c=c;
    cell.addEventListener('click',()=>{pattern[r][c]=!pattern[r][c];cell.classList.toggle('active');sendBeat();});
    row.appendChild(cell);
  }
  grid.appendChild(row);
}
const socket=new SockJS('/ws');
const stompClient=Stomp.over(socket);
stompClient.connect({},frame=>{stompClient.subscribe('/topic/beats',msg=>{const data=JSON.parse(msg.body);console.log('Beat received:',data);});});
function sendBeat(){stompClient.send("/app/beat",{},JSON.stringify({pattern:JSON.stringify(pattern)}));}
document.getElementById('play').addEventListener('click',()=>{const context=new (window.AudioContext||window.webkitAudioContext)();const now=context.currentTime;const osc=context.createOscillator();osc.type='square';osc.frequency.setValueAtTime(440,now);osc.connect(context.destination);osc.start(now);osc.stop(now+0.1);});
