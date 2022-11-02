"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.failedToLoadAPI = exports.failedToCreateNewInstance = void 0;
exports.failedToCreateNewInstance = new Error('An error occurred during the creation of the instance.');
exports.failedToLoadAPI = new Error('You can\'t run more than 1 instance of the DigiFlag. Please use the "Create a new instance" button.\nIf there is no other instance open please contact us on the GitHub repo or on the F1MV server.');
