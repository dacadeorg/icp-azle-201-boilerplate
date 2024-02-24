import { AuthClient } from "@dfinity/auth-client";

const IDENTITY_CANISTER_ID = "be2us-64aaa-aaaaa-qaabq-cai";
const IDENTITY_PROVIDER_URL = `http://localhost:4943/`;
const IDENTITY_PROVIDER_ENDPOINT = `#authorize`;
const IDENTITY_PROVIDER = `${IDENTITY_PROVIDER_URL}?canisterId=${IDENTITY_CANISTER_ID}${IDENTITY_PROVIDER_ENDPOINT}`;
const MAX_TTL = 7 * 24 * 60 * 60 * 1000 * 1000 * 1000;

export async function getAuthClient() {
    return await AuthClient.create();
}

export async function login() {
    const authClient = window.auth.client;

    const isAuthenticated = await authClient.isAuthenticated();

    if (!isAuthenticated) {
        await authClient?.login({
            identityProvider: IDENTITY_PROVIDER, 
            onSuccess: async () => {
                window.auth.isAuthenticated = await authClient.isAuthenticated(); 
                window.location.reload();
            }, 
            maxTimeToLive: MAX_TTL,
        });
    }
}

export async function logout() {
    const authClient = window.auth.client;
    authClient.logout();
    window.location.reload();
}