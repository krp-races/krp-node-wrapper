# Mapped.js

A node.js wrapper for a dedicated or challenge server in kart racing pro.

## Requirements

- None

## Installing

This package was tested under [Node.js](https://nodejs.org/en) 20.18.0 x64.

[Kart Racing Pro](https://kartracing-pro.com) release13e was used while testing.

```sh
pnpm add @krp-races/krp-node-wrapper
```

## Supported Features

- Server Livetiming

## API Documentation

# LivetimingClient

## Initialisation

```js
import { LiveTimingClient } from "@krp-races/krp-node-wrapper";

const client = new LivetimingClient({
  type: "udp4",
  host: "127.0.0.1",
  port: 5100,
  password: "123",
  trackPositions: 0,
  collisions: 0,
});

console.log("Enable Livetiming Client");
client.setEnabled(true);
```

## Methods

| Methods                      | Description            |
| ---------------------------- | ---------------------- |
| setEnabled(enabled: boolean) | Set Client enabled.    |
| getEnabled()                 | Is Client enabled?     |
| getStatus()                  | Current Client status. |

## Events

| Event          | Description           |
| -------------- | --------------------- |
| "connected"    | Client connected.     |
| "disconnected" | Client disconnected.  |
| "data"         | Client data update.   |
| "error"        | Client error occured. |

```js
client.on("data", (data) => {
  console.log(data);
});
```

## Constribute

Guidelines are defined [here](https://github.com/krp-races/krp-node-wrapper/blob/main/CONTRIBUTING.md).

## License

Released under the [AGPL-3.0 License](https://github.com/krp-races/krp-node-wrapper/blob/main/LICENSE).