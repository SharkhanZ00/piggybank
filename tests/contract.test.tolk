import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@acton/testing/fuzz"

import "@contracts/types"
import "@wrappers/Piggybank.gen"

get fun `test deploy exposes initial owner`() {
    val (contract, deployer, _) = setupTest();
    expect(contract.owner()).toEqual(deployer.address);
    expect(contract.balance()).toEqual(grams("0.05"));
}

get fun `test owner can topup`() {
    val (piggybank, deployer, _) = setupTest();

    val res = piggybank.sendTopUp(deployer.address, 42, grams("0.01"));
    expect(res).toHaveAllSuccessfulTxs();

    expect(piggybank.balance()).toEqual(grams("0.06"));
}

get fun `test not owner can topup`() {
    val (piggybank, deployer, other) = setupTest();

    val res = piggybank.sendTopUp(other.address, 43, grams("0.03"));
    expect(res).toHaveAllSuccessfulTxs();

    expect(piggybank.balance()).toEqual(grams("0.08"));
}

get fun `test owner can withdraw`() {
    val (piggybank, deployer, _) = setupTest();

    val res = piggybank.sendWithdraw(deployer.address, 42, grams("0.01"));
    expect(res).toHaveAllSuccessfulTxs();

    expect(piggybank.balance()).toEqual(grams("0.035"));
}

get fun `test not owner cannot withdraw`() {
    val (piggybank, deployer, other) = setupTest();

    val res = piggybank.sendWithdraw(other.address, 42, grams("0.01"));
    expect(res).toHaveFailedTx({
        exitCode: Errors.NotOwner,
    });;

    expect(piggybank.balance()).toEqual(grams("0.05"));
}

get fun `test owner cannot withdraw more then balance`() {
    val (piggybank, deployer, _) = setupTest();

    val res = piggybank.sendWithdraw(deployer.address, 42, grams("0.06"));
    expect(res).toHaveFailedTx({
        exitCode: Errors.InsufficientBalance,
    });;

    expect(piggybank.balance()).toEqual(grams("0.05"));
}

get fun `test owner cannot withdraw whole balance`() {
    val (piggybank, deployer, _) = setupTest();

    val res = piggybank.sendWithdraw(deployer.address, 42, grams("0.045"));
    expect(res).toHaveFailedTx({
        exitCode: Errors.InsufficientBalance,
    });;

    expect(piggybank.balance()).toEqual(grams("0.05"));
}

get fun `test owner cannot withdraw more then balance - fees`() {
    val (piggybank, deployer, _) = setupTest();

    val res = piggybank.sendWithdraw(deployer.address, 42, grams("0.05"));
    expect(res).toHaveFailedTx({
        exitCode: Errors.InsufficientBalance,
    });;

    expect(piggybank.balance()).toEqual(grams("0.05"));
}

get fun `test bounce restores balance`() {
    val (piggy, deployer, _) = setupTest();
    expect(piggy.balance()).toEqual(grams("0.05"));

    val res0 = piggy.sendWithdraw(deployer.address, 42, grams("0.01"));
    expect(res0).toHaveAllSuccessfulTxs();

    expect(piggy.balance()).toEqual(grams("0.035"));


    val bounced = createMessage({
        bounce: false,
        value: grams("0.05"),
        dest: piggy.address,
        body: beginCell()
            .storeUint(0xFFFFFFFF, 32)
            .storeSlice(Withdraw { queryId: 42, amount: grams("0.01") }.toCell().beginParse())
            .endCell(),
    }).bounced();

    val res1 = net.send(deployer.address, bounced);

    expect(res1).toHaveBouncedTx({ to: piggy.address });
    expect(piggy.balance()).toEqual(grams("0.05"));
}

