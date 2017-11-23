var dbx = new Dropbox({ accessToken: '5ELyqCYdMsgAAAAAAAARXvThZCMeswz0opKTjg2eQ2U9w-3tjtcEcH2tBDQu7vpq' });
dbx.filesUpload({path: '/helloWorld.txt', contents: 'hello, world!'})
  .then(function(response) {
    console.log(response);
  })
  .catch(function(error) {
    console.error(error);
  });
