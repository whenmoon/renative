import { configurePlugins, overrideTemplatePlugins } from '../core/pluginManager';
import { logTask } from '../core/systemManager/logger';
import { parseRenativeConfigs,
    fixRenativeConfigsSync,
    configureRnvGlobal,
    checkIsRenativeProject, configureRuntimeDefaults, generateRuntimeConfig } from '../core/configManager/configParser';
import { applyTemplate, checkIfTemplateInstalled, configureEntryPoints } from '../core/templateManager';
import { checkCrypto } from '../core/systemManager/crypto';
import { checkAndMigrateProject } from '../core/projectManager/migrator';
import { TASK_INSTALL, TASK_PROJECT_CONFIGURE, TASK_TEMPLATE_APPLY, TASK_APP_CONFIGURE } from '../core/constants';
import { checkAndCreateProjectPackage, copyRuntimeAssets } from '../core/projectManager/projectParser';
import { executeTask } from '../core/engineManager';


export const taskRnvProjectConfigure = async (c, parentTask, originTask) => {
    logTask('taskRnvPlatformConfigure', `parent:${parentTask} origin:${originTask}`);

    await checkAndMigrateProject(c);
    await parseRenativeConfigs(c);
    await checkIsRenativeProject(c);
    await checkAndCreateProjectPackage(c);
    await configureRnvGlobal(c);
    await checkIfTemplateInstalled(c);
    await fixRenativeConfigsSync(c);
    await executeTask(c, TASK_INSTALL, TASK_PROJECT_CONFIGURE, originTask);
    await checkCrypto(c, parentTask, originTask);
    await configureRuntimeDefaults(c);

    if (originTask !== TASK_TEMPLATE_APPLY) {
        await applyTemplate(c);
        await configureRuntimeDefaults(c);
        await configurePlugins(c);
        await executeTask(c, TASK_INSTALL, TASK_PROJECT_CONFIGURE, originTask);
        await executeTask(c, TASK_APP_CONFIGURE, TASK_PROJECT_CONFIGURE, originTask);
        await copyRuntimeAssets(c);
        await configureEntryPoints(c);
        await generateRuntimeConfig(c);
        await overrideTemplatePlugins(c);
    }

    return true;
};

export default {
    description: 'Configure current project',
    fn: taskRnvProjectConfigure,
    task: TASK_PROJECT_CONFIGURE,
    params: [],
    platforms: [],
};
