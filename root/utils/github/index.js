const fetch = require('node-fetch')
const jsdom = require("jsdom");
const { URL } = require('url')
const { JSDOM } = jsdom;
const { admin } = require('../../utils/firebase/firebase-admin')

const path = require('path')
const fs = require('fs')
const fbDatabase = admin.database()
const dirPath = `${process.cwd()}/src/crawler/`;
// function fetchDeviceAndUserVerificationCode(req, res) {
//     fetch('https://github.com/login/oauth/authorize?client_id=91c666c1cc595de45f17d0d4cc157c2fd9a76f83&redirect_url=http://localhost:3000/user-settings.html&scope=repo gist&state=gh_state&alow_signup=true', { method: 'get', headers: { 'Accept': 'application/json' } }).then(response => {
//         const status = response.status
//         debugger;
//         return response.json()
//     }).then(async data => {
//         debugger;
//         const dom = await JSDOM.fromFile(`${dirPath}/github-verification.html`)
//         const document = dom.window.document;
//         const label1 = document.createElement('label')
//         label1.setAttribute('for', 'user_code')
//         label1.innerText = 'User verification code:'
//         label1.classList.add('form-label')
//         document.getElementById('root').appendChild(label1)
//         const input1 = document.createElement('input')
//         input1.id = 'user_code'
//         input1.classList.add('form-control')
//         input1.setAttribute('readonly', true)
//         input1.type = 'text'
//         document.getElementById('root').appendChild(input1)
//         const label2 = document.createElement('label')
//         label2.setAttribute('for', 'verification_url')
//         label2.textContent = 'Please, click the following link and enter above verification code:'
//         label2.classList.add('form-label')
//         document.getElementById('root').appendChild(label2)
//         const a = document.createElement('a')
//         a.id = 'verification_uri'
//         a.classList.add('nav-link')
//         a.classList.add('form-control')
//         a.setAttribute('readonly', true)
//         a.textContent = 'Confirmation Link'
//         a.getAttribute("target", "_blank")
//         document.getElementById('root').appendChild(a)
//         document.getElementById('user_code').setAttribute('value', data.user_code)
//         document.getElementById('verification_uri').setAttribute('href', data.verification_uri)
//         deviceAuthRequestPoll({ interval: data.interval, device_code: data.device_code })
//         debugger;
//         const content = dom.serialize()
//         res.setHeader('Content-Type', 'text/html');
//         res.setHeader('Content-Length', Buffer.byteLength(content));
//         res.write(content)
//         res.end()

//     }).catch(error => {
//         console.log('error', error)
//     })

// }

async function fetchGithubAuthCode({ res, redirectUrl, state, client_id }) {
    const url = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${redirectUrl}&scope=repo public_repo workflow user&state=${state}&allow_signup=true`

    res.writeHead(302, { 'Location': url });
    res.end();
}

async function fetchGithubAccessToken({ code, client_id, client_secret, res, req }) {

    const response = await fetch(`https://github.com/login/oauth/access_token?client_id=${client_id}&client_secret=${client_secret}&code=${code}`, { method: 'post', headers: { 'Accept': 'application/json' } })

    const data  = await response.json()
    return data
}

/*
fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=AIzaSyDb8Z27Ut0WJ-RH7Exi454Bpit9lbARJeA`
    , {method:'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postBody: "access_token=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&providerId=github.com", requestUri: "https://turkmenistan-market.firebaseapp.com/__/auth/handler", returnIdpCredential: true, returnSecureToken: true }) }).then(response => response.json()).then(data => {
        debugger;
    }).catch(error => {
        debugger;
    })
*/

