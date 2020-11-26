import {getConfig, setConfig} from "../plugin-config";
import eventBus from "../utils/broadcast-channel-pubsub";

export const getActiveCountry = async () => (await getConfig('users'))?.country ?? null;

eventBus.on('country-set', async ({country, persist}) => {
    const config = await getConfig(null, true);
    if(!config?.users) return;

    config.users.country = country;

    if(persist) await setConfig(config);
});