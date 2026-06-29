const fs = require('fs');
const { JSDOM } = require('jsdom');
const jsdom = new JSDOM(`<!DOCTYPE html><html lang="zh-Hant"><head></head><body>
<canvas id="lineChart"></canvas>
<div id="segment-summary"></div>
<input type="number" id="maxTemp" value="1300">
<input type="number" id="timeExtendRate" value="60">
<button id="example1"></button>
<button id="example2"></button>
<button id="example3"></button>
<button id="example4"></button>
<button id="outdate"></button>
<button id="addSegment"></button>
<button id="removeSegment"></button>
<button id="test3"></button>
<button id="restartApp"></button>
<div id="error-message"></div>
</body></html>`, { runScripts: "dangerously" });

const window = jsdom.window;
global.window = window;
global.document = window.document;
global.Chart = class Chart {
    constructor(ctx, config) { this.canvas = window.document.getElementById('lineChart'); this.data = {datasets: [{data: []}]}; this.options = {scales:{x:{},y:{}}}; }
    static register() {}
    getElementsAtEventForMode() { return []; }
    getDatasetMeta() { return {data: []}; }
    update() {}
};
global.prompt = () => "123";
global.alert = () => {};

try {
    require('./script.js');
    console.log("Script executed without throwing");
} catch(e) {
    console.error("Error executing script:");
    console.error(e);
}
