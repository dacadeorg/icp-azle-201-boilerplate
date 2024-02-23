# ICP Azle 201 Boilerplate

ICP Azle 201 Boilerplate is a comprehensive project setup designed to streamline your development process. It provides a solid foundation with pre-configured components to help you get started quickly.

## Features

- **React.js Setup:** The boilerplate comes with a well-structured React.js setup, making it easy to manage your frontend infrastructure.
- **ICP Canister:** ICP Canister integration is included, offering a powerful way to manage data and interactions on the Internet Computer.

**[Read the Getting Started Guide](link-to-your-tutorial)**

## Things to be explained in the course:
1. What is Ledger? More details here: https://internetcomputer.org/docs/current/developer-docs/integrations/ledger/
2. What is Internet Identity? More details here: https://internetcomputer.org/internet-identity
3. What is Principal, Identity, Address? https://internetcomputer.org/internet-identity | https://yumimarketplace.medium.com/whats-the-difference-between-principal-id-and-account-id-3c908afdc1f9
4. Canister-to-canister communication and how multi-canister development is done? https://medium.com/icp-league/explore-backend-multi-canister-development-on-ic-680064b06320

## Getting started

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/dacadeorg/icp-azle-201)

If you rather want to use GitHub Codespaces, click this button instead:

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/dacadeorg/icp-azle-201?quickstart=1)

**NOTE**: After deploying your canisters in GitHub Codespaces, run `./canister_urls.py` and click the links that are shown there.

[![Open locally in Dev Containers](https://img.shields.io/static/v1?label=Dev%20Containers&message=Open&color=blue&logo=visualstudiocode)](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/dacadeorg/icp-azle-201)

## How to deploy canisters implemented in the course

### Ledger canister
`./deploy-local-ledger.sh` - deploys a local Ledger canister. IC works differently when run locally so there is no default network token available and you have to deploy it yourself. Remember that it's not a token like ERC-20 in Ethereum, it's a native token for ICP, just deployed separately.
This canister is described in the `dfx.json`:
```
	"ledger_canister": {
  	"type": "custom",
  	"candid": "https://raw.githubusercontent.com/dfinity/ic/928caf66c35627efe407006230beee60ad38f090/rs/rosetta-api/icp_ledger/ledger.did",
  	"wasm": "https://download.dfinity.systems/ic/928caf66c35627efe407006230beee60ad38f090/canisters/ledger-canister.wasm.gz",
  	"remote": {
    	"id": {
      	"ic": "ryjl3-tyaaa-aaaaa-aaaba-cai"
    	}
  	}
	}
```
`remote.id.ic` - that is the principal of the Ledger canister and it will be available by this principal when you work with the ledger.

Also, in the scope of this script, a minter identity is created which can be used for minting tokens
for the testing purposes.
Additionally, the default identity is pre-populated with 1000_000_000_000 e8s which is equal to 10_000 * 10**8 ICP.
The decimals value for ICP is 10**8.

List identities:
`dfx identity list`

Switch to the minter identity:
`dfx identity use minter`

Transfer ICP:
`dfx ledger transfer <ADDRESS>  --memo 0 --icp 100 --fee 0`
where:
- `--memo` is some correlation id that can be set to identify some particular transactions (we use that in the marketplace canister).
- `--icp` is the transfer amount
- `--fee` is the transaction fee. In this case it's 0 because we make this transfer as the minter idenity thus this transaction is of type MINT, not TRANSFER.
- `<ADDRESS>` is the address of the recipient. To get the address from the principal, you can use the helper function from the marketplace canister - `getAddressFromPrincipal(principal: Principal)`, it can be called via the Candid UI.


### Internet identity canister

`dfx deploy internet_identity` - that is the canister that handles the authentication flow. Once it's deployed, the `js-agent` library will be talking to it to register identities. There is UI that acts as a wallet where you can select existing identities
or create a new one.

### Marketplace canister

`dfx deploy dfinity_js_backend` - deploys the marketplace canister where the business logic is implemented.
Basically, it implements functions like add, view, update, delete, and buy products + a set of helper functions.

Do not forget to run `dfx generate dfinity_js_backend` anytime you add/remove functions in the canister or when you change the signatures.
Otherwise, these changes won't be reflected in IDL's and won't work when called using the JS agent.

### Marketplace frontend canister
`dfx deploy dfinity_js_frontend` - deployes the frontend app for the `dfinity_js_backend` canister on IC.

### Notes for WSL/Ubuntu 22.04.4 + dfx 0.17 + Azle 0.19 
If you have just finished installed your linux distro using `wsl install`, be sure to also install the following apt packages: build-essential, libssl-dev and clang.

To check which linux distro you're running you can use `lsb_release -a`.

## Bug-Fixes
- Better error handling when adding new products.
- Fixed condition for Notification popup when an error occured adding a product. 

## Improvements
### Store images as Blobs for products

- When adding products you can upload Product images directly (max 100k pngs);


### Improvement: add custom product attributes

Seller is able to add product attributes to a product in order to differentiate with other sellers offering the same product.

### Improvement: compare products from different sellers
Able to select and compare products (emphasis on price differences).

### Improvement: multiple products for an order

Able to add multiple products (from the same seller) to a single order.
- Tally total order amount.
Able to add multiple products (from different sellers) to a single order.
- Tally total order amount.
- Pay order and automatic payment to all sellers.

## New Features
### New Feature: Rewards

Incentivize: 
- Claim reward points for each purchase (bought).
- Claim reward points for each sell (sold).
- Redeem reward points for store credit (Points -> LCIP).
- Pay with reward points (burn): 
  - either swap to LICP for Rewards Treasury or,
  - burn into cycles canister operation

Rewards canister: claim, redeem, get_exchange_rate, burn.