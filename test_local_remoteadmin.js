const { RemoteAdminClient } = require(".").default;

const client = new RemoteAdminClient({
  type: "udp4",
  host: "127.0.0.1",
  port: 5101,
  password: "123",
});

client.on("connected", () => {
  console.log("Connected RemoteAdmin Client");
  client
    .sendCommand("MSG", "@A Hello")
    .then(() => console.log("Sent command: MSQ @A Hello"))
    .catch((err) => console.error(err));
  client
    .sendCommand("MSG", "@#2 Hello2")
    .then(() => console.log("Sent command: MSQ @#2 Hello2"))
    .catch((err) => console.error(err));
  client
      .sendCommand("MSG", "Hello3")
      .then(() => console.log("Sent command: MSQ Hello3"))
      .catch((err) => console.error(err));
});
client.on("disconnected", () => console.log("Disconnected RemoteAdmin Client"));
client.on("error", (err) => console.error(err));

console.log("Enable RemoteAdmin Client");
client.setEnabled(true);

process.on("SIGINT", function () {
  console.log("Disable RemoteAdmin Client");

  if (client.getStatus() === 2) {
    client.once("disconnected", () => process.exit(0));
    setTimeout(() => process.exit(1), 2000);
    client.setEnabled(false);
  } else {
    client.setEnabled(false);
    process.exit(0);
  }
});