get fun `test bounce from stranger does nothing`() {
    val (piggy, deployer, stranger) = setupTest();
    expect(piggy.balance()).toEqual(grams("0.05"));

    val bounced = createMessage({
        bounce: false,
        value: grams("0.05"),
        dest: piggy.address,
        body: beginCell()
            .storeUint(0xFFFFFFFF, 32)
            .storeSlice(Withdraw { queryId: 42, amount: grams("0.01") }.toCell().beginParse())
            .endCell(),
    }).bounced();

    val res = net.send(stranger.address, bounced);

    expect(res).toHaveBouncedTx({ to: piggy.address });
    expect(piggy.balance()).toEqual(grams("0.05"));
}

get fun `test bounce with garbage`() {
    val (piggy, deployer, stranger) = setupTest();
    expect(piggy.balance()).toEqual(grams("0.05"));

    val bounced = createMessage({
        bounce: false,
        value: grams("0.05"),
        dest: piggy.address,
        body: beginCell()
            .storeUint(0xFFFFFFFF, 32)
            .storeUint(0xDEADBEEF, 32)
            .storeUint(12345, 64)
            .endCell(),
    }).bounced();

    val res = net.send(stranger.address, bounced);

    expect(res).toHaveBouncedTx({ to: piggy.address });
    expect(piggy.balance()).toEqual(grams("0.05"));
}

get fun `test bounce from owner and topup does nothing`() {
    val (piggy, deployer, _) = setupTest();
    expect(piggy.balance()).toEqual(grams("0.05"));

    val bounced = createMessage({
        bounce: false,
        value: grams("0.05"),
        dest: piggy.address,
        body: beginCell()
            .storeUint(0xFFFFFFFF, 32)
            .storeSlice(TopUp { queryId: 42, amount: grams("0.01") }.toCell().beginParse())
            .endCell(),
    }).bounced();

    val res = net.send(deployer.address, bounced);

    expect(res).toHaveBouncedTx({ to: piggy.address });
    expect(piggy.balance()).toEqual(grams("0.05"));
}

@test.fuzz({ runs: 64, seed: 42 })
get fun `test garbage body never corrupts balance`(rawOpcode: int, rawPayload: int) {
    val (piggy, deployer, _) = setupTest();
    val before = piggy.balance();

    val op = fuzz.bound(rawOpcode, 0, 0xFFFFFFFF);
    val payload = fuzz.bound(rawPayload, 0, 0xFFFFFFFFFFFF);

    val garbage = beginCell()
        .storeUint(op, 32)
        .storeUint(payload, 48)
        .endCell();

    val msg = createMessage({
        bounce: false,
        value: grams("0.01"),
        dest: piggy.address,
        body: garbage,
    });
    val res = net.send(deployer.address, msg);

    val after = piggy.balance();
    assert(after == before || after == before + grams("0.01"), 799);
}

@test.fuzz(32)
get fun `test garbage bounced body does not touch balance`(rawOpcode: int, rawPayload: int) {
    val (piggy, deployer, _) = setupTest();

    val op = fuzz.bound(rawOpcode, 0, 0xFFFFFFFF);
    val payload = fuzz.bound(rawPayload, 0, 0xFFFFFFFFFFFF);

    val garbage = beginCell()
        .storeUint(0xFFFFFFFF, 32)  // bounce-prefix
        .storeUint(op, 32)
        .storeUint(payload, 48)
        .endCell();

    val bounced = createMessage({
        bounce: false,
        value: grams("0.01"),
        dest: piggy.address,
        body: garbage,
    }).bounced();

    val res = net.send(deployer.address, bounced);

    expect(piggy.balance()).toEqual(grams("0.05"));
}

fun setupTest(): (Piggybank, Treasury, Treasury) {
    val deployer = testing.treasury("deployer");
    val notDeployer = testing.treasury("notDeployer");

    val contract = Piggybank.fromStorage({
        owner: null,
        balance: grams("0"),
    });
    val res = contract.deploy(deployer.address, { value: grams("0.05") });
    expect(res).toHaveSuccessfulDeploy({
        to: contract.address,
    });

    return (contract, deployer, notDeployer);
}
