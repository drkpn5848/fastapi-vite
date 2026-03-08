//export const APIURL = "https://pbl.klef.in/";
//export const APIURL = "http://localhost:8000/";
export const APIURL = "http://backend:8000/"
export const IMGURL = import.meta.env.BASE_URL;

export function callApi(rmethod, url, data, responseHandler, errorHandler, csrid = "",)
{
    let options = (rmethod === "GET" || rmethod === "DELETE")? {method: rmethod, headers: {'Content-Type' : 'application/json', token: csrid}} : {method: rmethod, headers: {'Content-Type' : 'application/json', token: csrid}, body: data};
    fetch(url, options)
        .then((response) => {
            if(!response.ok)
                throw new Error(response.status + ": " + response.statusText);
            return response.json();
        })
        .then((res) => responseHandler(res))
        .catch((err) => errorHandler(err.message));
}

export function setSession(sesName, sesValue, expiry){
    document.cookie = `${sesName}=${encodeURIComponent(sesValue)};path=/;max-age=${expiry * 86400}`;
}

export function getSession(sesName){
    let decodedCookie = decodeURIComponent(document.cookie);
    let cookieData = decodedCookie.split(";");
    for(let x in cookieData){
        if(cookieData[x].includes(sesName))
            return cookieData[x].split("=")[1];
    }
    return ""
}

export function cipher(text, key="KPN") {
  let result = '';
  const keyLength = key.length;
  for (let i = 0; i < text.length; i++) {
    const xorValue = text.charCodeAt(i) ^ key.charCodeAt(i % keyLength);
    result += String.fromCharCode(xorValue);
  }
  return result;
}