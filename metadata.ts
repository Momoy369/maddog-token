import * as mpl from "@metaplex-foundation/mpl-token-metadata";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import * as fs from "fs";

// Fungsi untuk memuat keypair dari file
export function loadWalletKey(keypairFile: string): web3.Keypair {
  const loaded = web3.Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString()))
  );
  return loaded;
}

async function main() {
  console.log("Let's update some tokens");

  const myKeypair = loadWalletKey("/home/darkcyber/.config/solana/id_new.json");
  console.log(myKeypair.publicKey.toBase58());

  const mint = new web3.PublicKey(
    "34D3MyDKNUZpzYezpc9Sn8MnM4ytfznyi2i286gs6aeJ"
  );

  // Membuat PDA untuk metadata
  const seed1 = Buffer.from(anchor.utils.bytes.utf8.encode("metadata"));
  const seed2 = Buffer.from(mpl.PROGRAM_ID.toBytes());
  const seed3 = Buffer.from(mint.toBytes());

  const [metadataPDA, _bump] = web3.PublicKey.findProgramAddressSync(
    [seed1, seed2, seed3],
    mpl.PROGRAM_ID
  );

  // Menentukan akun yang diperlukan untuk memperbarui metadata
  const accounts = {
    metadata: metadataPDA,
    mint,
    mintAuthority: myKeypair.publicKey,
    payer: myKeypair.publicKey,
    updateAuthority: myKeypair.publicKey, // Update authority untuk memperbarui metadata
  };

  // Data baru yang ingin diperbarui
  const updatedData = {
    name: "Updated Maddog Token",
    symbol: "$MDTU", // Simbol baru
    uri: "https://ms-stories.mspublishing.co.id/updated_maddog.json", // URI baru
    sellerFeeBasisPoints: 500, // Fee baru
    creators: null, // Tidak ada creator baru
    collection: null, // Tidak ada koleksi baru
    uses: null, // Tidak ada penggunaan baru
    primarySaleHappened: false, // Menambahkan properti yang diperlukan
  };

  // Membuat instruksi untuk memperbarui metadata
  const args = {
    updateMetadataAccountArgsV2: {
      data: updatedData,
      isMutable: true,
      primarySaleHappened: true,
      updateAuthority: myKeypair.publicKey, // Pastikan updateAuthority diset
    },
  };

  // Mencoba instruksi untuk memperbarui metadata
  const ix = mpl.createUpdateMetadataAccountV2Instruction(accounts, args);

  // Membuat transaksi dan menambahkan instruksi
  const tx = new web3.Transaction();
  tx.add(ix);

  // Mengirim transaksi ke Solana
  const connection = new web3.Connection("https://api.mainnet-beta.solana.com");
  const txid = await web3.sendAndConfirmTransaction(connection, tx, [
    myKeypair,
  ]);

  // Output transaction ID
  console.log("Transaction ID: ", txid);
}

main().catch((err) => {
  console.error("Error:", err);
});
