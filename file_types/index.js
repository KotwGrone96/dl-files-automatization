import { join } from 'path';
import ytdl from 'ytdl-core';
import fs from 'fs';
// import { __dirname } from './../basepaths.js';
import puppeteer from 'puppeteer';
import axios from 'axios';

//? MÉTODO PARA DESCARGAR VIDEOS DE YOUTUBE
export const downloadYT = async(url='', path='', filename='')=> {
  try {
    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, { filter: 'audioandvideo' });
    //TODO: Algunos videos tienen el codec de audio separado y este no se descarga.
    //TODO: Para evitar eso es necesario { filter: 'audioandvideo' } en las opciones.

    const videoStream = ytdl(url, { format });
    const fileStream = fs.createWriteStream(join(path, filename));
    videoStream.pipe(fileStream);

    await new Promise((resolve, reject) => {
      fileStream.on('finish', () => resolve(true));
      fileStream.on('error', (err) => reject(err));
    });
    console.log(`${filename} descargado correctamente`);
    return true; //TODO: Devuelve TRUE si se completó la descarga.
  } catch (err) {
    console.error(`${filename} ERROR EN LA DESCARGA`);
    return false; //TODO: Devuelve FALSE en caso de error.
  }
};

//? MÉTODO PARA DESCARGAR VARIOS TIPOS DE ARCHIVOS
//TODO: Algunos enlaces utilizan protocolo http y otros https.
//TODO: Para no estar validando cuando usar un protocolo u otro usamos la librería AXIOS.
export const downloadFile = async (url='', path='', title='') => {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });
 
    const mime = response.headers['content-type']; //TODO: Con el mime-type sabremos el tipo de archivo

    let filename = '';

    switch (mime) {
      case 'application/pdf':
        filename = `${title}.pdf`;
        break;
      case 'image/jpeg':
        filename = `${title}.jpg`;
        break;
      case 'image/gif':
        filename = `${title}.gif`;
        break;  
      case 'image/png':
        filename = `${title}.png`;
        break;    
      case 'image/svg+xml':
        filename = `${title}.svg`;
        break;  
      case 'image/tiff':
        filename = `${title}.tiff`;
        break;  
      case 'image/webp':
        filename = `${title}.webp`;
        break;       
      case 'image/bmp':
        filename = `${title}.bmp`;
        break;  
      case 'audio/mpeg':
        filename = `${title}.mp3`;
        break;   
      case 'audio/wav':
        filename = `${title}.wav`;
        break;   
      case 'audio/mp3':
        filename = `${title}.mp3`;
        break;    
      case 'audio/webm':
        filename = `${title}.webm`;
        break;   
      case 'video/mp4':
        filename = `${title}.mp4`;
        break; 
    
      default:
        break;
    }

    if(filename == '') return {
      ok:false,
      filename
    };//TODO: Devuelve FALSE en caso de no encontrar el mime-type en la lista.

    const writer = fs.createWriteStream(join(path,filename));
    await response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(true));
      writer.on('error', (err) => reject(err));
    });

    console.log(`${filename} descargado correctamente`);
    return {
      ok:true,
      filename
    }; //TODO: Devuelve TRUE si se completó la descarga.
  } catch (error) {
    console.error(`${filename} ERROR EN LA DESCARGA`);
    return {
      ok:false,
      filename
    }; //TODO: Devuelve FALSE en caso de error.
  }
}
  
  
  
//? MÉTODO PARA DESCARGAR ARCHIVOS PDF
//TODO: Algunos enlaces utilizan protocolo http y otros https.
//TODO: Para no estar validando cuando usar un protocolo u otro usamos la librería AXIOS.
export const downloadPDF = async (url='', path='', filename='') => {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });
 
    const writer = fs.createWriteStream(join(path,filename));
    await response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(true));
      writer.on('error', (err) => reject(err));
    });

    console.log(`${filename} descargado correctamente`);
    return true; //TODO: Devuelve TRUE si se completó la descarga.
  } catch (error) {
    console.error(`${filename} ERROR EN LA DESCARGA`);
    return false; //TODO: Devuelve FALSE en caso de error.
  }
}

//? MÉTODO PARA DESCARGAR ARCHIVOS DE VIDEO
//TODO: Algunos enlaces utilizan protocolo http y otros https.
//TODO: Para no estar validando cuando usar un protocolo u otro usamos la librería AXIOS.
export const downloadVideo = async (url='', path='', filename='') => {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });
    const writer = fs.createWriteStream(join(path,filename));
    await response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(true));
      writer.on('error', (err) => reject(err));
    });
    console.log(`${filename} descargado correctamente`);
    return true; //TODO: Devuelve TRUE si se completó la descarga.
  } catch (error) {
    console.error(`${filename} ERROR EN LA DESCARGA`);
    return false; //TODO: Devuelve FALSE en caso de error.
  }
}


export const GET_HREF_CNTV = async (page, url='') => {
  try {
    await page.goto(url);
    const href = await page.$eval('div.download-serie a.download-button', el => el.getAttribute('href'));
    return href;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const get_mime_type = async(url) => {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  const mime = response.headers['content-type'];

  return mime;
}


//? MÉTODO PARA OBTENER EL ID YOUTUBE DE LOS VIDEOS DE KHAN ACADEMY
export const GET_HREF_KHAN_YT = async (page, url='') => {
  try {
    await page.goto(url);
    await page.waitForSelector('iframe');
    const frame =  await page.$('iframe');
    const raw_src = await frame.getProperty('src');
    const src = await raw_src.jsonValue();
    const regex = /embed\/([^\/]+)\//;
    const match = src.match(regex);
    if (match) {
      const result = match[1];
      return result
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}


//? REVISAR
export const GET_SRC_AUDIO_ARBOLABC = async(page, url='') => {
  try {
    await page.goto(url);
    await page.waitForSelector('audio[controlslist=nodownload]');
    const audio =  await page.$('audio[controlslist=nodownload]');
    const raw_src = await audio.getProperty('src');
    const src = await raw_src.jsonValue();
    return src;
  } catch (error) {
    console.error(error);
    return null;
  }
}
