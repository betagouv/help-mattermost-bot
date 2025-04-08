// @ts-check
const express = require("express");
const { tallyHandler } = require("./tally");
const app = express();
const port = process.env.PORT; // default port to listen
app.use(express.json());
// define a route handler for the default home page
app.get("/", (req, res) => {
    res.send("Hello world!");
});

const normalize = (str) =>
    str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

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
        // EMAIL
        `mail beta.gouv est arrivée à échéance`,
        `plus accès à mes mails`,
        `mon adresse email a été bloquée`,
        `plus accès à ma boîte`,
        `mon adresse beta.gouv`,
        `perdu mes accès à ma boite`,
        `n'arrive plus à accéder à son mail`,
        `n'arrive plus à accéder à son email`,
        `ne reçois plus mes mails`,
        `ne reçoit plus mes mails`,
        `mon mail beta n'existe plus`,
        `pas accès à mon adresse mail`,
        `pas à accéder à mon adresse mail`,
        `mon email ne fonctionne plus`,
        `Soucis avec mon adresse`,
        `n'arrive pas à se connecter à Mattermost`,
        `ne peux plus accéder à ma boite`,
        `ne peut plus accéder à sa boite`,
        `email de bienvenue`,
        `n'a pas reçu le mail`,
        `perdu accès à sa boîte`,
        `perdu l'accès à ma boîte`,
        `plus l'accès à mon mail`,
        `synchroniser mon mail`,

        //COMPTE
        `oublié mon mot de passe`,
        `mon compte n'est pas actif`,
        `n'arrive plus à accéder à sa messagerie`,
        "envoyer un lien de ré initialisation de mot de passe",
        "ne parvient pas à accéder à son compte beta",
        "ne parvient pas à accéder à mon compte beta",
        `n'arrive plus à me connecter à ma boite roundcube`,
        `n'arrive plus à me connecter à sa boite roundcube`,
        `qui est suspendu`,
        `pas non plus à me connecter à roundcube`,
        `mon mot de passe ne marche plus`,
        `pas me connecter sur mon adresse beta`,
        `mon adresse beta n'est pas  revenue`,
        `je n'ai plus accès à ma bal beta gouv`,
        `a été supprimée`,
        `réinitialiser mon mot de passe`,
        `perdu ses accès`,
        `organisation beta`,
        `organisation github`,
        `semble avoir été supprimé`,
        `semble avoir été désactivé`,
        `oublier mon mot de passe`,
    ],
    segur: [
        `demande d'accès`,
        `badge`,
        `accès`
    ],
    reservation: [
        `réservation`,
        `salle disponible`,
        `salle`,
        `réunion`
    ]
};

/**
 *
 * @param {string} query
 */
const findMatch = (type, query) => {
    const text = normalize(query);
    const triggers = TRIGGERS[type].map(normalize);
    const match = triggers.find((trigger) => text.includes(trigger));
    return match;
};

const buildText = {
    help: (params) => {
        return `:dizzy: Bonjour @${params.user_name} ! 
Si ton message concerne un problème d’accès à un outil ou service de la communauté beta.gouv.fr (comme l'espace membre, ton mail beta.gouv.fr, brevo, tally, etc.), merci de poser ta question directement sur Crisp (notre support dédié).
Cela nous permet de mieux vous accompagner et de suivre les demandes plus efficacement. 🙏
[➡️ Je contacte le support](${process.env.CRISP_CHAT_URL})       
Merci 😊`;
    },
    ops: (params) => {
        return `Hello @${params.user_name}, si tu veux faire une demande d'ops (création d'app scalingo/sentry/matomo/domaine/updown/...) tu peux utiliser le formulaire suivant :
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
    if (process.env.BADGE_CHANNELS.split(",").includes(req.body.channel_name)) {
        const matchBadge = findMatch('segur', req.body.text);
        if (matchBadge) {
            res.json({
                text: `Hello, il y a un formulaire en en-tête où tu peux faire une demande d'accès aux bureaux ségur.`,
                response_type: "comment",
            });
            return;
        }
        const matchReservation = findMatch('reservation', req.body.text);
        if (matchReservation) {
            res.json({
                text: `Hello, il y a un pad en en tête de ce channel dans : "Autres informations" qui t'explique comment réserver une salle à ségur`,
                response_type: "comment",
            });
            return;
        }
    }
    let type;
    if (process.env.OPS_CHANNELS.split(",").includes(req.body.channel_name)) {
        type = "ops";
    } else {
        type = "help";
    }
    const match = findMatch(type, req.body.text);
    if (match) {
        const responseText = buildText[type](req.body);
        res.json({
            text: responseText,
            response_type: "comment",
        });
    }
});

app.post("/tally/:id", tallyHandler);

// @ts-ignore todo
app.post("/:id", (req, res) => {
    const { id } = req.params;

    if (id === process.env.MATTERMOST_WEBHOOK_PING) {
        return res.json({
            text: process.env.MATTERMOST_TEAM_PING,
            response_type: "comment",
        });
    }
    if (id === process.env.MATTERMOST_WEBHOOK_PING_ANYWHERE_IN_CHANNEL) {
        if (req.body.text.includes("@team")) {
            return res.json({
                text: process.env.MATTERMOST_TEAM_PING,
                response_type: "comment",
            });
        }
    }
});

app.post("/:idc", (req, res) => {
    res.json({ io: 42 });
});

// start the Express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});

module.exports = {
    findMatch,
};
