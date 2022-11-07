function download(filename, text) {
	const pom = document.createElement('a');

	pom.setAttribute(
		'href',
		'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
	);
	pom.setAttribute('download', filename);

	if (document.createEvent) {
		const event = document.createEvent('MouseEvents');
		event.initEvent('click', true, true);
		pom.dispatchEvent(event);
	} else {
		pom.click();
	}
}

window.addEventListener('DOMContentLoaded', () => {
	addEventListener('scroll', () => {
		localStorage.setItem('scroll', document.documentElement.scrollTop);
	});

	chrome.tabs.query(
		{
			active: true,
			currentWindow: true
		},
		(tabs) => {
			chrome.tabs.sendMessage(
				tabs[0].id,
				{ from: 'popup', subject: 'maps' },
				(maps) => {
					for (let map of maps) {
						const li = document.createElement('li');
						const span = document.createElement('span');
						const button = document.createElement('button');

						button.innerText = 'download';
						span.classList.toggle('map-name', true);
						span.innerText = map.name;
						li.append(span);
						li.append(button);

						button.addEventListener('click', () => {
							download(map.name + '.hbs', map.data);
						});

						document.querySelector('#maps').append(li);
					}

					document.documentElement.scrollTop = parseInt(
						localStorage.getItem('scroll') ?? '0'
					);
				}
			);
		}
	);
});
