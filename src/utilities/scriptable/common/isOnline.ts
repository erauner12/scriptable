import { fetchRequest } from "src/utilities/scriptable/common";

export async function isOnline(timeoutIntervalMs: number = 1000): Promise<boolean> {
	const url = "https://www.google.com";

	try {
		const timeoutIntervalSeconds = timeoutIntervalMs / 1000;
		const response = await fetchRequest(
			url,
			{},
			{ timeoutInterval: timeoutIntervalSeconds, method: "HEAD" },
			async (request) => await request.load(),
		);
		if (response) return true;
		return false;
	} catch (error) {
		return false;
	}
}
