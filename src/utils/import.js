export default function importDataHandler(e, onError = null, onImportCompleted = null) {
    const file = e.target.files[0];
    if (!file) {
        return;
    }
    if (file.type !== 'application/json') {
        if (onError) onError('Wybierz plik JSON zawierający eksport danych');
        return;
    }

    const reader = new FileReader();

    reader.onload = async function (e) {
        try {
            const json = JSON.parse(e.target.result);

            if (!json || !json.version || !json.lastUpdated || !json.users) {
                if (onError) onError('Niepoprawny plik eksportu');
                return;
            }

            if (json.version < 1.2) {
                if (onError) onError('Import pliku ze starszej wersji pluginu nie jest wspierany');
                return;
            }

            if (onImportCompleted) await onImportCompleted(json);
        } catch (_) {
            if (onError) onError('Nieprawidłowy plik JSON');
        }
    };

    reader.readAsText(file);
}