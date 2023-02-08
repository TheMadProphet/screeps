require("Creep/Prototype");
require("Creep/Spawner");
require("Structure/Prototype/Room");

const ConsoleUtil = require("Util/Console");

const constructor = require("Structure/Constructor");
const structureTower = require("Structure/Tower");

/**
 * TODO:
 * move data that is used as cache inside memory.cache
 *
 * role count based on WORK / available energy per tick
 * refactor spawner
 * harvesters spawn #1
 *
 * auto tower placement
 * miner, hauler roles. External room mining
 *
 * emergency spawn
 */
module.exports.loop = function () {
    ConsoleUtil.improveLog();

    _.forEach(Game.rooms, room => {
        constructor.buildInfrastructure(room);
        constructor.buildStructures(room);

        room.spawn.automate();

        structureTower.automate(Game.getObjectById("63dda0ea034ca354399c6fce")); // todo
        room.drawVisuals();
    });

    _.forEach(Game.creeps, creep => creep.runRole());
};
