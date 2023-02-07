const roles = {
    harvester: require("Creep/Role/Harvester"),
    upgrader: require("Creep/Role/Upgrader"),
    builder: require("Creep/Role/Builder"),
    handyman: require("Creep/Role/Handyman")
};

(function () {
    this.runRole = function () {
        roles[this.memory.role].run(this);
    };

    this.findEnergyRepository = function () {
        if (this.room.hasEnergyEmergency()) return null;
        if (this.room.fillersAreEnabled()) return this.room.storage;

        const closestContainerWithEnergy = this.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: structure =>
                structure.structureType === STRUCTURE_CONTAINER && structure.store.getUsedCapacity() > 50
        });

        if (closestContainerWithEnergy) return closestContainerWithEnergy;

        const spawn = this.room.spawn;
        if (spawn.memory.hasEnoughEnergy && spawn.store.getUsedCapacity(RESOURCE_ENERGY) > 50) {
            return spawn;
        }

        return null;
    };

    this.withdrawEnergy = function () {
        const energyRepository = this.findEnergyRepository();
        if (energyRepository) {
            if (this.withdraw(energyRepository, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.moveTo(energyRepository, {visualizePathStyle: {stroke: "#ffaa00"}});
            }
        } else {
            this.idle();
        }
    };

    this.fillSpawnsWithEnergy = function () {
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
