const express = require( "express" );
const app = express();
const port = process.env.PORT; // default port to listen
app.use(express.json())  
// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    res.send( "Hello world!" );
} );
app.post( "/", ( req, res ) => {
    console.log('LCS HELLO WORD', req.body.text, req.body)
    console.log(req.body.channel_name)
    const triggers = [
        `j'ai perdu mes accès à ma boite mail`,
        `n'arrive plus à accéder à son mail`,
        'envoyer un lien de ré initialisation de mot de passe',
        'ne parvient pas à accéder à son compte beta',
        `je n'arrive plus à me connecter à boite roundcube`,
        `Je ne reçois plus mes mails sur mon adresse beta`,
        `je n'arrive pas non plus à me connecter à roundcube`,
        `je n'arrive pas me connecter sur mon adresse beta`,
        `je n'ai plus accès à ma bal beta gouv`,
        `mon email ne fonctionne plus`,
        `Soucis avec mon adresse mail beta`,
        `n'arrive pas à se connecter à Mattermost`,
        `je ne peux plus accéder à ma boite mail`,
        `je ne peux plus accéder à ma boite email`,
        `réinitialiser mon mot de passe`,
        `email de bienvenue`,
        `Il n'a pas reçu le mail`,
        `a perdu accès à sa boîte mail Beta`,
        `perdu l'accès à ma boîte`,
        `perdu ses accès`
    ].map(str => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
    const text = req.body.text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    if (triggers.includes(text)) {
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

