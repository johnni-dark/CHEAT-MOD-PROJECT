// CHEAT-MOD-PROJECT — Johnny_Dark
// https://vk.ru/cheat_mod_project | stalker@call-of-pripyat.ru
const animations = require("utils/animations");
const block = extend(StorageBlock, "resource-teleporter", {
    outputsItems(){ return true; }
});
block.localizedName = "Радиоактивный телепортатор";
block.description = "Передаёт предметы между блоками одного канала по всей карте. Настройте канал и режим приёма или отправки.";
block.size = 1;
block.health = 10000;
block.hasItems = true;
block.coreMerge = false;
block.itemCapacity = 10000;
block.update = true;
block.solid = true;
block.configurable = true;
block.saveConfig = false;
block.drawCached = false;
block.drawDynamic = true;
block.shownPlanets.add(Planets.serpulo);
block.shownPlanets.add(Planets.erekir);

block.category = Category.distribution;
block.requirements = ItemStack.empty;
block.alwaysUnlocked = true;
block.buildVisibility = BuildVisibility.shown;

let settings = {};
Events.on(EventType.ResetEvent, cons(e => {settings = {};}));
function state(b){
    let s = settings[b.pos()];
    if(s == null){ s = [1, false, 0, 0]; settings[b.pos()] = s; }
    return s;
}
function configure(b, ch, receive){ const s=state(b); s[0]=ch; s[1]=receive; }
block.buildType = prov(() => extend(StorageBlock.StorageBuild, block, {
    config(){ const s=state(this); return java.lang.Integer.valueOf(s[0]+(s[1]?100:0)); },
    buildConfiguration(table){
        const b=this;
        table.button("-", run(()=>{const s=state(b); configure(b,Math.max(1,s[0]-1),s[1]);})).size(48);
        table.label(prov(()=>"Канал: "+state(b)[0])).width(120);
        table.button("+", run(()=>{const s=state(b); configure(b,Math.min(100,s[0]+1),s[1]);})).size(48);
        table.row();
        table.button("Отправка / Приём", run(()=>{const s=state(b);configure(b,s[0],!s[1]);})).colspan(3).width(216).height(48);
        table.row();
        table.label(prov(()=>state(b)[1]?"Приём":"Отправка")).colspan(3);
    },
    acceptItem(source,item){return !state(this)[1] && this.items.total()<block.itemCapacity;},
    handleItem(source,item){ if(this.items.total()<block.itemCapacity)this.items.add(item,1); },
    getMaximumAccepted(item){return Math.max(0,block.itemCapacity-this.items.total()+this.items.get(item));},
    acceptStack(item,amount,source){return state(this)[1]?0:Math.min(amount,Math.max(0,block.itemCapacity-this.items.total()));},
    updateTile(){
        const s=state(this);
        s[2]=Math.min(10000,s[2]+10000/60*Time.delta);
        let budget=Math.floor(s[2]); s[2]-=budget;
        if(s[1]){
            for(let i=0;i<budget && this.items.total()>0;i++){if(!this.dump(this.items.first()))break;}
            return;
        }
        if(this.items.total()==0 || budget<=0)return;
        const targets=[]; const sender=this;
        sender.team.data().buildings.each(cons(b=>{if(String(b.block.name) === String(block.name) && b.team.id == sender.team.id && b.pos() != sender.pos()){const t=state(b);if(t[1] && t[0]===s[0] && b.items.total()<block.itemCapacity)targets.push(b);}}));
        if(targets.length===0)return;
        for(let i=0;i<budget && this.items.total()>0;i++){
            let target=null;
            for(let j=0;j<targets.length;j++){const candidate=targets[s[3]%targets.length];s[3]=(s[3]+1)%targets.length;if(candidate.items.total()<block.itemCapacity){target=candidate;break;}}
            if(target==null)break;
            const item=this.items.first(); if(item==null)break;
            target.items.add(item,1);this.items.remove(item,1);
            s[4]=Time.time; state(target)[4]=Time.time;
        }
    },
    draw(){
        this.super$draw();
        animations.drawFrames(block,this.x,this.y,12,6);
        const b=this, s=state(b);
        Draw.color(Color.valueOf(s[1]?"82c94b":"d5b74c"));
        Draw.alpha(0.85);
        Lines.stroke(0.65);
        Lines.circle(b.x,b.y,2.8);
        for(let i=0;i<4;i++){
            const other=b.nearby(i);
            if(other!=null && other.team.id===b.team.id && other.block.hasItems && other.block.name!==block.name){
                const dx=(other.x-b.x), dy=(other.y-b.y), len=Math.sqrt(dx*dx+dy*dy);
                if(len>0){
                    Lines.stroke(1.4);
                    Lines.line(b.x+dx/len*2.7,b.y+dy/len*2.7,b.x+dx/len*4,b.y+dy/len*4);
                }
            }
        }
        if(s[4]!=null && Time.time-s[4]<18){
            Draw.alpha(0.35*(1-(Time.time-s[4])/18));
            Lines.stroke(0.45);
            Lines.circle(b.x,b.y,2.8+(Time.time-s[4])*0.06);
        }
        Draw.reset();
    },
    drawConfigure(){
        this.super$drawConfigure();
        const oldZ=Draw.z();
        const b=this,s=state(b);
        Draw.z(Layer.overlayUI);
        Draw.color(Color.valueOf("a4d77a"));
        Draw.alpha(0.32);
        Lines.stroke(0.85);
        b.team.data().buildings.each(cons(other=>{
            if(String(other.block.name)!==String(block.name) || other.pos()===b.pos())return;
            const t=state(other);
            if(t[0]!==s[0] || t[1]===s[1])return;
            const dx=other.x-b.x,dy=other.y-b.y,len=Math.sqrt(dx*dx+dy*dy);
            if(len>0){
                for(let d=0;d<len;d+=8){
                    const end=Math.min(d+4,len);
                    Lines.line(b.x+dx*d/len,b.y+dy*d/len,b.x+dx*end/len,b.y+dy*end/len);
                }
            }
        }));
        Draw.reset();
        Draw.z(oldZ);
    },
    write(w){this.super$write(w);const s=state(this);w.i(s[0]);w.bool(s[1]);},
    read(r,revision){this.super$read(r,revision);const s=state(this);s[0]=Math.max(1,Math.min(100,r.i()));s[1]=r.bool();},
    onRemoved(){delete settings[this.pos()];this.super$onRemoved();}
}));
