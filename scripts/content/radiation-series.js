// CHEAT-MOD-PROJECT
// Author: Johnny_Dark
// Community: https://vk.ru/cheat_mod_project
// Contact: stalker@call-of-pripyat.ru

// Data-driven implementation using standard Mindustry content classes.
const models = [
    {id: "turret", hp: 900000000, tiles: 75, interval: 1, damage: 999999999, extendedAmmo: false},
    {id: "turret-mini", hp: 2000, tiles: 25, interval: 8, damage: 2000, extendedAmmo: true},
    {id: "turret-medium", hp: 10000, tiles: 40, interval: 3, damage: 6000, extendedAmmo: true}
];

function projectile(velocity, duration, damage, smoke) {
    const result = new BasicBulletType(velocity, damage);
    result.lifetime = duration;
    result.shootEffect = Fx.none;
    result.smokeEffect = smoke;
    return result;
}

function ammunition(damage) {
    const stages = [
        projectile(10, 100, damage, Fx.none),
        projectile(5, 15, damage, Fx.none),
        projectile(5, 15, damage, Fx.neoplasmSplat)
    ];
    stages[0].fragBullets = 10;
    stages[0].fragBullet = stages[1];
    stages[1].fragBullet = stages[2];
    return stages[0];
}

models.forEach(function(model) {
    const block = extend(ItemTurret, model.id, {
        icons() {
            return [Core.atlas.find("block-1"), Core.atlas.find(this.name)];
        }
    });
    block.health = model.hp;
    block.range = model.tiles * 8;
    block.reload = model.interval;
    block.itemCapacity = 100000000;
    block.shoot.shots = 2;
    const bullet = ammunition(model.damage);
    if (model.extendedAmmo) {
        block.ammo(Items.copper, bullet, Items.beryllium, bullet,
            Items.tungsten, bullet, Items.carbide, bullet, Items.oxide, bullet);
    } else {
        block.ammo(Items.copper, bullet, Items.beryllium, bullet);
    }
});
