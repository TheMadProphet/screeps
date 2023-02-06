Creep.prototype.buildConstruction = function () {
    const closestConstruction = this.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
    if (this.build(closestConstruction) === ERR_NOT_IN_RANGE) {
        this.moveTo(closestConstruction, {visualizePathStyle: {stroke: "#ffffff"}});
    }
};

const builder = {
    /** @param {Creep} creep **/
    run: function (creep) {
        if (!creep.room.constructionSites.length) {
            creep.idle();
            return;
        }

        if (creep.memory.building && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.building = false;
            creep.say("🪫");
        }
        if (!creep.memory.building && creep.store.getFreeCapacity() === 0) {
            creep.memory.building = true;
            creep.say("🔨");
        }

        if (creep.memory.building) {
            creep.buildConstruction();
        } else {
            creep.takeEnergyFromBestSource();
        }
    }
};

module.exports = builder;
