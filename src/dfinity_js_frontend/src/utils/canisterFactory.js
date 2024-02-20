import { HttpAgent, Actor, getManagementCanister } from "@dfinity/agent";
// declarations
// import { idlFactory as marketPlaceIdl} from ""
// import { idlFactory as ledgerIdl} from ""

const MARKETPLACE_CANISTER_ID = "";
const LEDGER_CANISTER_ID = "";
const PROVIDER_HOST = "localhost";
const PROVIDER_PORT = "4943";
const PROVIDER = `http://${PROVIDER_HOST}:${PROVIDER_PORT}`;

export async function getMarketplaceCanister() {
    return await getCanister(MARKETPLACE_CANISTER_ID, marketPlaceIdl);
};

export async function getLedgerCanister() {
    return await getCanister(LEDGER_CANISTER_ID, ledgerIdl);
}

async function getCanister(canisterId, idl) {
    const authClient = window.auth.client; 
    const agent = new HttpAgent({
        host: PROVIDER, 
        identity: authClient.getIdentity()
    });
    await agent.fetchRootKey(); // needed for testing on local env
    return Actor.createActor(idl, {
        agent, 
        canisterId,
    });
}