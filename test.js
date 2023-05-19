import { GET_HREF_CNTV,downloadVideo,downloadPDF,downloadYT,GET_SRC_AUDIO_ARBOLABC,GET_HREF_KHAN_YT, get_mime_type, downloadFile } from "./file_types/index.js";
import axios from "axios";
import puppeteer from "puppeteer";
import url from 'url';
import fs from 'fs';
import { join } from "path";
import {__dirname} from './basepaths.js'



const init = async () => { 
    const response = await axios({
        url:'https://cdn.kastatic.org/ka-youtube-converted/DaDZ8VcNeDw.mp4/DaDZ8VcNeDw.mp4#t=473',
        method: 'GET',
        responseType: 'stream',
      });
   
      const mime = response.headers['content-type']; 
      console.log(mime)
 }

 init()



