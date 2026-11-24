
import "types"

contract Piggybank {
    author: "Roman Gnedin"
    version: "0.0.1"
    description: "Piggy bank pet project"
    storage: Storage
    incomingMessages: AllowedMessage
}

type AllowedMessage = TopUp | Withdraw

fun onInternalMessage(in: InMessage) {
    val message = lazy AllowedMessage.fromSlice(in.body);

    var storage = lazy Storage.load();

    if (storage.owner == null) {
        storage.owner = in.senderAddress;
        storage.balance = in.valueCoins;
        Storage.save(storage);
        return;
    }

    val SEND_FEES: coins = grams("0.005");

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
            if (storage.balance > message.amount + SEND_FEES) {
                storage.balance -= message.amount;

                var withdrawConfirm = createMessage({
                    dest: storage.owner,
                    value: message.amount + SEND_FEES,
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
            throw Errors.InvalidMessage;
        }
    }
}

fun onBouncedMessage(in: InMessageBounced) {
    var storage = lazy Storage.load();

    if (storage.owner==null ||  in.senderAddress != storage.owner) {
        return;
    }

    in.bouncedBody.skipBouncedPrefix();

    val message = lazy AllowedMessage.fromSlice(in.bouncedBody);
    match (message) {
        TopUp => {}
        Withdraw => {
            storage.balance += message.amount;
            Storage.save(storage);
        }
        else => {}
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
