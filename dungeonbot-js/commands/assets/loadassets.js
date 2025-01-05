const fs = require('fs').promises;
const path = require('path');
const process = require('process');

const TITLE_ASSETS_PATH = path.join(process.cwd(), './commands/assets/titleassets.json');

/**
 * Load json file from path and get object
 *
 * @param { string } title name of title
 * @returns { Object }
 */
async function loadTitleAssets(title) {
    try {
        const file = await fs.readFile(TITLE_ASSETS_PATH);
        const assets = JSON.parse(file);
        if (assets[title]) {
            return assets[title];
        } else {
            throw new Error('Could not load object with name: ' + title);
        }
    } catch (e) {
        console.log(e);
        return null;
    }
}

module.exports = loadTitleAssets;