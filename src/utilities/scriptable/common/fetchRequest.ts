import type { RequestProperties } from "src/types/scriptable";

export async function fetchRequest(
	baseUrl: string,
	queryParameters: object,
	options: Partial<RequestProperties>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onRequest: (request: Request) => Promise<string | Image | Data | any>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onError: (response: { [key: string]: any }) => void = (response) => {
		throw new Error(response.data);
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<string | Image | Data | any> {
	try {
		const url = appendQueryParameter(baseUrl, queryParameters);
		const request = new Request(url);

		if (options) {
			Object.assign(request, options);
		}

		const response = await onRequest(request);

		const statusCode = request.response.statusCode;
		const isError = isClientError(statusCode) || isRedirection(statusCode) || isClientError(statusCode) || isServerError(statusCode);

		if (isError) {
			onError(response);
		}

		if (isResponseOk(statusCode)) {
			return response;
		}
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(error.message);
		} else {
			throw new Error(String(error));
		}
	}
}

function appendQueryParameter(baseUrl: string, parameters?: object): string {
	if (!parameters) return baseUrl;

	let hasQuery: boolean = baseUrl.includes("?");

	for (const key in parameters) {
		if (Object.prototype.hasOwnProperty.call(parameters, key)) {
			const value = parameters[key as keyof typeof parameters];

			if (value !== null && value !== undefined) {
				baseUrl += (hasQuery ? "&" : "?") + encodeURIComponent(key) + "=" + encodeURIComponent(value);
				hasQuery = true;
			}
		}
	}

	return baseUrl;
}

function isResponseOk(statusCode: number): boolean {
	return statusCode >= 200 && statusCode < 300;
}

function isRedirection(statusCode: number): boolean {
	return statusCode >= 300 && statusCode <= 399;
}

function isClientError(statusCode: number): boolean {
	return statusCode >= 400 && statusCode <= 499;
}

function isServerError(statusCode: number): boolean {
	return statusCode >= 500 && statusCode <= 599;
}
