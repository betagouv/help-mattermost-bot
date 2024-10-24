const axios = require("axios");
const { createHmac } = require("crypto");

function generateMarkdown(jsonData) {
    let markdown = `**Form Response Summary:**\n\n`;

    markdown += `- **Event Type:** ${jsonData.eventType}\n`;
    markdown += `- **Form Name:** ${jsonData.data.formName}\n`;
    markdown += `- **Response ID:** ${jsonData.data.responseId}\n`;
    markdown += `- **Respondent ID:** ${jsonData.data.respondentId}\n`;
    markdown += `- **Created At:** ${new Date(
        jsonData.data.createdAt
    ).toLocaleString()}\n\n`;

    markdown += `**Fields:**\n`;

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
                markdown += `- **${field.label}:** ${options}\n`;
            } else if (field.type === "FILE_UPLOAD") {
                const files = field.value
                    .map((file) => `[${file.name}](${file.url})`)
                    .join(", ");
                markdown += `- **${field.label}:** ${files}\n`;
            } else if (field.type === "RANKING") {
                const rankingOptions = field.options
                    .filter((option) => field.value.includes(option.id))
                    .map((option) => option.text)
                    .join(" > ");
                markdown += `- **${field.label}:** ${rankingOptions}\n`;
            }
        } else {
            if (field.type === "PAYMENT") {
                markdown += `- **${field.label}:** ${field.value}\n`;
            } else {
                markdown += `- **${field.label}:** ${field.value}\n`;
            }
        }
    });

    return markdown;
}

async function tallyHandler(req, res) {
    const webhookPayload = req.body;
    const receivedSignature = req.headers["tally-signature"];

    const tallySigninSecret = process.env.TALLY_SIGNIN_SECRET;

    // Calculate the signature using the signing secret and the payload
    const calculatedSignature = createHmac("sha256", tallySigninSecret)
        .update(JSON.stringify(webhookPayload))
        .digest("base64");

    // Compare the received signature with the calculated signature
    if (receivedSignature === calculatedSignature) {
        // Signature is valid, process the webhook payload
        await axios.post(
            `https://mattermost.incubateur.net/hooks/${process.env.MATTERMOST_TALLY_WEBHOOK_ID}`,
            { text: generateMarkdown(webhookPayload) }
        );
        res.status(200).send("Webhook received and processed successfully.");
    } else {
        // Signature is invalid, reject the webhook request
        res.status(401).send("Invalid signature.");
    }
}

module.exports = {
    tallyHandler,
};
