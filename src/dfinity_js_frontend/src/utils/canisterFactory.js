import { HttpAgent, Actor, getManagementCanister } from "@dfinity/agent";
// declarations
import { idlFactory as marketPlaceIdl } from "../../../declarations/dfinity_js_backend/dfinity_js_backend.did.js";
import { idlFactory as ledgerIdl } from "../../../declarations/ledger_canister/ledger_canister.did.js";

// Canister IDs
const MARKETPLACE_CANISTER_ID = "bkyz2-fmaaa-aaaaa-qaaaq-cai";
const LEDGER_CANISTER_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai";
// Provider config
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