// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a Piggybank contract in Tolk.
/* eslint-disable */

import * as c from '@ton/core';
import { beginCell, ContractProvider, Sender, SendMode } from '@ton/core';

// ————————————————————————————————————————————
//   predefined types and functions
//

type StoreCallback<T> = (obj: T, b: c.Builder) => void
type LoadCallback<T> = (s: c.Slice) => T

export type CellRef<T> = {
    ref: T
}

function makeCellFrom<T>(self: T, storeFn_T: StoreCallback<T>): c.Cell {
    let b = beginCell();
    storeFn_T(self, b);
    return b.endCell();
}

function loadAndCheckPrefix32(s: c.Slice, expected: number, structName: string): void {
    let prefix = s.loadUint(32);
    if (prefix !== expected) {
        throw new Error(`Incorrect prefix for '${structName}': expected 0x${expected.toString(16).padStart(8, '0')}, got 0x${prefix.toString(16).padStart(8, '0')}`);
    }
}

function lookupPrefix(s: c.Slice, expected: number, prefixLen: number): boolean {
    return s.remainingBits >= prefixLen && s.preloadUint(prefixLen) === expected;
}

function throwNonePrefixMatch(fieldPath: string): never {
    throw new Error(`Incorrect prefix for '${fieldPath}': none of variants matched`);
}

function storeCellRef<T>(cell: CellRef<T>, b: c.Builder, storeFn_T: StoreCallback<T>): void {
    let b_ref = c.beginCell();
    storeFn_T(cell.ref, b_ref);
    b.storeRef(b_ref.endCell());
}

function loadCellRef<T>(s: c.Slice, loadFn_T: LoadCallback<T>): CellRef<T> {
    let s_ref = s.loadRef().beginParse();
    return { ref: loadFn_T(s_ref) };
}

function storeTolkNullable<T>(v: T | null, b: c.Builder, storeFn_T: StoreCallback<T>): void {
    if (v === null) {
        b.storeUint(0, 1);
    } else {
        b.storeUint(1, 1);
        storeFn_T(v, b);
    }
}

// ————————————————————————————————————————————
//   parse get methods result from a TVM stack
//

class StackReader {
    constructor(private tuple: c.TupleItem[]) {
    }

    static fromGetMethod(expectedN: number, getMethodResult: { stack: c.TupleReader }): StackReader {
        let tuple = [] as c.TupleItem[];
        while (getMethodResult.stack.remaining) {
            tuple.push(getMethodResult.stack.pop());
        }
        if (tuple.length !== expectedN) {
            throw new Error(`expected ${expectedN} stack width, got ${tuple.length}`);
        }
        return new StackReader(tuple);
    }

    private popExpecting<ItemT>(itemType: string): ItemT {
        const item = this.tuple.shift();
        if (item?.type === itemType) {
            return item as ItemT;
        }
        throw new Error(`not '${itemType}' on a stack`);
    }

    private popCellLike(): c.Cell {
        const item = this.tuple.shift();
        if (item && (item.type === 'cell' || item.type === 'slice' || item.type === 'builder')) {
            return item.cell;
        }
        throw new Error(`not cell/slice on a stack`);
    }

    readBigInt(): bigint {
        return this.popExpecting<c.TupleItemInt>('int').value;
    }

    readBoolean(): boolean {
        return this.popExpecting<c.TupleItemInt>('int').value !== 0n;
    }

    readCell(): c.Cell {
        return this.popCellLike();
    }

    readSlice(): c.Slice {
        return this.popCellLike().beginParse();
    }
}

// ————————————————————————————————————————————
//   auto-generated serializers to/from cells
//

type coins = bigint

type uint64 = bigint

/**
 > struct Storage {
 >     owner: address?
 >     balance: coins
 > }
 */
export interface Storage {
    readonly $: 'Storage'
    owner: c.Address | null
    balance: coins
}

