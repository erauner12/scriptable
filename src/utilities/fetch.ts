export async function fetchRequest(
	url: string,
	options?: Partial<Request>
): Promise<Request> {
	try {
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
