enum Errors {
    NotOwner = 100
    NotDeployed = 101
    InsufficientBalance = 102
    InvalidMessage = 0xFFFF
}

const OP_DEPOSIT:  uint32 = 0x00010001;
const OP_WITHDRAW: uint32 = 0x00010002;
const OP_REFUND:   uint32 = 0x00010003;

struct Storage {
    owner: address?
    balance: coins
}

fun Storage.load(): Storage {
    return Storage.fromCell(contract.getData());
}

fun Storage.save(self) {
    contract.setData(self.toCell());
}

// ----- Messages -----
struct (0x00010001) TopUp {
    queryId: uint64
    amount: coins
}

struct (0x00010002) Withdraw {
    queryId: uint64
    amount: coins
}

struct (0x00010003) WithdrawResult {
    queryId: uint64
    sent: coins
    left: coins
}
