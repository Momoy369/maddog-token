import pkg from "@metaplex-foundation/mpl-token-metadata";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import fs from "fs";

// Mengambil fungsi dari ekspor default
const { createUpdateMetadataInstruction, Metadata } = pkg;

// Setup koneksi ke Solana
const connection = new Connection(
  "https://api.mainnet-beta.solana.com",
  "confirmed"
);

// Membaca file keypair
const secretKey = Uint8Array.from(
  JSON.parse(fs.readFileSync("/home/darkcyber/.config/solana/id_new.json"))
);
const payer = Keypair.fromSecretKey(secretKey);

// Mint Address token yang akan diperbarui metadata-nya
const mintAddress = new PublicKey(
  "7sJMBxsHHVLBD9C7hvBKQfB2gVWQy2hfmKh582gCKCZA"
);

async function updateMetadata() {
  try {
    // Mendapatkan alamat metadata token
    const metadataAddress = await Metadata.getPDA(mintAddress);
    console.log(`Alamat metadata: ${metadataAddress.toBase58()}`);

    // Menyusun instruksi untuk memperbarui metadata
    const updateMetadataArgs = {
      name: "Maddog Token",
      symbol: "$MDT",
      uri: "https://ms-stories.mspublishing.co.id/maddog.json",
      sellerFeeBasisPoints: 500,
      creators: null, // Atau bisa diatur sesuai dengan pengaturan creators jika diperlukan
    };

    // Membuat instruksi pembaruan metadata
    const updateMetadataIx = createUpdateMetadataInstruction(
      metadataAddress, // Alamat metadata token yang akan diperbarui
      payer.publicKey, // Pembayar transaksi (biasanya pemilik atau akun yang berwenang)
      payer.publicKey, // Pemilik atau pengubah metadata
      updateMetadataArgs // Data metadata yang baru
    );

    // Membuat transaksi untuk mengirim instruksi
    const transaction = new Transaction().add(updateMetadataIx);

    // Mengirim transaksi untuk memperbarui metadata
    const signature = await connection.sendTransaction(transaction, [payer], {
      skipPreflight: false,
    });
    console.log(`Transaksi berhasil: ${signature}`);
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
  }
}

// Menjalankan fungsi untuk memperbarui metadata
updateMetadata();
