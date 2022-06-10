const express = require( "express" );
const app = express();
const port = process.env.PORT; // default port to listen
app.use(express.json())  
// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    res.send( "Hello world!" );
} );

app.post( "/", ( req, res ) => {
    console.log('LCS HELLO WORD', req, req.body)
    res.send( "Hello world!" );
});

// start the Express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
} );

