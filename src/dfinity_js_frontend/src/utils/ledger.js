import { AccountIdentifier } from "@dfinity/nns"; 

export async function transferICP(sellerAddress, amount, memo) {
    const canister = window.canister.ledger;
    const account = AccountIdentifier.fromHex(sellerAddress);
    const result = await canister.transfer({
        to: account.toUint8Array(), 
        amount: { e8s: amount }, 
        memo, 
        fee: { e8s: 10_000n },
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

    return e8sToIcpDecimal(balance?.e8s);
}

const E8S_PER_ICP = BigInt(100000000n);

export function e8sToIcpDecimal(e8sBigInt) {
    // Convert the e8s value to a decimal string representation of ICP
    const icpString = (e8sBigInt / E8S_PER_ICP).toString() + '.' + (e8sBigInt % E8S_PER_ICP).toString().padStart(8, '0');
    
    // Remove trailing zeros from the fractional part
    const formattedIcpString = icpString.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.$/, "");
    
    return formattedIcpString;
}

export function DecimalToIcpe8s(amount) {
    const [integral, fractional] = `${amount}`.split(".");  
  
    if ((fractional ?? "0").length > 8) {  
        throw new Error("More than 8 decimals not supported.");  
    }  
    
    return (  
        BigInt(integral ?? 0) * E8S_PER_ICP +  BigInt((fractional ?? "0").padEnd(8, "0"))
    );
}