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
					const downloadAllBtn = document.querySelector('#download-all');

					downloadAllBtn.addEventListener('click', () => {
						const zip = new JSZip();
						const folder = zip.folder('haxball-maps');

						maps.forEach(m => {
							folder.file(m.name.replaceAll('/', '_') + '.hbs', m.data);
						});

						zip.generateAsync({type:"blob"})
							.then((content) => {
								saveAs(content, "haxball-maps.zip");
							});
					})

					for (let map of maps) {
						const li = document.createElement('li');
						const span = document.createElement('span');
						const button = document.createElement('button');

						button.innerText = 'download .hbs';
						span.classList.toggle('map-name', true);
						span.innerText = map.name;
						li.append(span);
						li.append(button);

						button.addEventListener('click', () => {
							saveAs(new Blob([map.data], {type: "text/plain;charset=utf-8"}), map.name + '.hbs');
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
