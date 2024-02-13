export async function getData(url: string) {
	const request = new Request(url);
	const response = await request.loadJSON();
	return response;
}
