// CHEAT-MOD-PROJECT — Johnny_Dark
// Visual connectors only; no changes to transport.
exports.drawPorts = function(b, liquid, tint){
    if(b.tile == null)return;
    const oldZ=Draw.z();
    Draw.z(Layer.blockOver + 0.1);
    for(let i=0;i<4;i++){
        const other=b.nearby(i);
        if(other==null || other.team.id!==b.team.id)continue;
        if(liquid ? !other.block.hasLiquids : !other.block.hasItems)continue;
        const dx=[1,0,-1,0][i],dy=[0,1,0,-1][i];
        const x=b.x+dx*3.65,y=b.y+dy*3.65;
        const w=dx===0?3.5:2.7,h=dx===0?2.7:3.5;
        Draw.color(Color.valueOf("34343b")); Fill.rect(x,y,w,h);
        Draw.color(Color.valueOf("85828a")); Fill.rect(x,y,w-0.65,h-0.65);
        Draw.color(tint); Fill.rect(x,y,dx===0?1.5:2.1,dx===0?2.1:1.5);
    }
    Draw.reset(); Draw.z(oldZ);
};
