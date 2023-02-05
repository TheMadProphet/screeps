require("Creep/Prototype");
require("Structure/Prototype/Room");
require("Structure/Prototype/StructureSpawn");

const constructor = require("Structure/Constructor");
const structureTower = require("Structure/Tower");
const roleHarvester = require("Creep/Role/Harvester");
const roleBuilder = require("Creep/Role/Builder");
const roleUpgrader = require("Creep/Role/Upgrader");
const roleHandyman = require("Creep/Role/Handyman");

/**
 * TODO:
 * use foreach instead of for
 * console log improvement
 *
 * filler role, build containers near sources
 *
 * harvesters spawn #1
 * determine amount of extra upgraders (distance)
 *
 * auto tower placement
 */
module.exports.loop = function () {
    for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName];

        constructor.buildInfrastructure(room);
        constructor.buildStructures(room);

        room.spawn.automate();

        structureTower.automate(Game.getObjectById("63dda0ea034ca354399c6fce")); // todo
    }

    for (const name in Game.creeps) {
        const creep = Game.creeps[name];
        if (creep.memory.role === "harvester") {
            roleHarvester.run(creep);
        }
        if (creep.memory.role === "upgrader") {
            roleUpgrader.run(creep);
        }
        if (creep.memory.role === "builder") {
            roleBuilder.run(creep);
        }
        if (creep.memory.role === "handyman") {
            roleHandyman.run(creep);
        }
    }
};
