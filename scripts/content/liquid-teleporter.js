// CHEAT-MOD-PROJECT — Johnny_Dark
// https://vk.ru/cheat_mod_project | stalker@call-of-pripyat.ru
const ports = require("utils/ports");
const animations = require("utils/animations");
const block = extend(Block, "liquid-teleporter", {});
block.localizedName = "Телепортатор жидкостей";
block.description = "Передаёт жидкости между блоками одного канала по всей карте. Настройте канал и режим приёма или отправки.";
block.size = 1;
block.health = 10000;
block.hasLiquids = true;
block.outputsLiquid = true;
block.liquidCapacity = 10000;
block.update = true;
block.solid = true;
block.configurable = true;
block.saveConfig = false;
block.drawCached = false;
block.drawDynamic = true;
block.shownPlanets.add(Planets.serpulo);
block.shownPlanets.add(Planets.erekir);

block.category = Category.liquid;
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
block.buildType = prov(() => extend(Building, {
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
    acceptLiquid(source, liquid){
        return this.liquids != null && liquid != null && !state(this)[1] && this.liquids.get(liquid)<block.liquidCapacity &&
            (this.liquids.current() == liquid || this.liquids.currentAmount()<0.001);
    },
    updateTile(){
        if(this.liquids == null)return;
        const s=state(this), liquid=this.liquids.current();
        if(liquid==null || this.liquids.get(liquid)<=0.0001)return;
        if(s[1]){this.dumpLiquid(liquid);return;}
        let budget=Math.min(this.liquids.get(liquid),10000/60*Time.delta);
        const targets=[], sender=this;
        sender.team.data().buildings.each(cons(b=>{
            if(String(b.block.name)!==String(block.name) || b.pos()===sender.pos())return;
            const t=state(b);
            if(b.liquids != null && t[1] && t[0]===s[0] && (b.liquids.current()==liquid || b.liquids.currentAmount()<0.001) && b.liquids.get(liquid)<block.liquidCapacity)targets.push(b);
        }));
        if(targets.length===0)return;
        const share=budget/targets.length;
        for(let i=0;i<targets.length && budget>0.0001;i++){
            const target=targets[(s[3]+i)%targets.length];
            const amount=Math.min(share,budget,this.liquids.get(liquid),block.liquidCapacity-target.liquids.get(liquid));
            if(amount<=0.0001)continue;
            target.liquids.add(liquid,amount);this.liquids.remove(liquid,amount);budget-=amount;
            s[4]=Time.time;state(target)[4]=Time.time;
        }
        s[3]=(s[3]+1)%targets.length;
    },
    draw(){
        this.super$draw();
        if(this.tile == null)return;
        animations.drawFrames(block,this.x,this.y,12,6);
        const b=this, s=state(b);
        Draw.color(Color.valueOf(s[1]?"59c9ee":"d5b74c"));
        Draw.alpha(0.85);
        Lines.stroke(0.65);
        Lines.circle(b.x,b.y,2.8);
        ports.drawPorts(b, true, Color.valueOf(s[1]?"59c9ee":"d5b74c"));
        Draw.color(Color.valueOf(s[1]?"59c9ee":"d5b74c"));
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
        Draw.color(Color.valueOf("8acde5"));
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
