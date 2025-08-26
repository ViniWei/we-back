import nodemailer from "nodemailer";
import Handlebars from "handlebars";
import fs from "fs/promises";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_AUTH_USER,
        pass: process.env.SMTP_AUTH_PASS
    }
});

const sendVerificationEmail = async (email, code) => {

    const templateHtml = await fs.readFile("./templates/verify.html", "utf-8");
    const compiledTemplate = Handlebars.compile(templateHtml);
    const html = compiledTemplate({ appName: "WE", code, logoUrl: "logo.png" });

    const mailOptions = {
        from: process.env.SMTP_AUTH_USER,
        to: email,
        subject: "VERIFICAÇÃO DE E-MAIL - WE",
        html
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending verification email:", error);
    }
};

export default {
    sendVerificationEmail
};
