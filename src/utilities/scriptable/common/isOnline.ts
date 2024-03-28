export async function isOnline(): Promise<boolean> {
	try {
		const webView = new WebView();
		const javaScript = "navigator.onLine";
		const response = await webView.evaluateJavaScript(javaScript);
		if (response) return true;
		return false;
	} catch (error) {
		return false;
	}
}
