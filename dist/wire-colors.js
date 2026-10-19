// Retain all historical shades for imported circuits, plus standard jumper colors.
export const COLORS=['#14b8a6','#ef4444','#3b82f6','#f59e0b','#8b5cf6','#64748b','#e2e8f0','#22c55e','#171717','#8b4513','#ff7900','#ffdf00','#138c32','#1458d4','#a855f7','#808080','#ffffff','#ed68ac','#00d9ef'];
export const validWireColor=c=>typeof c==='string'&&/^#[\da-f]{6}$/i.test(c);
