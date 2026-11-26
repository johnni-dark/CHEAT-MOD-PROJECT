// CHEAT-MOD-PROJECT
// Author: Johnny_Dark
// Community: https://vk.ru/cheat_mod_project
// Contact: stalker@call-of-pripyat.ru
exports.drawFrames = function(block, x, y, count, ticksPerFrame){
    const frame = Math.floor(Time.time / ticksPerFrame) % count;
    const region = Core.atlas.find(block.name + "-frame-" + frame, block.region);
    Draw.rect(region, x, y);
};
