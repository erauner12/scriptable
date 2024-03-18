export async function fetchRequest(
	baseUrl: string,
	queryParameters?: Object,
	options?: Partial<Request>
): Promise<Request> {
	try {
		const url = appendQueryParameter(baseUrl, queryParameters);
		const request = new Request(url);

		if (options && options.method) request.method = options.method;
		if (options && options.body) request.body = options.body;
		if (options && options.headers) request.headers = options.headers;
		if (options && options.onRedirect) request.onRedirect = options.onRedirect;
		if (options && options.allowInsecureRequest)
			request.allowInsecureRequest = options.allowInsecureRequest;
		if (options && options.timeoutInterval)
			request.timeoutInterval = options.timeoutInterval;

		return request;
	} catch (error) {
		if (error instanceof Error) {
			throw error;
		} else {
			throw new Error(String(error));
		}
	}
}

function appendQueryParameter(
	baseUrl: string,
	parameters?: Record<string, any>
): string {
	if (!parameters) return baseUrl;

	let hasQuery: boolean = baseUrl.includes("?");

	for (const key in parameters) {
		if (parameters.hasOwnProperty(key)) {
			const value = parameters[key];

			if (value !== null && value !== undefined) {
				baseUrl +=
					(hasQuery ? "&" : "?") +
					encodeURIComponent(key) +
					"=" +
					encodeURIComponent(value.toString());
			}
		}
	}

	return encodeURI(baseUrl);
}
