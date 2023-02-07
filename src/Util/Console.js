const consoleLog = console.log;

function apply() {
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

module.exports = {apply};
