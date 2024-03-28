import { fetchRequest } from "src/utilities/scriptable/common";

export async function isOnline(timeoutIntervalMs: number = 15): Promise<boolean> {
	const url = "https://www.google.com";

	try {
		const response = await fetchRequest(url, {}, { timeoutInterval: timeoutIntervalMs / 1000, method: "HEAD" }, async (request) =>
			request.load(),
		);
		if (response) return true;
		return false;
	} catch (error) {
		return false;
	}
}
