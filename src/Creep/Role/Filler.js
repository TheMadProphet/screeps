const filler = {
    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.memory.filling && creep.store.getUsedCapacity() === 0) {
            creep.memory.filling = false;
            creep.say("🪫");
        }
        if (!creep.memory.filling && creep.store.getFreeCapacity() === 0) {
            creep.memory.filling = true;
            creep.say("🔋");
        }

        if (!creep.memory.filling) {
            this.gatherEnergy(creep);
        } else {
            this.fill(creep);
        }
    },

    /** @param {Creep} creep **/
    gatherEnergy: function (creep) {
        if (creep.room.energyAvailable !== creep.room.energyCapacityAvailable) {
            creep.withdrawFrom(creep.room.storage);
        } else {
            const containersWithEnergy = creep.room.find(FIND_STRUCTURES, {
                filter: structure =>
                    structure.structureType === STRUCTURE_CONTAINER && structure.store.getUsedCapacity() > 50
            });

            if (containersWithEnergy.length) {
                creep.withdrawFrom(containersWithEnergy[0]);
            } else {
                creep.idle();
            }
        }
    },

    /** @param {Creep} creep **/
    fill: function (creep) {
        if (creep.room.energyAvailable !== creep.room.energyCapacityAvailable) {
            creep.fillSpawnsWithEnergy();
        } else {
            const towersWithMissingEnergy = creep.room.find(FIND_MY_STRUCTURES, {
                filter: structure =>
                    structure.structureType === STRUCTURE_TOWER && structure.store.getFreeCapacity() > 0
            });

            if (towersWithMissingEnergy.length) {
                creep.transferTo(towersWithMissingEnergy[0]);
            } else {
                creep.transferTo(creep.room.storage);
            }
        }
    }
};

module.exports = filler;
