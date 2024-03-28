export function handleError(error: unknown) {
	console.error(error);

	if (error instanceof Error) {
		return Error(error.message);
	} else {
		return Error(String(error));
	}
}
