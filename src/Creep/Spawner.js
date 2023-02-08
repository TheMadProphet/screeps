const Body = require("Creep/Body");

const basicParts = [WORK, CARRY, MOVE];

/**
 * @param {RoomPosition} start
 * @param {RoomPosition} end
 */
function extraCreepCountForDistance(start, end) {
    const distance = start.findPathTo(end).length;

    return Math.trunc(distance / 15);
}

(function () {
    /** @type {Object.<string, Creep[]>} */
    this.creepsByRole = {};

    this.automate = function () {
        this.creepsByRole = {};
        for (const name in Memory.creeps) {
            const creep = Game.creeps[name];
            if (!creep) {
                delete Memory.creeps[name];
                console.log("Clearing non-existing creep memory:", name);
            } else {
                const creeps = this.creepsByRole[creep.memory.role];
                if (!creeps) {
                    this.creepsByRole[creep.memory.role] = [creep];
                } else {
                    creeps.push(creep);
                }
            }
        }

        this.spawnRoles();
        this.displayVisuals();
    };

    /**
     * @param {Body} body
     * @param memory
     */
    this.spawn = function (body, memory) {
        const creepName = `${memory.role}[${body.cost()}]`;
        const spawnStatus = this.spawnCreep(body.getParts(), creepName + `(${Game.time})`, {memory});

        if (spawnStatus === ERR_NOT_ENOUGH_ENERGY) {
            this.memory.hasEnoughEnergy = false;
            this.memory.wantsToSpawn = creepName;
        }

        return spawnStatus;
    };

    this.displayVisuals = function () {
        if (!this.memory.hasEnoughEnergy) {
            this.room.visual.text(`🪫`, this.pos.x, this.pos.y - 1);
        }

        if (this.spawning) {
            this.room.visual.text(`🛠 ${this.spawning.name}`, this.pos.x + 1, this.pos.y, {align: "left"});
        }
    };

    this.canBeUsedAsStorage = function () {
        return this.memory.hasEnoughEnergy && this.store.getUsedCapacity(RESOURCE_ENERGY) > 50;
    };

    this.spawnRoles = function () {
        this.memory.hasEnoughEnergy = true;
        Body.maxEnergy = this.room.energyCapacityAvailable;

        this.spawnFillers();
        this.spawnHandymen();
        this.spawnUpgraders();
        this.spawnBuilders();
        this.spawnHarvesters();
    };

    this.spawnHarvesters = function () {
        const sources = this.room.memory.sources;

        _.forEach(sources, source => {
            source.assignedWorkers = [];
        });

        _.forEach(this.creepsByRole["harvester"], harvester => {
            const assignedSource = harvester.memory.assignedSource;

            if (assignedSource && sources[assignedSource]) {
                sources[assignedSource].assignedWorkers.push(harvester);
            }
        });

        _.forEach(sources, (sourceMemory, sourceId) => {
            if (sourceMemory.assignedWorkers.length < sourceMemory.maxWorkerCount) {
                const body = new Body(this).addParts(basicParts, 6);
                this.spawn(body, {role: "harvester", assignedSource: sourceId});
            }
        });
    };

    this.spawnBuilders = function () {
        if (this.room.constructionSites.length) {
            const builders = this.creepsByRole["builder"];
            const maxBuilders = 2;
            if (!builders || !builders.length || builders.length < maxBuilders) {
                const body = new Body(this).addParts(basicParts, 5);
                this.spawn(body, {role: "builder"});
            }
        }
    };

    this.spawnUpgraders = function () {
        const controller = this.room.controller;
        const upgraders = this.creepsByRole["upgrader"];

        let maxUpgraders = 3 + extraCreepCountForDistance(this.pos, controller.pos);
        if (controller.level === 1 || this.room.availableExtension > 0 || this.room.constructionSites.length > 0) {
            maxUpgraders = 1;
        } else if (controller.level === 2) {
            maxUpgraders = 3;
        }

        maxUpgraders = 1; // todo
        if (!upgraders || !upgraders.length || upgraders.length < maxUpgraders) {
            const body = new Body(this).addParts([WORK, WORK, WORK, CARRY, MOVE, MOVE], 2).addParts(basicParts, 2);
            this.spawn(body, {role: "upgrader"});
        }
    };

    this.spawnFillers = function () {
        if (this.room.fillersAreEnabled()) {
            const fillers = this.creepsByRole["filler"];
            const maxFillers = 1;

            if (!fillers || !fillers.length || fillers.length < maxFillers) {
                const body = new Body(this).addParts([CARRY, CARRY, MOVE], 7);
                this.spawn(body, {role: "filler"});
            }
        }
    };

    this.spawnHandymen = function () {
        const handymen = this.creepsByRole["handyman"];
        if (this.room.controller.level >= 2 && (!handymen || !handymen.length)) {
            const body = new Body(this).addParts(basicParts, 3);
            this.spawn(body, {role: "handyman"});
        }
    };
}.call(StructureSpawn.prototype));
