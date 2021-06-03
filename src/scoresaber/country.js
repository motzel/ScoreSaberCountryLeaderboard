import {getConfig, setConfig} from "../plugin-config";
import eventBus from "../utils/broadcast-channel-pubsub";

export const getActiveCountry = async () => (await getConfig('users'))?.country ?? null;

eventBus.on('country-set', async ({country, persist, reload}) => {
    const config = await getConfig(null, true);
    if(!config?.users) return;

    config.users.country = country;

    if(persist) await setConfig(config);
    if (reload) eventBus.publish('reload-browser-cmd');
});