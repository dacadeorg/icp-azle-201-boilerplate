import { AccountIdentifier } from "@dfinity/nns"; 

export async function transferICP(sellerAddress, amount, memo) {
    const canister = window.canister.ledger;
    const account = AccountIdentifier.fromHex(sellerAddress);
    const result = await canister.transfer({
        to: account.toUint8Array(), 
        amount: { e8s: amount }, 
        memo, 
        fee: { e8s: 10000n },
        from_subaccount: [], 
        created_at_time: []
    });

    // check errors: InsufficientFunds
    if ('Err' in result) {
        console.log(`Error transferring: ${result.Err}`);
        throw result.Err;
    }

    // result.Ok = blockIdx
    return result.Ok; 
}

export async function balance() {
    const ledgerCanister = window.canister.ledger;
    const accountId = await window.canister.marketplace.getAddressFromPrincipal(window.auth.principal);

    const balance = await ledgerCanister.account_balance_dfx({account: accountId});
    console.log(`Principal: ${window.auth.principal}. Account: ${accountId}. balance ${balance.e8s}`)

    // return (balance?.e8s / BigInt(100000000n)).toString();
    // return balance?.e8s.toString();
    return e8sToIcpDecimal(balance?.e8s);
}

export function e8sToIcpDecimal(e8sBigInt) {
    // Convert the e8s value to a decimal string representation of ICP
    const icpString = (e8sBigInt / BigInt(1e8)).toString() + '.' + (e8sBigInt % BigInt(1e8)).toString().padStart(8, '0');
    
    // Remove trailing zeros from the fractional part
    const formattedIcpString = icpString.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.$/, "");
    
    return formattedIcpString;
}