export const getConfig = (URL, configUrl, config) => {
  if(URL.indexOf(configUrl) > -1 ) {
    const country = URL.substring(configUrl.length);
    const countryConfig = config[country] || null;
    return Promise.resolve({data: countryConfig});
  } else {
    return Promise.reject({data: null});
  }
}