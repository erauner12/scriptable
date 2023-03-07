// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: reply-all;
// share-sheet-inputs: url;
interface redirections {
	origin: Array<String>;
	alt: string;
}

const redirections: Array<redirections> = [
	{
		origin: ["reddit.com"],
		alt: "teddit.net",
	},
	{
		origin: ["twitter.com"],
		alt: "nitter.it",
	},
	{
		origin: ["instagram.com"],
		alt: "imginn.com",
	},
];

(async () => {
	const url = await getUrl();
	runScript(parseUrl(url, redirections));
})();

async function getUrl() {
	let url = args.urls[0];

	if (!url) {
		const alert = new Alert();
		alert.title = "URL to Redirect";
		alert.addTextField("URL", Pasteboard.paste());
		alert.addAction("Go");
		alert.addCancelAction("Cancel");
		let alertPressed = await alert.present();

		if (alertPressed === 0) {
			url = alert.textFieldValue(0);
		}

		if (alertPressed === -1) {
			Script.complete();
		}
	}

	return String(url);
}

function parseUrl(url: string, redirections: Array<redirections>) {
	let parsedUrl;

	if (url) {
		redirections.forEach((site) => {
			const checkingUrl = convertToPrivateUrl(url, site);

			if (checkingUrl) {
				parsedUrl = checkingUrl;
			}
		});
	}

	if (parsedUrl) {
		return String(parsedUrl);
	}
}

function convertToPrivateUrl(url: string, site: redirections) {
	const { origin: origins, alt } = site;

	let isOriginSite;
	let originSite;
	let privateUrl;

	Array(origins).forEach((origin) => {
		isOriginSite = url.includes(String(origin));

		if (isOriginSite) {
			originSite = origin;
		}
	});

	if (originSite) {
		privateUrl = url.replace(originSite, alt);
		return privateUrl;
	}
}

function runScript(url: string | undefined) {
	if (url) {
		Safari.open(url);
	}

	Script.complete();
}

function logAlert(message: string) {
	let alert = new Alert();
	alert.message = message;
	alert.present();
}
