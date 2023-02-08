const harvester = {
    /** @param {Creep} creep **/
    run: function (creep) {
        if (!creep.memory.assignedSource) {
            creep.say("⚠");
            return;
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
            this.harvest(creep);
        } else {
            this.storeEnergy(creep);
        }
    },

    /** @param {Creep} creep **/
    harvest: function (creep) {
        const source = Game.getObjectById(creep.memory.assignedSource);
        const harvestStatus = creep.harvest(source);
        if (harvestStatus === ERR_NOT_IN_RANGE || harvestStatus === ERR_NOT_ENOUGH_RESOURCES) {
            creep.moveTo(source, {visualizePathStyle: {stroke: "#ffaa00"}});

            if (harvestStatus === ERR_NOT_ENOUGH_RESOURCES) {
                creep.say("🕑");
            }
        }
    },

    /** @param {Creep} creep **/
    storeEnergy: function (creep) {
        if (creep.room.fillersAreEnabled()) {
            if (creep.fillContainersWithEnergy() === ERR_FULL) {
                creep.idle();
            }
        } else {
            if (creep.fillSpawnsWithEnergy() === ERR_FULL && creep.fillContainersWithEnergy() === ERR_FULL) {
                creep.idle();
            }
        }
    }
};

module.exports = harvester;
