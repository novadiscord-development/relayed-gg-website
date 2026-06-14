export default function generateSnowflake() {
  const timestamp = BigInt(Date.now() - 1704067200000); // custom epoch

  const random = BigInt(
    Math.floor(Math.random() * 4095)
  );

  return ((timestamp << 12n) | random).toString();
}