export const Storage = {
    create(args: {
        owner: c.Address | null
        balance: coins
    }): Storage {
        return {
            $: 'Storage',
            ...args
        }
    },
    fromSlice(s: c.Slice): Storage {
        return {
            $: 'Storage',
            owner: s.loadMaybeAddress(),
            balance: s.loadCoins(),
        }
    },
    store(self: Storage, b: c.Builder): void {
        b.storeAddress(self.owner);
        b.storeCoins(self.balance);
    },
    toCell(self: Storage): c.Cell {
        return makeCellFrom<Storage>(self, Storage.store);
    }
}

/**
 > struct (0x00010001) TopUp {
 >     queryId: uint64
 >     amount: coins
 > }
 */
export interface TopUp {
    readonly $: 'TopUp'
    queryId: uint64
    amount: coins
}

export const TopUp = {
    PREFIX: 0x00010001,

    create(args: {
        queryId: uint64
        amount: coins
    }): TopUp {
        return {
            $: 'TopUp',
            ...args
        }
    },
    fromSlice(s: c.Slice): TopUp {
        loadAndCheckPrefix32(s, 0x00010001, 'TopUp');
        return {
            $: 'TopUp',
            queryId: s.loadUintBig(64),
            amount: s.loadCoins(),
        }
    },
    store(self: TopUp, b: c.Builder): void {
        b.storeUint(0x00010001, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.amount);
    },
    toCell(self: TopUp): c.Cell {
        return makeCellFrom<TopUp>(self, TopUp.store);
    }
}

/**
 > struct (0x00010002) Withdraw {
 >     queryId: uint64
 >     amount: coins
 > }
 */
export interface Withdraw {
    readonly $: 'Withdraw'
    queryId: uint64
    amount: coins
}

export const Withdraw = {
    PREFIX: 0x00010002,

    create(args: {
        queryId: uint64
        amount: coins
    }): Withdraw {
        return {
            $: 'Withdraw',
            ...args
        }
    },
    fromSlice(s: c.Slice): Withdraw {
        loadAndCheckPrefix32(s, 0x00010002, 'Withdraw');
        return {
            $: 'Withdraw',
            queryId: s.loadUintBig(64),
            amount: s.loadCoins(),
        }
    },
    store(self: Withdraw, b: c.Builder): void {
        b.storeUint(0x00010002, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.amount);
    },
    toCell(self: Withdraw): c.Cell {
        return makeCellFrom<Withdraw>(self, Withdraw.store);
    }
}

/**
 > struct (0x00010003) WithdrawResult {
 >     queryId: uint64
 >     sent: coins
 >     left: coins
 > }
 */
export interface WithdrawResult {
    readonly $: 'WithdrawResult'
    queryId: uint64
    sent: coins
    left: coins
}

export const WithdrawResult = {
    PREFIX: 0x00010003,

    create(args: {
        queryId: uint64
        sent: coins
        left: coins
    }): WithdrawResult {
        return {
            $: 'WithdrawResult',
            ...args
        }
    },
    fromSlice(s: c.Slice): WithdrawResult {
        loadAndCheckPrefix32(s, 0x00010003, 'WithdrawResult');
        return {
            $: 'WithdrawResult',
            queryId: s.loadUintBig(64),
            sent: s.loadCoins(),
            left: s.loadCoins(),
        }
    },
    store(self: WithdrawResult, b: c.Builder): void {
        b.storeUint(0x00010003, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.sent);
        b.storeCoins(self.left);
    },
    toCell(self: WithdrawResult): c.Cell {
        return makeCellFrom<WithdrawResult>(self, WithdrawResult.store);
    }
}

// ————————————————————————————————————————————
//    class Piggybank
//

interface ExtraSendOptions {
    bounce?: boolean                    // default: false
    sendMode?: SendMode                 // default: SendMode.PAY_GAS_SEPARATELY
    extraCurrencies?: c.ExtraCurrency   // default: empty dict
}

