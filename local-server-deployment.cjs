const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load ssh2 dynamically from local/global node_modules
let Client;
try {
    Client = require('ssh2').Client;
} catch (e) {
    const appData = process.env.APPDATA;
    if (appData) {
        const globalPath = path.join(appData, 'npm', 'node_modules', 'ssh2');
        try {
            Client = require(globalPath).Client;
        } catch (err) {
            // Fallback
        }
    }
}

if (!Client) {
    console.log("ssh2 package not found in paths. Attempting to install locally...");
    try {
        execSync('npm install ssh2', { stdio: 'inherit' });
        Client = require('ssh2').Client;
    } catch (installErr) {
        console.error("Could not install/load ssh2. Please run: npm install ssh2");
        process.exit(1);
    }
}

// Default ignore rules for unwanted files & folders
const DEFAULT_IGNORED_DIRS = new Set([
    'node_modules',
    '.git',
    '.svn',
    '.hg',
    'dist',
    'build',
    'out',
    'coverage',
    '.next',
    '.nuxt',
    '__pycache__',
    '.pytest_cache',
    '.mypy_cache',
    '.venv',
    'venv',
    'env',
    '.idea',
    '.vscode',
    'scratch',
    'temp',
    'tmp'
]);

const DEFAULT_IGNORED_FILES = new Set([
    '.DS_Store',
    'Thumbs.db',
    'local-server-pipeline.js',
    'local-server-pipeline.py',
    'local-server-deployment.js',
    'local-server-deployment.cjs',
    'dummy.py'
]);

// Ignored file extensions (archives, presentations, audio, and videos)
const IGNORED_EXTENSIONS = new Set([
    // Python bytecode and logs
    '.pyc',
    '.pyo',
    '.log',

    // Zip and archive files
    '.zip',

    // PPT / Presentation files
    '.ppt',
    '.pptx',
    '.pps',
    '.ppsx',
    '.pot',
    '.potx',

    // Audio files
    '.mp3',
    '.wav',
    '.m4a',
    '.aac',
    '.ogg',
    '.flac',
    '.wma',
    '.opus',
    '.aiff',

    // MP4 videos
    '.mp4',
    '.m4v'
]);

function shouldIgnore(name, isDirectory) {
    if (isDirectory) {
        return DEFAULT_IGNORED_DIRS.has(name);
    }

    // Always ignore .env files to prevent credential leakage
    if (name.startsWith('.env')) return true;

    // Check specific ignored filenames
    if (DEFAULT_IGNORED_FILES.has(name)) return true;

    // Check file extensions (case-insensitive)
    const ext = path.extname(name).toLowerCase();
    if (IGNORED_EXTENSIONS.has(ext)) return true;

    return false;
}

function runSSHCommand(conn, cmd) {
    return new Promise((resolve, reject) => {
        conn.exec(cmd, (err, stream) => {
            if (err) return reject(err);
            stream.on('close', (code) => {
                resolve(code);
            }).on('data', (data) => {
                process.stdout.write(data.toString());
            }).stderr.on('data', (data) => {
                process.stderr.write(data.toString());
            });
        });
    });
}

function ensureRemoteDir(sftp, remoteDir) {
    return new Promise((resolve, reject) => {
        sftp.stat(remoteDir, (err) => {
            if (!err) return resolve(); // Directory already exists

            // Create parent directory first if needed
            const parentDir = path.posix.dirname(remoteDir);
            if (parentDir && parentDir !== '.' && parentDir !== '/' && parentDir !== remoteDir) {
                ensureRemoteDir(sftp, parentDir)
                    .then(() => {
                        sftp.mkdir(remoteDir, (mkdirErr) => {
                            if (mkdirErr && mkdirErr.code !== 4) return reject(mkdirErr);
                            resolve();
                        });
                    })
                    .catch(reject);
            } else {
                sftp.mkdir(remoteDir, (mkdirErr) => {
                    if (mkdirErr && mkdirErr.code !== 4) return reject(mkdirErr);
                    resolve();
                });
            }
        });
    });
}

