const clientId = '1027664070993772594';
const DiscordRPC = require('discord-rpc');
const RPC = new DiscordRPC.Client({ transport: 'ipc' });

DiscordRPC.register(clientId);

let nowDate = Date.now();

async function setActivity() {
	const { SessionInfo } = await (
		await fetch('http://127.0.0.1:10101/api/v2/live-timing/state')
	).json();

	if (!RPC) return;
	RPC.setActivity({
		details: `Watching ${SessionInfo.Name} with MultiViewer for F1`,
		startTimestamp: nowDate,
		largeImageKey: 'f1mv_logo',
		largeImageText: 'Logo of F1MV',
		instance: false,
		buttons: [
			{
				label: `Download MultiViewer for F1 !`,
				url: 'https://multiviewer.app/download',
			},
		],
	});
}

RPC.on('ready', async () => {
	setActivity();

	setInterval(setActivity, 15000);
});

RPC.login({ clientId });
