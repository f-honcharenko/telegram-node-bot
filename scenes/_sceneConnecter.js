const userScene = require('./userScene');
const moderScene = require('./moderScene');
const workerScene = require('./workerScene');
const adminScene = require('./adminScene');
const myFormsScene = require('./myFormsScene');
const groupChatScene = require('./groupChatScene');
const createFormScene = require('./createFormScene');

const scenes = [
    userScene,
    moderScene,
    workerScene,
    adminScene,
    myFormsScene,
    groupChatScene,
    createFormScene,
];

module.exports = scenes;