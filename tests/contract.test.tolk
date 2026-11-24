import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"

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

    expect(piggybank.balance()).toEqual(grams("0.04"));
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
