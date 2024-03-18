export function handleError(error: unknown) {
	if (error instanceof Error) {
		return Error(error.message);
	} else {
		return Error(String(error));
	}
}
