(function () {
    this.findBestEnergySource = function () {
        const closestContainerWithEnergy = this.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: structure =>
                (structure.structureType === STRUCTURE_CONTAINER && structure.store.getUsedCapacity() > 50) ||
                (structure.structureType === STRUCTURE_STORAGE && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 50)
        });

        if (closestContainerWithEnergy) {
            return closestContainerWithEnergy;
        }

        return this.pos.findClosestByPath(FIND_MY_SPAWNS, {
            filter: spawn => spawn.memory.hasEnoughEnergy && spawn.store.getUsedCapacity(RESOURCE_ENERGY) > 50
        });
    };

    this.takeEnergyFrom = function (target) {
        if (hasEnergyStorage(target)) {
            if (this.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.moveTo(target, {visualizePathStyle: {stroke: "#ffaa00"}});
            }
        } else if (isEnergyMine(this, target)) {
            if (this.harvest(target) === ERR_NOT_IN_RANGE) {
                this.moveTo(target, {visualizePathStyle: {stroke: "#ffaa00"}});
            }
        }
    };

    this.takeEnergyFromBestSource = function () {
        const closestSource = this.findBestEnergySource();
        if (closestSource) {
            this.takeEnergyFrom(closestSource);
        } else {
            this.idle();
        }
    };

    this.fillMyStructuresWithEnergy = function () {
        const closestStructure = this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            filter: structure => {
                return (
                    (structure.structureType === STRUCTURE_EXTENSION ||
                        structure.structureType === STRUCTURE_SPAWN ||
                        structure.structureType === STRUCTURE_TOWER) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                );
            }
        });

        if (closestStructure) {
            if (this.transfer(closestStructure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.moveTo(closestStructure, {visualizePathStyle: {stroke: "#ffffff"}});
            }

            return OK;
        }

        return ERR_FULL;
    };

    this.fillContainersWithEnergy = function () {
        const closestContainer = this.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: structure => {
                return (
                    (structure.structureType === STRUCTURE_CONTAINER ||
                        structure.structureType === STRUCTURE_STORAGE) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                );
            }
        });

        if (closestContainer) {
            if (this.transfer(closestContainer, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.moveTo(closestContainer, {visualizePathStyle: {stroke: "#ffffff"}});
            }

            return OK;
        }

        return ERR_FULL;
    };

    this.idle = function () {
        const afkFlag = Game.flags["AFK"];
        if (afkFlag) {
            this.moveTo(afkFlag);
        }

        this.say("💤");
    };
}.call(Creep.prototype));

// todo improve (.store)
const hasEnergyStorage = target => {
    return (
        target.structureType === STRUCTURE_SPAWN ||
        target.structureType === STRUCTURE_EXTENSION ||
        target.structureType === STRUCTURE_CONTAINER ||
        target.structureType === STRUCTURE_STORAGE
    );
};

const isEnergyMine = (creep, target) => {
    return creep.harvest(target) !== ERR_INVALID_TARGET;
};
