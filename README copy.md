# Noona Workflow

## About the App

Noona Workflow is an integration hub for Noona HQ, enabling users to trigger actions based on events in Noona HQ.

With Noona Workflow, you can create workflows that are activated by specific events in Noona HQ. These workflows can be triggered immediately when an event occurs or scheduled to execute at a specified time before or after the event.

The app features a user-friendly wizard that guides users through the setup process, simplifying complexity and ensuring a smooth experience.

### Example Use Cases:
- Automatically send a personalized email when an appointment is booked.
- Automatically send a personalized SMS when an appointment is booked.
- Automatically send orders to Entro or other systems through custom webhooks.
- Automatically customize an appointment for noona mobile app.
- Trigger custom webhooks.


### How It Works:

1. **Select a Trigger:**
   <img src="docs/1.png" width="800">

2. **Configure Settings:**
   Adjust the relevant configurations for each trigger.
   
   <img src="docs/02.PNG" width="800">
   <img src="docs/01.PNG" width="800">


3. **Select service:**
   Adjust the relevant configurations for each services.
   
   <img src="docs/03.PNG" width="800">


4. **Pick an Action:**
   <img src="docs/04.PNG" width="800">
   <img src="docs/05.PNG" width="800">

## Technology

This app is built with Remix.
📖 For more information, refer to the [Remix documentation](https://remix.run/docs) and the [Remix Vite documentation](https://remix.run/docs/en/main/guides/vite).

The data is stored in Firebase Firestore.

## Development

Start the Vite development server:
```shell
npm run dev
```

## Deployment

To deploy the app, follow these steps:

1. Build the app for production:
   ```sh
   npm run build
   ```


   This process will create a Docker image from the source code. The container starts up when it receives requests and shuts down in between.

## Folders and Files

`/app`: Contains the code for the main application.



`server.js`: The Node.js server that runs the Remix app in production.
