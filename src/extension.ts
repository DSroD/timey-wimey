import * as vscode from 'vscode';
import * as fs from 'fs';
import { Timer } from './timer';

// TODO get from configuration
const INACTIVE_INTERVAL =    1000*(vscode.workspace.getConfiguration('timeyWimey').get('inactivityInterval') as number); // how long till user considered inactive
const IN_PROGRESS_INTERVAl = 1000*60*(vscode.workspace.getConfiguration('timeyWimey').get('sessionActiveInterval') as number); // how long till check no unexpected crash
const FILE_PATH = 'timey.txt';

// TODO think about how to handle pushing to git: cuz then the user hasnt ended yet. Maybe we can force the end to run before git add commit and then make another start after git finishes? 

var userName: string | undefined = undefined;

const progressTimer = new Timer(IN_PROGRESS_INTERVAl, recordInProgress);
const inactiveTimer = new Timer(INACTIVE_INTERVAL, recordEnd);


function initializeFile() {

	// check if file exists
	fs.access(FILE_PATH, fs.constants.F_OK, (err) => {
		if (err) {
			// File doesn't exist, so create it
			fs.writeFile(FILE_PATH, '', (err) => {
				if (err) {
					console.error('An error occurred while creating the file:', err);
				} else {
					console.log('File created successfully.');
				}
			});
		}
	});

	// check if file ends with in_progress
	fs.readFile(FILE_PATH, 'utf8', (err, data) => {
		if (err) {
			console.error('An error occurred while reading the file:', err);
			return;
		}

		if (data.endsWith('in_progress')) {
			// unexpected exit, append end

			const lines = data.split('\n');
			const lastLine = lines[lines.length - 1];
			const timestamp = lastLine.split(' ')[0];
			const endMail = lastLine.split(' ')[1];
			const endLine = `\n${timestamp} ${endMail} end`;

			fs.appendFile(FILE_PATH, endLine, (err) => {
				if (err) console.error('Error saving end time: ' + err);
			});
		}
	});
}

function recordInProgress() {
	// append in_progress to file with timestamp

	const timestamp = new Date().getTime();
	const progressLine = `\n${timestamp} ${userName} in_progress`;

	console.debug(progressLine);// TODO REMOVE

	fs.appendFile(FILE_PATH, progressLine, (err) => {
		if (err) console.error('Error saving progress time: ' + err);
	});

}

var currentlyActive = false;

function recordEnd() {
	// append end to file with timestamp

	const timestamp = new Date().getTime();
	const endLine = `\n${timestamp} ${userName} end`;

	console.debug(endLine);// TODO REMOVE

	fs.appendFile(FILE_PATH, endLine, (err) => {
		if (err) console.error('Error saving end time: ' + err);
	});

	currentlyActive = false;
	inactiveTimer.stop();
	progressTimer.stop();
}

function recordStart() {
	// append start to file with timestamp
	const timestamp = new Date().getTime();
	const startLine = `\n${timestamp} ${userName} start`;

	console.debug(startLine); // TODO REMOVE

	fs.appendFile(FILE_PATH, startLine, (err) => {
		if (err) console.error('Error saving start time: ' + err);
	});
	progressTimer.start();
	inactiveTimer.start();
	currentlyActive = true;
}

export function activate(context: vscode.ExtensionContext) {
	vscode.window.showInformationMessage('Hello World from vscode-extensions!');

	userName = 'userName'; //TODO prolly wont be possible from vscode api? maybe from config?

	initializeFile();
	
	// listen to input
	vscode.workspace.onDidChangeTextDocument(event => {
		if (!currentlyActive) {
			recordStart();
		}
		else {
			inactiveTimer.reset();
		}
	});

}

export function deactivate() {
	recordEnd();
}
