# ![Logo](./src/assets/logo_48.png) StorageR

[![build](https://github.com/Reterics/storager/actions/workflows/npm-build-test.yml/badge.svg)](https://github.com/Reterics/storager/actions/workflows/npm-build-test.yml) ![maintenance-status](https://img.shields.io/badge/maintenance-actively--developed-brightgreen.svg)

![Preview](./public/img/screenshot.png)

Lightweight Cloud based storage and service management application based on React, Typescript and Tailwind.

## Getting started 🚀

### Preparing Cloud Environment ☁️

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
    - Create an empty **shops**  **items** **parts** **services** **completions** **settings** and **users** collection
      - _Note:_ You can customize collection names in the .env file

### Environment Setup

1. Install dependencies

```bash
npm install
```

2. Create a .env file based on .env.template
```bash
cp .env.example .env
```

3. Setup environment variables based on your GCP Firebase cloud setup

```dotenv
VITE_FIREBASE_APIKEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGE_SENDER_ID=your-message-sender-id
VITE_FIREBASE_APP_ID=your-firebase-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id

VITE_FIREBASE_DB_SHOPS=shops
VITE_FIREBASE_DB_ITEMS=items
VITE_FIREBASE_DB_PARTS=parts
VITE_FIREBASE_DB_SERVICES=services
VITE_FIREBASE_DB_COMPLETIONS=completions
VITE_FIREBASE_DB_SETTINGS=settings
VITE_FIREBASE_DB_USERS=users

VITE_BASENAME=/
```

4. Start the development server 🔥
```bash
npm dev
```
It will automatically open [http://localhost:5173](http://localhost:5173) with your primary browser.

5. Build when you are ready
```bash
npm build
```




## Contribute

There are many ways to [contribute](./CONTRIBUTING.md) to StorageR.
* [Submit bugs](https://github.com/Reterics/storager/issues) and help us verify fixes as they are checked in.
* Review the [source code changes](https://github.com/Reterics/storager/pulls).
* [Contribute bug fixes](https://github.com/Reterics/storager/blob/main/CONTRIBUTING.md).

