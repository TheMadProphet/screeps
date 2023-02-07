(function () {
    this.buildRoad = function (from, to) {
        const path = this.findPath(from, to, {ignoreRoads: true, ignoreCreeps: true});

        for (const i in path) {
            const pos = path[i];

            if (to.x !== pos.x || to.y !== pos.y) {
                this.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
            }
        }
    };

    this.buildBiDirectionalRoad = function (pos1, pos2) {
        this.buildRoad(pos1, pos2);

        const fromPos1 = PathFinder.search(pos1, {pos: pos2, range: 1});
        const fromPos2 = PathFinder.search(pos2, {pos: pos1, range: 0});

        const path = [...fromPos1.path, ...fromPos2.path];
        for (const i in path) {
            const pos = path[i];

            if ((pos1.x !== pos.x || pos1.y !== pos.y) && (pos2.x !== pos.x || pos2.y !== pos.y)) {
                this.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
            }
        }
    };

    this.fillersAreEnabled = function () {
        return this.controller.level >= 4 && this.storage !== null && this.storage !== undefined;
    };

    this.hasEnergyEmergency = function () {
        if (!this.storage) return false;

        return this.storage.store.getUsedCapacity(RESOURCE_ENERGY) <= this.energyCapacityAvailable * 2;
    };

    this.drawVisuals = function () {
        const uiFlag = Game.flags["UI"];
        if (uiFlag) {
            const x = uiFlag.pos.x + 1;
            let y = uiFlag.pos.y;

            const progress = (this.controller.progress / this.controller.progressTotal).toFixed(2) * 100;
            this.visual.text(`Controller[${this.controller.level}]: ${progress}%`, x, y++, {
                align: "left",
                color: "#5a37cc",
                stroke: "#000000",
                strokeWidth: 0.1
            });
            this.drawRoleStats(x, y++, "upgrader");

            y++;
            this.visual.text(`Spawn: ${this.energyAvailable}/${this.energyCapacityAvailable}`, x, y++, {
                align: "left",
                color: "#e09107",
                stroke: "#000000",
                strokeWidth: 0.1
            });
            const storage = this.storage.store;
            this.visual.text(`Storage: ${(storage.getUsedCapacity(RESOURCE_ENERGY) / 1000).toFixed(2)}K`, x, y++, {
                align: "left",
                color: "#e09107",
                stroke: "#000000",
                strokeWidth: 0.1
            });
            if (this.hasEnergyEmergency()) {
                this.visual.text(`Emergency: ${this.hasEnergyEmergency()}`, x, y++, {
                    align: "left",
                    color: "#e09107",
                    stroke: "#000000",
                    strokeWidth: 0.1
                });
            }
            this.drawRoleStats(x, y++, "harvester");

            y++;
            this.drawRoleStats(x, y++, "builder");
            this.drawRoleStats(x, y++, "handyman");
        }
    };

    this.drawRoleStats = function (x, y, role) {
        let count = 0;
        if (this.spawn.creepsByRole[role]) {
            count = this.spawn.creepsByRole[role].length;
        }

        this.visual.text(`${role}: ${count}`, x, y, {
            align: "left",
            color: "#a6a6a6",
            stroke: "#000000",
            strokeWidth: 0.05
        });
    };
}.call(Room.prototype));

Object.defineProperty(Room.prototype, "spawn", {
    get: function () {
        if (!this._spawn) {
            if (!this.memory.spawnId) {
                this.memory.spawnId = this.find(FIND_MY_SPAWNS)[0].id;
            }
            this._spawn = Game.getObjectById(this.memory.spawnId);
        }

        return this._spawn;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, "availableExtension", {
    get: function () {
        if (!this._availableExtension) {
            this._availableExtension = getAvailableStructure(this, STRUCTURE_EXTENSION);
        }

        return this._availableExtension;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, "constructionSites", {
    get: function () {
        if (!this._constructionSites) {
            this._constructionSites = this.find(FIND_MY_CONSTRUCTION_SITES);
        }

        return this._constructionSites;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, "rawSources", {
    get: function () {
        if (!this._rawSources) {
            if (!this.memory.rawSourceIds) {
                this.memory.rawSourceIds = this.find(FIND_SOURCES).map(source => source.id);
            }
            this._rawSources = this.memory.rawSourceIds.map(id => Game.getObjectById(id));
        }

        return this._rawSources;
    },
    enumerable: false,
    configurable: true
});

function getAvailableStructure(room, structureType) {
    const currentlyBuilt = room.find(FIND_MY_STRUCTURES, {
        filter: structure => structure.structureType === structureType
    }).length;

    const maxAvailable = getMaxStructureForController(structureType, room.controller.level);

    return maxAvailable - currentlyBuilt;
}

const getMaxStructureForController = (structureType, controllerLevel) => {
    switch (structureType) {
        case STRUCTURE_EXTENSION:
            if (controllerLevel <= 1) return 0;
            if (controllerLevel === 2) return 5;
            return (controllerLevel - 2) * 10;
    }
};
