Creep.prototype.moveToAndUpgradeController = function () {
    if (this.upgradeController(this.room.controller) === ERR_NOT_IN_RANGE) {
        this.moveTo(this.room.controller, {visualizePathStyle: {stroke: "#ffffff"}});
    }
};

const upgrader = {
    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.upgrading = false;
            creep.say("🪫");
        }
        if (!creep.memory.upgrading && creep.store.getFreeCapacity() === 0) {
            creep.memory.upgrading = true;
            creep.say("🪛");
        }

        if (creep.memory.upgrading) {
            creep.moveToAndUpgradeController();
        } else {
            creep.withdrawEnergy();
        }
    }
};

module.exports = upgrader;
