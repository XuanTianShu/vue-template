// proxy.js (Single-File I/O Version with CWD support - ES Module Syntax)
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

// Get __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// IO file path (relative to skill directory)
const IO_FILE = path.join(__dirname, 'io.json');
const SKILL_DIR = __dirname;

// Helper function to check if a command exists in PATH
function which(cmd) {
    const processEnv = process.env;
    // On Windows, PATHEXT is a list of extensions to check.
    // On other systems, we can default to an empty array.
    const pathExt = (processEnv.PATHEXT || '').split(';').filter(Boolean);
    const paths = (processEnv.PATH || '').split(path.delimiter);

    // Check if the command itself is a path that exists
    if (fs.existsSync(cmd)) {
        return cmd;
    }

    for (const p of paths) {
        const fullPath = path.join(p, cmd);
        
        // Check for the command without any extension
        if (fs.existsSync(fullPath) && !fs.statSync(fullPath).isDirectory()) {
            return fullPath;
        }

        // Check for the command with each extension
        for (const ext of pathExt) {
            const extPath = fullPath + ext;
            if (fs.existsSync(extPath)) {
                return extPath;
            }
        }
    }
    return null;
}

// Clean command line to extract only the actual command without any injected environment variables
function cleanCommandLine(cmdLine) {
    // A more robust way to handle potentially polluted command lines.
    // This regex looks for patterns like 'VAR=value' at the start of the string.
    const cleaned = cmdLine.replace(/^([A-Z_]+\s*=\s*".*?"\s+|[A-Z_]+\s*=\s*'.*?'\s+|[A-Z_]+\s*=\s*[\S]+\s+)*/, '');
    
    // Now, find the first part of the remaining string that is an executable.
    const parts = cleaned.trim().split(/\s+/);
    let commandIndex = -1;

    for (let i = 0; i < parts.length; i++) {
        // Build up a potential command path (e.g., "C:\Program Files\...")
        const potentialCmd = parts.slice(0, i + 1).join(' ');
        if (which(potentialCmd)) {
            commandIndex = i;
            // We found a potential executable, but let's see if a longer path also matches
            // This helps with commands that have spaces in their path.
        } else if (commandIndex !== -1) {
            // If we had a match but the current longer path doesn't match, the previous one was the real one.
            break;
        }
    }
    
    if (commandIndex !== -1) {
        // Reconstruct the command and its arguments
        const cmd = parts.slice(0, commandIndex + 1).join(' ');
        const args = parts.slice(commandIndex + 1);
        // Return the command in a way that exec can handle, with arguments separated.
        // For simplicity here, we'll just join them back. exec is smart enough.
        return [cmd, ...args].join(' ');
    }

    // Fallback to original if no executable part is found.
    return cmdLine;
}

// Initialize IO file if it doesn't exist
function initIOFile() {
    if (!fs.existsSync(IO_FILE)) {
        const initialState = { status: 'idle', result: null };
        fs.writeFileSync(IO_FILE, JSON.stringify(initialState, null, 2), 'utf8');
        console.log('[proxy.js] Initialized io.json');
    }
}

// Main polling loop
function startPolling() {
    console.log('[proxy.js] Proxy server started. Waiting for commands...');
    
    setInterval(() => {
        try {
            const raw = fs.readFileSync(IO_FILE, 'utf8');
            const data = JSON.parse(raw);

            if (data.status === 'pending') {
                console.log('[proxy.js] Received command:', data.command_line);
                
                // Update status to processing
                const processingState = { status: 'processing', ...data };
                fs.writeFileSync(IO_FILE, JSON.stringify(processingState, null, 2), 'utf8');

                // Execute the command
                const cleanCmd = cleanCommandLine(data.command_line);
                const cwd = data.cwd ? path.resolve(SKILL_DIR, data.cwd) : SKILL_DIR;
                const execOptions = { cwd: cwd };

                console.log(`[proxy.js] Executing: ${cleanCmd} (cwd: ${cwd})`);

                exec(cleanCmd, execOptions, (error, stdout, stderr) => {
                    const resultPayload = {
                        status: 'completed',
                        result: {
                            stdout: stdout,
                            stderr: stderr,
                            exit_code: error ? error.code : 0
                        }
                    };
                    fs.writeFileSync(IO_FILE, JSON.stringify(resultPayload, null, 2), 'utf8');
                    console.log('[proxy.js] Command completed. Result written to io.json');
                });
            }
        } catch (err) {
            // Ignore JSON parse errors, file is likely being written to
        }
    }, 500); // Poll every 500ms
}

// Start
initIOFile();
startPolling();