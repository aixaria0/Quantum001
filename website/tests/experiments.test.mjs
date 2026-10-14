import {test} from 'node:test';
import assert from 'node:assert/strict';
import {QState,quantumKernel} from '../dist/modules/engine.mjs';
import {LABS} from '../dist/modules/labs.mjs';
import {evaluate,defaults,sample,normalized,trainBorn,optimizeCut,evidence,verifyEvidence,canonical} from '../dist/modules/experiments.mjs';
const close=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<tol,`${a} ≠ ${b}`);

test('all original labs and the ZIP composer evaluate with finite normalized results',()=>{
 for(const id of [...LABS.map(l=>l.id),'composer']){const r=evaluate(id);assert.equal(r.id,id);assert.ok(r.metrics.length===3);if(r.probabilities)close(normalized(r.probabilities),1);for(const [,v] of r.metrics)if(typeof v==='number')assert.ok(Number.isFinite(v));}
});
test('unitary gate round trip and QFT inverse preserve a complex superposition',()=>{
 const s=QState.computational(4).hAll().ry(0,.9).rz(1,.3).cnot(0,2).t(3),before=s.clone();s.qft().iqft();
 for(let i=0;i<s.dim;i++){close(s.re[i],before.re[i]);close(s.im[i],before.im[i]);}close(normalized(s.probabilities()),1);
});
test('Bell and GHZ-12 prepare only the two expected basis states',()=>{
 for(const [preset,qubits] of [['bell',2],['ghz',12]]){const r=evaluate('composer',{preset,qubits,noise:0});close(r.probabilities[0],.5);close(r.probabilities.at(-1),.5);close(r.probabilities.slice(1,-1).reduce((a,b)=>a+b,0),0);assert.equal(r.probabilities.length,2**qubits);}
});
test('maximal global depolarization produces a uniform 12-qubit mixture',()=>{
 const r=evaluate('composer',{preset:'ghz',qubits:12,noise:1});for(const p of r.probabilities)close(p,1/4096);close(r.fidelity,1/4096);
});
test('sampling is reproducible and conserves the complete shot budget',()=>{
 const p=evaluate('composer',{noise:.2}).probabilities,a=sample(p,8192,98765),b=sample(p,8192,98765);assert.deepEqual(a,b);assert.equal(a.reduce((x,y)=>x+y,0),8192);assert.notDeepEqual(a,sample(p,8192,98766));assert.throws(()=>sample([.2,.2],10,42));assert.throws(()=>sample(p,0,42));
});
test('Grover amplification moves probability to a caller-selected target',()=>{
 const r=evaluate('grover',{qubits:4,marked:7,iterations:3}),base=evaluate('grover',{qubits:4,marked:7,iterations:0});assert.ok(r.probabilities[7]>.96);close(base.probabilities[7],1/16);assert.equal(r.marked,7);assert.ok(evaluate('grover',{qubits:2,marked:63,iterations:1}).marked===3);
});
test('Shor teaching model identifies valid periods and rejects non-coprime bases',()=>{
 assert.deepEqual(evaluate('shor',{N:15,base:2}).factors,[3,5]);assert.deepEqual(evaluate('shor',{N:21,base:2}).factors,[3,7]);assert.throws(()=>evaluate('shor',{N:15,base:3}),/coprime/);
});
test('QAOA grid search improves the initial expectation without exceeding the MaxCut bound',()=>{
 const best=optimizeCut(),r=evaluate('qaoa',{gamma:best.gamma,beta:best.beta}),initial=evaluate('qaoa');assert.ok(r.metrics[0][1]>initial.metrics[0][1]);assert.ok(r.metrics[0][1]<=4+1e-9);
});
test('all three physical X errors are corrected for both repetition code logical values',()=>{
 for(const logical of [0,1])for(const error of [-1,0,1,2]){const r=evaluate('qec',{logical,error});close(r.probabilities[logical?7:0],1);assert.equal(r.correction,error);assert.equal(r.metrics[2][1],'Yes');}
});
test('quantum feature kernel is symmetric with unit diagonal',()=>{
 const a=[.7,1.2],b=[1.4,.9];close(quantumKernel(a,a),1);close(quantumKernel(a,b),quantumKernel(b,a));assert.ok(quantumKernel(a,b)>=0&&quantumKernel(a,b)<=1);
});
test('Born training really lowers the evaluated model loss and does not invent a trace',()=>{
 const initial=defaults('qbm'),trained=trainBorn(initial);assert.ok(trained.loss.at(-1)<trained.loss[0]/5);for(let i=1;i<trained.loss.length;i++)assert.ok(trained.loss[i]<=trained.loss[i-1]+1e-12);close(evaluate('qbm',trained.params).metrics[0][1],trained.loss.at(-1),1e-8);
});
test('open-system evolution stays in the Bloch ball',()=>{
 for(const time of [0,2,6])for(const gamma of [0,.4,2]){const r=evaluate('mesolve',{time,gamma,dephasing:.2}),b=r.bloch;assert.ok(Math.hypot(b.x,b.y,b.z)<=1+1e-9);assert.ok(r.metrics[0][1]>=.5-1e-9&&r.metrics[0][1]<=1+1e-9);}
});
test('Metropolis trajectories replay from the seed and record the classical model boundary',()=>{
 const a=evaluate('annealing',{},41),b=evaluate('annealing',{},41);assert.deepEqual(a,b);assert.equal(a.kind,'classical-metropolis');assert.match(a.note,/Classical/);
});
test('SHA-256 binds every payload field; changing a seed or count fails verification',async()=>{
 const r=evaluate('composer',{preset:'ghz',qubits:12},2026),entry=await evidence(r,512);assert.equal(entry.sha256.length,64);assert.equal(await verifyEvidence(entry),true);assert.deepEqual(entry.payload.counts,sample(r.probabilities,512,2026));entry.payload.seed++;assert.equal(await verifyEvidence(entry),false);entry.payload.seed--;entry.payload.counts[0]++;assert.equal(await verifyEvidence(entry),false);
});
test('canonical JSON sorts object keys and preserves array order',()=>{
 assert.equal(canonical({b:2,a:[3,1]}),canonical({a:[3,1],b:2}));assert.notEqual(canonical([1,2]),canonical([2,1]));
});
test('parameters fail closed outside the supported register, noise or gate ranges',()=>{
 assert.throws(()=>evaluate('composer',{qubits:30}));assert.throws(()=>evaluate('composer',{noise:NaN}));assert.throws(()=>evaluate('composer',{noise:1.1}));assert.throws(()=>evaluate('evolution',{axis:'execute'}));assert.throws(()=>evaluate('grover',{qubits:0}));
});
