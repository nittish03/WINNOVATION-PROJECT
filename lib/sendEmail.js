import { env } from "process"
import NodeMailer from 'nodemailer'

const transporter = NodeMailer.createTransporter({
    service: 'gmail',
    auth: {
        user: env.EMAIL,
        pass: env.EMAIL_PASS
    }
})

export class OTPHandler {
    constructor(email) {
        this.email = email
        this.otp = this.generateOTP()
    }

    generateOTP = () => {
        return Math.floor(100000 + Math.random() * 900000);
    }

    getOTP = () => this.otp

    sendOTP = () => {
        sendEmail(this.email, `
            <div style="font-family: Arial, sans-serif; padding: 2rem; background-color: #f6f6f6; border-radius: 1rem;">
                <h1 style="text-align: center; color: #333;">Student Skill Development Portal</h1>
                <p style="text-align: center; font-size: 1.5rem;">Your OTP is <strong>${this.otp}</strong></p>
                <p style="text-align: center; color: #666;">This OTP will expire in 5 minutes.</p>
            </div>
        `, "Email Verification OTP")
    }
}

export function sendEmail(emailTo, msg, subject) {
    const mailOptions = {
        from: env.EMAIL,
        to: emailTo,
        subject: subject,
        html: msg
    }

    transporter.sendMail(mailOptions, (error, _) => {
        if (error) {
            throw new Error(error.message)
        }
    })
}
