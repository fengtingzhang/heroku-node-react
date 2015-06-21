# heroku-node-react
Heroku Node App, Connects to your Local Elastic Search Install

# Build
```
npm install
foreman start web
```

You should be able to access your app locally at http://localhost:5000

# Start locally without foreman after install
```
npm start
```
You should be able to access your app locally at port 3000 at http://localhost:3000

# Debug
To debug, or as an alternative to starting your app without installing
heroku and foreman toolbelt, you can use the startup script directly

```
DEBUG=heroku-node-react ./bin/www
```

# Demo App
https://platform-demo-9389.herokuapp.com/?q=Platforms

