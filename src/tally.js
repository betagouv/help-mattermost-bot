const axios = require("axios");
const { createHmac } = require("crypto");

function generateMarkdown(jsonData) {
    let markdown = `**Nouvelle réponse au formulaire Tally: ${jsonData.data.formName}**\n\n`;

    jsonData.data.fields.forEach((field) => {
        if (Array.isArray(field.value)) {
            if (
                field.type === "MULTIPLE_CHOICE" ||
                field.type === "CHECKBOXES" ||
                field.type === "MULTI_SELECT"
            ) {
                const options = field.options
                    .filter((option) => field.value.includes(option.id))
                    .map((option) => option.text)
                    .join(", ");
                markdown += `- **${field.label}:**\n${options}\n`;
            } else if (field.type === "FILE_UPLOAD") {
                const files = field.value
                    .map((file) => `[${file.name}](${file.url})`)
                    .join(", ");
                markdown += `- **${field.label}:**\n${files}\n`;
            } else if (field.type === "RANKING") {
                const rankingOptions = field.options
                    .filter((option) => field.value.includes(option.id))
                    .map((option) => option.text)
                    .join(" > ");
                markdown += `- **${field.label}:**\n${rankingOptions}\n`;
            }
        } else {
            if (field.type === "PAYMENT") {
                markdown += `- **${field.label}:**\n${field.value}\n`;
            } else {
                markdown += `- **${field.label}:**\n${field.value}\n`;
            }
        }
    });

    return markdown;
}

const isSignatureVerified = (req) => {
    if (!process.env.TALLY_SIGNIN_SECRET) {
        return false;
    }
    const receivedSignature = req.headers["tally-signature"];
    const tallySigninSecret = process.env.TALLY_SIGNIN_SECRET;

    // Calculate the signature using the signing secret and the payload
    const calculatedSignature = createHmac("sha256", tallySigninSecret)
        .update(JSON.stringify(webhookPayload))
        .digest("base64");
    return receivedSignature === calculatedSignature;
};

async function tallyHandler(req, res) {
    const webhookPayload = req.body;
    const { id } = req.params;
    const isTallySigninEnable = process.env.TALLY_SIGNIN_ENABLE;

    // Compare the received signature with the calculated signature
    if (!isTallySigninEnable || isSignatureVerified(req)) {
        // Signature is valid, process the webhook payload
        await axios.post(`https://mattermost.incubateur.net/hooks/${id}`, {
            text: generateMarkdown(webhookPayload),
        });
        res.status(200).send("Webhook received and processed successfully.");
    } else {
        // Signature is invalid, reject the webhook request
        res.status(401).send("Invalid signature.");
    }
}

module.exports = {
    tallyHandler,
};
