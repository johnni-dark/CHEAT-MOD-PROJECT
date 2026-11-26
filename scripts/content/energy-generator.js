// CHEAT-MOD-PROJECT
// Author: Johnny_Dark
// Community: https://vk.ru/cheat_mod_project
// Contact: stalker@call-of-pripyat.ru
const animations = require("utils/animations");
const block = extend(PowerSource, "energy-generator", {});
block.localizedName = "Генератор энергии";
block.description = "Бесконечный источник энергии без топлива.";
block.size = 1;
block.health = 10000;
block.laserRange = 6;
block.maxNodes = 100;
block.powerProduction = 1000000 / 60;
block.category = Category.power;
block.requirements = ItemStack.empty;
block.alwaysUnlocked = true;
block.buildVisibility = BuildVisibility.shown;
block.shownPlanets.add(Planets.serpulo);
block.shownPlanets.add(Planets.erekir);
block.buildType = prov(() => extend(PowerSource.PowerSourceBuild, block, {
    draw(){
        this.super$draw();
        animations.drawFrames(block, this.x, this.y, 12, 6);
    }
}));
