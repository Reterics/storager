# StorageR

[![build](https://github.com/Reterics/storager/actions/workflows/npm-build-test.yml/badge.svg)](https://github.com/Reterics/storager/actions/workflows/npm-build-test.yml)

This is a Storage Manager application for small businesses

### Preparing Cloud Environment

In order to have Denarius application functional we need to create a .env file based on our available .env.template

We need to create a Google Firebase Project in Google Console for this here: https://console.firebase.google.com/project/

After you have the access to Firebase Dashboard use the following steps:

- Create a Web App
    - Open **Project settings**
    - Under Your apps section click the **Add app** button and click to the third **Web App** button
    - On the next page Add a nickname to your app and click to **Register app** button and then **Continue to console**
    - Now in the **Your apps** section you can see all of the details you need to put in your **.env** file
- Create Collections
    - Open Firestore Database in Build Menu
    - Create an empty **shops**  **items** and **parts** collection
      - _Note:_ You can customize collection names in the .env file

### Install NodeJS Project

For the latest stable version

```bash
npm install
npm run build
npm run dev
```

It will automatically open [http://localhost:5173](http://localhost:5173) with your primary browser.

