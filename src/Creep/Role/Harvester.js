const harvester = {
    /** @param {Creep} creep **/
    run: function (creep) {
        const assignedSource = creep.memory.assignedSource;
        if (!assignedSource) {
            creep.say("⚠");
            return; // Or find harvest any?
        }

        if (creep.memory.harvesting && creep.store.getFreeCapacity() === 0) {
            creep.memory.harvesting = false;
            creep.say("📦");
        }
        if (!creep.memory.harvesting && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.harvesting = true;
            creep.say("⛏");
        }

        if (creep.memory.harvesting) {
            const source = Game.getObjectById(assignedSource);
            const harvestStatus = creep.harvest(source);
            if (harvestStatus === ERR_NOT_IN_RANGE || harvestStatus === ERR_NOT_ENOUGH_RESOURCES) {
                creep.moveTo(source, {visualizePathStyle: {stroke: "#ffaa00"}});

                if (harvestStatus === ERR_NOT_ENOUGH_RESOURCES) {
                    creep.say("🕑");
                }
            }
        } else {
            if (creep.fillMyStructuresWithEnergy() === ERR_FULL) {
                if (creep.fillContainersWithEnergy() === ERR_FULL) {
                    creep.idle();
                }
            }
        }
    },
    /** @param {Creep} creep **/
    harvestAny: function (creep) {
        if (creep.store.getFreeCapacity() > 0) {
            const sources = creep.room.find(FIND_SOURCES);
            if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: "#ffaa00"}});
            }
        } else {
            if (creep.fillMyStructuresWithEnergy() === ERR_FULL) {
                if (creep.fillContainersWithEnergy() === ERR_FULL) {
                    creep.idle();
                }
            }
        }
    }
};

module.exports = harvester;
