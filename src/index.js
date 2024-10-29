const express = require("express");
const { tallyHandler } = require("./tally");
const app = express();
const port = process.env.PORT; // default port to listen
app.use(express.json());
// define a route handler for the default home page
app.get("/", (req, res) => {
    res.send("Hello world!");
});

const TRIGGERS = {
    ops: [
        `nouvelle app sur scalingo`,
        `nouvelle app Scalingo`,
        `créer un compte`,
        `un nom de domaine en beta.gouv`,
        `demande d'apps supplémentaire sur scalingo`,
        `nous aimerions un domaine en .beta.gouv.fr`,
        `créer la mailing list`,
        `nouvelle mailing list`,
        `@beta.gouv.fr`,
    ],
    peertube: [
        `peertube`, // won't trigger anything for the time being
    ],
    help: [
        `mail beta.gouv est arrivée à échéance`,
        `perdu mes accès à ma boite`,
        `ma fiche github a expiré`,
        `plus accès à ma boîte`,
        `plus accès à mes mails`,
        `mon adresse beta.gouv`,
        `mon adresse email a été bloquée`,
        `n'arrive plus à accéder à son mail`,
        `n'arrive plus à accéder à son email`,
        `oublié mon mot de passe`,
        `mon compte n'est pas actif`,
        `n'arrive plus à accéder à sa messagerie`,
        "envoyer un lien de ré initialisation de mot de passe",
        "ne parvient pas à accéder à son compte beta",
        "ne parvient pas à accéder à mon compte beta",
        `n'arrive plus à me connecter à ma boite roundcube`,
        `n'arrive plus à me connecter à sa boite roundcube`,
        `ne reçois plus mes mails`,
        `ne reçoit plus mes mails`,
        `mon mail beta n'existe plus`,
        `qui est suspendu`,
        `pas accès à mon adresse mail`,
        `pas non plus à me connecter à roundcube`,
        `pas à accéder à mon adresse mail`,
        `mon mot de passe ne marche plus`,
        `pas me connecter sur mon adresse beta`,
        `mon adresse beta n'est pas  revenue`,
        `je n'ai plus accès à ma bal beta gouv`,
        `a été supprimée`,
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
        `perdu ses accès`,
        `organisation beta`,
        `organisation github`,
        `semble avoir été supprimé`,
        `semble avoir été désactivé`,
        `oublier mon mot de passe`,
        `plus l'accès à mon mail`,
        `synchroniser mon mail`,
    ],
};

const buildText = {
    help: (params) => {
        return `Hello @${params.user_name}, 
Tu as peut-être un problème fréquent dont la réponse se trouve sans doute dans la doc :
https://doc.incubateur.net/communaute/les-outils-de-la-communaute/espace-membre/faq-espace-membre
N'hésites pas aussi a utiliser la barre de recherche de la doc pour trouver la bonne page.`;
    },
    ops: (params) => {
        return `Hello @${params.user_name}, si tu veux faire une demande d'ops (création d'app scalingo/sentry/matomo/domaine/updown/dashlane/...) tu peux utiliser le formulaire suivant :
${process.env.OPS_FORM_TEXT}`;
    },
    peertube: (params) => {
        return `Hello @${params.user_name}! Oui il y a https://tube.numerique.gouv.fr hébergée par la DINUM et tu peux demander une création de compte pour une SE en écrivant depuis https://tube.numerique.gouv.fr/about/contact et en donnant une adresse mail générique pour ta SE + le nom des gens susceptibles de publier`;
    },
};

app.post("/", (req, res) => {
    if (!process.env.TOKEN.split(",").includes(req.body.token)) {
        return;
    }
    let type;
    if (process.env.OPS_CHANNELS.split(",").includes(req.body.channel_name)) {
        type = "ops";
    } else {
        type = "help";
    }
    let triggers = TRIGGERS[type].map((str) =>
        str
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(" ", "")
    );
    const text = req.body.text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(" ", "");
    if (triggers.some((trigger) => text.includes(trigger))) {
        const responseText = buildText[type](req.body);
        res.json({
            text: responseText,
            response_type: "comment",
        });
    }
});

app.post("/:id", (req, res) => {
    const { id } = req.params;

    if (id === process.env.MATTERMOST_WEBHOOK_PING) {
        return res.json({
            text: `${process.env.MATTERMOST_TEAM_PING}`,
            response_type: "comment",
        });
    }
    if (id === process.env.MATTERMOST_WEBHOOK_PING_ANYWHERE_IN_CHANNEL) {
        if (req.body.text.includes("@team")) {
            return res.json({
                text: `${process.env.MATTERMOST_TEAM_PING}`,
                response_type: "comment",
            });
        }
    }
    if (id === process.env.TALLY_WEBHOOK_ID) {
        tallyHandler(req, res);
    }
});

app.post("/tally/:id", tallyHandler);

// start the Express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
