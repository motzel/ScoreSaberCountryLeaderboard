import {getConfig} from "../plugin-config";
import eventBus from "../utils/broadcast-channel-pubsub";
import {getCacheAndConvertIfNeeded, setCache} from "../store";

export const getActiveCountry = async () => {
    const country = (await getConfig('users'))?.country ?? null;

    return country;
}

eventBus.on('country-set', async ({country, persist}) => {
    const data = await getCacheAndConvertIfNeeded();
    if(!data?.config?.users) return;

    data.config.users.country = country;

    if(persist) await setCache(data);
})

eventBus.on('reload-browser-cmd', () => {
    window.location.reload();
})