import { 
    query, update, ic,
    text, bool, nat64,
    None, Some, Ok, Err, Opt, Result, Null,
    Record, StableBTreeMap, Variant, Vec,
    Principal, Duration, Canister    
} from 'azle';
import {
    binaryAddressFromAddress, binaryAddressFromPrincipal, Block, hexAddressFromPrincipal,
    Ledger,
} from "azle/canisters/ledger";
// import {} from "hashcode"; // hashcode
import { v4 as uuidv4 } from 'uuid';
import HashCode from 'ts-hashcode';

// Data
const Product = Record({
    id: text, // uuid
    title: text, 
    description: text, 
    location: text, 
    price: nat64, 
    seller: Principal, 
    attachmentUrl: text, 
    soldAmount: nat64
});
//type Product = typeof Product.tsType; // if using StableBTreeMap<>()

const CreateProduct = Record({
    title: text, 
    description: text, 
    location: text, 
    price: nat64, 
    attachmentUrl: text
});

const OrderStatus = Variant({
    PaymentPending: Null, // pending
    Completed: Null,
});
//type OrderStatus = typeof OrderStatus.tsType;

const Order = Record({
    productId: text, // should be a Vec of products | productId(s)
    price: nat64, 
    status: OrderStatus, 
    seller: Principal, // buyer?
    paid_at_block: Opt(nat64), 
    memo: nat64
});

const InfoMessage = Variant({
    InvalidPayload: text,
    PendingOrderNotFound: text,
    ProductNotFound: text, 
    MissingProductInformation: Null,  //InvalidPayload: Null, 
    PaymentFailed: text, 
    PaymentCompleted: Null,
    OrderComplete: text,
});

// stable storage
const productsDb = StableBTreeMap(0, text, Product); //StableBTreeMap<text, Product>(0);
const orders = StableBTreeMap(1, Principal,Order);
const pending = StableBTreeMap(2, nat64, Order);

// keep order alive for how long? (products on-hold) 120secs
const ORDER_TTL_MIN = 2n;
const ORDER_TTL = ORDER_TTL_MIN * 60n;

// Services
const LEDGER_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai";
const ledgerCanister = Ledger(Principal.fromText(LEDGER_ID));
const DEFAULT_SUBACCOUNT = 0;

// steup Canister object
export default Canister({
    // Functions
    // Queries
    getProducts: query([], Vec(Product), () => {
        return productsDb.values();
    }),

    getOrders: query([], Vec(Order), () => {
        return orders.values();
    }),

    getPendingOrders: query([], Vec(Order), () => {
        return pending.values();
    }),

    getProduct: query([text], Result(Product, InfoMessage), (id) => {
        const productOpt = productsDb.get(id);
       
        if ("None" in productOpt) {
            return Err({ ProductNotFound: `Product  id=${id} not found`});
        }

        return Ok(productOpt.Some);
    }),

    // Product Management
    addProduct: update([CreateProduct], Result(Product, InfoMessage), (payload) => {
        if(typeof payload !== "object" || Object.keys(payload).length === 0) {
            return Err({ InvalidPayload: `Invalid payload data` });
        }

        const product = { id: uuidv4(), soldAmount: 0n, seller: ic.caller(), ...payload };
        productsDb.insert(product.id, product);

        return Ok(product);
    }),

    updateProduct: update([Product], Result(Product, InfoMessage), (payload) => {
        const productOpt = productsDb.get(payload.id);

        if("None" in productOpt) {
            return Err({ ProductNotFound: `Product  id=${payload.id} not found`});
        }

        productsDb.insert(productOpt.Some.id, payload);

        return Ok(payload);
    }),

    deleteProduct: update([text], Result(text, InfoMessage), (id) => {
        const deleteProductOpt = productsDb.remove(id);

        if ("None" in deleteProductOpt) {
            return Err({ ProductNotFound: `Product  id=${id} not found`});
        }

        return Ok(deleteProductOpt.Some.id);
    }),

    // Order Management
    createOrder: update([text], Result(Order, InfoMessage), (id) => {
        const productOpt = productsDb.get(id);

        if("None" in productOpt) {
            return Err({ ProductNotFound: `Product  id=${id} not found`});
        }

        const product = productOpt.Some;
        const order = {
            productId: product.id, 
            price: product.price, 
            status: { PaymentPending: null }, 
            seller: product.seller, 
            paid_at_block: None, 
            memo: generateCorrelationId(id) // product_id + Principal (caller = buyer) + timestamp
        };
        pending.insert(order.memo, order)
        discardByTimeout(order.memo, ORDER_TTL);

        return Ok(order);
    }),

    completePurchase: update([Principal, text, nat64, nat64, nat64], 
        Result(Order, InfoMessage), 
        async (seller, id, price, block, memo) => {
            const paymentVerified = await verifyPaymentInternal(seller, price, block, memo);
            if (!paymentVerified) {
                return Err({ PaymentFailed: `cannot complete purchase. payment failed, memo=${memo}` });
            }

            const pendingOrderOpt = pending.remove(memo);
            if ("None" in pendingOrderOpt) {
                return Err({ PendingOrderNotFound: `cannot complete purchase. No pending order with id=${id}` });
            }

            const order = pendingOrderOpt.Some; 
            const updatedOrder = { ...order, status: { Completed: null }, paid_at_block: Some(block) };

            // update product
            const productOpt = productsDb.get(id);
            if("None" in productOpt) {
                return Err({ ProductNotFound: `Product  id=${id} not found`});
            }
            const product = productOpt.Some; 
            product.soldAmount += 1; 
            productsDb.insert(product.id, product);
            orders.insert(ic.caller(), updatedOrder);

            return Ok(updatedOrder);
     }),

     verifyPayment: query([Principal, nat64, nat64, nat64], bool, async (receiver, amount, block, memo) => {
        return await verifyPaymentInternal(receiver, amount, block, memo);
     }),

     // TODO: makePayment, pay from Marketplace canister escrow account to sellers
});

async function verifyPaymentInternal(receiver: Principal, amount: nat64, block: nat64, memo: nat64): Promise<bool> {
    const blockData = await ic.call(ledgerCanister.query_blocks, { args: [ { start: block, length: 1n } ]} );
    
    const tx = blockData.blocks.find((block) => {
        if ("None" in block.transaction.operation) {
            return false;
        }

        const operation = block.transaction.operation.Some;
        const senderAddress = binaryAddressFromPrincipal(ic.caller(), DEFAULT_SUBACCOUNT);
        const receiverAddress = binaryAddressFromPrincipal(receiver, DEFAULT_SUBACCOUNT);

        // is there a tx with same memo + from/to transfer + amount?
        return block.transaction.memo == memo &&
            hash(senderAddress) == hash(operation.Transfer?.from) &&
            hash(receiverAddress) == hash(operation.Transfer?.to) &&
            amount == operation.Transfer?.amount.e8s;
    });

    return tx ? true : false;    
};

// helpers
function hash(input: any): nat64 {
    return BigInt(Math.abs(HashCode(input)));
}

// workaround for uuid to work with Azle
globalThis.crypto = {
    // @ts-ignore
    getRandomValues: () => {
        let array = new Uint8Array(32);

        for(let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }

        return array;
    }
}

function generateCorrelationId(productId: text): nat64 {
    const correlationId = `${productId}+${ic.caller().toText()}_${ic.time()}`;
    return hash(correlationId);
}

function discardByTimeout(memo: nat64, delay: Duration) {
    ic.setTimer(delay, () => {
        const order = pending.remove(memo);
        console.log(`Order discarded ${order}`);
    });
}
