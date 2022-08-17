import axios from 'axios';
 
const starOrganization = async (account, id, starred, setStarred, setStarredDisabled, context) => {
	const [appState, dispatch] = context;	
	if(!account){const payload = {
		type: 'CONNECT_WALLET',
		payload: true
	};
	dispatch(payload);
	return; 
	}
	const signMessage = async () => {
		const message = 'OpenQ';
		const signature = await window.ethereum
			.request({
				method: 'personal_sign',
				params: [message, account]
			});
		return signature;
	};
	try {
		const response = await axios.get(`${process.env.NEXT_PUBLIC_AUTH_URL}/hasSignature?address=${account}`, { withCredentials: true });
		if (response.data.status===false) {
			const signature = await signMessage();
			await axios.post(`${process.env.NEXT_PUBLIC_AUTH_URL}/verifySignature`,
				{
					signature,
					address: account
				}, { withCredentials: true }
			);
		}


		setStarredDisabled(true);
		if (starred) {
			await appState.openQPrismaClient.unStarOrg(id, account);
			setStarred(false);
			setStarredDisabled(false);
		} else {
			await appState.openQPrismaClient.starOrg(id, account);
			setStarred(true);
			setStarredDisabled(false);
		}

		const payload = {
			type: 'RELOAD_NOW',
			payload: Date.now()
		};

		dispatch(payload);
	} catch (error) {
		console.error(error);
	}
 
};
export default starOrganization;