import {QState,runGrover,shorHistogram,factorFromPeriod,gcd,qaoaP1,qaoaSweep,evolveBloch,encodeBitFlip,bitFlipSyndrome,quantumKernel,qcbmProbs,klDivergence} from './engine.mjs';

export const SOURCE_COMMIT='f92d86869a441141dc6e7b25907d744b5b475177';
export const CATEGORIES={evolution:'Foundations',shor:'Algorithms',grover:'Algorithms',qaoa:'Algorithms',knitting:'Foundations',annealing:'Algorithms',qec:'Noise & resilience',advantage:'Foundations',qml:'Learning',qbm:'Learning',mesolve:'Noise & resilience',atlas:'Foundations'};
export const FA_TITLES={evolution:'تحول زمانی',shor:'الگوریتم شور',grover:'جست‌وجوی گروور',qaoa:'بهینه‌سازی کوانتومی',knitting:'بافت مدار',annealing:'بازپخت و QAOA',qec:'تصحیح خطا',advantage:'مزیت کوانتومی',qml:'یادگیری کوانتومی',qbm:'ماشین‌های بورن',mesolve:'سیستم‌های باز',atlas:'اطلس الگوریتم‌ها',composer:'مدار کوانتومی'};
export const SHORT={evolution:['Watch a single qubit find its rhythm.','حرکت یک کیوبیت را روی کرهٔ بلوخ ببین.'],shor:['Find the period. Uncover the factors.','دوره را پیدا کن؛ عوامل را آشکار کن.'],grover:['Make one possibility stand out.','احتمال پاسخ دلخواه را تقویت کن.'],qaoa:['Turn a graph into an optimization problem.','یک گراف را به مسئلهٔ بهینه‌سازی تبدیل کن.'],knitting:['Rebuild correlations, piece by piece.','همبستگی‌ها را جزءبه‌جزء بازسازی کن.'],annealing:['Follow an energy landscape downhill.','روی چشم‌انداز انرژی به سمت کمینه برو.'],qec:['Find an error without reading the message.','خطا را بدون خواندن داده پیدا کن.'],advantage:['Understand where quantum helps.','ببین کوانتوم کجا مزیت دارد.'],qml:['A different geometry for learning.','هندسه‌ای متفاوت برای یادگیری.'],qbm:['Teach a circuit a probability distribution.','به مدار، یک توزیع احتمال یاد بده.'],mesolve:['Let the environment into the experiment.','محیط را وارد آزمایش کن.'],atlas:['Connect the ideas. See the whole picture.','ایده‌ها را پیوند بده و کل مسیر را ببین.']};
const range=(key,label,min,max,step,value)=>({key,label,min,max,step,value,type:'range'});
const select=(key,label,options,value)=>({key,label,options,value,type:'select'});
export const CONTROLS={
 evolution:[select('axis','Rotation axis',[['x','X axis'],['y','Y axis'],['z','Z axis']],'y'),range('angle','Evolution angle θ',0,6.28,.02,1.57)],
 grover:[range('qubits','Qubits',2,6,1,4),range('marked','Marked state',0,63,1,7),range('iterations','Amplification rounds',0,8,1,3)],
 shor:[select('N','Composite number',[[15,'15 = ? × ?'],[21,'21 = ? × ?'],[35,'35 = ? × ?']],15),range('base','Coprime base a',2,10,1,2),range('precision','Readout bits',4,8,1,6)],
 qaoa:[range('gamma','Cost angle γ',0,3.14,.02,.8),range('beta','Mixer angle β',0,3.14,.02,.4)],
 knitting:[range('theta','Entangling angle θ',0,1.57,.01,.785)],
 annealing:[range('spins','Spins in ring',6,12,1,8),range('fraction','Anneal fraction s',.05,1,.01,.65),range('steps','Metropolis steps',50,1500,50,500)],
 qec:[select('logical','Logical bit',[[0,'|0⟩ logical'],[1,'|1⟩ logical']],0),select('error','Inject bit-flip',[[-1,'No error'],[0,'X on qubit 0'],[1,'X on qubit 1'],[2,'X on qubit 2']],1)],
 advantage:[select('problem','Problem family',[['search','Unstructured search'],['factoring','Integer factoring'],['sampling','State representation']],'search'),range('scale','Problem size n',4,24,1,12)],
 qml:[range('x0','Feature x₀',0,3.14,.02,.8),range('x1','Feature x₁',0,3.14,.02,1.6)],
 qbm:[range('a0','Layer 1 · θ₀',0,6.28,.02,.8),range('a1','Layer 1 · θ₁',0,6.28,.02,1.1),range('a2','Layer 1 · θ₂',0,6.28,.02,.4),range('b0','Layer 2 · φ₀',0,6.28,.02,.6),range('b1','Layer 2 · φ₁',0,6.28,.02,.9),range('b2','Layer 2 · φ₂',0,6.28,.02,1.3)],
 mesolve:[range('time','Evolution time',0,6,.05,2),range('gamma','Amplitude damping γ',0,2,.02,.35),range('dephasing','Dephasing Γ',0,2,.02,.2)],
 atlas:[],
 composer:[select('preset','Circuit preset',[['bell','Bell pair · 2 qubits'],['ghz','GHZ · n qubits'],['product','Product · |00…0⟩']],'bell'),select('qubits','Register size',[[2,'2 qubits'],[3,'3 qubits'],[4,'4 qubits'],[8,'8 qubits'],[12,'12 qubits']],4),range('noise','Global depolarizing p',0,1,.01,0)],
};
export function defaults(id){return Object.fromEntries((CONTROLS[id]??[]).map(c=>[c.key,c.value]));}
export function seeded(seed){let a=Number(seed)>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export function normalized(p){const sum=p.reduce((s,x)=>s+x,0);if(!Number.isFinite(sum)||Math.abs(sum-1)>1e-7||p.some(x=>!Number.isFinite(x)||x< -1e-12))throw new Error('Probability normalization failed.');return sum;}
export function sample(p,shots,seed){normalized(p);if(!Number.isInteger(shots)||shots<1||shots>8192)throw new Error('Shots must be between 1 and 8192.');const rng=seeded(seed),cdf=[];let acc=0;for(const v of p)cdf.push(acc+=v);const counts=new Array(p.length).fill(0);for(let k=0;k<shots;k++){const r=rng();let lo=0,hi=cdf.length-1;while(lo<hi){const m=(lo+hi)>>1;if(cdf[m]<r)lo=m+1;else hi=m;}counts[lo]++;}return counts;}
export const EDGES=[[0,1],[1,2],[2,3],[3,0],[0,2]];
export const TARGET=[.28,.04,.04,.22,.04,.18,.04,.16];
function trainValues(p){return [[p.a0,p.a1,p.a2],[p.b0,p.b1,p.b2]];}
export function trainBorn(p,steps=45){let pars=trainValues(p).flat(),loss=[];const evalAt=v=>klDivergence(TARGET,qcbmProbs([v.slice(0,3),v.slice(3)],3));let lr=.15;for(let i=0;i<steps;i++){const before=evalAt(pars);loss.push(before);const grad=pars.map((_,j)=>{const a=pars.slice(),b=pars.slice();a[j]+=.001;b[j]-=.001;return(evalAt(a)-evalAt(b))/.002;});const candidate=pars.map((x,j)=>x-lr*grad[j]);if(evalAt(candidate)<before){pars=candidate;lr=Math.min(.25,lr*1.04);}else lr*=.5;}loss.push(evalAt(pars));return {params:Object.fromEntries(['a0','a1','a2','b0','b1','b2'].map((k,i)=>[k,Math.min(6.28,(pars[i]%(2*Math.PI)+2*Math.PI)%(2*Math.PI))])),loss};}
export function optimizeCut(){return qaoaSweep(4,EDGES,25).best;}
export function evaluate(id,input={},seed=42){
 const p={...defaults(id),...input};
 for(const ctl of CONTROLS[id]??[]){const v=p[ctl.key];if(ctl.type==='range'&&(!Number.isFinite(Number(v))||Number(v)<ctl.min||Number(v)>ctl.max))throw new Error(`${ctl.label} is out of range.`);if(ctl.type==='select'&&!ctl.options.some(([x])=>String(x)===String(v)))throw new Error(`${ctl.label} is invalid.`);}
 const base={id,params:p,probabilities:null,metrics:[],qasm:null,kind:'statevector',note:'Exact local statevector calculation.',seed};
 const finish=r=>{const out={...base,...r};if(out.probabilities)normalized(out.probabilities);return out;};
 if(id==='evolution'){
  const s=QState.computational(1);s['r'+p.axis](0,+p.angle);const b=s.bloch(0);
  return finish({probabilities:s.probabilities(),bloch:b,metrics:[['P(|1⟩)',s.probabilities()[1],'prob'],['Bloch length',Math.hypot(b.x,b.y,b.z),'fixed'],['Rotation',+p.angle,'rad']],qasm:`OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[1];\nr${p.axis}(${p.angle}) q[0];`});
 }
 if(id==='grover'){
  const n=+p.qubits,marked=Math.min((1<<n)-1,Math.round(+p.marked));const r=runGrover(n,marked,+p.iterations);const prob=r.state.probabilities();
  return finish({probabilities:prob,history:r.history.map((v,i)=>({t:i,value:v[marked]})),marked,metrics:[['Target probability',prob[marked],'prob'],['Search space',1<<n,'int'],['Oracle queries',+p.iterations,'int']],qasm:groverQasm(n,marked,+p.iterations),note:'Exact amplitude amplification. Too many rounds can reduce the target probability.'});
 }
 if(id==='shor'){
  const N=+p.N,a=+p.base;if(gcd(N,a)!==1)throw new Error(`Choose a base coprime to ${N}; gcd(${a}, ${N}) ≠ 1.`);const r=shorHistogram(N,a,+p.precision);const factors=factorFromPeriod(N,a,r.period);
  return finish({kind:'analytic-period-model',probabilities:r.probs,period:r.period,factors,metrics:[['Period r',r.period,'int'],['Factor pair',factors?factors.join(' × '):'Try another base','text'],['Readout states',r.Q,'int']],note:'Analytic teaching model: the order is found classically, then a QFT-shaped histogram is calculated. This is not a full gate-level implementation of Shor.'});
 }
 if(id==='qaoa'){
  const r=qaoaP1(4,EDGES,+p.gamma,+p.beta);const best=r.state.mostProbable();return finish({probabilities:r.probs,graph:{bits:best.bits,edges:EDGES},metrics:[['Expected cut',r.expectation,'fixed'],['Maximum cut',4,'int'],['Layers p',1,'int']],note:'A four-node MaxCut problem with five edges, evaluated with a p = 1 variational circuit.'});
 }
 if(id==='knitting'){
  const theta=+p.theta,s=QState.computational(2).ry(0,2*theta).cnot(0,1),x=Math.sin(2*theta),z=Math.cos(2*theta);
  const terms=[['I ⊗ I',.25],['Z ⊗ I',z/4],['I ⊗ Z',z/4],['Z ⊗ Z',.25],['X ⊗ X',x/4],['Y ⊗ Y',-x/4]];
  return finish({probabilities:s.probabilities(),terms,metrics:[['XX correlation',x,'fixed'],['ZZ correlation',1,'fixed'],['Pauli terms',6,'int']],note:'Pedagogical Pauli decomposition of cos(θ)|00⟩ + sin(θ)|11⟩. Coefficients reconstruct the density matrix; this is not a distributed wire-cut execution.'});
 }
 if(id==='annealing'){
  const n=+p.spins,s=+p.fraction,T=Math.max(.025,1.2*(1-s)),rng=seeded(seed);let spins=Array.from({length:n},()=>rng()<.5?1:-1),accepted=0,history=[];
  const energy=a=>a.reduce((sum,x,i)=>sum-s*x*a[(i+1)%n],0);
  for(let i=0;i<+p.steps;i++){const j=Math.floor(rng()*n),next=spins.slice();next[j]*=-1;const d=energy(next)-energy(spins);if(d<=0||rng()<Math.exp(-d/T)){spins=next;accepted++;}if(i%5===0)history.push({t:i,value:energy(spins)});}
  return finish({kind:'classical-metropolis',spins,history,metrics:[['Ring energy',energy(spins),'fixed'],['Temperature',T,'fixed'],['Accepted moves',accepted,'int']],note:'Classical Metropolis annealing of a ferromagnetic ring. This illustrates an energy landscape; it does not simulate quantum adiabatic evolution.'});
 }
 if(id==='qec'){
  const s=encodeBitFlip(+p.logical);if(+p.error>=0)s.x(+p.error);const before=bitFlipSyndrome(s);if(before.flip>=0)s.x(before.flip);const after=bitFlipSyndrome(s);
  return finish({probabilities:s.probabilities(),syndrome:before.syn,correction:before.flip,metrics:[['Syndrome',before.syn.join(' '),'text'],['Correction',before.flip<0?'None':`X(${before.flip})`,'text'],['Recovered',after.syn.every(x=>x===0)?'Yes':'No','text']],qasm:`OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[3];\n${+p.logical?'x q[0];\n':''}cx q[0],q[1];\ncx q[0],q[2];\n${+p.error>=0?`x q[${p.error}];\n`:''}${before.flip>=0?`x q[${before.flip}];\n`:''}`,note:'Ideal three-qubit repetition code for at most one X error. Syndrome is calculated from exact expectations; no noisy ancilla measurement is modeled.'});
 }
 if(id==='qml'){
  const point=[+p.x0,+p.x1],ref=[.9,1.2],K=quantumKernel(point,ref),heat=[];for(let y=0;y<18;y++){const row=[];for(let x=0;x<18;x++)row.push(quantumKernel(point,[x/17*Math.PI,y/17*Math.PI]));heat.push(row);}return finish({kind:'quantum-feature-map',heat,metrics:[['Kernel K(x, x′)',K,'fixed'],['Feature dimensions',2,'int'],['Reference x′','0.90, 1.20','text']],note:'Squared overlap between two two-qubit feature states. This is an exact kernel demonstration, not a trained classifier.'});
 }
 if(id==='qbm'){
  const probs=qcbmProbs(trainValues(p),3),kl=klDivergence(TARGET,probs);return finish({probabilities:probs,target:TARGET,metrics:[['KL divergence',kl,'fixed'],['Trainable angles',6,'int'],['Circuit layers',2,'int']],note:'Two RY/CZ layers produce a Born distribution. Train performs real finite-difference gradient descent against the target distribution.'});
 }
 if(id==='mesolve'){
  const history=evolveBloch(1,0,0,{omega:1,axis:'z',gamma:+p.gamma,dephasing:+p.dephasing,t:+p.time,steps:1200}),b=history.at(-1),purity=(1+b.x*b.x+b.y*b.y+b.z*b.z)/2;return finish({kind:'bloch-lindblad-euler',bloch:b,history:history.map(x=>({t:x.t,value:x.x,y:x.y,z:x.z})),probabilities:[(1+b.z)/2,(1-b.z)/2],metrics:[['Purity Tr(ρ²)',purity,'fixed'],['Bloch length',Math.hypot(b.x,b.y,b.z),'fixed'],['Time',+p.time,'fixed']],note:'Numerical first-order integration of the single-qubit Bloch-form Lindblad equation (1,200 steps). This does not call QuTiP or mesolve.'});
 }
 if(id==='advantage'){
  const n=+p.scale,N=2**n;return finish({kind:'complexity-illustration',complexity:{n,N,problem:p.problem},metrics:[['Size n',n,'int'],['Basis states',N,'int'],['Scope','Asymptotic','text']],note:'Illustrative complexity comparison. These are scaling expressions, not wall-clock measurements or evidence of a hardware advantage.'});
 }
 if(id==='atlas')return finish({kind:'learning-map',metrics:[['Research labs',12,'int'],['Idea families',4,'int'],['Execution','Local','text']],note:'A navigable learning map of the original twelve research labs.'});
 if(id==='composer'){
  const n=p.preset==='bell'?2:+p.qubits;if(n<2||n>12)throw new Error('Register size must be between 2 and 12.');const s=QState.computational(n);let gates=[];if(p.preset!=='product'){s.h(0);gates.push('h q[0];');for(let q=1;q<n;q++){s.cnot(0,q);gates.push(`cx q[0],q[${q}];`);}}
  const noise=+p.noise,dim=1<<n,probs=s.probabilities().map(x=>(1-noise)*x+noise/dim),fid=1-noise+noise/dim;
  return finish({probabilities:probs,qubits:n,fidelity:fid,noise,metrics:[['Target fidelity',fid,'prob'],['State amplitudes',dim,'int'],['Register size',n,'int']],qasm:`OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[${n}];\n${gates.join('\n')}\n// Display noise model: rho = (1-p)|psi><psi| + p I/${dim}.\n// Noise is not part of this ideal QASM circuit.`,note:'Bell/GHZ/product preparation inspired by the supplied CHIMERA workspace. Noise is a global depolarizing mixture, calculated analytically. No quantum hardware connection.'});
 }
 throw new Error('Unknown experiment.');
}

function groverQasm(n,marked,k){const lines=['OPENQASM 2.0;','include "qelib1.inc";',`qreg q[${n}];`];
 // Transparent OpenQASM 2 extension declaration for the multi-controlled NOT.
 if(n>3)return null;
 const xall=()=>{for(let q=0;q<n;q++)lines.push(`x q[${q}];`);};
 const hall=()=>{for(let q=0;q<n;q++)lines.push(`h q[${q}];`);};
 const phase=()=>{lines.push(`h q[${n-1}];`,n===2?'cx q[0],q[1];':'ccx q[0],q[1],q[2];',`h q[${n-1}];`);};
 hall();for(let i=0;i<k;i++){for(let q=0;q<n;q++)if(!((marked>>q)&1))lines.push(`x q[${q}];`);phase();for(let q=0;q<n;q++)if(!((marked>>q)&1))lines.push(`x q[${q}];`);hall();xall();phase();xall();hall();}return lines.join('\n');
}

export function canonical(value){if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';return JSON.stringify(value);}
export async function digest(payload){if(!globalThis.crypto?.subtle)throw new Error('SHA-256 requires a secure browser context.');const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonical(payload)));return [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');}
export async function evidence(result,shots=512){const counts=result.probabilities?sample(result.probabilities,shots,result.seed):null;const payload={schema:'quantum001.browser-experiment/v1',engine_source:SOURCE_COMMIT,scope:'Local numerical simulation. Integrity digest, not a formal proof or hardware attestation.',experiment:result.id,parameters:result.params,seed:result.seed,shots:counts?shots:0,model:result.kind,probabilities:result.probabilities,counts,metrics:result.metrics,qasm:result.qasm,note:result.note,created_at:new Date().toISOString()};return {payload,sha256:await digest(payload)};}
export async function verifyEvidence(entry){if(!entry?.payload||typeof entry.sha256!=='string')return false;return await digest(entry.payload)===entry.sha256;}
