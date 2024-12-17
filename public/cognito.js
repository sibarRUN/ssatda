import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'ap-northeast-2_ivdYIN7gR',
  ClientId: '6tnct5lftekfjnvoq4fa8810pj'
};

const userPool = new CognitoUserPool(poolData);

   function authenticateUser(username, password) {
     const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
       Username: username,
       Password: password,
     });

     const userData = {
       Username: username,
       Pool: userPool,
     };

     const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

     cognitoUser.authenticateUser(authenticationDetails, {
       onSuccess: (session) => {
         console.log('Authentication successful!');
         console.log('ID Token:', session.getIdToken().getJwtToken());
         console.log('Access Token:', session.getAccessToken().getJwtToken());
         console.log('Refresh Token:', session.getRefreshToken().getToken());
       },
       onFailure: (err) => {
         console.error('Authentication failed:', err);
       },
     });
   }

// 추가적인 Cognito 기능 구현
