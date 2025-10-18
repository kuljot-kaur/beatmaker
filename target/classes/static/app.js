const grid=document.getElementById('beat-grid');
const rows=4,cols=8;
let pattern=Array.from({length:rows},()=>Array(cols).fill(false));

// cells matrix for quick access
const cells = Array.from({length:rows},()=>Array(cols).fill(null));
for(let r=0;r<rows;r++){
  const row=document.createElement('div'); row.className='row r' + r;
  for(let c=0;c<cols;c++){
    const cell=document.createElement('div'); cell.className='cell';
    cell.dataset.r=r; cell.dataset.c=c;
    cell.addEventListener('click',()=>{ toggleCell(r,c); });
    row.appendChild(cell);
    cells[r][c]=cell;
  }
  grid.appendChild(row);
}

// render column markers
const markersContainer = document.getElementById('column-markers');
const markers = [];
for(let c=0;c<cols;c++){
  const m = document.createElement('div'); m.className='marker';
  markersContainer.appendChild(m);
  markers.push(m);
}

function toggleCell(r,c){
  pattern[r][c]=!pattern[r][c];
  const cell = cells[r][c];
  if(pattern[r][c]) cell.classList.add('active'); else cell.classList.remove('active');
  // play immediate note for that row
  playNoteForRow(r);
  sendBeat();
}

// audio helper
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioContext = null;
function ensureAudio(){ if(!audioContext) audioContext = new AudioCtx(); }

// map rows to frequencies (row 0 = high pitch)
const rowFreq = [880,660,440,330];
function playNoteForRow(r, duration=0.12){
  ensureAudio();
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(rowFreq[r] || 440, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.3, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain); gain.connect(audioContext.destination);
  osc.start(now); osc.stop(now + duration + 0.02);
}

// STOMP connection
const socket=new SockJS('/ws');
const stompClient=Stomp.over(socket);
stompClient.debug = ()=>{}; // silence logs

stompClient.connect({},frame=>{
  stompClient.subscribe('/topic/beats',msg=>{
    try{
      const data=JSON.parse(msg.body);
      let p = data.pattern;
      if(typeof p === 'string') p = JSON.parse(p);
      applyRemotePattern(p);
    }catch(e){ console.warn('Failed to parse beat message', e); }
  });
});

function applyRemotePattern(p){
  if(!Array.isArray(p)) return;
  for(let r=0;r<rows && r<p.length;r++){
    for(let c=0;c<cols && c<p[r].length;c++){
      pattern[r][c] = !!p[r][c];
      const cell = cells[r][c];
      if(cell){
        if(pattern[r][c]) cell.classList.add('active'); else cell.classList.remove('active');
      }
    }
  }
}

function sendBeat(){
  if(!stompClient || !stompClient.connected) return;
  stompClient.send("/app/beat",{},JSON.stringify({pattern:JSON.stringify(pattern)}));
}

// Sequencer
let playTimer = null;
let currentCol = -1;
const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const tempoInput = document.getElementById('tempo');

playButton.addEventListener('click', ()=>{
  if(playTimer) return; // already playing
  ensureAudio();
  const bpm = Math.max(40, Math.min(300, parseInt(tempoInput.value) || 120));
  const intervalMs = 60000 / bpm / 2; // 8th notes
  currentCol = 0;
  highlightColumn(currentCol);
  playStep();
  playTimer = setInterval(()=>{ currentCol = (currentCol+1) % cols; highlightColumn(currentCol); playStep(); }, intervalMs);
});

stopButton.addEventListener('click', stopSequencer);

function stopSequencer(){
  if(playTimer) clearInterval(playTimer);
  playTimer = null;
  unhighlightAll();
  currentCol = -1;
}

function playStep(){
  if(currentCol < 0) return;
  for(let r=0;r<rows;r++){
    if(pattern[r][currentCol]) playNoteForRow(r, 0.12);
  }
}

function highlightColumn(col){
  unhighlightAll();
  for(let r=0;r<rows;r++){
    const cell = cells[r][col];
    if(cell) cell.classList.add('playing');
  }
  // choose marker color based on first active cell in column (top-down)
  if(markers[col]){
    markers[col].classList.remove('r0','r1','r2','r3');
    let assigned = false;
    for(let r=0;r<rows;r++){
      if(pattern[r][col]){ markers[col].classList.add('r'+r); assigned = true; break; }
    }
    if(!assigned) markers[col].classList.add('r0'); // default subtle color
  }
}

function unhighlightAll(){
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) cells[r][c].classList.remove('playing');
  for(let c=0;c<cols;c++) if(markers[c]) markers[c].classList.remove('r0','r1','r2','r3');
}

