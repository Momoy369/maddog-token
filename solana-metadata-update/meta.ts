import * as mpl from "@metaplex-foundation/mpl-token-metadata";
import * as web3 from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";

export function loadWalletKey(keypairFile: string): web3.Keypair {
  const fs = require("fs");
  const loaded = web3.Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString()))
  );
  return loaded;
}

async function main() {
  console.log("Let's name some tokens");

  const myKeypair = loadWalletKey("/home/darkcyber/.config/solana/id_new.json");
  console.log(myKeypair.publicKey.toBase58());
  const mint = new web3.PublicKey(
    "7sJMBxsHHVLBD9C7hvBKQfB2gVWQy2hfmKh582gCKCZA"
  );

  const seed1 = Buffer.from(anchor.utils.bytes.utf8.encode("metadata"));
  const seed2 = Buffer.from(mpl.PROGRAM_ID.toBytes());
  const seed3 = Buffer.from(mint.toBytes());

  const [metadataPDA, _bump] = web3.PublicKey.findProgramAddressSync(
    [seed1, seed2, seed3],
    mpl.PROGRAM_ID
  );

  const accounts = {
    metadata: metadataPDA,
    mint,
    mintAuthority: myKeypair.publicKey,
    payer: myKeypair.publicKey,
    updateAuthority: myKeypair.publicKey,
  };

  const dataV2 = {
    name: "Maddog Token",
    symbol: "$MDT",
    uri: "https://ms-stories.mspublishing.co.id/maddog.json",
    // we don't need that
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  };

  const args = {
    createMetadataAccountArgsV2: {
      data: dataV2,
      isMutable: true,
    },
  };

  const ix = mpl.createCreateMetadataAccountV2Instruction(accounts);
  const tx = new web3.Transaction();
  tx.add(ix);
  const connection = new web3.Connection(
    "https://api.mainnet-beta.solana.com/"
  );
  const txid = await web3.sendAndConfirmTransaction(connection, tx, [
    myKeypair,
  ]);
  console.log(txid);
}

main();
