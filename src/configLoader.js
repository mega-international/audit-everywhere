
function handleResponse() {
  try {
    console.log('[Mega] Loading config file');
    const req = new XMLHttpRequest();
    req.open('GET', `${process.env.BASE_URL}config/config.json`, false);
    req.send(null);
    try {
      window.localStorage.setItem('config', req.response);
      return JSON.parse(req.response);
    } catch (error) {
      console.log(error);
      if (process.env != 'production') console.log(error);
      return false;
    }
  } catch (error) {
    console.log('[Mega] Trying to load from local storage');
    if (!window.localStorage.getItem('config')) return false;
    const config = window.localStorage.getItem('config');
    return JSON.parse(config);
  }
}

export default handleResponse();