function uploadDirectoryDirect(sftp, localDir, remoteDir) {
    return new Promise(async (resolve, reject) => {
        try {
            await ensureRemoteDir(sftp, remoteDir);

            const tasks = [];

            function scan(currentLocal, currentRemote) {
                const entries = fs.readdirSync(currentLocal, { withFileTypes: true });

                for (const entry of entries) {
                    const isDir = entry.isDirectory();
                    if (shouldIgnore(entry.name, isDir)) {
                        continue;
                    }

                    const lPath = path.join(currentLocal, entry.name);
                    const rPath = path.posix.join(currentRemote, entry.name);

                    if (isDir) {
                        tasks.push({ type: 'mkdir', local: lPath, remote: rPath });
                        scan(lPath, rPath);
                    } else {
                        tasks.push({ type: 'upload', local: lPath, remote: rPath });
                    }
                }
            }

            console.log(`Scanning local workspace: ${localDir}...`);
            scan(path.resolve(localDir), remoteDir);
            console.log(`Found ${tasks.length} total items to sync (directories + files).`);

            for (const task of tasks) {
                if (task.type === 'mkdir') {
                    try {
                        await ensureRemoteDir(sftp, task.remote);
                    } catch (mkdirErr) {
                        console.warn(`Warning ensuring remote dir ${task.remote}: ${mkdirErr.message}`);
                    }
                } else if (task.type === 'upload') {
                    console.log(`Uploading: ${path.relative(localDir, task.local)} -> ${task.remote}`);
                    await new Promise((res, rej) => {
                        sftp.fastPut(task.local, task.remote, (uploadErr) => {
                            if (uploadErr) {
                                console.error(`Error uploading ${task.local}:`, uploadErr);
                                return rej(uploadErr);
                            }
                            res();
                        });
                    });
                }
            }

            resolve();
        } catch (err) {
            reject(err);
        }
    });
}

function main() {
    // Universally adapts to any codebase: uses the root directory from where the command is executed
    const workspaceRoot = process.cwd();

    // Connection credentials
    const config = {
        host: '172.23.4.50',
        username: 'innovation-center',
        password: 'Gkup@789'
    };
    const remoteDir = 'infra/authoring_tool';

    const conn = new Client();
    conn.on('ready', async () => {
        console.log('\nSSH Connection established successfully.');

        try {
            // Get home directory path 
            let homeDir = '';
            await new Promise((resolve) => {
                conn.exec('echo $HOME', (err, stream) => {
                    stream.on('data', (data) => {
                        homeDir += data.toString().trim();
                    }).on('close', resolve);
                });
            });

            const absoluteRemoteDir = `${homeDir}/${remoteDir}`;
            console.log(`Target remote directory: ${absoluteRemoteDir}`);

            // Ensure base target directory exists
            await runSSHCommand(conn, `mkdir -p ${absoluteRemoteDir}`);

            // Direct upload from workspace to remote SFTP
            await new Promise((resolve, reject) => {
                conn.sftp(async (err, sftp) => {
                    if (err) return reject(err);
                    try {
                        await uploadDirectoryDirect(sftp, workspaceRoot, absoluteRemoteDir);
                        resolve();
                    } catch (uploadErr) {
                        reject(uploadErr);
                    }
                });
            });

            // Grant execution permissions and fix Windows CRLF endings on remote shell scripts (*.sh)
            console.log('\nFixing line endings and setting execution permissions on shell scripts (*.sh)...');
            await runSSHCommand(conn, `find ${absoluteRemoteDir} -type f -name "*.sh" -exec sed -i -e 's/\\r$//' {} + -exec chmod +x {} + 2>/dev/null || true`);

            // Check if any Docker Compose file exists before attempting docker compose commands
            console.log('\nChecking for Docker Compose file in root...');
            const checkDockerCmd = `[ -f "${absoluteRemoteDir}/docker-compose.yml" ] || [ -f "${absoluteRemoteDir}/docker-compose.yaml" ] || [ -f "${absoluteRemoteDir}/compose.yml" ] || [ -f "${absoluteRemoteDir}/compose.yaml" ]`;
            const hasDockerCompose = (await runSSHCommand(conn, checkDockerCmd)) === 0;

            if (hasDockerCompose) {
                console.log('Docker Compose configuration found. Running containers...');
                const commands = [
                    `cd ${absoluteRemoteDir}`,
                    "docker compose down",
                    "docker compose up -d --build"
                ];
                const exitCode = await runSSHCommand(conn, commands.join(' && '));
                console.log(`\nRemote docker-compose finished with code: ${exitCode}`);
            } else {
                console.log('\nNo docker-compose file found in root. All files uploaded successfully; skipping container launch.');
            }

        } catch (err) {
            console.error('\nError running pipeline:', err);
        } finally {
            conn.end();
            console.log('\nSSH Connection closed.');
        }
    }).on('error', (err) => {
        console.error('Connection error:', err);
    }).connect(config);
}

main();
