const router = require('express').Router()
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const bcrypt = require('bcryptjs')
const User = require('../models/User')

// In-memory token store { token: { userId, expires } }
const resetTokens = {}

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

// POST /api/reset/request
router.post('/request', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required' })

    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'No account found with this email' })

    const token = crypto.randomBytes(32).toString('hex')
    resetTokens[token] = { userId: user._id.toString(), expires: Date.now() + 15 * 60 * 1000 }

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`

    await getTransporter().sendMail({
      from: `"EE Project Hub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your EE Project Hub Password',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f4f6fb;border-radius:16px">
          <h2 style="color:#1a237e">⚡ EE Project Hub</h2>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>You requested a password reset. Click the button below to set a new password.</p>
          <a href="${resetLink}" style="display:inline-block;margin:20px 0;padding:12px 28px;background:#1a237e;color:#fff;border-radius:10px;text-decoration:none;font-weight:700">Reset Password</a>
          <p style="color:#6b7280;font-size:13px">This link expires in 15 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `,
    })

    res.json({ message: 'Password reset link sent to your email' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to send email. Please try again.' })
  }
})

// POST /api/reset/confirm
router.post('/confirm', async (req, res) => {
  try {
    const { token, password } = req.body
    if (!token || !password) return res.status(400).json({ message: 'Token and password are required' })
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })

    const record = resetTokens[token]
    if (!record) return res.status(400).json({ message: 'Invalid or expired reset link' })
    if (Date.now() > record.expires) {
      delete resetTokens[token]
      return res.status(400).json({ message: 'Reset link has expired. Please request a new one.' })
    }

    const user = await User.findById(record.userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    user.password = password
    await user.save()
    delete resetTokens[token]

    res.json({ message: 'Password reset successfully! You can now login.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
