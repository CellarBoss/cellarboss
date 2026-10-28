# Installation

## Download

CellarBoss Mobile is available for Android, and will soon be available for download on the Google Play Store.
Alternatively, you can download the latest APK from the [GitHub Releases](https://github.com/CellarBoss/cellarboss/releases) page.

## Connecting to Your Server

When you first open the app, you will be prompted to enter your CellarBoss server URL.

The app talks to the CellarBoss **backend**, not the web interface. In the [standard Docker setup](https://docs.cellarboss.org/web/guide/installation.html) the backend only listens on an internal network, so you will need to make it reachable from your device, either by publishing its port (`5000`) or by putting it behind a reverse proxy.

::: tip
You don't need to add anything to the backend's `CORS` setting for the app. `CORS` only lists the addresses you use for the web interface.
:::

![Server setup](/screenshots/auth-setup.png)

1. Enter the full URL of your CellarBoss backend (e.g. `http://192.168.1.10:5000` or `https://cellarboss-api.example.com`)
2. Tap **Connect**

The app checks that the address belongs to a CellarBoss backend before moving on to the login screen. If you see "This doesn't look like a CellarBoss server", you have most likely entered the address of the web interface instead.
