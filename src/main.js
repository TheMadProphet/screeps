require("Creep/Prototype");
require("Creep/Spawner");
require("Structure/Prototype/Room");

const improvedConsole = require("Util/Console");

const constructor = require("Structure/Constructor");
const structureTower = require("Structure/Tower");

/**
 * TODO:
 * role count based on WORK / available energy per tick
 *
 * use foreach instead of for
 *
 * filler, miner, hauler roles. External room mining
 *
 * harvesters spawn #1
 *
 * auto tower placement
 * mine other rooms
 */
module.exports.loop = function () {
    improvedConsole.apply();

    for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName];

        constructor.buildInfrastructure(room);
        constructor.buildStructures(room);

        room.spawn.automate();

        structureTower.automate(Game.getObjectById("63dda0ea034ca354399c6fce")); // todo
        room.drawVisuals();
    }

    _.forEach(Game.creeps, creep => creep.runRole());
};
