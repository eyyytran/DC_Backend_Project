const express = require('express')
const { Users, Cards, Projects, UserProjects } = require('../../db/models')
const router = express.Router()
const { v4 } = require('uuid')
const bcrypt = require('bcrypt')
const checkLogin = require('../../util/checkLogin')
// user registration
router.post('/register', async (req, res) => {
    const { username, password, email } = await req.body
    try {
        const salt = await bcrypt.genSalt(5)
        const hashedPassword = await bcrypt.hash(password, salt)
        const userToCreate = {
            id: v4(),
            username,
            password: hashedPassword,
            email,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        const user = await Users.create(userToCreate)
        req.session.user = user
        res.status(200).send(user)
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
})
// login
router.post('/login', async (req, res) => {
    const { email, password } = req.body
    const user = await Users.findOne({
        where: { email: email },
    })
    const validateUser = user.dataValues
    const validated = await bcrypt.compare(password, validateUser.password)
    if (validated) {
        req.session.user = user
        res.status(200).send('login successful')
    } else {
        res.status(400).send('login failed')
    }
})
// update user
router.put('/update_user', checkLogin, async (req, res) => {
    const { email, password, newPassword, newEmail, newUsername } = req.body
    try {
        const user = await Users.findOne({ where: { email: email } })
        const validateUser = user.dataValues
        const validated = await bcrypt.compare(password, validateUser.password)
        if (!validated) {
            res.status(400).send('Check email and password')
        } else {
            const salt = await bcrypt.genSalt(5)
            const hashedPassword = await bcrypt.hash(newPassword, salt)
            user.set({
                username: newUsername,
                password: hashedPassword,
                email: newEmail,
                updatedAt: new Date(),
            })
            await user.save()
            res.status(200).send(user)
        }
    } catch (error) {
        res.status(400).send('could not find')
        console.log(error)
    }
})
// delete account
router.delete('/destroy_user', checkLogin, async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await Users.findOne({ where: { email: email } })
        const validateUser = user.dataValues
        const validated = await bcrypt.compare(password, validateUser.password)
        if (!validated) {
            res.status(400).send('Check email and password')
        } else {
            user.destroy()
            res.send('User account removed')
        }
    } catch (error) {
        res.status(400).send('could not complete')
        console.log(error)
    }
})
// delete guest account and everything associated
router.delete("/destroy_guest", checkLogin, async (req, res) => {
  try {
    if (req.session.user.username === 'guest'){
    const guest = await Users.findByPk(req.session.user.id);
    const allProjectIDs = await UserProjects.findAll({
      where: { userID: guest.id },
      attributes: ["projectID"],
    });
    await UserProjects.destroy({ where: { userID: guest.id } });
    for (let index = 0; index < allProjectIDs.length; index++) {
      const projectID = allProjectIDs[index].dataValues.projectID;
      await Cards.destroy({ where: { projectID: projectID } });
      await Projects.destroy({ where: { id: projectID } });
    }
    await guest.destroy();
    res.status(200).send("guest destroyed");}
  } catch (error) {
    res.status(400).send("error");
  }
});
//end session
router.put('/logout', checkLogin, (req, res) => {
    try {
        req.session.user = null
        res.status(200).send('session ended')
    } catch (error) {
        res.status(400).send('could not end session')
        console.log(error)
    }
})

module.exports = router
