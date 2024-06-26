import * as anchor from "@coral-xyz/anchor";
import BN from "bn.js";
import assert from "assert";
import * as web3 from "@solana/web3.js";
import type { Lifafa } from "../target/types/lifafa";
import {
  loadWallet,
  getBalance,
  createLifafa,
  claimLifafa,
  deleteLifafa,
  generateLifafaId,
  findLifafaState,
  toSol,
  confirmTransaction
} from "../client/utils";

describe("Test Red Envelope", () => {
  // Load wallet from the secret key path
  const secretKeyPath = "/home/jovian/.config/solana/id.json";
  let wallet: web3.Keypair;
  let provider: anchor.AnchorProvider;
  let program: anchor.Program<Lifafa>;

  before(async () => {
    wallet = await loadWallet(secretKeyPath);
    provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    program = anchor.workspace.Lifafa as anchor.Program<Lifafa>;
  });

  it("create sol lifafa", async () => {
    const id = Math.floor(Math.random() * 10000000);
    const amount = web3.LAMPORTS_PER_SOL * 0.1;
    const timeLimit = 1000;
    const maxClaims = 1;
    const ownerName = "jovian";
    const desc = "Gift"

    const [lifafaState] = findLifafaState(program.programId, id);

    await createLifafa(
        program, 
        provider, 
        wallet, 
        id, 
        amount, 
        timeLimit,
        maxClaims,
        ownerName, 
        desc,
        lifafaState
      );

    // Fetch the created lifafa account
    const createdLifafa = await program.account.lifafa.fetch(lifafaState);

    console.log("On-chain lifafa data:", {
      id: createdLifafa.id.toString(),
      amount: await getBalance(provider.connection, lifafaState),
      timeLimit: createdLifafa.timeLimit.toString(),
      maxClaims: createdLifafa.maxClaims,
      ownerName: createdLifafa.ownerName
    });

    // Check whether the data on-chain is equal to local data
    assert(id === createdLifafa.id.toNumber());
    // assert(amount === createdLifafa.amount.toNumber());
    assert(timeLimit === createdLifafa.timeLimit.toNumber());
    assert(maxClaims === createdLifafa.maxClaims);
    assert(ownerName === createdLifafa.ownerName);
  });


  it("claim sol lifafa", async () => {
    // Create a new lifafa first
    const id = generateLifafaId();
    const amount = web3.LAMPORTS_PER_SOL * 0.1;
    const timeLimit = 1000;
    const maxClaims = 1;
    const ownerName = "jovian";
    const desc = "Gift"

    const [lifafaState] = findLifafaState(program.programId, id);

    console.log(`\nCreating Lifafa for claiming test, amount = ${toSol(amount)}, id = ${id}`);

    await createLifafa(
        program, 
        provider, 
        wallet, 
        id, 
        amount, 
        timeLimit,
        maxClaims,
        ownerName, 
        desc,
        lifafaState
      );

    // Initial balances before claiming
    const initialWalletBalance = await getBalance(provider.connection, provider.wallet.publicKey);
    const initialLifafaBalance = await getBalance(provider.connection, lifafaState);

    console.log(`Initial wallet balance: ${initialWalletBalance} SOL`);
    console.log(`Initial lifafa balance: ${initialLifafaBalance} SOL`);

    // Claim the lifafa
    await claimLifafa(program, provider, wallet, id, lifafaState);

    // Balances after claiming
    const finalWalletBalance = await getBalance(provider.connection, provider.wallet.publicKey);
    const finalLifafaBalance = await getBalance(provider.connection, lifafaState);

    console.log(`Final wallet balance: ${finalWalletBalance} SOL`);
    console.log(`Final lifafa balance: ${finalLifafaBalance} SOL`);

    // Check whether the balance was transferred correctly
    assert(finalWalletBalance > initialWalletBalance, "Wallet balance should increase after claiming the lifafa");
    assert(finalLifafaBalance < initialLifafaBalance, "Lifafa balance should decrease after being claimed");
  });

});
