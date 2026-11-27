// CHEAT-MOD-PROJECT
// Author: Johnny_Dark
// Community: https://vk.ru/cheat_mod_project
// Contact: stalker@call-of-pripyat.ru

const ports = require("utils/ports");

function generator(kind, buildKind, id, field, category, defaultColor){
    const block = extend(kind, id, {});
    block.size = 1;
    block.health = 5000;
    block.alwaysUnlocked = true;
    block.category = category;
    block.buildVisibility = BuildVisibility.shown;
    block.requirements = ItemStack.empty;
    block.drawCached = false;
    block.drawDynamic = true;
    block.buildType = prov(() => extend(buildKind, block, {
        draw(){
            Draw.color();
            Draw.rect(block.region, this.x, this.y);
            const selected = this[field];
            Draw.color(selected == null ? defaultColor : selected.color);
            Draw.rect(Core.atlas.find(block.name + "-mask"), this.x, this.y);
            Draw.color();
            ports.drawPorts(this, field === "source", selected == null ? defaultColor : selected.color);
            if(Vars.state.isGame() && !Core.scene.hasMouse()){
                const hovered = Vars.world.buildWorld(Core.input.mouseWorldX(), Core.input.mouseWorldY());
                if(hovered != null && hovered.pos() == this.pos()){
                    const caption = selected == null ? "Не выбрано" : selected.localizedName;
                    const label = String(caption);
                    const width = Math.max(14, label.length * 1.8 + 9);
                    const left = this.x + 5;
                    const cy = this.y + 8;
                    const previous = Draw.z();
                    Draw.z(Layer.overlayUI + 1);
                    Draw.color(Color.valueOf("181c23"));
                    Fill.rect(left + width/2, cy, width, 6);
                    Draw.color(selected == null ? Color.gray : selected.color);
                    Fill.rect(left + 0.5, cy, 1, 6);
                    Draw.color();
                    if(selected != null){
                        Draw.rect(selected.uiIcon, left + 3.5, cy, 4.5, 4.5);
                    }
                    Drawf.text(label, left + 7, cy + 2, Color.white, 0.8, Align.left);
                    Draw.reset();
                    Draw.z(previous);
                }
            }
        }
    }));
    return block;
}
const items = generator(ItemSource, ItemSource.ItemSourceBuild, "resource-generator",
    "outputItem", Category.distribution, Color.valueOf("9fff20"));
items.itemsPerSecond = 100;
const liquids = generator(LiquidSource, LiquidSource.LiquidSourceBuild, "liquid-generator",
    "source", Category.liquid, Color.valueOf("00cfff"));
