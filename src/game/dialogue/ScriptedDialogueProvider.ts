import { DialogueNode, DialogueScript } from './DialogueTypes';

export class ScriptedDialogueProvider {
  private nodes: Map<string, DialogueNode>;
  constructor(readonly script: DialogueScript) { this.nodes = new Map(script.nodes.map(n => [n.id,n])); }
  start(): DialogueNode { return this.get(this.script.start); }
  get(id: string): DialogueNode {
    const node=this.nodes.get(id); if(!node) throw new Error(`Dialogue node not found: ${id}`); return node;
  }
}
