const {LivetimingClient} = require(".").default;

const client = new LivetimingClient({
  type: "udp4",
  host: "127.0.0.1",
  port: 5100,
  password: "123",
  trackPositions: 0,
  collisions: 0,
});

client.on("connected", () => console.log("Connected Livetiming Client"));
client.on("disconnected", () => console.log("Disconnected Livetiming Client"));
//client.on("data", (data) => console.log(data));
client.on("error", (err) => console.error(err));

console.log("Enable Livetiming Client");
client.setEnabled(true);

process.on("SIGINT", function () {
  console.log("Disable Livetiming Client");

  if (client.getStatus() === 2) {
    client.once("disconnected", () => process.exit(0));
    setTimeout(() => process.exit(1), 2000);
    client.setEnabled(false);
  } else {
    client.setEnabled(false);
    process.exit(0);
  }
});
