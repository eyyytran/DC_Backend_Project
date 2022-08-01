const submitBtn = document.getElementById('submit-button')
const form = document.getElementById('form-login')

//utilities
const isRequired = value => (value === '' ? false : true)

const isEmail = email => {
    const re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

    return re.test(email)
}

//validations
const checkEmail = e => {
    let valid = false
    const email = e.target.form[0].value
    if (!isRequired(email)) {
        showError(e.target.form[0], 'Please enter your email.')
    } else if (!isEmail(email)) {
        console.log(isEmail(email))
        showError(e.target.form[0], 'This is not an email. Try again.')
    } else {
        showSuccess(e.target.form[0])
        valid = true
    }
    return valid
}

//response to user
const showError = (input, message) => {
    const formField = input.parentElement
    formField.classList.remove('success')
    formField.classList.add('error')
    const feedback = formField.querySelector('small')
    feedback.textContent = message
}

const showSuccess = input => {
    const formField = input.parentElement
    formField.classList.remove('error')
    formField.classList.add('success')
    const feedback = formField.querySelector('small')
    feedback.textContent = ''
}

//forms and submissions
const submitForm = async e => {
    const Email = e.target.form[0].value
    const Password = e.target.form[1].value
    const data = {
        email: Email,
        password: Password,
    }
    try {
        const request = await fetch('http://localhost:3001/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Access-Control-Allow-Origin': '*',
                // 'Access-Control-Allow-Methods': 'POST',
            },
            body: JSON.stringify(data),
        })
        alert('Login successful')
        window.location.href = 'http://localhost:3001/dashboard'
    } catch (error) {
        alert('Unable login')
    }
}

submitBtn.onclick = e => {
    e.preventDefault()
    let isEmailValid = checkEmail(e)

    if (!isEmailValid) {
        console.log('Will not be submitted')
        alert('Unable to submit form')
    } else {
        console.log('Will be submitted')
        submitForm(e)
    }
}
