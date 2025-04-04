import { Connection, PublicKey } from "@solana/web3.js";
import { programs } from "@metaplex/js";

const { Metadata } = programs.metadata;

// Inisialisasi koneksi ke Solana Mainnet
const connection = new Connection(
  "https://api.mainnet-beta.solana.com",
  "confirmed"
);

// Mint address token yang ingin dicek
const mintAddress = new PublicKey(
  "mntv2Hgsa3D8KhjPmQbCTefph17cJMuW4ZT1cGFg5FH"
); // Gantilah dengan mint address token kamu

// Mendapatkan alamat metadata dari mint address
async function getMetadataAddress() {
  const metadataAddress = await Metadata.getPDA(mintAddress);
  console.log(
    `Alamat metadata untuk token ${mintAddress.toBase58()} adalah: ${metadataAddress.toBase58()}`
  );
}

getMetadataAddress();
