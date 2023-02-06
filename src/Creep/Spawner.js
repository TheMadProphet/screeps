/**
 * @param {RoomPosition} start
 * @param {RoomPosition} end
 */
function extraCreepCountForDistance(start, end) {
    const distance = start.findPathTo(end).length;

    return Math.trunc(distance / 15);
}

function bodyCost(body) {
    let cost = 0;

    _.forEach(body, part => {
        switch (part) {
            case WORK:
                cost += 100;
                break;
            case CARRY:
            case MOVE:
                cost += 50;
        }
    });

    return cost;
}

function getBasicBody(maxEnergy) {
    const basicParts = [WORK, CARRY, MOVE];
    const basicPartFitCount = Math.trunc(maxEnergy / bodyCost(basicParts));

    let body = [];
    for (let i = 0; i < basicPartFitCount; i++) {
        body.push(...basicParts);
    }

    return body;
}

function getUpgraderBody(maxEnergy) {
    const upgraderPartsConfig = [WORK, WORK, WORK, CARRY, MOVE, MOVE];
    const upgraderPartsCost = bodyCost(upgraderPartsConfig);

    if (upgraderPartsCost > maxEnergy) {
        return getBasicBody(maxEnergy);
    }

    const upgraderPartFitCount = Math.trunc(maxEnergy / upgraderPartsCost);
    let body = getBasicBody(maxEnergy - upgraderPartsCost * upgraderPartFitCount);
    for (let i = 0; i < upgraderPartFitCount; i++) {
        body.push(...upgraderPartsConfig);
    }

    return body;
}

(function () {
    this.creepsByRole = {};

    this.automate = function () {
        this.creepsByRole = {};
        // todo try foreach here once done and tested
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

    this.spawn = function (body, memory) {
        const creepName = `${memory.role}[${bodyCost(body)}]`;
        const spawnStatus = this.spawnCreep(body, creepName + `(${Game.time})`, {memory});

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

    this.spawnRoles = function () {
        this.memory.hasEnoughEnergy = true;

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

        _.forEach(sources, (source, sourceId) => {
            if (source.assignedWorkers.length < source.maxWorkerCount) {
                const body = getBasicBody(this.room.energyCapacityAvailable);
                this.spawn(body, {role: "harvester", assignedSource: sourceId});
            }
        });
    };

    this.spawnBuilders = function () {
        if (this.room.constructionSites.length) {
            const builders = this.creepsByRole["builder"];
            const maxBuilders = this.room.controller.level;
            if (!builders || !builders.length || builders.length < maxBuilders) {
                const body = getBasicBody(this.room.energyCapacityAvailable);
                this.spawn(body, {role: "builder"});
            }
        }
    };

    this.spawnUpgraders = function () {
        const controller = this.room.controller;
        const upgraders = this.creepsByRole["upgrader"];

        let maxUpgraders = 3 + extraCreepCountForDistance(this.pos, controller.pos);
        if (controller.level === 1 || this.room.availableExtension > 0) {
            maxUpgraders = 1;
        } else if (controller.level === 2) {
            maxUpgraders = 3;
        }

        if (!upgraders || !upgraders.length || upgraders.length < maxUpgraders) {
            const body = getUpgraderBody(this.room.energyCapacityAvailable);
            this.spawn(body, {role: "upgrader"});
        }
    };

    this.spawnHandymen = function () {
        const handymen = this.creepsByRole["handyman"];
        if (this.room.controller.level >= 2 && (!handymen || !handymen.length)) {
            const body = getBasicBody(this.room.energyCapacityAvailable);
            this.spawn(body, {role: "handyman"});
        }
    };
}.call(StructureSpawn.prototype));
