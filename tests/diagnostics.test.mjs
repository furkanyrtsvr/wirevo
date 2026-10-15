import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {parseCompilerDiagnostics,editorDiagnosticRanges} from '../dist/diagnostics.js';
const real=JSON.parse(fs.readFileSync(new URL('./fixtures/gcc-diagnostics.json',import.meta.url)));
test('Actual avr-g++ failure maps sketch line and column while linker locations remain non-navigable',()=>{
 const entries=parseCompilerDiagnostics(real.error),first=entries[0];assert.equal(first.file,'sketch.ino');assert.equal(first.line,3);assert.equal(first.column,1);assert.equal(first.severity,'error');assert.match(first.message,/expected ';'/);assert.equal(first.navigable,true);
 assert.equal(entries.filter(e=>e.file==='linker').length,2);assert.ok(entries.filter(e=>e.file==='linker').every(e=>!e.navigable));
 const source='void setup(){\n  pinMode(13, OUTPUT)\n}\nvoid loop(){}\n',range=editorDiagnosticRanges(source,entries)[0];assert.equal(source.slice(range.from,range.to),'}');assert.equal(range.severity,'error');
});
test('Successful real GCC warning stays a warning, with original source mapping and no failed firmware claim',()=>{
 const entries=parseCompilerDiagnostics(real.warnings);assert.equal(entries.length,1);assert.equal(entries[0].severity,'warning');assert.equal(entries[0].line,1);assert.equal(entries[0].column,2);assert.match(entries[0].message,/#warning CircuitForge/);
});
test('Library notes, duplicate messages, invalid positions and changed documents cannot target nonexistent editor lines',()=>{
 const log='[cc1plus] /headers/Arduino.h:12:8: note: detail\nsketch.ino:8:999: error: nope\nsketch.ino:8:999: error: nope\nsketch.ino:0:1: error: invalid\nsketch.ino:2:2: warning: <script>text</script>';
 const entries=parseCompilerDiagnostics(log);assert.equal(entries.length,3);assert.equal(entries[0].navigable,false);assert.equal(entries[0].severity,'info');const ranges=editorDiagnosticRanges('first\nsecond',entries);assert.equal(ranges.length,1);assert.equal(ranges[0].from,7);assert.equal(ranges[0].message,'<script>text</script>');
 const far=editorDiagnosticRanges('x',[{navigable:true,line:1,column:999,severity:'error',message:'end'}])[0];assert.equal(far.from,1);assert.equal(far.to,1);
});
