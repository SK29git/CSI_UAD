import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');
const CONFIG_FILE = resolve(ROOT_DIR, 'src/data/orchestratorConfig.json');
const USERS_FILE = resolve(ROOT_DIR, 'src/data/departmentUsers.js');

/**
 * Read the current orchestrator configuration
 */
export function getOrchestratorConfig() {
  try {
    if (existsSync(CONFIG_FILE)) {
      const raw = readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[Orchestrator] Error reading config:', err.message);
  }
  return null;
}

/**
 * Save configuration to disk and synchronize legacy files
 */
export function saveOrchestratorConfig(newConfig, adminUser = 'Admin') {
  if (!newConfig || typeof newConfig !== 'object') {
    throw new Error('Invalid configuration object');
  }

  const updated = {
    ...newConfig,
    lastUpdated: new Date().toISOString(),
    lastUpdatedBy: adminUser
  };

  // 1. Write orchestratorConfig.json
  writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');

  // 2. Synchronize src/data/departmentUsers.js if users are present
  if (Array.isArray(updated.users)) {
    try {
      const code = `/**
 * AGMC Department Users List - Managed by Orchestrator Portal
 * Last Updated: ${updated.lastUpdated} by ${adminUser}
 */

export const DEPARTMENT_USERS = ${JSON.stringify(updated.users, null, 2)};

export function getUsersByDepartment(deptName) {
  if (!deptName) return DEPARTMENT_USERS;
  const target = String(deptName).toLowerCase().trim();
  return DEPARTMENT_USERS.filter((u) => {
    const dType = (u.departmentType || '').toLowerCase();
    const dDesc = (u.departmentDescription || '').toLowerCase();
    if (target === 'service') {
      return dType.includes('serv') || dDesc.includes('serv') || dDesc.includes('workshop');
    }
    if (target === 'sales') {
      return dType.includes('sale') || dDesc.includes('sale') || dDesc.includes('showroom');
    }
    if (target === 'parts') {
      return dType.includes('part') || dDesc.includes('part');
    }
    if (target === 'business development centre' || target === 'bdc') {
      return dType.includes('bdc') || dDesc.includes('bdc') || dDesc.includes('business dev');
    }
    if (target === 'accounts' || target === 'finance') {
      return dType.includes('account') || dDesc.includes('account') || dDesc.includes('finance');
    }
    if (target === 'balance sheet') {
      return dType.includes('balance') || dDesc.includes('balance') || dDesc.includes('sheet');
    }
    return dType.includes(target) || dDesc.includes(target);
  });
}
`;
      writeFileSync(USERS_FILE, code, 'utf-8');
    } catch (e) {
      console.warn('[Orchestrator] Failed to sync departmentUsers.js:', e.message);
    }
  }

  return updated;
}

/**
 * Commit and push changes to git origin
 */
export function publishToGit({ config, commitMessage, adminUser = 'SAdmin' }) {
  // 1. Save config first
  const saved = saveOrchestratorConfig(config, adminUser);

  // 2. Determine current branch
  let currentBranch = 'OrchestrationPortal';
  try {
    const branchOut = execSync('git rev-parse --abbrev-ref HEAD', { cwd: ROOT_DIR, encoding: 'utf-8' });
    currentBranch = branchOut.trim() || 'OrchestrationPortal';
  } catch (err) {
    console.warn('[Orchestrator] Could not determine branch:', err.message);
  }

  // 3. Format commit message
  const userPrefix = adminUser === 'MAdmin' ? '[MAdmin]' : '[SAdmin]';
  const cleanMsg = (commitMessage || 'Update orchestrator configuration')
    .replace(/^\[(SAdmin|MAdmin)\]\s*/i, '')
    .trim();
  const fullCommitMsg = `chore(orchestrator): ${userPrefix} ${cleanMsg}`;

  // 4. Run Git commands
  try {
    // Stage relevant files
    execSync('git add src/data/orchestratorConfig.json src/data/departmentUsers.js', { cwd: ROOT_DIR });
    
    // Commit
    const commitCmd = `git commit -m "${fullCommitMsg.replace(/"/g, '\\"')}"`;
    execSync(commitCmd, { cwd: ROOT_DIR });

    // Push to current branch on origin
    const pushCmd = `git push origin ${currentBranch}`;
    execSync(pushCmd, { cwd: ROOT_DIR });

    // Get latest commit hash
    const hash = execSync('git rev-parse --short HEAD', { cwd: ROOT_DIR, encoding: 'utf-8' }).trim();

    return {
      success: true,
      commitHash: hash,
      author: adminUser,
      branch: currentBranch,
      message: fullCommitMsg,
      timestamp: new Date().toISOString()
    };
  } catch (gitErr) {
    console.error('[Orchestrator] Git execution error:', gitErr.message);
    // If working tree clean or already committed, check hash
    try {
      const hash = execSync('git rev-parse --short HEAD', { cwd: ROOT_DIR, encoding: 'utf-8' }).trim();
      return {
        success: true,
        commitHash: hash,
        author: adminUser,
        branch: currentBranch,
        message: fullCommitMsg,
        timestamp: new Date().toISOString(),
        warning: 'Git reported: ' + (gitErr.stdout || gitErr.message)
      };
    } catch {
      throw new Error(gitErr.message || 'Git publish execution failed');
    }
  }
}
