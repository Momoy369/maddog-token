import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { programs } from "@metaplex/js";
import fs from "fs";

const { Metadata, MetadataDataData } = programs.metadata; // Correctly importing Metadata

// Inisialisasi koneksi ke jaringan Solana
const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

// Membaca keypair dari file
const payer = Keypair.fromSecretKey(
  Uint8Array.from(
    JSON.parse(
      fs.readFileSync(
        "/home/darkcyber/maddog2/marh8pPkLKqDApW2XvF6gEGQBpHWcXPU6FVBCU9bNnT.json"
      )
    )
  )
);

// Alamat mint token yang ingin diupdate
const mintAddress = new PublicKey(
  "mntv2Hgsa3D8KhjPmQbCTefph17cJMuW4ZT1cGFg5FH"
);

// Fungsi async untuk memperbarui metadata
async function updateMetadata() {
  try {
    // Alamat metadata untuk token
    const metadataAddress = await Metadata.getPDA(mintAddress);

    // Mengecek apakah metadata ada di blockchain
    const metadataAccount = await connection.getAccountInfo(metadataAddress);
    if (!metadataAccount) {
      throw new Error("Metadata account not found on blockchain");
    }

    // Fetch metadata yang ada
    const metadata = await Metadata.load(connection, metadataAddress);

    // Data baru untuk metadata (misalnya, memperbarui URI atau atribut lainnya)
    const newUri = "https://ms-stories.mspublishing.co.id/maddog.json";
    const newData = new MetadataDataData({
      name: "Maddog Token",
      symbol: "$MDT",
      uri: newUri,
      sellerFeeBasisPoints: 500, // 5% royalty
      creators: null, // bisa berisi array creator jika ada
    });

    // Update metadata
    const updateTransaction = new programs.metadata.Metadata.updateMetadata(
      payer.publicKey,
      metadataAddress,
      payer.publicKey, // Pengubah metadata adalah pembuatnya (atau siapa pun yang memiliki otoritas)
      newData
    );

    // Kirim transaksi untuk memperbarui metadata
    const tx = await connection.sendTransaction(updateTransaction, [payer]);
    await connection.confirmTransaction(tx);

    console.log(
      `Metadata telah diperbarui untuk token dengan mint ${mintAddress}`
    );
  } catch (error) {
    console.error("Error updating metadata:", error);
  }
}

// Panggil fungsi untuk memperbarui metadata
updateMetadata();
