#!/usr/bin/env node
import * as http from 'http';

const args = process.argv.slice(2);
const command = args[0] || 'help';

const PORT = 41738;
const HOST = '127.0.0.1';

function postEvent(type: string, tool: string, message?: string) {
  const payload = JSON.stringify({
    type,
    tool,
    message: message || `Emitted from CLI: ${type}`
  });

  const req = http.request(
    {
      hostname: HOST,
      port: PORT,
      path: '/event',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    },
    res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        console.log(`[CodePet] Event '${type}' dispatched successfully.`);
      });
    }
  );

  req.on('error', err => {
    console.error(`[CodePet Error] Could not connect to running CodePet instance: ${err.message}`);
    console.error('Make sure CodePet desktop application is running.');
  });

  req.write(payload);
  req.end();
}

function checkStatus() {
  const req = http.get({ hostname: HOST, port: PORT, path: '/status' }, res => {
    let data = '';
    res.on('data', chunk => (data += chunk));
    res.on('end', () => {
      console.log(`[CodePet Status]: ${data}`);
    });
  });

  req.on('error', err => {
    console.error(`[CodePet Status] App is not reachable: ${err.message}`);
  });
}

function showHelp() {
  console.log(`
🐾 CodePet CLI Companion

Usage:
  codepet emit <EVENT_TYPE> [--tool <tool-name>] [--message <text>]
  codepet status
  codepet help

Examples:
  codepet emit BUILD_SUCCESS --tool claude-code
  codepet emit BUILD_FAILED --message "Syntax error on line 42"
  codepet emit TEST_PASSED --tool vitest
  codepet emit THINKING --tool cursor
  codepet emit CELEBRATING --message "Shipped v1.0!"
`);
}

switch (command) {
  case 'emit': {
    const eventType = args[1] || 'MANUAL_INTERACTION';
    let tool = 'generic-cli';
    let message: string | undefined = undefined;

    for (let i = 2; i < args.length; i++) {
      if (args[i] === '--tool' && args[i + 1]) {
        tool = args[i + 1];
        i++;
      } else if (args[i] === '--message' && args[i + 1]) {
        message = args[i + 1];
        i++;
      }
    }

    postEvent(eventType, tool, message);
    break;
  }
  case 'status':
  case 'ping':
    checkStatus();
    break;
  case 'help':
  default:
    showHelp();
    break;
}
