const getCurrentTab = async () => {
	const tabsQuery = { active: true, currentWindow: true };
	return (await chrome.tabs.query(tabsQuery))[0];
};

const getAllMaps = async () => {
	const message = { from: 'popup', subject: 'maps' };
	const tab = await getCurrentTab();
	return chrome.tabs.sendMessage(tab.id, message);
};

const createMapLiEl = ({ name, data }) => {
	const li = document.createElement('li');
	const span = document.createElement('span');
	const button = document.createElement('button');

	button.innerText = '.hbs';
	span.classList.toggle('map-name', true);
	span.textContent = name;
	li.append(span);
	li.append(button);

	li.addEventListener('click', () => {
		saveAs(
			new Blob([data], {
				type: 'text/plain;charset=utf-8'
			}),
			name + '.hbs'
		);
	});

	return li;
};

const onDOMContentLoaded = async () => {
	const searchBoxInEl = document.getElementById('search-box');
	const downloadAllBtnEl = document.getElementById('download-all');
	const mapsUlEl = document.getElementById('maps');
	const maps = await getAllMaps();

	searchBoxInEl.addEventListener('input', ({ target }) => {
		const mapsEls = [...document.querySelectorAll('li span')];
		const searchQuery = target.value.trim().toLowerCase();
		const searchTerms = searchQuery.split(' ');

		mapsEls.forEach((mapEl) => {
			const mapTitle = mapEl.textContent.toLowerCase();
			const visible =
				searchQuery === '' ||
				searchTerms.every((k) => mapTitle.includes(k));
			mapEl.parentElement.classList.toggle('hidden', !visible);
		});
	});

	downloadAllBtnEl.addEventListener('click', async () => {
		const zip = new JSZip();
		const folder = zip.folder('haxball-maps');

		maps.forEach(({ name, data }) =>
			folder.file(name.replaceAll('/', '_') + '.hbs', data)
		);

		const content = await zip.generateAsync({ type: 'blob' });
		saveAs(content, 'haxball-maps.zip');
	});

	maps.forEach((map) => mapsUlEl.append(createMapLiEl(map)));

	document.documentElement.scrollTop = parseInt(
		localStorage.getItem('scroll') ?? '0'
	);
};

const onScroll = () => {
	const { scrollTop } = document.documentElement;
	localStorage.setItem('scroll', scrollTop);
};

window.addEventListener('DOMContentLoaded', onDOMContentLoaded);
window.addEventListener('scroll', onScroll);
