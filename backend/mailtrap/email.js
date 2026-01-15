import {VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE} from './emailTemplets.js'
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
        throw new Error(`Failed to send verification email: ${error.message}`);
        
    }
}

export const sendWelcomeEmail = async (email, name) =>{
    const recipient = [{email}]

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to : recipient,
            template_uuid : "81eff79c-186d-4469-9e50-3bd7dd60f1ab",
            template_variables:{
                company_info_name : "Auth System",
                name : name
            }
        })

        console.log("Welcome email sent:", response);

    } catch (error) {
        console.error("Error sending welcome email:", error);
        throw res.status(500).json({success:false, message:`Failed to send welcome email to ${email}`});
    }
}

export const sendPasswordResetEmail = async (email, resetLink) =>{
    const recipient = [{email}]

    try {
        const response = await mailtrapClient.send({
            from : sender,
            to: recipient,
            subject : "Password Reset Request",
            html : PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetLink}", resetLink),
            category : "Password Reset"
        })
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw new Error(`Failed to send password reset email to ${email}`);
    }
}

export const setResetSuccessEmail = async (email) =>{
    const recipient = [{email}]

    try {
        const response = await mailtrapClient.send({
            from : sender,
            to : recipient,
            subject : "Password Reset Successful",
            html : PASSWORD_RESET_SUCCESS_TEMPLATE,
            category : "Password Reset Success"
        })
    } catch (error) {
        throw new Error(`Failed to send password reset success email to ${email}`);
    }
}