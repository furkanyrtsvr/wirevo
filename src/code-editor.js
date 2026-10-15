import {EditorView, basicSetup} from 'codemirror';
import {EditorState,Compartment} from '@codemirror/state';
import {python} from '@codemirror/lang-python';
import {cpp} from '@codemirror/lang-cpp';
import {lintGutter,setDiagnostics as applyDiagnostics} from '@codemirror/lint';
import {editorDiagnosticRanges} from '../dist/diagnostics.js';
import {oneDark} from '@codemirror/theme-one-dark';
export function createCodeEditor(parent, code, onChange, onCursor) {
  let suppressed=false;const language=new Compartment();
  const view=new EditorView({ parent, state:EditorState.create({doc:code,extensions:[basicSetup,language.of(cpp()),oneDark,lintGutter(),EditorView.theme({ '&':{height:'100%',fontSize:'12px',backgroundColor:'var(--editor)'},'.cm-scroller':{fontFamily:'Consolas, monospace',overflow:'auto'},'.cm-content':{padding:'12px 0'},'.cm-gutters':{backgroundColor:'var(--editor)',borderRight:'1px solid var(--border)'},'.cm-activeLine':{backgroundColor:'#22364c50'},'.cm-activeLineGutter':{backgroundColor:'#22364c50'} }),EditorView.updateListener.of(u=>{if(u.docChanged&&!suppressed)onChange(u.state.doc.toString());if(u.selectionSet){const line=u.state.doc.lineAt(u.state.selection.main.head);onCursor?.(line.number,u.state.selection.main.head-line.from+1);}}),EditorView.contentAttributes.of({'aria-label':'Arduino C++ kaynak kodu'})]})});
  return {setLanguage(value){view.dispatch({effects:language.reconfigure(value==='micropython'?python():cpp())});view.contentDOM.setAttribute('aria-label',value==='micropython'?'MicroPython kaynak kodu':value==='c'?'C kaynak kodu':'Arduino C++ kaynak kodu');},setDiagnostics(items,compiler){view.dispatch(applyDiagnostics(view.state,editorDiagnosticRanges(view.state.doc.toString(),items,compiler)));},getValue:()=>view.state.doc.toString(),setValue(value){if(value!==view.state.doc.toString()){suppressed=true;view.dispatch({changes:{from:0,to:view.state.doc.length,insert:value}});suppressed=false;}},focus:()=>view.focus(),goToLine(line){const l=view.state.doc.line(Math.max(1,Math.min(line,view.state.doc.lines)));view.dispatch({selection:{anchor:l.from},scrollIntoView:true});view.focus();},destroy:()=>view.destroy()};
}
