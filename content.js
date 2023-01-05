function connectToDb(dbName) {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(dbName);

		request.onsuccess = (_) => {
			resolve(request.result);
		};

		request.onerror = (_) => {
			reject('error while opening db');
		};
	});
}

function dumpDbObjectStore(dbConn, storeName) {
	return new Promise((resolve, reject) => {
		const store = dbConn.transaction(storeName).objectStore(storeName);
		const request = store.openCursor();
		const items = [];

		request.onsuccess = (_) => {
			const cursor = request.result;
			if (cursor) {
				items.push(cursor.value);
				cursor.continue();
			} else {
				resolve(items);
			}
		};

		request.onerror = (_) => {
			reject('error while opening cursor');
		};
	});
}

async function main() {
	const dbConn = await connectToDb('stadiums');
	const files = await dumpDbObjectStore(dbConn, 'files');
	const meta = await dumpDbObjectStore(dbConn, 'meta');
	const maps = [];

	for (let i = 0; i < files.length; ++i)
		maps.push({ name: meta[i].name, data: files[i] });

	chrome.runtime.onMessage.addListener((msg, sender, response) => {
		if (msg.from === 'popup' && msg.subject === 'maps') {
			response(maps);
		}
	});
}

main();
