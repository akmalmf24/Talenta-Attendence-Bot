import axios from "axios";


export async function sendText(to, text) {
	try {
		await axios.post(process.env.NOTIFY_URL, {
			target: to,
			message: text,
		});
	} catch (err) {
		console.error("Notify Error:", err.response?.data || err.message);
	}
}