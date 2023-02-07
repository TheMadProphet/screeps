const consoleLog = console.log;

/**
 * Override original console.log() and convert objects to JSON string
 */
function improveLog() {
    console.log = function (...dataList) {
        const transformedData = _.map(dataList, data => {
            if (typeof data === "object") {
                return JSON.stringify(data, undefined, "  ");
            } else {
                return data;
            }
        });

        consoleLog(transformedData.join(" "));
    };
}

module.exports = {improveLog};
