import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.NODEMAILER_AUTH_USER,
        pass: process.env.NODEMAILER_AUTH_PASS
    }
});

const sendVerificationEmail = async (email, code) => {
    const mailOptions = {
        from: "teste@gmail.com",
        to: email,
        subject: "Email Verification",
        text: `Your verification code is ${code}`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Verification email sent");
    } catch (error) {
        console.error("Error sending verification email:", error);
    }
};

export default {
    sendVerificationEmail
};
