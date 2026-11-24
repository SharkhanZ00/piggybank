
import "types"

contract Piggybank {
    author: "Roman Gnedin"
    version: "0.0.1"
    description: "Piggy bank pet project"
    storage: Storage
    incomingMessages: AllowedMessage
}

type AllowedMessage = TopUp | Withdraw
const SEND_FEES: coins = grams("0.005")

fun onInternalMessage(in: InMessage) {
    val message = lazy AllowedMessage.fromSlice(in.body);

    var storage = lazy Storage.load();

    if (storage.owner == null) {
        storage.owner = in.senderAddress;
        storage.balance = in.valueCoins;
        Storage.save(storage);
        return;
    }


    match (message) {
        TopUp => {
            storage.balance += message.amount;
            Storage.save(storage);
            return;
        }
        Withdraw => {
            if (in.senderAddress != storage.owner) {
                throw Errors.NotOwner;
            }
            val withdrawAmount = message.amount + SEND_FEES;
            if (storage.balance > withdrawAmount ) {
                storage.balance -= withdrawAmount;

                var withdrawConfirm = createMessage({
                    dest: storage.owner,
                    value: withdrawAmount,
                    body: WithdrawResult {
                        queryId: message.queryId,
                        sent: message.amount,
                        left: storage.balance
                    }.toCell(),
                    bounce: BounceMode.Only256BitsOfBody,
                });
                withdrawConfirm.send(SEND_MODE_REGULAR);

                Storage.save(storage);

                return;
            }
            throw Errors.InsufficientBalance;
        }
        else => {
        }
    }
}

fun onBouncedMessage(in: InMessageBounced) {
    var storage = lazy Storage.load();

    if (storage.owner==null ||  in.senderAddress != storage.owner!) {
        return;
    }

    in.bouncedBody.skipBouncedPrefix();

    val message = lazy AllowedMessage.fromSlice(in.bouncedBody);
    val originalOpcode = in.bouncedBody.loadUint(32);

    match (message) {
        TopUp => {}
        Withdraw => {
            storage.balance += message.amount + SEND_FEES;
            Storage.save(storage);
        }
        else => {
        }
    }

}

get fun owner(): address {
    val storage = lazy Storage.load();
    if (storage.owner == null) {
        throw Errors.NotDeployed;
    }
    return storage.owner;
}

get fun balance(): coins {
    val storage = lazy Storage.load();
    return storage.balance;
}
