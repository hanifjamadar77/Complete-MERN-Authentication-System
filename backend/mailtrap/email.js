import {VERIFICATION_EMAIL_TEMPLATE} from './emailTemplets.js'
import { mailtrapClient, sender } from './mailtrap.config.js'

export const sendVerificationEmail = async (email , verificationCode) =>{
    const recipient = [{email}]

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to : recipient,
            subject : "Verify your email",
            html : VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationCode),
            category : "Email verification"
        })

        console.log("Verification email sent:", response);

    } catch (error) {
        console.error("Error sending verification email:", error);
        throw new Error(`Failed to send verification email to ${error}`);
        
    }
}