interface DeployedAddrOptions {
    workchain?: number                  // default: 0 (basechain)
    toShard?: { fixedPrefixLength: number; closeTo: c.Address }
    overrideContractCode?: c.Cell
}

function calculateDeployedAddress(code: c.Cell, data: c.Cell, options: DeployedAddrOptions): c.Address {
    const stateInitCell = beginCell().store(c.storeStateInit({
        code,
        data,
        splitDepth: options.toShard?.fixedPrefixLength,
        special: null,
        libraries: null,
    })).endCell();

    let addrHash = stateInitCell.hash();
    if (options.toShard) {
        const shardDepth = options.toShard.fixedPrefixLength;
        addrHash = beginCell()
            .storeBits(new c.BitString(options.toShard.closeTo.hash, 0, shardDepth))
            .storeBits(new c.BitString(stateInitCell.hash(), shardDepth, 256 - shardDepth))
            .endCell()
            .beginParse().loadBuffer(32);
    }

    return new c.Address(options.workchain ?? 0, addrHash);
}

export class Piggybank implements c.Contract {
    static CodeCell = c.Cell.fromBase64('te6ccgECCgEAATQAART/APSkE/S88sgLAQIBYgIDBPjQ+JGOUu1E0PpQ+gAwIW6Rf5j4kiLHBbPDAOKSXwPgAtMfMSDXCx8w1ywgAAgADJJfA+DXLCAACAAUjhjTPzH6ADCCCExLQKASoAHI+lQB+gLJ7VTgXwPg7UTQ+lD6ADAhbo4QXwP4kviXAcj6VAH6AsntVOACidcn4wKJBAUGBwIBIAgJAAgAAQABACTTPzH6ADASoAHI+lQB+gLJ7VQACAABAAIAstcnjlL4kiLHBZPywGTh0z/6ADAggghMS0CgU0C8jjNRRKHIz5AABAAOE8s/AfoCIfoCycjPhYhSMPpSUAT6AnHPC2oTzMlw+wDI+lQB+gLJ7VTg8sBm4F8DAB++KO9qJofSgYEDdJ+WAy8EABe8tgdqJofSgY/QAYQ=');

    static Errors = {
        'Errors.NotOwner': 100,
        'Errors.NotDeployed': 101,
        'Errors.InsufficientBalance': 102,
    }

    readonly address: c.Address
    readonly init: { code: c.Cell, data: c.Cell } | undefined

    protected constructor(address: c.Address, init?: { code: c.Cell, data: c.Cell }) {
        this.address = address;
        this.init = init;
    }

    static fromAddress(address: c.Address) {
        return new Piggybank(address);
    }

    static fromStorage(emptyStorage: {
        owner: c.Address | null
        balance: coins
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? Piggybank.CodeCell,
            data: Storage.toCell(Storage.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new Piggybank(address, initialState);
    }

    static createCellOfTopUp(body: {
        queryId: uint64
        amount: coins
    }) {
        return TopUp.toCell(TopUp.create(body));
    }

    static createCellOfWithdraw(body: {
        queryId: uint64
        amount: coins
    }) {
        return Withdraw.toCell(Withdraw.create(body));
    }

    async sendDeploy(provider: ContractProvider, via: Sender, msgValue: coins, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: c.Cell.EMPTY,
            ...extraOptions
        });
    }

    async sendTopUp(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        amount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: TopUp.toCell(TopUp.create(body)),
            ...extraOptions
        });
    }

    async sendWithdraw(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        amount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: Withdraw.toCell(Withdraw.create(body)),
            ...extraOptions
        });
    }

    async getOwner(provider: ContractProvider): Promise<c.Address> {
        const r = StackReader.fromGetMethod(1, await provider.get('owner', []));
        return r.readSlice().loadAddress();
    }

    async getBalance(provider: ContractProvider): Promise<coins> {
        const r = StackReader.fromGetMethod(1, await provider.get('balance', []));
        return r.readBigInt();
    }
}
