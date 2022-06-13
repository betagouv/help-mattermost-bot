const express = require( "express" );
const app = express();
const port = process.env.PORT; // default port to listen
app.use(express.json())  
// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    res.send( "Hello world!" );
} );
app.post( "/", ( req, res ) => {
    if (!process.env.TOKEN.split(',').includes(req.body.token)) { 
        return
    }
    const triggers = [
        `perdu mes accès à ma boite`,
        `n'arrive plus à accéder à son mail`,
        `n'arrive plus à accéder à son email`,
        'envoyer un lien de ré initialisation de mot de passe',
        'ne parvient pas à accéder à son compte beta',
        'ne parvient pas à accéder à mon compte beta',
        `n'arrive plus à me connecter à ma boite roundcube`,
        `n'arrive plus à me connecter à sa boite roundcube`,
        `ne reçois plus mes mails`,
        `ne reçoit plus mes mails`,
        `pas non plus à me connecter à roundcube`,
        `pas me connecter sur mon adresse beta`,
        `je n'ai plus accès à ma bal beta gouv`,
        `mon email ne fonctionne plus`,
        `Soucis avec mon adresse`,
        `n'arrive pas à se connecter à Mattermost`,
        `ne peux plus accéder à ma boite`,
        `ne peut plus accéder à sa boite`,
        `réinitialiser mon mot de passe`,
        `email de bienvenue`,
        `n'a pas reçu le mail`,
        `perdu accès à sa boîte`,
        `perdu l'accès à ma boîte`,
        `perdu ses accès`
    ].map(str => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
    const text = req.body.text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    if (triggers.some(trigger => text.includes(trigger))) {
        res.json({
            text: `Hello @${req.body.user_name}, tu sembles avoir un problème fréquent dont la réponse se trouve sans doute dans la doc : 
            https://doc.incubateur.net/communaute/travailler-a-beta-gouv/jutilise-les-outils-de-la-communaute/problemes-frequents 
            N'hésites pas aussi a utiliser la barre de recherche de la doc pour trouver la bonne page.`,
            response_type: 'comment',
        })
    }
});

// start the Express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
} );