async function signInWithIdp({ access_token, filepath, key, res }) {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${key}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postBody: `access_token=${access_token}&providerId=github.com`, requestUri: "https://turkmenistan-market.firebaseapp.com/__/auth/handler", returnIdpCredential: true, returnSecureToken: true }) })

    const { email, emailVerified, federatedId, kind, localId, needConfirmation, oauthAccessToken, photoUrl, providerId, screenName,refreshToken,idToken } = await response.json()
    debugger;
    const dom = await JSDOM.fromFile(filepath)
    const document = dom.window.document;

    var emailInput = document.createElement('input');
    emailInput.setAttribute('type', 'hidden');
    emailInput.setAttribute('id', 'email');
    emailInput.setAttribute('value', email);
    document.body.appendChild(emailInput);

    var emailVerifiedInput = document.createElement('input');
    emailVerifiedInput.setAttribute('type', 'hidden');
    emailVerifiedInput.setAttribute('id', 'emailVerified');
    emailVerifiedInput.setAttribute('value', emailVerified);
    document.body.appendChild(emailVerifiedInput);

    var federatedIdInput = document.createElement('input');
    federatedIdInput.setAttribute('type', 'hidden');
    federatedIdInput.setAttribute('id', 'federatedId');
    federatedIdInput.setAttribute('value', federatedId);
    document.body.appendChild(federatedIdInput);

    var kindInput = document.createElement('input');
    kindInput.setAttribute('type', 'hidden');
    kindInput.setAttribute('id', 'kind');
    kindInput.setAttribute('value', kind);
    document.body.appendChild(kindInput);


    var localIdInput = document.createElement('input');
    localIdInput.setAttribute('type', 'hidden');
    localIdInput.setAttribute('id', 'localId');
    localIdInput.setAttribute('value', localId);
    document.body.appendChild(localIdInput);


    var needConfirmationInput = document.createElement('input');
    needConfirmationInput.setAttribute('type', 'hidden');
    needConfirmationInput.setAttribute('id', 'needConfirmation');
    needConfirmationInput.setAttribute('value', needConfirmation);
    document.body.appendChild(needConfirmationInput);


    var oauthAccessTokenInput = document.createElement('input');
    oauthAccessTokenInput.setAttribute('type', 'hidden');
    oauthAccessTokenInput.setAttribute('id', 'oauthAccessToken');
    oauthAccessTokenInput.setAttribute('value', oauthAccessToken);
    document.body.appendChild(oauthAccessTokenInput);


    var photoUrlInput = document.createElement('input');
    photoUrlInput.setAttribute('type', 'hidden');
    photoUrlInput.setAttribute('id', 'photoUrl');
    photoUrlInput.setAttribute('value', photoUrl);
    document.body.appendChild(photoUrlInput);

    var providerIdInput = document.createElement('input');
    providerIdInput.setAttribute('type', 'hidden');
    providerIdInput.setAttribute('id', 'providerId');
    providerIdInput.setAttribute('value', providerId);
    document.body.appendChild(providerIdInput);



    var screenNameInput = document.createElement('input');
    screenNameInput.setAttribute('type', 'hidden');
    screenNameInput.setAttribute('id', 'screenName');
    screenNameInput.setAttribute('value', screenName);
    document.body.appendChild(screenNameInput);

    var idTokenInput = document.createElement('input');
    idTokenInput.setAttribute('type', 'hidden');
    idTokenInput.setAttribute('id', 'idToken');
    idTokenInput.setAttribute('value', idToken);
    document.body.appendChild(idTokenInput);

    var refreshTokenInput = document.createElement('input');
    refreshTokenInput.setAttribute('type', 'hidden');
    refreshTokenInput.setAttribute('id', 'refreshToken');
    refreshTokenInput.setAttribute('value', refreshToken);
    document.body.appendChild(refreshTokenInput);

    const content = dom.serialize()

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Length', Buffer.byteLength(content));
       res.write(content)
       res.end()

    }
// function deviceAuthRequestPoll({ interval, device_code }) {
//     const pollInterval = setInterval(async () => {
//         //  const url = new URL(`https://github.com/login/oauth/access_token?client_id=da589515a4265ee07cc7 & device_code=${device_code}`).href
//         const url = new URL(`https://github.com/login/oauth/access_token`)
//         url.searchParams.append('client_id', '198fd462ac295507b855')
//         // url.searchParams.append('client_secret', process.env.gh_client_secret)
//         url.searchParams.append('device_code', device_code)
//         const href = url.href
//         debugger;
//         const response = await fetch(href, { method: 'post', headers: { 'Accept': 'application/json' } })
//         debugger;
//         const data = await response.json()
//         console.log('data', data)
//         debugger;

//     }, interval * 2000)
// }

module.exports = { fetchGithubAuthCode, fetchGithubAccessToken, signInWithIdp }



/*
   fetch(`https://api.github.com/repos/webapis/agregators/forks`, { method: 'post', headers: { 'Authorization': `token ${access_token}`, 'Accept': 'application/vnd.github.v3+json' } }).then(response => {
                debugger;
                return response.json()
            }).then(data => {
                debugger;
                const { owner: { login } } = data
                userRef.update({ ghuser: login, gh_action_url: `https://api.github.com/repos/${login}/agregators/actions/workflows/aggregate.yml/dispatches` }, (error) => {
                    if (error) {
                        console.log(error)
                    } else {
                        const filepath = `${process.cwd()}/src/crawler/user-settings.html`;
                        debugger;
                        res.setHeader('Content-Type', 'text/html');
                        fs.createReadStream(filepath).pipe(res)
                    }

                })
            })
*/